import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type = "text", disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        className={`w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#e1306c] focus:bg-[var(--bg-surface)] focus:outline-none focus:ring-2 focus:ring-[#e1306c]/15 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
