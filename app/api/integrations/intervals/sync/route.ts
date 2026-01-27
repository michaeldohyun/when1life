import { NextResponse } from 'next/server';
import { syncActivities } from '@/lib/integrations/intervals';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const daysBack = parseInt(searchParams.get('days') || '30', 10);

    const result = await syncActivities(daysBack);

    if (result.success) {
      return NextResponse.json({
        success: true,
        synced: result.synced,
        message: `${result.synced}개의 활동을 동기화했습니다`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('intervals.icu sync error:', error);
    return NextResponse.json(
      { success: false, error: '동기화 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
