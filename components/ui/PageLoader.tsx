interface PageLoaderProps {
  message?: string;
}

export default function PageLoader({ message }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div
        role="status"
        aria-label="Loading"
        className="animate-spin rounded-full w-10 h-10 border-b-2 border-brand-navy"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {message && (
        <p className="mt-4 text-sm text-gray-500">{message}</p>
      )}
    </div>
  );
}
