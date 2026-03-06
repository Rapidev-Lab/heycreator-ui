interface SectionLoaderProps {
  message?: string;
  className?: string;
}

export default function SectionLoader({ message, className }: SectionLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className ?? 'py-20'}`}>
      <div
        role="status"
        aria-label="Loading"
        className="animate-spin rounded-full w-7 h-7 border-b-2 border-brand-navy"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {message && (
        <p className="mt-3 text-sm text-gray-500">{message}</p>
      )}
    </div>
  );
}
