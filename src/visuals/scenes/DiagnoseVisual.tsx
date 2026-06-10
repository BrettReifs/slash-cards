import type React from "react";

export function DiagnoseVisual(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"

      {...props}
    >
      {/* EKG / heartbeat trace */}
      <path
        d="M48 52 L58 52 L62 40 L66 58 L70 44 L74 52 L84 52"
        stroke="var(--sc-accent, #0f766e)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Flat line on left (before) */}
      <line x1="28" y1="52" x2="48" y2="52" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Flat line on right (after) */}
      <line x1="84" y1="52" x2="100" y2="52" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Magnifying glass */}
      <circle cx="28" cy="30" r="11" stroke="currentColor" strokeWidth="2" />
      <circle cx="28" cy="30" r="7" stroke="currentColor" strokeWidth="1.4" />
      <line x1="36" y1="38" x2="44" y2="46" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      {/* Robot character (small, looking through glass) */}
      <circle cx="86" cy="22" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="83" cy="21" r="1.5" fill="currentColor" />
      <circle cx="89" cy="21" r="1.5" fill="currentColor" />
      <path d="M83 25.5 Q86 27.5 89 25.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* Body */}
      <rect x="80" y="31" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      {/* Arm pointing at EKG */}
      <path d="M80 36 L74 40" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
