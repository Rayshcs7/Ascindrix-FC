// Club crest. Colours come from the theme tokens in globals.css,
// so changing --color-ink / --color-flare recolours it.
export default function Crest({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 120"
      role="img"
      aria-label="Ascindrix FC crest"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 3 L93 15 V58 C93 87 73 107 50 118 C27 107 7 87 7 58 V15 Z"
        fill="var(--color-flare)"
      />
      <path
        d="M50 10 L86 20 V58 C86 83 69 100 50 110 C31 100 14 83 14 58 V20 Z"
        fill="var(--color-ink)"
      />
      <path
        fillRule="evenodd"
        fill="var(--color-flare)"
        d="M50 28 L75 92 H63.5 L58.8 79 H41.2 L36.5 92 H25 Z M50 50 L44.5 68 H55.5 Z"
      />
      <path d="M30 100 L50 88 L70 100 L50 94 Z" fill="var(--color-flare)" opacity="0.55" />
    </svg>
  );
}
