interface SkeletonBoxProps {
  className?: string;
}

export function SkeletonBox({ className }: SkeletonBoxProps) {
  return <div className={`bg-gray-200 animate-pulse rounded-lg ${className ?? ''}`} />;
}

interface SkeletonCircleProps {
  className?: string;
}

export function SkeletonCircle({ className }: SkeletonCircleProps) {
  return <div className={`bg-gray-200 animate-pulse rounded-full ${className ?? ''}`} />;
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  const widths = ['w-full', 'w-3/4', 'w-1/2'];
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3 bg-gray-200 animate-pulse rounded ${widths[i % widths.length]}`}
        />
      ))}
    </div>
  );
}
