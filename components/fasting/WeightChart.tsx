'use client';

import { useMemo } from 'react';

interface DataPoint {
  date: string;
  weight_kg: number;
  body_fat_pct: number | null;
  hadFastingSession: boolean;
}

interface WeightChartProps {
  data: DataPoint[];
  targetWeight?: number;
  height?: number;
}

export function WeightChart({ data, targetWeight, height = 200 }: WeightChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    const weights = data.map((d) => d.weight_kg);
    const minWeight = Math.min(...weights, targetWeight || Infinity);
    const maxWeight = Math.max(...weights);
    const padding = (maxWeight - minWeight) * 0.1 || 1;

    return {
      minY: minWeight - padding,
      maxY: maxWeight + padding,
      points: data,
    };
  }, [data, targetWeight]);

  if (!chartData || data.length < 2) {
    return (
      <div className="flex items-center justify-center h-[200px] text-xs text-muted-foreground">
        Not enough data to display chart
      </div>
    );
  }

  const width = 100;
  const chartHeight = 100;
  const { minY, maxY, points } = chartData;

  const getX = (index: number) => (index / (points.length - 1)) * width;
  const getY = (value: number) =>
    chartHeight - ((value - minY) / (maxY - minY)) * chartHeight;

  // SVG path for weight line
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.weight_kg)}`)
    .join(' ');

  // Area fill path
  const areaPath = `${linePath} L ${width} ${chartHeight} L 0 ${chartHeight} Z`;

  // Target line Y position
  const targetY = targetWeight ? getY(targetWeight) : null;

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Get first and last dates for axis labels
  const firstDate = formatDate(points[0].date);
  const lastDate = formatDate(points[points.length - 1].date);

  // Calculate stats
  const firstWeight = points[0].weight_kg;
  const lastWeight = points[points.length - 1].weight_kg;
  const weightChange = lastWeight - firstWeight;
  const fastingDays = points.filter((p) => p.hadFastingSession).length;

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="flex items-center gap-4 text-xs">
        <div>
          <span className="text-muted-foreground">Change: </span>
          <span className={weightChange <= 0 ? 'text-green-600' : 'text-red-500'}>
            {weightChange <= 0 ? '' : '+'}
            {weightChange.toFixed(1)} kg
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Fasting days: </span>
          <span className="text-foreground">{fastingDays}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${chartHeight}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <line
            x1="0"
            y1={chartHeight * 0.25}
            x2={width}
            y2={chartHeight * 0.25}
            stroke="currentColor"
            strokeOpacity="0.1"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1="0"
            y1={chartHeight * 0.5}
            x2={width}
            y2={chartHeight * 0.5}
            stroke="currentColor"
            strokeOpacity="0.1"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1="0"
            y1={chartHeight * 0.75}
            x2={width}
            y2={chartHeight * 0.75}
            stroke="currentColor"
            strokeOpacity="0.1"
            vectorEffect="non-scaling-stroke"
          />

          {/* Target weight line */}
          {targetY !== null && targetY >= 0 && targetY <= chartHeight && (
            <line
              x1="0"
              y1={targetY}
              x2={width}
              y2={targetY}
              stroke="currentColor"
              strokeOpacity="0.3"
              strokeDasharray="2 2"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {/* Area fill */}
          <path d={areaPath} fill="currentColor" fillOpacity="0.05" />

          {/* Weight line */}
          <path
            d={linePath}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Fasting day markers */}
          {points.map((p, i) =>
            p.hadFastingSession ? (
              <circle
                key={i}
                cx={getX(i)}
                cy={getY(p.weight_kg)}
                r="2"
                fill="currentColor"
                className="text-green-500"
              />
            ) : null
          )}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-muted-foreground -translate-x-full pr-2">
          <span>{maxY.toFixed(1)}</span>
          <span>{minY.toFixed(1)}</span>
        </div>

        {/* Target label */}
        {targetWeight && targetY !== null && targetY >= 0 && targetY <= chartHeight && (
          <div
            className="absolute right-0 text-[10px] text-muted-foreground translate-x-full pl-2"
            style={{ top: `${(targetY / chartHeight) * 100}%`, transform: 'translateY(-50%)' }}
          >
            Target
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{firstDate}</span>
        <span>{lastDate}</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-foreground" />
          <span>Weight</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Fasting day</span>
        </div>
        {targetWeight && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 border-t border-dashed border-muted-foreground" />
            <span>Target ({targetWeight}kg)</span>
          </div>
        )}
      </div>
    </div>
  );
}
