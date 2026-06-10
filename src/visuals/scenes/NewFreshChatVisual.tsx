import type React from "react";

export function NewFreshChatVisual(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"

      {...props}
    >
      {/* Reset / restart button — large circular arrow */}
      <path
        d="M76 24 A22 22 0 1 0 82 40"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Arrow head on the arc */}
      <path d="M79 22 L76 28 L82 28 Z" fill="currentColor" />
      {/* Accent glow ring */}
      <circle cx="67" cy="42" r="10" stroke="var(--sc-accent, #0f766e)" strokeWidth="1.8" strokeDasharray="4 2" />
      {/* Blank canvas / clean slate */}
      <rect x="55" y="30" width="24" height="16" rx="3" fill="var(--sc-accent, #0f766e)" fillOpacity="0.12" stroke="var(--sc-accent, #0f766e)" strokeWidth="1.6" />
      {/* Robot character */}
      <circle cx="26" cy="28" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="23" cy="27" r="1.5" fill="currentColor" />
      <circle cx="29" cy="27" r="1.5" fill="currentColor" />
      {/* Wide eyes expressing wonder */}
      <path d="M23 32 Q26 34.5 29 32" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* Body */}
      <rect x="20" y="37" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      {/* Arm pointing at button */}
      <path d="M32 41 L48 40" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="50" cy="40" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
