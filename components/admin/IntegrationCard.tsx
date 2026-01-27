'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, RefreshCw, Settings, Unlink } from 'lucide-react';
import { Integration, formatSyncTime } from '@/lib/integrations';

interface IntegrationCardProps {
  integration: Integration;
  onSync?: () => Promise<void>;
  onSettings?: () => void;
  onDisconnect?: () => Promise<void>;
  children?: React.ReactNode;
}

export function IntegrationCard({
  integration,
  onSync,
  onSettings,
  onDisconnect,
  children,
}: IntegrationCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!onSync) return;
    setIsSyncing(true);
    try {
      await onSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = () => {
    if (isSyncing || integration.sync_status === 'syncing') {
      return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
    }
    if (integration.is_enabled && integration.sync_status === 'success') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (integration.sync_status === 'error') {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getStatusText = () => {
    if (!integration.is_enabled) return 'Not connected';
    if (isSyncing || integration.sync_status === 'syncing') return 'Syncing...';
    if (integration.sync_status === 'error') return 'Error';
    return 'Connected';
  };

  return (
    <div className="border border-border p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            {integration.display_name}
            {getStatusIcon()}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {getStatusText()}
          </p>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 ${
            integration.is_enabled
              ? 'bg-green-500/10 text-green-600'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {integration.is_enabled ? 'Active' : 'Inactive'}
        </span>
      </div>

      {integration.is_enabled && (
        <div className="text-xs text-muted-foreground mb-3">
          Last synced: {formatSyncTime(integration.last_synced_at)}
          {integration.error_message && (
            <p className="text-red-500 mt-1">{integration.error_message}</p>
          )}
        </div>
      )}

      {children}

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        {integration.is_enabled && onSync && (
          <button
            onClick={handleSync}
            disabled={isSyncing || integration.sync_status === 'syncing'}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Now
          </button>
        )}
        {onSettings && (
          <button
            onClick={onSettings}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-foreground transition-colors"
          >
            <Settings className="w-3 h-3" />
            Settings
          </button>
        )}
        {integration.is_enabled && onDisconnect && (
          <button
            onClick={onDisconnect}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 transition-colors ml-auto"
          >
            <Unlink className="w-3 h-3" />
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
