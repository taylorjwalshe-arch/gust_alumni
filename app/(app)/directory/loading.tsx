export default function Loading() {
  return (
    <div className="p-6 space-y-3">
      <div className="h-6 w-40 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-xl p-4 space-y-2">
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
            <div className="h-3 w-1/2 bg-gray-200 rounded" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
              <div className="h-5 w-12 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
