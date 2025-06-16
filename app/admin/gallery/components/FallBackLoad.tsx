import React from 'react'
import { cn } from "@/lib/utils"

const FallBackLoad = () => {
  return (
    <div className="w-full space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted/60 rounded-md animate-pulse" />
          <div className="h-4 w-32 bg-muted/40 rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-muted/60 rounded-md animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            {/* Image skeleton */}
            <div className="aspect-square bg-muted/60 rounded-lg animate-pulse" />
            {/* Title skeleton */}
            <div className="h-4 w-3/4 bg-muted/40 rounded-md animate-pulse" />
            {/* Description skeleton */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted/30 rounded-md animate-pulse" />
              <div className="h-3 w-2/3 bg-muted/30 rounded-md animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FallBackLoad
