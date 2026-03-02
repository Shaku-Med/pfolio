export function LoadMoreSkeleton() {
  return (
    <div
      className="flex w-full items-center justify-center gap-2 py-8"
      aria-hidden
    >
      <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/40" />
      <div
        className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/40"
        style={{ animationDelay: "0.15s" }}
      />
      <div
        className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/40"
        style={{ animationDelay: "0.3s" }}
      />
    </div>
  );
}
