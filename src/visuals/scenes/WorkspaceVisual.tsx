import type React from "react";

export function WorkspaceVisual(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"

      {...props}
    >
      {/* File nodes around the robot */}
      {/* Top node */}
      <rect x="52" y="8" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="56" y1="12" x2="64" y2="12" stroke="currentColor" strokeWidth="1" />
      <line x1="56" y1="15" x2="62" y2="15" stroke="currentColor" strokeWidth="1" />
      {/* Right node */}
      <rect x="88" y="28" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="92" y1="32" x2="100" y2="32" stroke="currentColor" strokeWidth="1" />
      <line x1="92" y1="35" x2="98" y2="35" stroke="currentColor" strokeWidth="1" />
      {/* Bottom-right node */}
      <rect x="80" y="58" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="84" y1="62" x2="92" y2="62" stroke="currentColor" strokeWidth="1" />
      <line x1="84" y1="65" x2="90" y2="65" stroke="currentColor" strokeWidth="1" />
      {/* Connection lines from center robot to nodes */}
      <line x1="44" y1="34" x2="57" y2="19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 2" />
      <line x1="52" y1="38" x2="88" y2="34" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 2" />
      <line x1="50" y1="46" x2="82" y2="62" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 2" />
      {/* Accent hub ring */}
      <circle cx="40" cy="40" r="14" stroke="var(--sc-accent, #0f766e)" strokeWidth="1.6" strokeDasharray="4 2" />
      {/* Robot character */}
      <circle cx="40" cy="34" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="37" cy="33" r="1.5" fill="currentColor" />
      <circle cx="43" cy="33" r="1.5" fill="currentColor" />
      <path d="M37 37 Q40 39.5 43 37" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* Body */}
      <rect x="34" y="43" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
