import type React from "react";

export function FixVisual(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"

      {...props}
    >
      {/* Cracked gear */}
      <circle cx="72" cy="42" r="14" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="72" cy="42" r="6" stroke="currentColor" strokeWidth="1.5" />
      {/* Gear teeth */}
      <rect x="69" y="24" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="69" y="55" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="54" y="39" width="5" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="83" y="39" width="5" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      {/* Crack */}
      <path d="M72 34 L69 38 L73 42 L70 46" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {/* Wrench */}
      <path d="M28 62 L52 38" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="26" cy="64" r="5" stroke="currentColor" strokeWidth="1.8" />
      {/* Wrench head detail */}
      <path d="M52 34 C54 31 58 31 58 34 C58 37 54 38 52 38 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {/* Robot character */}
      <circle cx="24" cy="28" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="21" cy="27" r="1.5" fill="currentColor" />
      <circle cx="27" cy="27" r="1.5" fill="currentColor" />
      <path d="M21 31 Q24 33.5 27 31" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* Body */}
      <rect x="18" y="37" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      {/* Arm holding wrench */}
      <path d="M30 40 L38 46" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Accent spark at fix point */}
      <path d="M56 36 L58 32 L60 36 L64 34" stroke="var(--sc-accent, #0f766e)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
