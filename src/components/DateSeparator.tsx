type DateSeparatorProps = {
  label: string;
};

export function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <div className="my-4 flex justify-center px-[var(--space-chat-x)]">
      <span className="max-w-[90vw] rounded-xl bg-[#d4e8d1]/95 px-3.5 py-1.5 text-center text-[11px] font-medium leading-snug text-[#54656f] shadow-sm backdrop-blur-sm sm:text-xs">
        {label}
      </span>
    </div>
  );
}
