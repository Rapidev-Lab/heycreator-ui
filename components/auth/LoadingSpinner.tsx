/**
 * Loading spinner component for auth states
 */
export default function LoadingSpinner({
  message = 'Loading...',
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
}
