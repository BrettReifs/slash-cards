import { useEffect, useRef, useMemo } from "react";
import type { KeyboardEvent } from "react";
import type { CommandGroup } from "./types";
import { PLATFORM_LABELS } from "./types";

type PlatformTone = "copilot" | "claude" | "neutral";

function getPlatformTone(platform: string): PlatformTone {
  const normalized = platform.toLowerCase();
  if (normalized.startsWith("claude")) return "claude";
  if (normalized.startsWith("copilot")) return "copilot";
  return "neutral";
}

function normalizeEquivalentName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  const suffix = trimmed.includes("--") ? trimmed.split("--").pop() ?? trimmed : trimmed;
  return suffix.startsWith("/") ? suffix : `/${suffix}`;
}

interface CardDetailOverlayProps {
  group: CommandGroup;
  onClose: () => void;
  onOpenDocs?: (url: string) => void;
  onSearchCommand?: (command: string) => void;
}

export function CardDetailOverlay({
  group,
  onClose,
  onOpenDocs,
  onSearchCommand,
}: CardDetailOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const command = group.topEntry;

  const platformDocs = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of group.entries) {
      if (entry.docUrl) {
        map.set(entry.platform, entry.docUrl);
      }
    }
    return map;
  }, [group.entries]);

  const equivalents = useMemo(
    () =>
      command.equivalents
        .map((eq) => normalizeEquivalentName(eq))
        .filter((eq) => eq.trim() && eq !== command.command),
    [command.command, command.equivalents],
  );

  const releaseLabel = command.isNew
    ? "New"
    : command.isRecentlyUpdated
      ? "Updated"
      : null;

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Tab") {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div
      className="card-overlay-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${command.command}`}
    >
      <div
        className="card-overlay-panel"
        ref={panelRef}
        tabIndex={-1}
        onKeyDown={handlePanelKeyDown}
      >
        <button
          type="button"
          className="card-overlay-close tap-target"
          onClick={onClose}
          aria-label="Close detail view"
        >
          ✕
        </button>

        <div className="card-overlay-content">
          <div>
            <div className="card-overlay-header">
              <span className="flash-card__command flash-card__command--hero">
                {command.command}
              </span>
            </div>
            <p className="flash-card__description">
              <strong>{command.description}</strong>
            </p>
            {command.aliases.length > 0 ? (
              <p className="flash-card__aliases">
                Aliases: {command.aliases.join(", ")}
              </p>
            ) : null}
            <div className="pill-row">
              <span className="category-pill">{command.category}</span>
              {releaseLabel ? (
                <span
                  className={`flash-card__release-badge ${
                    command.isNew
                      ? "flash-card__release-badge--new"
                      : "flash-card__release-badge--updated"
                  }`}
                >
                  {releaseLabel}
                </span>
              ) : null}
              {command.releaseVersion ? (
                <span className="flash-card__release-meta">
                  {command.releaseVersion}
                </span>
              ) : null}
            </div>
          </div>

          <section className="flash-card__section">
            <h3 className="section-title">Available on</h3>
            <div className="pill-row">
              {group.platforms.map((platform) => {
                const docUrl = platformDocs.get(platform);
                return docUrl ? (
                  <button
                    key={platform}
                    type="button"
                    className={`platform-pill platform-pill--${getPlatformTone(platform)} platform-pill--link`}
                    onClick={() => onOpenDocs?.(docUrl)}
                    aria-label={`Open docs for ${PLATFORM_LABELS[platform] ?? platform}`}
                  >
                    {PLATFORM_LABELS[platform] ?? platform}
                    <span className="pill-link-icon" aria-hidden="true">↗</span>
                  </button>
                ) : (
                  <span
                    key={platform}
                    className={`platform-pill platform-pill--${getPlatformTone(platform)}`}
                  >
                    {PLATFORM_LABELS[platform] ?? platform}
                  </span>
                );
              })}
            </div>
          </section>

          <section className="flash-card__section">
            <h3 className="section-title">When to use</h3>
            <p>{command.whenToUse || "Use this when you want a fast reference for the command."}</p>
          </section>

          <section className="flash-card__section">
            <h3 className="section-title">Example</h3>
            <pre className="code-block">
              <code>{command.example || command.command}</code>
            </pre>
          </section>

          {equivalents.length > 0 ? (
            <section className="flash-card__section">
              <h3 className="section-title">Equivalent commands</h3>
              <div className="pill-row">
                {equivalents.map((equivalent) => (
                  <button
                    key={equivalent}
                    type="button"
                    className="tag-pill tag-pill--action tap-target"
                    onClick={() => {
                      onClose();
                      onSearchCommand?.(equivalent);
                    }}
                  >
                    {equivalent}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {command.behavior ? (
            <section className="flash-card__section">
              <h3 className="section-title">Behavior notes</h3>
              <p>{command.behavior}</p>
            </section>
          ) : null}

          {command.tags.length > 0 ? (
            <div className="card-overlay-footer">
              <div className="pill-row pill-row--compact">
                {command.tags.map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
