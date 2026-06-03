import { Skeleton } from "./ui/Skeleton";

const ROWS = 6;

export function ChatSidebarSkeleton() {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2" aria-label="Caricamento chat">
      {Array.from({ length: ROWS }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl px-2 py-3">
          <Skeleton className="h-12 w-12 shrink-0" rounded="full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-[70%]" />
            <Skeleton className="h-3 w-[45%]" />
          </div>
        </div>
      ))}
    </div>
  );
}
