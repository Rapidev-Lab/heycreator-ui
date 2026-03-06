'use client';

// ===== SEAT COUNTER =====
// Circular progress ring showing seat usage.
// Turns red when seats are full (used >= total).

interface SeatCounterProps {
  used: number;
  total: number;
  className?: string;
}

const RING_RADIUS = 24;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function SeatCounter({ used, total, className = '' }: SeatCounterProps) {
  const isFull = used >= total;
  const percentage = total > 0 ? Math.min(used / total, 1) : 0;
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - percentage);

  const usedColor = isFull ? '#FF3B30' : '#001F54';
  const label = isFull ? 'Seats full' : 'seats used';

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {/* SVG Ring */}
      <div className="relative w-[60px] h-[60px]">
        <svg
          width="60"
          height="60"
          viewBox="0 0 60 60"
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Track (background ring) */}
          <circle
            cx="30"
            cy="30"
            r={RING_RADIUS}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="6"
          />
          {/* Progress ring */}
          <circle
            cx="30"
            cy="30"
            r={RING_RADIUS}
            fill="none"
            stroke={usedColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.3s ease' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-[11px] font-bold leading-none"
            style={{ color: usedColor }}
            aria-label={`${used} of ${total} seats used`}
          >
            {used}/{total}
          </span>
        </div>
      </div>

      {/* Label below */}
      <span
        className="text-xs leading-none"
        style={{ color: isFull ? '#FF3B30' : '#6B7280' }}
      >
        {label}
      </span>
    </div>
  );
}
