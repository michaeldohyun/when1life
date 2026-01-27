'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selected?: string;
  onSelect: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function Calendar({ selected, onSelect, minDate, maxDate }: CalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => {
    if (selected) return parseDate(selected);
    return today;
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isDisabled = (date: Date) => {
    const dateStr = formatDate(date);
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const isSelected = (date: Date) => {
    if (!selected) return false;
    return formatDate(date) === selected;
  };

  const isToday = (date: Date) => formatDate(date) === formatDate(today);

  const handleSelect = (date: Date) => {
    if (!isDisabled(date)) {
      onSelect(formatDate(date));
    }
  };

  // Build calendar grid
  const days: (Date | null)[] = [];

  // Previous month's trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, daysInPrevMonth - i));
  }

  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  // Next month's leading days
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return (
    <div className="w-[252px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-medium text-foreground">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-[10px] text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((date, i) => {
          if (!date) return <div key={i} />;

          const isCurrentMonth = date.getMonth() === month;
          const disabled = isDisabled(date);
          const selectedDay = isSelected(date);
          const todayDay = isToday(date);

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(date)}
              disabled={disabled}
              className={`
                h-8 w-8 text-xs transition-colors
                ${!isCurrentMonth ? 'text-muted-foreground/40' : ''}
                ${disabled ? 'text-muted-foreground/30 cursor-not-allowed' : 'hover:bg-muted'}
                ${selectedDay ? 'bg-foreground text-background hover:bg-foreground' : ''}
                ${todayDay && !selectedDay ? 'border border-border' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
