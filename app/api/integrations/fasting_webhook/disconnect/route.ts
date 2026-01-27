import { NextResponse } from 'next/server';
import { upsertIntegration } from '@/lib/integrations';

export async function POST() {
  try {
    const integration = await upsertIntegration('fasting_webhook', {
      is_enabled: false,
      config: null,
      last_synced_at: null,
      sync_status: 'idle',
      error_message: null,
    });

    if (!integration) {
      return NextResponse.json(
        { success: false, error: '연동 해제에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('fasting webhook disconnect error:', error);
    return NextResponse.json(
      { success: false, error: '연동 해제 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
