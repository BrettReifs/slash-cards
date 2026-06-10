import type { CardVisualSurface } from "../types";
import { getVisual } from "./registry";

interface CardVisualProps {
  visualId: string;
  surface: CardVisualSurface;
  label?: string;
}

export function CardVisual({ visualId, surface, label }: CardVisualProps) {
  const entry = getVisual(visualId);
  if (!entry) return null;

  const { component: Visual, alt } = entry;

  if (surface === "overlay") {
    return (
      <div className="card-visual card-visual--overlay" aria-hidden="true">
        <Visual className="card-visual__svg" />
      </div>
    );
  }

  return (
    <div className={`card-visual card-visual--${surface}`}>
      <Visual
        className="card-visual__svg"
        role="img"
        aria-label={alt}
      />
      <div className="card-visual__scrim" aria-hidden="true" />
      {label ? (
        <span className="card-visual__label-chip" aria-hidden="true">
          {label}
        </span>
      ) : null}
    </div>
  );
}
