'use client';

import { useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DataPoint {
  date: string;
  count: number;
}

interface UsageHistoryChartProps {
  data: DataPoint[];
  limit?: number;
  title?: string;
  color?: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  date: string;
  count: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formats a YYYY-MM-DD string to a short label like "Mar 6".
 */
function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
}

/**
 * Formats a YYYY-MM-DD string to a full readable date for tooltips.
 */
function formatTooltipDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Generates a simple Y-axis scale from 0 to maxValue with ~4 steps.
 */
function buildYAxis(maxValue: number): number[] {
  if (maxValue === 0) return [0, 1, 2, 3, 4];
  const step = Math.ceil(maxValue / 4);
  const ticks: number[] = [];
  for (let i = 0; i <= 4; i++) {
    ticks.push(i * step);
  }
  return ticks;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * UsageHistoryChart — CSS-only bar chart showing daily usage data.
 *
 * No external chart libraries required. Renders bars using CSS Flexbox/Grid.
 * Hover tooltips are pure React state — no portal needed.
 *
 * Features:
 * - Animated bars on mount
 * - Hover tooltip with date + count
 * - Optional dashed red limit line
 * - X-axis labels every 5th day
 * - Y-axis scale on the left
 */
export default function UsageHistoryChart({
  data,
  limit,
  title,
  color = '#001F54',
}: UsageHistoryChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    date: '',
    count: 0,
  });

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        No usage data available for this period.
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const counts = data.map((d) => d.count);
  const maxCount = Math.max(...counts, limit ?? 0, 1);
  const yTicks = buildYAxis(maxCount);
  const yMax = yTicks[yTicks.length - 1];

  // Limit line position as percentage from bottom
  const limitLinePercent =
    limit !== undefined ? Math.min(100, (limit / yMax) * 100) : null;

  // ── Bar hover handlers ─────────────────────────────────────────────────────
  function handleMouseEnter(
    e: React.MouseEvent<HTMLButtonElement>,
    point: DataPoint
  ) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerRect = (
      e.currentTarget.closest('[data-chart-container]') as HTMLElement
    )?.getBoundingClientRect();

    const relativeX = rect.left - (containerRect?.left ?? 0) + rect.width / 2;
    const relativeY = rect.top - (containerRect?.top ?? 0) - 8;

    setTooltip({
      visible: true,
      x: relativeX,
      y: relativeY,
      date: point.date,
      count: point.count,
    });
  }

  function handleMouseLeave() {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }

  return (
    <div className="space-y-3">
      {/* Title */}
      {title && (
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      )}

      {/* Chart area */}
      <div
        className="relative"
        data-chart-container
        aria-label={title ?? 'Usage history chart'}
        role="img"
      >
        {/* Tooltip */}
        {tooltip.visible && (
          <div
            className="absolute z-10 pointer-events-none px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)',
            }}
            aria-hidden="true"
          >
            <span className="font-semibold">{tooltip.count}</span>
            {' · '}
            {formatTooltipDate(tooltip.date)}
            {/* Arrow */}
            <span
              className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Y-axis + bars */}
        <div className="flex gap-2">
          {/* Y-axis labels */}
          <div
            className="flex flex-col-reverse justify-between text-right pr-1 flex-shrink-0 select-none"
            style={{ height: 128 }}
            aria-hidden="true"
          >
            {yTicks.map((tick) => (
              <span key={tick} className="text-[10px] text-gray-400 leading-none tabular-nums">
                {tick}
              </span>
            ))}
          </div>

          {/* Bars + grid */}
          <div className="relative flex-1" style={{ height: 128 }}>
            {/* Horizontal grid lines */}
            {yTicks.map((tick) => (
              <div
                key={tick}
                className="absolute left-0 right-0 border-t border-gray-100"
                style={{ bottom: `${(tick / yMax) * 100}%` }}
                aria-hidden="true"
              />
            ))}

            {/* Limit line */}
            {limitLinePercent !== null && (
              <div
                className="absolute left-0 right-0 border-t-2 border-dashed border-[#FF3B30] z-10"
                style={{ bottom: `${limitLinePercent}%` }}
                aria-hidden="true"
              >
                <span className="absolute -top-4 right-0 text-[10px] font-semibold text-[#FF3B30] bg-white px-1 leading-none">
                  Limit
                </span>
              </div>
            )}

            {/* Bars row */}
            <div className="absolute inset-0 flex items-end gap-0.5">
              {data.map((point, idx) => {
                const heightPercent = yMax > 0 ? (point.count / yMax) * 100 : 0;
                const isToday =
                  point.date === new Date().toISOString().slice(0, 10);

                return (
                  <button
                    key={idx}
                    className="flex-1 relative group rounded-t-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                    style={{
                      height: `${Math.max(heightPercent, point.count > 0 ? 2 : 0)}%`,
                      backgroundColor: color,
                      opacity: isToday ? 1 : 0.75,
                      transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                    onMouseEnter={(e) => handleMouseEnter(e, point)}
                    onMouseLeave={handleMouseLeave}
                    aria-label={`${formatTooltipDate(point.date)}: ${point.count}`}
                    onFocus={(e) => handleMouseEnter(e as unknown as React.MouseEvent<HTMLButtonElement>, point)}
                    onBlur={handleMouseLeave}
                  >
                    {/* Hover highlight */}
                    <span
                      className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm"
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex gap-0.5 pl-[calc(2rem+8px)]" aria-hidden="true">
          {data.map((point, idx) => {
            // Show label every 5th day, or for first/last entry
            const showLabel =
              idx === 0 || idx === data.length - 1 || (idx + 1) % 5 === 0;
            return (
              <div
                key={idx}
                className="flex-1 flex justify-center"
              >
                {showLabel ? (
                  <span className="text-[9px] text-gray-400 leading-none tabular-nums whitespace-nowrap">
                    {formatDateLabel(point.date)}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
