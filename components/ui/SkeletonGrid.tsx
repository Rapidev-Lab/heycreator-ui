import { ReactNode } from 'react';

interface SkeletonGridProps {
  count?: number;
  cols?: string;
  children: (index: number) => ReactNode;
}

export default function SkeletonGrid({
  count = 6,
  cols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  children,
}: SkeletonGridProps) {
  return (
    <div className={`grid ${cols} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ animationDelay: `${i * 0.15}s` }}>
          {children(i)}
        </div>
      ))}
    </div>
  );
}
