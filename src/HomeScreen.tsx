import { useMemo, useState } from "react";
import { CardViewer } from "./CardViewer";
import type { SlashCommand } from "./types";

type StackTab = "pick" | "make";
type StackPreset = "slash" | "at" | "all";

interface HomeScreenProps {
  commands: SlashCommand[];
  visibleCommands: SlashCommand[];
  onOpenDocs?: (url: string) => void;
  onDiscoverCommands?: () => Promise<void> | void;
}

export function HomeScreen({ visibleCommands, onOpenDocs, onDiscoverCommands }: HomeScreenProps) {
  const [tab, setTab] = useState<StackTab>("pick");
  const [preset, setPreset] = useState<StackPreset>("slash");
  const [viewerCards, setViewerCards] = useState<SlashCommand[] | null>(null);
  const [showFinished, setShowFinished] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);

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

  const canGenerate = preset === "at" || presetCards.length > 0;

  const generate = async () => {
    if (preset === "at" && atCommands.length === 0) {
      setIsDiscovering(true);
      await onDiscoverCommands?.();
      return;
    }
    if (presetCards.length === 0) return;
    setViewerCards(presetCards);
    setShowFinished(false);
  };

  // When atCommands appear after discovery, auto-open the viewer
  const prevAtCountRef = useMemo(() => ({ current: atCommands.length }), []);
  if (isDiscovering && atCommands.length > 0 && atCommands.length !== prevAtCountRef.current) {
    prevAtCountRef.current = atCommands.length;
    setIsDiscovering(false);
    setViewerCards(atCommands);
    setShowFinished(false);
  }

  const handleFinish = () => {
    setViewerCards(null);
    setShowFinished(true);
  };

  const handleNewStack = () => {
    setShowFinished(false);
    setViewerCards(null);
  };

  const handleDiscover = () => {
    setIsDiscovering(true);
    void Promise.resolve(onDiscoverCommands?.()).finally(() => {
      setIsDiscovering(false);
    });
  };

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
        >
          {isDiscovering ? "Refreshing..." : "Discover"}
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
              <span className="home-preset__count">{slashCommands.length}</span>
            </button>
            <button
              type="button"
              className={`home-preset${preset === "at" ? " home-preset--active" : ""}`}
              onClick={() => setPreset("at")}
            >
              <span className="home-preset__icon">@</span>
              <span className="home-preset__label">Participants</span>
              <span className="home-preset__count">{atCommands.length}</span>
            </button>
            <button
              type="button"
              className={`home-preset${preset === "all" ? " home-preset--active" : ""}`}
              onClick={() => setPreset("all")}
            >
              <span className="home-preset__icon">*</span>
              <span className="home-preset__label">All</span>
              <span className="home-preset__count">{visibleCommands.length}</span>
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
