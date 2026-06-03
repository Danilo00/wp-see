type SkeletonProps = {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
};

const roundedMap = {
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export function Skeleton({ className = "", rounded = "md" }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer bg-[#e9edef] ${roundedMap[rounded]} ${className}`}
      aria-hidden
    />
  );
}
