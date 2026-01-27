import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface FastingSession {
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  goal_reached?: boolean;
  source?: string;
}

interface WebhookPayload {
  sessions: FastingSession[];
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Verify API key from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = authHeader.replace("Bearer ", "");

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify webhook API key from Integrations table
    const { data: integration, error: integrationError } = await supabase
      .from("Integrations")
      .select("*")
      .eq("service_name", "fasting_webhook")
      .single();

    if (integrationError || !integration) {
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const webhookApiKey = (integration.config as { webhook_api_key?: string })?.webhook_api_key;
    if (!webhookApiKey || webhookApiKey !== apiKey) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const payload: WebhookPayload = await req.json();

    if (!payload.sessions || !Array.isArray(payload.sessions)) {
      return new Response(JSON.stringify({ error: "Invalid payload: sessions array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process sessions
    let syncedCount = 0;
    const errors: string[] = [];

    for (const session of payload.sessions) {
      if (!session.started_at) {
        errors.push("Session missing started_at");
        continue;
      }

      const sessionData = {
        started_at: session.started_at,
        ended_at: session.ended_at || null,
        duration_minutes: session.duration_minutes || null,
        goal_reached: session.goal_reached || false,
        external_id: `shortcut_${new Date(session.started_at).getTime()}`,
        source: session.source || "apple_health",
        synced_at: new Date().toISOString(),
      };

      // Upsert session (avoid duplicates based on started_at time)
      const { error } = await supabase
        .from("FastingSessions")
        .upsert(sessionData, {
          onConflict: "external_id",
          ignoreDuplicates: false,
        });

      if (error) {
        errors.push(`Failed to insert session: ${error.message}`);
      } else {
        syncedCount++;
      }
    }

    // Update integration status
    await supabase
      .from("Integrations")
      .update({
        last_synced_at: new Date().toISOString(),
        sync_status: errors.length === 0 ? "success" : "partial",
        error_message: errors.length > 0 ? errors.join("; ") : null,
        updated_at: new Date().toISOString(),
      })
      .eq("service_name", "fasting_webhook");

    // Create sync log
    await supabase.from("SyncLogs").insert({
      integration_id: integration.id,
      status: errors.length === 0 ? "success" : (syncedCount > 0 ? "partial" : "error"),
      records_synced: syncedCount,
      finished_at: new Date().toISOString(),
      error_message: errors.length > 0 ? errors.join("; ") : null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        synced: syncedCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
