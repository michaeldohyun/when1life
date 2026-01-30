import {
  getRecentSessions,
  getPeriodStats,
  getLatestBodyComposition,
  getCurrentGoal,
  getCurrentTheory,
  getWeightWithFastingCorrelation,
  calculateGoalProgress,
} from '@/lib/fasting';
import { ArrowLeft, Target, Scale, Clock, TrendingDown } from 'lucide-react';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { FastingClient } from './FastingClient';
import { WeightChart } from '@/components/fasting/WeightChart';

export default async function FastingPage() {
  const [sessions, stats, bodyComp, goal, theory, weightHistory] = await Promise.all([
    getRecentSessions(10, 7),
    getPeriodStats(7),
    getLatestBodyComposition(),
    getCurrentGoal(),
    getCurrentTheory(),
    getWeightWithFastingCorrelation(90),
  ]);

  // 목표 진행률 계산
  const startWeight = goal?.current_weight_kg || (weightHistory.length > 0 ? weightHistory[0].weight_kg : null);
  const currentWeight = bodyComp?.weight_kg || null;
  const targetWeight = goal?.target_weight_kg || null;

  const progress =
    currentWeight && targetWeight && startWeight
      ? calculateGoalProgress(currentWeight, targetWeight, startWeight)
      : null;

  const remainingKg =
    currentWeight && targetWeight ? Math.max(0, currentWeight - targetWeight) : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/workflows"
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-medium text-foreground">Fasting Coach</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Intermittent fasting tracker with body composition
          </p>
        </div>
      </div>

      {/* Current Protocol */}
      {theory && (
        <div className="border border-border p-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Clock className="w-3.5 h-3.5" />
            Current Protocol
          </div>
          <p className="text-sm text-foreground">
            {theory.theory_name} ({theory.fasting_hours}:{theory.eating_window_hours})
          </p>
        </div>
      )}

      {/* Body Composition & Goal */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {/* Current Weight */}
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Scale className="w-3.5 h-3.5" />
            Weight
          </div>
          <p className="text-lg font-medium text-foreground">
            {bodyComp?.weight_kg?.toFixed(1) || '-'}{' '}
            <span className="text-xs text-muted-foreground">kg</span>
          </p>
          {bodyComp?.measured_at && (
            <p className="text-[10px] text-muted-foreground mt-1">
              {new Date(bodyComp.measured_at).toLocaleDateString('ko-KR')}
            </p>
          )}
        </div>

        {/* Body Fat */}
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            Body Fat
          </div>
          <p className="text-lg font-medium text-foreground">
            {bodyComp?.body_fat_pct?.toFixed(1) || '-'}{' '}
            <span className="text-xs text-muted-foreground">%</span>
          </p>
        </div>

        {/* Target Weight */}
        {goal && (
          <div className="border border-border p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Target className="w-3.5 h-3.5" />
              Target
            </div>
            <p className="text-lg font-medium text-foreground">
              {goal.target_weight_kg}{' '}
              <span className="text-xs text-muted-foreground">kg</span>
            </p>
          </div>
        )}
      </div>

      {/* Goal Progress */}
      {remainingKg !== null && targetWeight && progress !== null && (
        <div className="border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingDown className="w-3.5 h-3.5" />
              Goal Progress
            </div>
            <span className="text-xs text-muted-foreground">
              {remainingKg > 0 ? `${remainingKg.toFixed(1)}kg remaining` : 'Goal reached!'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>{startWeight?.toFixed(1)}kg</span>
            <span className="font-medium text-foreground">{progress}%</span>
            <span>{targetWeight}kg</span>
          </div>
        </div>
      )}

      {/* Weight Chart with Fasting Correlation */}
      {weightHistory.length > 0 && (
        <div className="border border-border p-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Scale className="w-3.5 h-3.5" />
            Weight Trend (90 days)
          </div>
          <WeightChart data={weightHistory} targetWeight={targetWeight || undefined} />
        </div>
      )}

      {/* Client Component with Filter */}
      <FastingClient initialStats={stats} initialSessions={sessions} />

      {/* Contact */}
      <div className="mt-8 pt-8 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Interested in this workflow?{' '}
          <a
            href="https://t.me/when1log"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Contact me on Telegram
          </a>
        </p>
      </div>
    </div>
  );
}
