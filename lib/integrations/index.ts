import { supabase } from '../supabase';

export interface Integration {
  id: number;
  service_name: string;
  display_name: string;
  service_type: 'running' | 'fasting' | 'both';
  is_enabled: boolean;
  config: Record<string, unknown> | null;
  last_synced_at: string | null;
  sync_status: 'idle' | 'syncing' | 'success' | 'error';
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: number;
  integration_id: number;
  started_at: string;
  finished_at: string | null;
  status: 'success' | 'error' | 'partial';
  records_synced: number;
  error_message: string | null;
}

export async function getIntegrations(): Promise<Integration[]> {
  const { data, error } = await supabase
    .from('Integrations')
    .select('*')
    .order('service_type', { ascending: true });

  if (error) {
    console.error('Error fetching integrations:', error);
    return [];
  }

  return data || [];
}

export async function getIntegration(serviceName: string): Promise<Integration | null> {
  const { data, error } = await supabase
    .from('Integrations')
    .select('*')
    .eq('service_name', serviceName)
    .maybeSingle();

  if (error) {
    console.error('Error fetching integration:', error);
    return null;
  }

  return data;
}

export async function upsertIntegration(
  serviceName: string,
  data: Partial<Omit<Integration, 'id' | 'created_at'>>
): Promise<Integration | null> {
  const { data: result, error } = await supabase
    .from('Integrations')
    .upsert(
      {
        service_name: serviceName,
        ...data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'service_name' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error upserting integration:', error);
    return null;
  }

  return result;
}

export async function updateIntegrationStatus(
  serviceName: string,
  status: Integration['sync_status'],
  errorMessage?: string
): Promise<void> {
  const updateData: Partial<Integration> = {
    sync_status: status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'success') {
    updateData.last_synced_at = new Date().toISOString();
    updateData.error_message = null;
  } else if (status === 'error') {
    updateData.error_message = errorMessage || null;
  }

  await supabase
    .from('Integrations')
    .update(updateData)
    .eq('service_name', serviceName);
}

export async function getSyncLogs(
  integrationId: number,
  limit: number = 10
): Promise<SyncLog[]> {
  const { data, error } = await supabase
    .from('SyncLogs')
    .select('*')
    .eq('integration_id', integrationId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching sync logs:', error);
    return [];
  }

  return data || [];
}

export async function getRecentSyncLogs(limit: number = 10): Promise<(SyncLog & { integration: Integration })[]> {
  const { data, error } = await supabase
    .from('SyncLogs')
    .select(`
      *,
      integration:Integrations(*)
    `)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent sync logs:', error);
    return [];
  }

  return data || [];
}

export async function createSyncLog(
  integrationId: number,
  status: SyncLog['status'],
  recordsSynced: number = 0,
  errorMessage?: string
): Promise<SyncLog | null> {
  const { data, error } = await supabase
    .from('SyncLogs')
    .insert({
      integration_id: integrationId,
      status,
      records_synced: recordsSynced,
      finished_at: new Date().toISOString(),
      error_message: errorMessage || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating sync log:', error);
    return null;
  }

  return data;
}

export function formatSyncTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';

  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
