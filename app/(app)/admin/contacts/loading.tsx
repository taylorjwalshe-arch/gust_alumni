export default function Loading() {
  return (
    <div className="p-6 space-y-4" role="status" aria-label="Loading admin contacts">
      <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
      <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
      <div className="h-64 w-full bg-gray-100 rounded animate-pulse" />
    </div>
  );
}
