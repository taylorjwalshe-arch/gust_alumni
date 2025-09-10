export default function Loading() {
  return (
    <div className="p-6 space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-6 w-32 bg-gray-200 rounded" />
      <div className="h-24 w-full bg-gray-100 rounded-2xl" />
      <ul className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="border rounded-xl p-4 flex items-start gap-3">
            <div className="h-6 w-14 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
              <div className="h-3 w-1/3 bg-gray-200 rounded" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
