import { useCallback, useEffect, useMemo, useState } from "react";
import type { SlashCommand } from "./types";
import { PLATFORM_LABELS } from "./types";

type PlatformTone = "copilot" | "claude" | "neutral";

function getPlatformTone(platform: string): PlatformTone {
  const p = platform.toLowerCase();
  if (p.startsWith("claude")) return "claude";
  if (p.startsWith("copilot")) return "copilot";
  return "neutral";
}

interface CardViewerProps {
  cards: SlashCommand[];
  onFinish: () => void;
  onOpenDocs?: (url: string) => void;
}

export function CardViewer({ cards, onFinish, onOpenDocs }: CardViewerProps) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = cards[index];
  const total = cards.length;

  const prev = useCallback(() => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setIsFlipped(false);
    }
  }, [index]);

  const next = useCallback(() => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setIsFlipped(false);
    } else {
      onFinish();
    }
  }, [index, total, onFinish]);

  const flip = useCallback(() => setIsFlipped((f) => !f), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        flip();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [prev, next, flip]);

  const releaseLabel = card?.isNew
    ? "New"
    : card?.isRecentlyUpdated
      ? "Updated"
      : null;

  const tone = useMemo(() => (card ? getPlatformTone(card.platform) : "neutral"), [card]);

  if (!card) return null;

  return (
    <section className="card-viewer">
      <div className="card-viewer__stage">
        <div
          className={`card-viewer__card${isFlipped ? " card-viewer__card--flipped" : ""}`}
          role="button"
          tabIndex={0}
          aria-label={`${isFlipped ? "Back" : "Front"} of card: ${card.command}`}
          onClick={flip}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              flip();
            }
          }}
        >
          <div className="card-viewer__inner">
            <article className="card-viewer__face card-viewer__face--front">
              <div className="card-viewer__front-content">
                <span className="card-viewer__command">{card.command}</span>
              </div>
              <p className="card-viewer__hint">Use arrow-keys or click to flip</p>
            </article>

            <article className="card-viewer__face card-viewer__face--back">
              <div className="card-viewer__back-content">
                <div className="card-viewer__primary">
                  <p className="flash-card__description">
                    <strong>{card.description}</strong>
                  </p>

                  <p className="flash-card__when">
                    {card.whenToUse || "Use this when you want a fast reference for the command."}
                  </p>
                </div>

                {card.aliases.length > 0 ? (
                  <p className="flash-card__aliases">Aliases: {card.aliases.join(", ")}</p>
                ) : null}

                <section className="flash-card__section">
                  <pre className="code-block"><code>{card.example || card.command}</code></pre>
                </section>

                {card.behavior ? (
                  <section className="flash-card__section">
                    <p>{card.behavior}</p>
                  </section>
                ) : null}

                <div className="card-viewer__back-footer">
                  {card.docUrl ? (
                    <button
                      type="button"
                      className={`platform-pill platform-pill--${tone} platform-pill--link`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDocs?.(card.docUrl);
                      }}
                    >
                      {PLATFORM_LABELS[card.platform] ?? card.platform}
                      <span className="pill-link-icon" aria-hidden="true">&#8599;</span>
                    </button>
                  ) : (
                    <span className={`platform-pill platform-pill--${tone}`}>
                      {PLATFORM_LABELS[card.platform] ?? card.platform}
                    </span>
                  )}
                  <span className="category-pill">{card.category}</span>
                  {releaseLabel ? (
                    <span className={`flash-card__release-badge ${card.isNew ? "flash-card__release-badge--new" : "flash-card__release-badge--updated"}`}>
                      {releaseLabel}
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      <div className="card-viewer__controls">
        <button
          type="button"
          className="card-viewer__nav tap-target"
          onClick={prev}
          disabled={index === 0}
          aria-label="Previous card"
        >
          &#8249;
        </button>
        <span className="card-viewer__counter">{index + 1} / {total}</span>
        <button
          type="button"
          className="card-viewer__nav tap-target"
          onClick={next}
          aria-label={index === total - 1 ? "Finish" : "Next card"}
        >
          &#8250;
        </button>
      </div>

      <button type="button" className="link-button tap-target" onClick={onFinish}>
        Create new flashcards
      </button>
    </section>
  );
}
