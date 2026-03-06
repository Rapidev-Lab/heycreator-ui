export default function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 bg-gray-200 rounded w-28" />
        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
      </div>
      <div className="h-7 bg-gray-200 rounded w-20 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-16" />
    </div>
  );
}
