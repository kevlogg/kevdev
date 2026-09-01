export default function Loading() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-4xl space-y-8 animate-pulse">
        {/* Hero Skeleton */}
        <div className="h-12 bg-neutral-800/60 rounded-xl w-3/4 mx-auto" />
        <div className="h-6 bg-neutral-800/40 rounded-lg w-1/2 mx-auto" />
        
        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="h-64 bg-neutral-900/80 border border-neutral-800 rounded-2xl" />
          <div className="h-64 bg-neutral-900/80 border border-neutral-800 rounded-2xl" />
          <div className="h-64 bg-neutral-900/80 border border-neutral-800 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
