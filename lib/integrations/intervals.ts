import { supabase } from '../supabase';
import { updateIntegrationStatus, createSyncLog, getIntegration } from './index';

const INTERVALS_API_BASE = 'https://intervals.icu/api/v1';

export interface IntervalsActivity {
  id: string;
  start_date_local: string;
  name: string;
  type: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  average_heartrate: number | null;
  max_heartrate: number | null;
  icu_training_load: number | null;
  icu_intensity: number | null;
  average_speed: number | null;
}

export interface IntervalsAthlete {
  id: string;
  name: string;
  email: string;
}

interface IntervalsConfig {
  api_key: string;
  athlete_id: string;
}

function getAuthHeader(apiKey: string): string {
  return 'Basic ' + Buffer.from(`API_KEY:${apiKey}`).toString('base64');
}

export async function testConnection(apiKey: string, athleteId: string): Promise<{
  success: boolean;
  athlete?: IntervalsAthlete;
  error?: string;
}> {
  try {
    const response = await fetch(`${INTERVALS_API_BASE}/athlete/${athleteId}`, {
      headers: {
        Authorization: getAuthHeader(apiKey),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: 'Invalid API key' };
      }
      if (response.status === 404) {
        return { success: false, error: 'Athlete not found' };
      }
      return { success: false, error: `API error: ${response.status}` };
    }

    const athlete = await response.json();
    return { success: true, athlete };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

export async function fetchActivities(
  apiKey: string,
  athleteId: string,
  oldest?: string,
  newest?: string
): Promise<IntervalsActivity[]> {
  const params = new URLSearchParams();
  if (oldest) params.set('oldest', oldest);
  if (newest) params.set('newest', newest);

  const url = `${INTERVALS_API_BASE}/athlete/${athleteId}/activities?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: getAuthHeader(apiKey),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch activities: ${response.status}`);
  }

  return response.json();
}

function calculatePace(distanceMeters: number, timeSeconds: number): string {
  if (distanceMeters <= 0 || timeSeconds <= 0) return '-';

  const distanceKm = distanceMeters / 1000;
  const paceMinPerKm = timeSeconds / 60 / distanceKm;
  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function mapActivityToRunningLog(activity: IntervalsActivity) {
  return {
    external_id: activity.id,
    date: activity.start_date_local.split('T')[0],
    name: activity.name || null,
    distance_km: activity.distance > 0 ? Math.round(activity.distance / 100) / 10 : null,
    duration_min: activity.moving_time > 0 ? Math.round(activity.moving_time / 60) : null,
    avg_pace: calculatePace(activity.distance, activity.moving_time),
    avg_hr: activity.average_heartrate ? Math.round(activity.average_heartrate) : null,
    training_load: activity.icu_training_load ? Math.round(activity.icu_training_load) : null,
    source: 'intervals_icu',
    synced_at: new Date().toISOString(),
  };
}

export async function syncActivities(daysBack: number = 30): Promise<{
  success: boolean;
  synced: number;
  error?: string;
}> {
  try {
    // Get integration config
    const integration = await getIntegration('intervals_icu');
    if (!integration || !integration.is_enabled) {
      return { success: false, synced: 0, error: 'Integration not enabled' };
    }

    const config = integration.config as IntervalsConfig | null;
    if (!config?.api_key || !config?.athlete_id) {
      return { success: false, synced: 0, error: 'Missing API key or athlete ID' };
    }

    // Update status to syncing
    await updateIntegrationStatus('intervals_icu', 'syncing');

    // Calculate date range
    const newest = new Date().toISOString().split('T')[0];
    const oldestDate = new Date();
    oldestDate.setDate(oldestDate.getDate() - daysBack);
    const oldest = oldestDate.toISOString().split('T')[0];

    // Fetch activities from intervals.icu
    const activities = await fetchActivities(
      config.api_key,
      config.athlete_id,
      oldest,
      newest
    );

    // Filter only Run activities
    const runActivities = activities.filter(
      (a) => a.type === 'Run' || a.type === 'VirtualRun'
    );

    if (runActivities.length === 0) {
      await updateIntegrationStatus('intervals_icu', 'success');
      await createSyncLog(integration.id, 'success', 0);
      return { success: true, synced: 0 };
    }

    // Map to RunningLogs format
    const runningLogs = runActivities.map(mapActivityToRunningLog);

    // Upsert to database (using external_id for conflict resolution)
    let syncedCount = 0;
    for (const log of runningLogs) {
      const { error } = await supabase
        .from('RunningLogs')
        .upsert(log, {
          onConflict: 'external_id',
          ignoreDuplicates: false,
        });

      if (!error) {
        syncedCount++;
      }
    }

    // Update integration status
    await updateIntegrationStatus('intervals_icu', 'success');
    await createSyncLog(integration.id, 'success', syncedCount);

    return { success: true, synced: syncedCount };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updateIntegrationStatus('intervals_icu', 'error', errorMessage);

    const integration = await getIntegration('intervals_icu');
    if (integration) {
      await createSyncLog(integration.id, 'error', 0, errorMessage);
    }

    return { success: false, synced: 0, error: errorMessage };
  }
}
