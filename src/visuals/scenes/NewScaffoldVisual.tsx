import type React from "react";

export function NewScaffoldVisual(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"

      {...props}
    >
      {/* Scaffold structure */}
      <line x1="55" y1="20" x2="55" y2="68" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="80" y1="20" x2="80" y2="68" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="53" y1="32" x2="82" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="53" y1="48" x2="82" y2="48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="53" y1="64" x2="82" y2="64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Diagonal braces */}
      <line x1="55" y1="32" x2="80" y2="48" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="3 2" />
      {/* Building block being placed */}
      <rect x="58" y="17" width="19" height="14" rx="2" stroke="var(--sc-accent, #0f766e)" strokeWidth="2" />
      {/* Hard hat */}
      <path d="M16 26 Q16 18 25 18 Q34 18 34 26 Z" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <line x1="13" y1="26" x2="37" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Robot character with hard hat */}
      <circle cx="25" cy="34" r="8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="22" cy="33" r="1.5" fill="currentColor" />
      <circle cx="28" cy="33" r="1.5" fill="currentColor" />
      <path d="M22 37 Q25 39.5 28 37" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* Body */}
      <rect x="19" y="42" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      {/* Arm raised up */}
      <path d="M31 45 L43 36 L49 30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
