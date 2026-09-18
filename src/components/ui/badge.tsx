import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning";
}

export function Badge({
  className = "",
  variant = "default",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-medium transition-colors select-none";

  const variantStyles: Record<string, string> = {
    default:
      "bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]",
    secondary:
      "bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]",
    outline:
      "bg-transparent text-[var(--text-secondary)] border border-[var(--border-subtle)]",
    success:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    warning:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.default} ${className}`}
      {...props}
    />
  );
}
