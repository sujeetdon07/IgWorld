export function InstagramIcon({ className = "w-5 h-5 text-white" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5.5" ry="5.5" />
      <circle cx="12" cy="12" r="4.25" />
      <circle cx="17.75" cy="6.25" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}
