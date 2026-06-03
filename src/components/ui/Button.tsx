import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dangerSoft" | "onDark" | "onDarkOutline";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--wa-accent)] text-white shadow-sm hover:bg-[var(--wa-accent-hover)] active:bg-[var(--wa-accent-hover)] disabled:bg-[var(--wa-accent)]/60",
  secondary:
    "border border-[var(--wa-border)] bg-white text-[var(--wa-text)] shadow-sm hover:bg-[var(--wa-header)] active:bg-[#e9edef] disabled:bg-[var(--wa-header)]",
  ghost:
    "border border-[var(--wa-border)] bg-[var(--wa-header)] text-[var(--wa-text)] hover:bg-[#e9edef] active:bg-[#dfe5e7] disabled:text-[var(--wa-text-muted)]",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-700 disabled:bg-red-400",
  dangerSoft:
    "border border-red-300 bg-red-50 text-red-700 shadow-sm hover:bg-red-100 active:bg-red-100 disabled:bg-red-50",
  onDark:
    "bg-white text-[var(--wa-accent)] shadow-md hover:bg-[#f0fdf9] active:bg-[#ecfdf5] disabled:bg-white/70 disabled:text-[var(--wa-accent)]/70",
  onDarkOutline:
    "border-2 border-white/90 bg-transparent text-white hover:bg-white/15 active:bg-white/25 disabled:border-white/50 disabled:text-white/60",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-[44px] touch-manipulation items-center justify-center rounded-xl px-4 text-sm font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70 ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    />
  );
}
