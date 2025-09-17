export default function Loading() {
  return (
    <div className="p-6 space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-6 w-40 bg-gray-200 rounded" />
      <div className="h-28 w-full bg-gray-100 rounded-2xl" />
      <div className="h-56 w-full bg-gray-100 rounded-2xl" />
    </div>
  );
}
