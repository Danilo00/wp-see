type LoadMoreButtonProps = {
  label: string;
  onClick: () => void;
  loading?: boolean;
};

export function LoadMoreButton({ label, onClick, loading }: LoadMoreButtonProps) {
  return (
    <div className="flex justify-center py-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="min-h-[44px] touch-manipulation rounded-full bg-white/90 px-5 py-2.5 text-sm font-medium text-[#027eb5] shadow active:bg-white disabled:opacity-60 md:py-1.5"
      >
        {loading ? "Caricamento…" : label}
      </button>
    </div>
  );
}
