export default function TrendingLoading() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <nav className="sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-xl border-b border-white/[0.04] h-16" />

      <div className="container mx-auto px-4 py-10">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-dark-card border border-white/[0.06] animate-pulse" />
            <div>
              <div className="h-8 w-48 bg-dark-card rounded animate-pulse mb-2" />
              <div className="h-4 w-64 bg-dark-card rounded animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-xl bg-dark-card border border-white/[0.06] animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-dark-card border border-white/[0.06] aspect-[4/3] animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-dark-card border border-white/[0.06] aspect-[4/3] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
