"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationBarProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function PaginationBar({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  className = "",
}: PaginationBarProps) {
  if (totalCount === 0) return null;

  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) {
    return (
      <div className={`flex items-center justify-between pt-6 ${className}`}>
        <p className="text-sm text-gray-500">
          Showing {totalCount} of {totalCount} result{totalCount !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }

  const rangeStart = currentPage * pageSize + 1;
  const rangeEnd = Math.min((currentPage + 1) * pageSize, totalCount);

  // Build visible page numbers — show up to 5 with ellipsis
  const pages: (number | "ellipsis")[] = [];
  if (totalPages <= 5) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else {
    pages.push(0);
    if (currentPage > 2) pages.push("ellipsis");
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages - 2, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 3) pages.push("ellipsis");
    pages.push(totalPages - 1);
  }

  return (
    <div className={`flex items-center justify-between pt-6 ${className}`}>
      <p className="text-sm text-gray-500">
        Showing {rangeStart}-{rangeEnd} of {totalCount} result{totalCount !== 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {pages.map((page, i) =>
          page === "ellipsis" ? (
            <span key={`e-${i}`} className="px-1 text-sm text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-brand-navy text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {page + 1}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
