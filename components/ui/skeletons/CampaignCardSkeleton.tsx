export default function CampaignCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
            <div className="flex items-center gap-2">
              <div className="h-5 bg-gray-200 rounded w-16" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-16" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-28" />
    </div>
  );
}
