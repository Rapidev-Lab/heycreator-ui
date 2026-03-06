"use client";
export default function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-[320px]"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl" />
            <div className="w-5 h-5 bg-gray-100 rounded-full" />
          </div>
          <div className="h-6 w-3/4 bg-gray-100 rounded mb-2" />
          <div className="h-4 w-1/4 bg-gray-100 rounded mb-6" />
          <div className="flex gap-2 mb-8">
            <div className="h-6 w-16 bg-gray-50 rounded-full" />
            <div className="h-6 w-16 bg-gray-50 rounded-full" />
          </div>
          <div className="h-12 w-full bg-gray-50 rounded-xl mt-auto" />
        </div>
      ))}
    </div>
  );
}
