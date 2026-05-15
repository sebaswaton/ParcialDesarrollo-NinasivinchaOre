export function LoadingSpinner({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-green-100" />
        <div className="absolute inset-0 rounded-full border-4 border-green-700 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-gray-400 font-medium">{text}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-4 space-y-3">
      <div className="skeleton h-36 w-full" />
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-3/4" />
    </div>
  );
}
