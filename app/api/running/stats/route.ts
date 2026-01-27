import { NextRequest, NextResponse } from 'next/server';
import { getPeriodStats, getRecentActivities } from '@/lib/running';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const days = searchParams.get('days');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');

  const periodDays = days === 'null' ? null : days ? Number(days) : null;
  const limitNum = limit ? Number(limit) : 10;
  const offsetNum = offset ? Number(offset) : 0;

  const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;

  const [stats, activities] = await Promise.all([
    getPeriodStats(periodDays, dateRange),
    getRecentActivities(limitNum, periodDays, offsetNum, dateRange),
  ]);

  return NextResponse.json({ stats, activities });
}
