'use client';

import { useState } from 'react';
import { Calendar } from './Calendar';

export type Period = '7' | '30' | '90' | 'all' | 'custom';

export interface DateRange {
  start: string;
  end: string;
}

interface PeriodFilterProps {
  selected: Period;
  onChange: (period: Period, dateRange?: DateRange) => void;
  dateRange?: DateRange;
}

const periodLabels: Record<Exclude<Period, 'custom'>, string> = {
  '7': '7 days',
  '30': '30 days',
  '90': '90 days',
  'all': 'All time',
};

type SelectingField = 'start' | 'end' | null;

export function PeriodFilter({ selected, onChange, dateRange }: PeriodFilterProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(dateRange?.start || '');
  const [endDate, setEndDate] = useState(dateRange?.end || '');
  const [selectingField, setSelectingField] = useState<SelectingField>(null);

  const handleCustomClick = () => {
    if (selected === 'custom') {
      setShowDatePicker(!showDatePicker);
    } else {
      setShowDatePicker(true);
      setSelectingField('start');
      onChange('custom', dateRange);
    }
  };

  const handleApply = () => {
    if (startDate && endDate) {
      // Ensure start <= end
      const finalStart = startDate <= endDate ? startDate : endDate;
      const finalEnd = startDate <= endDate ? endDate : startDate;
      onChange('custom', { start: finalStart, end: finalEnd });
      setShowDatePicker(false);
      setSelectingField(null);
    }
  };

  const handleDateSelect = (date: string) => {
    if (selectingField === 'start') {
      setStartDate(date);
      setSelectingField('end');
    } else if (selectingField === 'end') {
      setEndDate(date);
    }
  };

  const formatDateLabel = () => {
    if (dateRange?.start && dateRange?.end) {
      const start = new Date(dateRange.start + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = new Date(dateRange.end + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${start} - ${end}`;
    }
    return 'Custom';
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(periodLabels) as Exclude<Period, 'custom'>[]).map((period) => (
          <button
            key={period}
            onClick={() => {
              onChange(period);
              setShowDatePicker(false);
              setSelectingField(null);
            }}
            className={`px-2.5 py-1 text-xs transition-colors ${
              selected === period
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground border border-border hover:border-foreground'
            }`}
          >
            {periodLabels[period]}
          </button>
        ))}
        <button
          onClick={handleCustomClick}
          className={`px-2.5 py-1 text-xs transition-colors ${
            selected === 'custom'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground border border-border hover:border-foreground'
          }`}
        >
          {selected === 'custom' ? formatDateLabel() : 'Custom'}
        </button>
      </div>

      {showDatePicker && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-background border border-border z-10 shadow-lg">
          <div className="flex flex-col gap-3">
            {/* Date display buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectingField('start')}
                className={`flex-1 px-2 py-1.5 text-xs border transition-colors ${
                  selectingField === 'start'
                    ? 'border-foreground text-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground'
                }`}
              >
                <span className="block text-[10px] text-muted-foreground mb-0.5">From</span>
                {formatDisplayDate(startDate)}
              </button>
              <button
                type="button"
                onClick={() => setSelectingField('end')}
                className={`flex-1 px-2 py-1.5 text-xs border transition-colors ${
                  selectingField === 'end'
                    ? 'border-foreground text-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground'
                }`}
              >
                <span className="block text-[10px] text-muted-foreground mb-0.5">To</span>
                {formatDisplayDate(endDate)}
              </button>
            </div>

            {/* Calendar */}
            <Calendar
              selected={selectingField === 'start' ? startDate : endDate}
              onSelect={handleDateSelect}
              maxDate={new Date().toISOString().split('T')[0]}
            />

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowDatePicker(false);
                  setSelectingField(null);
                }}
                className="flex-1 px-2 py-1 text-xs text-muted-foreground border border-border hover:border-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!startDate || !endDate}
                className="flex-1 px-2 py-1 text-xs bg-foreground text-background disabled:opacity-50 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
