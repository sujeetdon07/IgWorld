"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light-theme");
      queueMicrotask(() => setIsDark(true));
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light-theme");
      queueMicrotask(() => setIsDark(false));
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light-theme");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light-theme");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-8 h-8 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-hover)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-secondary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer select-none"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 stroke-[1.8]" />
      ) : (
        <Moon className="w-4 h-4 text-[var(--text-secondary)] stroke-[1.8]" />
      )}
    </button>
  );
}