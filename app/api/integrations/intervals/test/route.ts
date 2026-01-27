import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/integrations/intervals';

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

    const result = await testConnection(api_key, athlete_id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('intervals.icu test error:', error);
    return NextResponse.json(
      { success: false, error: '연결 테스트 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
