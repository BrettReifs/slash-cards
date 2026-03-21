import { useMemo } from "react";
import type { SlashCommand } from "./types";

type DifferenceKey = "aliases" | "description" | "whenToUse" | "example";

type ComparisonGroup = {
  platform: string;
  entries: SlashCommand[];
};

interface ComparisonViewProps {
  commandName: string;
  commands: SlashCommand[];
  onBack: () => void;
}

function normalizeList(items: string[]) {
  return [...items].sort().join("|");
}

function fieldIsDifferent(
  commands: SlashCommand[],
  key: DifferenceKey
): boolean {
  if (commands.length <= 1) {
    return false;
  }

  const signatures = commands.map((command) => {
    if (key === "aliases") {
      return normalizeList(command.aliases);
    }

    return command[key].trim();
  });

  return new Set(signatures).size > 1;
}

function getPlatformTone(platform: string) {
  const normalized = platform.toLowerCase();

  if (normalized.startsWith("claude")) {
    return "claude";
  }

  if (normalized.startsWith("copilot")) {
    return "copilot";
  }

  return "neutral";
}

export function ComparisonView({
  commandName,
  commands,
  onBack,
}: ComparisonViewProps) {
  const comparableCommands = useMemo(() => {
    const exactMatches = commands.filter(
      (command) => command.command.toLowerCase() === commandName.toLowerCase()
    );

    if (exactMatches.length > 0) {
      return exactMatches;
    }

    return commands.filter((command) =>
      command.equivalents.some(
        (equivalent) => equivalent.toLowerCase() === commandName.toLowerCase()
      )
    );
  }, [commandName, commands]);

  const groups = useMemo<ComparisonGroup[]>(() => {
    const grouped = new Map<string, SlashCommand[]>();

    for (const command of comparableCommands) {
      grouped.set(command.platform, [
        ...(grouped.get(command.platform) ?? []),
        command,
      ]);
    }

    return [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([platform, entries]) => ({ platform, entries }));
  }, [comparableCommands]);

  const differingFields = useMemo(() => {
    return {
      aliases: fieldIsDifferent(comparableCommands, "aliases"),
      description: fieldIsDifferent(comparableCommands, "description"),
      whenToUse: fieldIsDifferent(comparableCommands, "whenToUse"),
      example: fieldIsDifferent(comparableCommands, "example"),
    };
  }, [comparableCommands]);

  const differenceLabels = [
    differingFields.aliases ? "aliases" : null,
    differingFields.description ? "behavior" : null,
    differingFields.whenToUse ? "when to use" : null,
    differingFields.example ? "examples" : null,
  ].filter(Boolean) as string[];

  if (comparableCommands.length === 0) {
    return (
      <section className="comparison-view">
        <div className="panel empty-state">
          <button type="button" className="back-button tap-target" onClick={onBack}>
            Back to deck
          </button>
          <strong>No platform variants found for {commandName}</strong>
          <p>Try returning to the deck and selecting another command.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="comparison-view">
      <div className="comparison-view__header panel">
        <button type="button" className="back-button tap-target" onClick={onBack}>
          Back to deck
        </button>
        <div>
          <p className="eyebrow">Cross-platform comparison</p>
          <h2 className="comparison-view__title">{commandName}</h2>
          <p className="helper-text">
            {comparableCommands.length} command variants across {groups.length} platforms
          </p>
        </div>
        {differenceLabels.length > 0 ? (
          <p className="difference-callout">
            Differences highlighted: {differenceLabels.join(", ")}
          </p>
        ) : (
          <p className="difference-callout">The platforms line up closely for this command.</p>
        )}
      </div>

      <div className="comparison-grid">
        {groups.map((group) => {
          const tone = getPlatformTone(group.platform);

          return (
            <section key={group.platform} className="comparison-group panel">
              <div className="comparison-group__header">
                <span className={`platform-pill platform-pill--${tone}`}>
                  {group.platform}
                </span>
                <span className="helper-text">
                  {group.entries.length} variant{group.entries.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="comparison-group__cards">
                {group.entries.map((command) => (
                  <article key={command.id} className="comparison-card">
                    <header className="comparison-card__header">
                      <code className="comparison-card__command">{command.command}</code>
                      {command.category ? (
                        <span className="category-pill">{command.category}</span>
                      ) : null}
                    </header>

                    <section
                      className={`comparison-card__section ${
                        differingFields.description ? "comparison-card__section--highlight" : ""
                      }`}
                    >
                      <h3 className="section-title">Description</h3>
                      <p>{command.description}</p>
                    </section>

                    <section
                      className={`comparison-card__section ${
                        differingFields.aliases ? "comparison-card__section--highlight" : ""
                      }`}
                    >
                      <h3 className="section-title">Aliases</h3>
                      <p>
                        {command.aliases.length > 0
                          ? command.aliases.join(", ")
                          : "No aliases listed"}
                      </p>
                    </section>

                    <section
                      className={`comparison-card__section ${
                        differingFields.whenToUse ? "comparison-card__section--highlight" : ""
                      }`}
                    >
                      <h3 className="section-title">When to use</h3>
                      <p>{command.whenToUse || "Use the default behavior for this platform."}</p>
                    </section>

                    <section
                      className={`comparison-card__section ${
                        differingFields.example ? "comparison-card__section--highlight" : ""
                      }`}
                    >
                      <h3 className="section-title">Example</h3>
                      <pre className="code-block">
                        <code>{command.example || command.command}</code>
                      </pre>
                    </section>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
