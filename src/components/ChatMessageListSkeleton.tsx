import { Skeleton } from "./ui/Skeleton";

const BUBBLES = [
  { align: "start", width: "w-[62%]" },
  { align: "end", width: "w-[48%]" },
  { align: "start", width: "w-[72%]" },
  { align: "end", width: "w-[55%]" },
  { align: "start", width: "w-[40%]" },
  { align: "end", width: "w-[65%]" },
  { align: "start", width: "w-[58%]" },
  { align: "end", width: "w-[44%]" },
];

export function ChatMessageListSkeleton() {
  return (
    <div className="chat-wallpaper flex flex-1 flex-col gap-2 px-3 py-4 sm:px-4 md:px-6" aria-label="Caricamento messaggi">
      <div className="mb-2 flex justify-center">
        <Skeleton className="h-6 w-36" rounded="lg" />
      </div>
      {BUBBLES.map((bubble, i) => (
        <div
          key={i}
          className={`flex ${bubble.align === "end" ? "justify-end" : "justify-start"}`}
        >
          <Skeleton className={`h-14 ${bubble.width}`} rounded="lg" />
        </div>
      ))}
    </div>
  );
}
