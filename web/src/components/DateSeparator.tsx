type DateSeparatorProps = {
  label: string;
};

export function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <div className="my-3 flex justify-center">
      <span className="max-w-[90vw] rounded-lg bg-[#d4e8d1] px-3 py-1 text-center text-[11px] font-medium leading-snug text-[#54656f] shadow-sm sm:text-xs">
        {label}
      </span>
    </div>
  );
}
