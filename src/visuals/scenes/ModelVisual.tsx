import type React from "react";

export function ModelVisual(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"

      {...props}
    >
      {/* Control panel */}
      <rect x="50" y="28" width="56" height="40" rx="4" stroke="currentColor" strokeWidth="1.8" />
      {/* Model selection cards on panel */}
      <rect x="55" y="34" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="55" y="34" width="14" height="10" rx="2" stroke="var(--sc-accent, #0f766e)" strokeWidth="2" />
      <rect x="74" y="34" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="88" y="34" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      {/* Selection indicator glow on first card */}
      <line x1="57" y1="38" x2="67" y2="38" stroke="var(--sc-accent, #0f766e)" strokeWidth="1" />
      <line x1="57" y1="41" x2="64" y2="41" stroke="var(--sc-accent, #0f766e)" strokeWidth="1" />
      {/* Dial knob */}
      <circle cx="68" cy="57" r="8" stroke="currentColor" strokeWidth="1.6" />
      <line x1="68" y1="49" x2="68" y2="53" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Tick marks on dial */}
      <line x1="60" y1="57" x2="62" y2="57" stroke="currentColor" strokeWidth="1.2" />
      <line x1="76" y1="57" x2="74" y2="57" stroke="currentColor" strokeWidth="1.2" />
      <line x1="68" y1="65" x2="68" y2="63" stroke="currentColor" strokeWidth="1.2" />
      {/* Robot character */}
      <circle cx="25" cy="32" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="22" cy="31" r="1.5" fill="currentColor" />
      <circle cx="28" cy="31" r="1.5" fill="currentColor" />
      <path d="M22 35 Q25 37.5 28 35" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* Body */}
      <rect x="19" y="41" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      {/* Arm pointing at panel */}
      <path d="M31 45 L46 44" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="48" cy="44" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
