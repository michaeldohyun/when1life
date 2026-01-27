import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface BodyCompositionData {
  measured_at: string;
  weight_kg: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  bmi?: number;
  visceral_fat_level?: number;
  basal_metabolic_rate?: number;
  source?: string;
}

interface WebhookPayload extends BodyCompositionData {
  // Single record or array
}

// Telegram 메시지 전송 함수
async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  data: BodyCompositionData
): Promise<void> {
  const weightChange = ""; // 이전 데이터와 비교하려면 DB 조회 필요

  const message = `📊 *체성분 데이터 동기화 완료*

⚖️ 체중: *${data.weight_kg}kg*${data.body_fat_percentage ? `
📉 체지방률: *${data.body_fat_percentage}%*` : ""}${data.muscle_mass_kg ? `
💪 근육량: *${data.muscle_mass_kg}kg*` : ""}${data.bmi ? `
📏 BMI: *${data.bmi}*` : ""}

🕐 측정: ${new Date(data.measured_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
📱 출처: ${data.source || "Apple Health"}`;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch (error) {
    console.error("Telegram notification failed:", error);
    // 알림 실패해도 webhook 자체는 성공으로 처리
  }
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
      .eq("service_name", "body_composition_webhook")
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

    // Validate required fields
    if (!payload.weight_kg) {
      return new Response(JSON.stringify({ error: "weight_kg is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const measuredAt = payload.measured_at || new Date().toISOString();

    // Prepare data for insertion (match BodyCompositionLogs table schema)
    const compositionData = {
      chat_id: "webhook", // webhook을 통한 입력 식별
      measured_at: measuredAt,
      weight_kg: payload.weight_kg,
      body_fat_pct: payload.body_fat_percentage || null,
      muscle_mass_kg: payload.muscle_mass_kg || null,
      bmi: payload.bmi || null,
      visceral_fat_level: payload.visceral_fat_level || null,
      input_method: "ios_shortcut",
      external_id: `shortcut_${new Date(measuredAt).getTime()}`,
      source: payload.source || "apple_health",
      synced_at: new Date().toISOString(),
    };

    // Upsert body composition data (avoid duplicates)
    const { error: insertError } = await supabase
      .from("BodyCompositionLogs")
      .upsert(compositionData, {
        onConflict: "external_id",
        ignoreDuplicates: false,
      });

    if (insertError) {
      console.error("Insert error:", insertError);

      // Update integration status to error
      await supabase
        .from("Integrations")
        .update({
          sync_status: "error",
          error_message: insertError.message,
          updated_at: new Date().toISOString(),
        })
        .eq("service_name", "body_composition_webhook");

      // Create error sync log
      await supabase.from("SyncLogs").insert({
        integration_id: integration.id,
        status: "error",
        records_synced: 0,
        finished_at: new Date().toISOString(),
        error_message: insertError.message,
      });

      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update integration status to success
    await supabase
      .from("Integrations")
      .update({
        last_synced_at: new Date().toISOString(),
        sync_status: "success",
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("service_name", "body_composition_webhook");

    // Create success sync log
    await supabase.from("SyncLogs").insert({
      integration_id: integration.id,
      status: "success",
      records_synced: 1,
      finished_at: new Date().toISOString(),
      error_message: null,
    });

    // Send Telegram notification (fasting-tracker와 같은 봇 사용)
    const telegramBotToken = Deno.env.get("FASTING_TELEGRAM_BOT_TOKEN");
    const telegramChatId = Deno.env.get("TELEGRAM_CHAT_ID");

    if (telegramBotToken && telegramChatId) {
      await sendTelegramNotification(telegramBotToken, telegramChatId, {
        ...payload,
        measured_at: measuredAt,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Body composition data synced successfully",
        data: {
          weight_kg: payload.weight_kg,
          measured_at: measuredAt,
        },
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
