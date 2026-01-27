import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/integrations/intervals';
import { upsertIntegration } from '@/lib/integrations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { api_key, athlete_id } = body;

    if (!api_key || !athlete_id) {
      return NextResponse.json(
        { success: false, error: 'API Key와 Athlete ID가 필요합니다' },
        { status: 400 }
      );
    }

    // Verify connection before saving
    const testResult = await testConnection(api_key, athlete_id);
    if (!testResult.success) {
      return NextResponse.json(
        { success: false, error: testResult.error },
        { status: 400 }
      );
    }

    // Save integration config
    const integration = await upsertIntegration('intervals_icu', {
      display_name: 'intervals.icu',
      service_type: 'running',
      is_enabled: true,
      config: {
        api_key,
        athlete_id,
        athlete_name: testResult.athlete?.name,
      },
      sync_status: 'idle',
      error_message: null,
    });

    if (!integration) {
      return NextResponse.json(
        { success: false, error: '연동 정보 저장에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, integration });
  } catch (error) {
    console.error('intervals.icu connect error:', error);
    return NextResponse.json(
      { success: false, error: '연결 저장 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
