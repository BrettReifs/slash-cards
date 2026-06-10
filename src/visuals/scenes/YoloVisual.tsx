import type React from "react";

export function YoloVisual(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"

      {...props}
    >
      {/* Launch ramp */}
      <path d="M20 64 Q50 62 70 44" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* Speed lines behind robot */}
      <line x1="50" y1="48" x2="42" y2="54" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="3 2" />
      <line x1="54" y1="52" x2="44" y2="60" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="3 2" />
      <line x1="46" y1="44" x2="36" y2="48" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="3 2" />
      {/* Cape */}
      <path d="M82 24 Q90 28 88 36 Q84 40 78 38" stroke="var(--sc-accent, #0f766e)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M82 24 Q78 32 78 38" stroke="var(--sc-accent, #0f766e)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Robot character flying */}
      <circle cx="84" cy="22" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="81" cy="21" r="1.5" fill="currentColor" />
      <circle cx="87" cy="21" r="1.5" fill="currentColor" />
      {/* Big grin */}
      <path d="M80 25 Q84 28.5 88 25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* Body tilted forward */}
      <rect x="78" y="30" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" transform="rotate(-20 84 34)" />
      {/* Stars / chaos sparks */}
      <path d="M60 18 L62 14 L64 18 L68 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M96 50 L98 46 L100 50 L104 48" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Danger triangle accent */}
      <path d="M30 36 L38 22 L46 36 Z" stroke="var(--sc-accent, #0f766e)" strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="38" y1="27" x2="38" y2="31" stroke="var(--sc-accent, #0f766e)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="38" cy="33.5" r="1" fill="var(--sc-accent, #0f766e)" />
    </svg>
  );
}
