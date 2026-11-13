/**
 * Placeholder for the signal arc. The final brand SVG replaces this path.
 */
export function ArcMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 16"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 14C8 3 20 3 26 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
