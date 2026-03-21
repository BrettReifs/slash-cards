import type { KeyboardEvent } from "react";
import type { SlashCommand } from "./types";

interface FlashCardProps {
  command: SlashCommand;
  onClick?: () => void;
  stackCount?: number;
  stackPlatforms?: string[];
  isAvailableInSession?: boolean;
}

export function FlashCard({
  command,
  onClick,
  stackCount = 1,
  isAvailableInSession,
}: FlashCardProps) {
  const isStacked = stackCount > 1;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={`flash-card${isStacked ? " flash-card--stacked" : ""}${
        isAvailableInSession === false ? " flash-card--unavailable" : ""
      }`}
      data-stack-depth={isStacked ? Math.min(stackCount, 4) : undefined}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${command.command}${
        isStacked ? ` (${stackCount} platforms)` : ""
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <article className="flash-card__face flash-card__face--front">
        {isAvailableInSession ? (
          <span className="flash-card__session-dot" aria-label="Available in this session" />
        ) : null}
        {isStacked ? (
          <span className="flash-card__stack-badge">
            {stackCount} platforms
          </span>
        ) : null}

        <div className="flash-card__front-copy flash-card__front-copy--hero">
          <span className="flash-card__command flash-card__command--hero">
            {command.command}
          </span>
        </div>
      </article>
    </div>
  );
}
