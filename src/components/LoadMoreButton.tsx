import { Skeleton } from "./ui/Skeleton";
import { Button } from "./ui/Button";

type LoadMoreButtonProps = {
  label: string;
  onClick: () => void;
  loading?: boolean;
};

export function LoadMoreButton({ label, onClick, loading }: LoadMoreButtonProps) {
  if (loading) {
    return (
      <div className="flex justify-center px-[var(--space-chat-x)] py-3">
        <Skeleton className="h-10 w-44" rounded="full" />
      </div>
    );
  }

  return (
    <div className="flex justify-center px-[var(--space-chat-x)] py-3">
      <Button
        variant="secondary"
        onClick={onClick}
        disabled={loading}
        className="rounded-full bg-white/95 px-5 text-[#027eb5] shadow-md hover:bg-white"
      >
        {label}
      </Button>
    </div>
  );
}
