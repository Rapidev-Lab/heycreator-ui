export default function CreatorCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 space-y-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-full bg-gray-200" />
          <div className="flex flex-col space-y-2">
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded w-16" />
              <div className="h-6 bg-gray-200 rounded w-12" />
              <div className="h-6 bg-gray-200 rounded w-12" />
            </div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-200" />
      </div>
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded w-32" />
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="w-8 h-8 rounded-full bg-gray-200" />
      </div>
      <div className="border-t border-gray-200 pt-4">
        <div className="h-12 bg-gray-200 rounded" />
      </div>
      <div className="flex gap-2 h-16 bg-gray-200 rounded" />
      <div className="flex gap-2">
        <div className="h-10 bg-gray-200 rounded flex-1" />
        <div className="h-10 bg-gray-200 rounded flex-1" />
      </div>
    </div>
  );
}
