import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "default" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "default", disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl select-none transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#e1306c]";

    const variantStyles: Record<string, string> = {
      primary:
        "bg-[#e1306c] hover:bg-[#d0255f] text-white text-white-force font-semibold shadow-xs",
      secondary:
        "bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)]",
      outline:
        "bg-transparent border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-surface-secondary)] text-[var(--text-primary)]",
      ghost:
        "bg-transparent hover:bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
      destructive:
        "bg-rose-600 hover:bg-rose-700 text-white text-white-force font-semibold shadow-xs",
    };

    const sizeStyles: Record<string, string> = {
      sm: "h-8 px-3 text-xs gap-1.5",
      default: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "w-9 h-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.default} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
