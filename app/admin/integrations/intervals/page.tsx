'use client';

import { useState } from 'react';
import { ArrowLeft, ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function IntervalsSetupPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [athleteId, setAthleteId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    athleteName?: string;
  } | null>(null);

  const handleTest = async () => {
    if (!apiKey || !athleteId) return;

    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/integrations/intervals/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey, athlete_id: athleteId }),
      });

      const data = await response.json();

      if (data.success) {
        setTestResult({
          success: true,
          message: '연결 성공!',
          athleteName: data.athlete?.name,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || '연결 실패',
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: '네트워크 오류가 발생했습니다',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!apiKey || !athleteId || !testResult?.success) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/integrations/intervals/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey, athlete_id: athleteId }),
      });

      if (response.ok) {
        router.push('/admin/integrations');
      } else {
        const data = await response.json();
        setTestResult({
          success: false,
          message: data.error || '연결 저장 실패',
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: '연결 저장 중 오류가 발생했습니다',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/integrations"
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-medium text-foreground">intervals.icu 연결</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Garmin 러닝 데이터를 가져옵니다
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="border border-border p-4 mb-6">
        <h2 className="text-sm font-medium text-foreground mb-2">설정 방법</h2>
        <ol className="text-xs text-muted-foreground space-y-2">
          <li>
            1.{' '}
            <a
              href="https://intervals.icu/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline inline-flex items-center gap-1"
            >
              intervals.icu Settings
              <ExternalLink className="w-3 h-3" />
            </a>
            에서 Developer Settings로 이동
          </li>
          <li>2. API Key를 생성하고 복사</li>
          <li>3. 프로필 페이지에서 Athlete ID 확인 (URL의 i숫자)</li>
          <li>4. 아래 폼에 입력하고 연결 테스트</li>
        </ol>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="intervals.icu API Key"
            className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Athlete ID
          </label>
          <input
            type="text"
            value={athleteId}
            onChange={(e) => setAthleteId(e.target.value)}
            placeholder="i12345"
            className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            intervals.icu URL에서 확인 가능 (예: intervals.icu/athlete/i12345)
          </p>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`flex items-center gap-2 p-3 border ${
              testResult.success
                ? 'border-green-200 bg-green-500/5'
                : 'border-red-200 bg-red-500/5'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <div>
              <p className={`text-xs ${testResult.success ? 'text-green-600' : 'text-red-500'}`}>
                {testResult.message}
              </p>
              {testResult.athleteName && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Athlete: {testResult.athleteName}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleTest}
            disabled={!apiKey || !athleteId || isLoading}
            className="px-4 py-2 text-xs border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              '연결 테스트'
            )}
          </button>
          <button
            onClick={handleConnect}
            disabled={!testResult?.success || isLoading}
            className="px-4 py-2 text-xs bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            연결하기
          </button>
        </div>
      </div>
    </div>
  );
}
