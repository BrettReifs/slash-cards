import type React from "react";

export function CompactVisual(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"

      {...props}
    >
      {/* Tall stack of papers being compressed */}
      <rect x="62" y="12" width="28" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="62" y="20" width="28" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="62" y="28" width="28" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="62" y="36" width="28" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* Compression arrows */}
      <path d="M76 8 L76 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M73 9 L76 6 L79 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M76 45 L76 48" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M73 47 L76 50 L79 47" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Compact cube result */}
      <rect x="64" y="56" width="24" height="16" rx="3" stroke="var(--sc-accent, #0f766e)" strokeWidth="2" />
      <path d="M64 62 L88 62" stroke="var(--sc-accent, #0f766e)" strokeWidth="1.2" />
      {/* Robot character */}
      <circle cx="28" cy="30" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="25" cy="29" r="1.5" fill="currentColor" />
      <circle cx="31" cy="29" r="1.5" fill="currentColor" />
      <path d="M25 33 Q28 35.5 31 33" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* Body */}
      <rect x="22" y="39" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      {/* Arm pushing down */}
      <path d="M34 43 L50 43" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M50 38 L50 48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
