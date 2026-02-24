import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
}

export function QuestionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="h-5 w-3/4 max-w-[280px]" />
      </div>
      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-14 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <QuestionSkeleton />
      <QuestionSkeleton />
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="h-5 w-2/3 max-w-[240px]" />
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-16 w-16 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-6 rounded-full" />
    </div>
  );
}
