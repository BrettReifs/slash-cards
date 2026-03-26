import { useEffect, useMemo, useState } from "react";
import { CardViewer } from "./CardViewer";
import type { SlashCommand } from "./types";

type StackTab = "pick" | "make";
type StackPreset = "slash" | "at" | "all";
type DiscoverTrigger = "discover" | "generate";

type DiscoverCounts = Record<StackPreset, number>;

type DiscoverResult = {
  success: boolean;
};

type DiscoverRun = {
  activePreset: StackPreset;
  baseline: DiscoverCounts;
  success: boolean | null;
  trigger: DiscoverTrigger;
};

type DiscoverFeedback = {
  activePreset: StackPreset;
  delta: DiscoverCounts;
  hasNew: boolean;
};

const DISCOVER_WORDS = ["exploring", "retrieving", "searching", "scanning"] as const;
const MIN_DISCOVER_CYCLE_MS = 1600;

interface HomeScreenProps {
  commands: SlashCommand[];
  visibleCommands: SlashCommand[];
  onOpenDocs?: (url: string) => void;
  onDiscoverCommands?: () => Promise<DiscoverResult | void> | DiscoverResult | void;
}

export function HomeScreen({ visibleCommands, onOpenDocs, onDiscoverCommands }: HomeScreenProps) {
  const [tab, setTab] = useState<StackTab>("pick");
  const [preset, setPreset] = useState<StackPreset>("slash");
  const [viewerCards, setViewerCards] = useState<SlashCommand[] | null>(null);
  const [showFinished, setShowFinished] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverRun, setDiscoverRun] = useState<DiscoverRun | null>(null);
  const [discoverFeedback, setDiscoverFeedback] = useState<DiscoverFeedback | null>(null);
  const [discoverWordIndex, setDiscoverWordIndex] = useState(0);

  const slashCommands = useMemo(
    () => visibleCommands.filter((c) => c.command.startsWith("/")),
    [visibleCommands],
  );

  const atCommands = useMemo(
    () => visibleCommands.filter((c) => c.command.startsWith("@")),
    [visibleCommands],
  );

  const presetCards = useMemo(() => {
    if (preset === "slash") return slashCommands;
    if (preset === "at") return atCommands;
    return visibleCommands;
  }, [preset, slashCommands, atCommands, visibleCommands]);

  const counts = useMemo<DiscoverCounts>(
    () => ({
      slash: slashCommands.length,
      at: atCommands.length,
      all: visibleCommands.length,
    }),
    [atCommands.length, slashCommands.length, visibleCommands.length],
  );

  const canGenerate = preset === "at" || presetCards.length > 0;

  useEffect(() => {
    if (!isDiscovering) {
      setDiscoverWordIndex(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setDiscoverWordIndex((current) => (current + 1) % DISCOVER_WORDS.length);
    }, 700);

    return () => window.clearInterval(intervalId);
  }, [isDiscovering]);

  useEffect(() => {
    if (!discoverRun || isDiscovering || discoverRun.success === null) {
      return;
    }

    if (!discoverRun.success) {
      setDiscoverRun(null);
      return;
    }

    const delta: DiscoverCounts = {
      slash: Math.max(0, counts.slash - discoverRun.baseline.slash),
      at: Math.max(0, counts.at - discoverRun.baseline.at),
      all: Math.max(0, counts.all - discoverRun.baseline.all),
    };
    const hasNew = delta.slash > 0 || delta.at > 0 || delta.all > 0;

    setDiscoverFeedback({
      activePreset: discoverRun.activePreset,
      delta,
      hasNew,
    });

    if (discoverRun.trigger === "generate" && counts.at > 0) {
      setViewerCards(atCommands);
      setShowFinished(false);
    }

    setDiscoverRun(null);
  }, [atCommands, counts, discoverRun, isDiscovering]);

  useEffect(() => {
    if (!discoverFeedback || isDiscovering) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDiscoverFeedback(null);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [discoverFeedback, isDiscovering]);

  const startDiscover = async (trigger: DiscoverTrigger) => {
    const nextRun: DiscoverRun = {
      activePreset: preset,
      baseline: counts,
      success: null,
      trigger,
    };

    setDiscoverFeedback(null);
    setDiscoverRun(nextRun);
    setIsDiscovering(true);
    const startedAt = Date.now();

    try {
      const result = await onDiscoverCommands?.();
      const remainingTime = MIN_DISCOVER_CYCLE_MS - (Date.now() - startedAt);

      if (remainingTime > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingTime));
      }

      setDiscoverRun({
        ...nextRun,
        success: result?.success ?? true,
      });
    } catch {
      setDiscoverRun({
        ...nextRun,
        success: false,
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const generate = async () => {
    if (preset === "at" && atCommands.length === 0) {
      await startDiscover("generate");
      return;
    }
    if (presetCards.length === 0) return;
    setViewerCards(presetCards);
    setShowFinished(false);
  };

  const handleFinish = () => {
    setViewerCards(null);
    setShowFinished(true);
  };

  const handleNewStack = () => {
    setShowFinished(false);
    setViewerCards(null);
  };

  const handleDiscover = () => {
    void startDiscover("discover");
  };

  const getPresetDelta = (presetKey: StackPreset) =>
    discoverFeedback?.delta[presetKey] ?? 0;

  const shouldAccentCount = (presetKey: StackPreset) => {
    if (!discoverFeedback) {
      return false;
    }

    if (discoverFeedback.delta[presetKey] > 0) {
      return true;
    }

    return !discoverFeedback.hasNew && discoverFeedback.activePreset === presetKey;
  };

  const discoverLabel = isDiscovering ? DISCOVER_WORDS[discoverWordIndex] : "Discover";

  if (viewerCards && viewerCards.length > 0) {
    return (
      <CardViewer cards={viewerCards} onFinish={handleFinish} onOpenDocs={onOpenDocs} />
    );
  }

  if (showFinished) {
    return (
      <section className="home-finished">
        <div className="home-finished__content">
          <h2 className="home-finished__title">Stack complete</h2>
          <p className="home-finished__subtitle">
            You reviewed {presetCards.length} cards. Scroll down to browse the full gallery, or generate a new stack.
          </p>
          <div className="home-finished__actions">
            <button type="button" className="toolbar-button tap-target" onClick={handleNewStack}>
              Create new flashcards
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="home-screen">
      <h1 className="home-screen__title">Create F/<span className="home-screen__at">@</span>shcards</h1>

      <div className="home-screen__controls">
        <button
          type="button"
          className="home-discover tap-target"
          onClick={handleDiscover}
          disabled={isDiscovering}
          data-discovering={isDiscovering ? "true" : undefined}
        >
          <span className="home-discover__label">{discoverLabel}</span>
        </button>

        <div className="home-screen__tabs">
          <button
            type="button"
            className={`home-tab${tab === "pick" ? " home-tab--active" : ""}`}
            onClick={() => setTab("pick")}
          >
            Pick Stack
          </button>
          <button
            type="button"
            className={`home-tab${tab === "make" ? " home-tab--active" : ""}`}
            onClick={() => setTab("make")}
          >
            Make Stack
          </button>
        </div>
      </div>

      {tab === "pick" ? (
        <div className="home-screen__pick">
          <div className="home-presets">
            <button
              type="button"
              className={`home-preset${preset === "slash" ? " home-preset--active" : ""}`}
              onClick={() => setPreset("slash")}
            >
              <span className="home-preset__icon">/</span>
              <span className="home-preset__label">Slash commands</span>
              <span className="home-preset__count-row">
                <span className={`home-preset__count${shouldAccentCount("slash") ? " home-preset__count--accent" : ""}`}>
                  {slashCommands.length}
                </span>
                {getPresetDelta("slash") > 0 ? (
                  <span className="home-preset__delta">+ {getPresetDelta("slash")} new</span>
                ) : null}
              </span>
            </button>
            <button
              type="button"
              className={`home-preset${preset === "at" ? " home-preset--active" : ""}`}
              onClick={() => setPreset("at")}
            >
              <span className="home-preset__icon">@</span>
              <span className="home-preset__label">Participants</span>
              <span className="home-preset__count-row">
                <span className={`home-preset__count${shouldAccentCount("at") ? " home-preset__count--accent" : ""}`}>
                  {atCommands.length}
                </span>
                {getPresetDelta("at") > 0 ? (
                  <span className="home-preset__delta">+ {getPresetDelta("at")} new</span>
                ) : null}
              </span>
            </button>
            <button
              type="button"
              className={`home-preset${preset === "all" ? " home-preset--active" : ""}`}
              onClick={() => setPreset("all")}
            >
              <span className="home-preset__icon">*</span>
              <span className="home-preset__label">All</span>
              <span className="home-preset__count-row">
                <span className={`home-preset__count${shouldAccentCount("all") ? " home-preset__count--accent" : ""}`}>
                  {visibleCommands.length}
                </span>
                {getPresetDelta("all") > 0 ? (
                  <span className="home-preset__delta">+ {getPresetDelta("all")} new</span>
                ) : null}
              </span>
            </button>
          </div>

          <button
            type="button"
            className="home-generate tap-target"
            onClick={generate}
            disabled={!canGenerate || isDiscovering}
          >
            {isDiscovering ? "Discovering participants…" : preset === "at" && atCommands.length === 0 ? "Discover @participants" : "Generate flashcards"}
          </button>
        </div>
      ) : (
        <div className="home-screen__make">
          <textarea
            className="home-make__input"
            placeholder={"Describe a topic. GitHub Copilot will generate the cards for you.\n\nExample: \"Commands to manage pull requests in GitHub\""}
            rows={6}
            disabled
          />
          <button type="button" className="home-generate tap-target" disabled>
            Generate flashcards
          </button>
          <p className="helper-text" style={{ textAlign: "center" }}>
            Coming soon &#8212; requires Copilot SDK integration
          </p>
        </div>
      )}
    </section>
  );
}
