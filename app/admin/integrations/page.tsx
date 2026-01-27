'use client';

import { useState, useEffect } from 'react';
import { Activity, Timer, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { IntegrationCard } from '@/components/admin/IntegrationCard';
import {
  Integration,
  SyncLog,
  getIntegrations,
  getRecentSyncLogs,
  formatSyncTime,
} from '@/lib/integrations';
import Link from 'next/link';

// 기본 연동 서비스 정의 (DB에 없을 때 표시용)
const DEFAULT_INTEGRATIONS: Partial<Integration>[] = [
  {
    service_name: 'intervals_icu',
    display_name: 'intervals.icu',
    service_type: 'running',
    is_enabled: false,
    sync_status: 'idle',
  },
  {
    service_name: 'body_composition_webhook',
    display_name: 'iOS Shortcuts (체성분)',
    service_type: 'fasting',
    is_enabled: false,
    sync_status: 'idle',
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [recentLogs, setRecentLogs] = useState<(SyncLog & { integration: Integration })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [integrationsData, logsData] = await Promise.all([
      getIntegrations(),
      getRecentSyncLogs(5),
    ]);

    // DB에 없는 기본 연동은 기본값으로 표시
    const mergedIntegrations = DEFAULT_INTEGRATIONS.map((defaultInt) => {
      const existing = integrationsData.find((i) => i.service_name === defaultInt.service_name);
      return existing || (defaultInt as Integration);
    });

    setIntegrations(mergedIntegrations);
    setRecentLogs(logsData);
    setIsLoading(false);
  };

  const handleSync = async (serviceName: string) => {
    const apiPath = serviceName === 'intervals_icu' ? 'intervals' : serviceName;
    const response = await fetch(`/api/integrations/${apiPath}/sync`, {
      method: 'POST',
    });

    if (response.ok) {
      await fetchData();
    }
  };

  const handleDisconnect = async (serviceName: string) => {
    if (!confirm('연동을 해제하시겠습니까?')) return;

    const apiPath = serviceName === 'intervals_icu' ? 'intervals' : serviceName;
    const response = await fetch(`/api/integrations/${apiPath}/disconnect`, {
      method: 'POST',
    });

    if (response.ok) {
      await fetchData();
    }
  };

  const runningIntegrations = integrations.filter((i) => i.service_type === 'running');
  const fastingIntegrations = integrations.filter((i) => i.service_type === 'fasting');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-lg font-medium text-foreground">Integrations</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          외부 서비스와 데이터 연동을 관리합니다
        </p>
      </div>

      {/* Running Coach Section */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">Running Coach</h2>
        </div>
        <div className="grid gap-4">
          {runningIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.service_name}
              integration={integration}
              onSync={integration.is_enabled ? () => handleSync(integration.service_name) : undefined}
              onSettings={integration.is_enabled ? undefined : undefined}
              onDisconnect={integration.is_enabled ? () => handleDisconnect(integration.service_name) : undefined}
            >
              {!integration.is_enabled && (
                <Link
                  href={`/admin/integrations/${integration.service_name === 'intervals_icu' ? 'intervals' : integration.service_name}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-foreground text-background hover:bg-foreground/90 transition-colors"
                >
                  Connect
                </Link>
              )}
              {integration.is_enabled && integration.service_name === 'intervals_icu' && (
                <p className="text-xs text-muted-foreground">
                  Athlete ID: {(integration.config as { athlete_id?: string })?.athlete_id || '-'}
                </p>
              )}
            </IntegrationCard>
          ))}
        </div>
      </section>

      {/* Fasting Coach Section */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Timer className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">Fasting Coach</h2>
        </div>
        <div className="grid gap-4">
          {fastingIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.service_name}
              integration={integration}
              onDisconnect={integration.is_enabled ? () => handleDisconnect(integration.service_name) : undefined}
            >
              {!integration.is_enabled && (
                <Link
                  href="/admin/integrations/fasting-shortcut"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-foreground text-background hover:bg-foreground/90 transition-colors"
                >
                  Setup Guide
                </Link>
              )}
              {integration.is_enabled && (
                <p className="text-xs text-muted-foreground">
                  Webhook 활성화됨 - iOS Shortcuts에서 체성분 데이터를 수신합니다
                </p>
              )}
            </IntegrationCard>
          ))}
        </div>
      </section>

      {/* Sync History */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">Sync History</h2>
        </div>
        {recentLogs.length > 0 ? (
          <div className="border border-border divide-y divide-border">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  {log.status === 'success' ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  ) : log.status === 'error' ? (
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 text-yellow-500" />
                  )}
                  <div>
                    <p className="text-xs text-foreground">
                      {log.integration?.display_name || 'Unknown'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatSyncTime(log.started_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {log.status === 'success' ? (
                    <p className="text-xs text-green-600">
                      {log.records_synced} records
                    </p>
                  ) : log.status === 'error' ? (
                    <p className="text-xs text-red-500 max-w-[150px] truncate">
                      {log.error_message || 'Error'}
                    </p>
                  ) : (
                    <p className="text-xs text-yellow-600">Partial</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-border p-8 text-center">
            <p className="text-xs text-muted-foreground">아직 동기화 기록이 없습니다</p>
          </div>
        )}
      </section>
    </div>
  );
}
