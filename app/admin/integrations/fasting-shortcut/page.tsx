'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, CheckCircle, Key, Smartphone, Clock, Send, Scale } from 'lucide-react';
import Link from 'next/link';
import { getIntegration, upsertIntegration } from '@/lib/integrations';

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'bcwk_'; // body composition webhook key prefix
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function BodyCompositionShortcutPage() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState<'url' | 'key' | null>(null);

  useEffect(() => {
    loadIntegration();
  }, []);

  const loadIntegration = async () => {
    setIsLoading(true);
    const integration = await getIntegration('body_composition_webhook');

    if (integration?.is_enabled) {
      setIsEnabled(true);
      setApiKey((integration.config as { webhook_api_key?: string })?.webhook_api_key || '');
    }

    // Set webhook URL
    const projectRef = 'dotsosqsftympgdescvz'; // Supabase project ref
    setWebhookUrl(`https://${projectRef}.supabase.co/functions/v1/body-composition-webhook`);
    setIsLoading(false);
  };

  const handleEnable = async () => {
    const newApiKey = generateApiKey();

    const result = await upsertIntegration('body_composition_webhook', {
      display_name: 'iOS Shortcuts (체성분)',
      service_type: 'fasting',
      is_enabled: true,
      config: {
        webhook_api_key: newApiKey,
      },
      sync_status: 'idle',
    });

    if (result) {
      setApiKey(newApiKey);
      setIsEnabled(true);
    }
  };

  const handleCopy = async (type: 'url' | 'key') => {
    const text = type === 'url' ? webhookUrl : apiKey;
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRegenerateKey = async () => {
    if (!confirm('새 API Key를 생성하면 기존 Shortcuts를 업데이트해야 합니다. 계속하시겠습니까?')) {
      return;
    }

    const newApiKey = generateApiKey();
    await upsertIntegration('body_composition_webhook', {
      config: { webhook_api_key: newApiKey },
    });
    setApiKey(newApiKey);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/integrations"
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-medium text-foreground">체성분 데이터 연동</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            앳플리 → Apple Health → iOS Shortcuts → Webhook
          </p>
        </div>
      </div>

      {/* Overview */}
      <div className="border border-border p-4 mb-6">
        <h2 className="text-sm font-medium text-foreground mb-3">연동 방식</h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="px-2 py-1 bg-muted">앳플리 앱</span>
          <span>→</span>
          <span className="px-2 py-1 bg-muted">Apple Health</span>
          <span>→</span>
          <span className="px-2 py-1 bg-muted">iOS Shortcuts</span>
          <span>→</span>
          <span className="px-2 py-1 bg-muted">Webhook</span>
          <span>→</span>
          <span className="px-2 py-1 bg-muted">BodyCompositionLogs</span>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          앳플리에서 측정한 체성분 데이터(몸무게, 체지방률 등)가 Apple Health에 동기화되면,
          iOS Shortcuts가 자동으로 데이터를 읽어 서버로 전송합니다.
        </p>
        <div className="mt-3 p-2 bg-muted/50 border border-border">
          <p className="text-[10px] text-muted-foreground">
            💡 <strong>단식 기록</strong>은 Telegram Bot에서 직접 입력합니다. 이 연동은 <strong>체성분 데이터</strong>만 처리합니다.
          </p>
        </div>
      </div>

      {/* Enable/Config Section */}
      {!isEnabled ? (
        <div className="border border-border p-6 text-center mb-6">
          <Scale className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-foreground mb-4">
            Webhook을 활성화하여 iOS Shortcuts에서 체성분 데이터를 수신할 수 있습니다.
          </p>
          <button
            onClick={handleEnable}
            className="px-4 py-2 text-xs bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            Webhook 활성화
          </button>
        </div>
      ) : (
        <>
          {/* Webhook Credentials */}
          <div className="border border-border p-4 mb-6">
            <h2 className="text-sm font-medium text-foreground mb-4">Webhook 정보</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Webhook URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={webhookUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-muted border border-border text-xs text-foreground font-mono"
                  />
                  <button
                    onClick={() => handleCopy('url')}
                    className="p-2 border border-border hover:bg-muted transition-colors"
                  >
                    {copied === 'url' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">API Key</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={apiKey}
                    readOnly
                    className="flex-1 px-3 py-2 bg-muted border border-border text-xs text-foreground font-mono"
                  />
                  <button
                    onClick={() => handleCopy('key')}
                    className="p-2 border border-border hover:bg-muted transition-colors"
                  >
                    {copied === 'key' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <button
                  onClick={handleRegenerateKey}
                  className="text-[10px] text-muted-foreground hover:text-foreground mt-1.5"
                >
                  API Key 재생성
                </button>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="border border-border p-4 mb-6">
            <h2 className="text-sm font-medium text-foreground mb-4">iOS Shortcuts 설정 가이드</h2>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-muted flex items-center justify-center">
                  <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-foreground mb-1">1. Shortcuts 앱 열기</h3>
                  <p className="text-xs text-muted-foreground">
                    iPhone에서 Shortcuts(단축어) 앱을 엽니다. 새 Shortcut을 생성합니다.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-muted flex items-center justify-center">
                  <Key className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-foreground mb-1">2. Health 데이터 읽기 액션 추가</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    &quot;Find Health Samples&quot; 액션을 추가하고 다음과 같이 설정:
                  </p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                    <li><strong>Type: Body Mass (체중)</strong></li>
                    <li>Start Date: 24 hours ago</li>
                    <li>Sort By: Start Date (Newest First)</li>
                    <li>Limit: 1</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">
                    필요시 Body Fat Percentage (체지방률), Lean Body Mass (제지방량) 등도 추가로 읽을 수 있습니다.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-muted flex items-center justify-center">
                  <Send className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-foreground mb-1">3. Webhook 전송 액션 추가</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    &quot;Get Contents of URL&quot; 액션을 추가하고 설정:
                  </p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                    <li>URL: {webhookUrl}</li>
                    <li>Method: POST</li>
                    <li>Headers: Authorization = Bearer {apiKey.substring(0, 10)}...</li>
                    <li>Request Body: JSON (아래 예시 참고)</li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-muted flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-foreground mb-1">4. 자동화 설정</h3>
                  <p className="text-xs text-muted-foreground">
                    Shortcuts 앱 → Automation → Time of Day → 매일 아침 (앳플리로 측정 후)
                    → 생성한 Shortcut 선택 → &quot;Run Immediately&quot; 활성화
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* JSON Example */}
          <div className="border border-border p-4">
            <h2 className="text-sm font-medium text-foreground mb-3">요청 Body 예시</h2>
            <pre className="text-xs text-muted-foreground bg-muted p-3 overflow-x-auto">
{`{
  "measured_at": "2026-01-28T07:30:00Z",
  "weight_kg": 72.5,
  "body_fat_percentage": 18.5,
  "muscle_mass_kg": 32.1,
  "bmi": 23.4,
  "source": "apple_health"
}`}
            </pre>
            <p className="text-[10px] text-muted-foreground mt-2">
              * weight_kg는 필수이며, 나머지 필드는 선택사항입니다.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
