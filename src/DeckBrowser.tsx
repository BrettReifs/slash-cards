import { useMemo, useState } from "react";
import { SORT_LABELS, detectSessionPlatform, getVisibleCommands, groupByCommand } from "./commandUtils";
import { CardDetailOverlay } from "./CardDetailOverlay";
import { FlashCard } from "./FlashCard";
import type { CommandGroup, HostContext, SlashCommand, SlashCardsFilters } from "./types";

interface DeckBrowserProps {
  commands: SlashCommand[];
  filters: SlashCardsFilters;
  onFiltersChange: (next: Partial<SlashCardsFilters>) => void;
  onOpenDocs?: (url: string) => void;
  hostContext?: HostContext;
}

export function DeckBrowser({
  commands,
  filters,
  onFiltersChange,
  onOpenDocs,
  hostContext,
}: DeckBrowserProps) {
  const sessionPlatform = useMemo(
    () => detectSessionPlatform(hostContext),
    [hostContext],
  );

  const [selectedGroup, setSelectedGroup] = useState<CommandGroup | null>(null);

  const platforms = useMemo(
    () => [...new Set(commands.map((command) => command.platform))].sort(),
    [commands]
  );

  const categories = useMemo(
    () => [...new Set(commands.map((command) => command.category))].sort(),
    [commands]
  );

  const filteredCommands = useMemo(
    () => getVisibleCommands(commands, filters, hostContext, sessionPlatform),
    [commands, filters, hostContext, sessionPlatform],
  );

  const groups = useMemo(
    () => groupByCommand(filteredCommands, sessionPlatform),
    [filteredCommands, sessionPlatform],
  );

  const togglePlatform = (platform: string) => {
    const nextPlatforms = filters.platforms.includes(platform)
      ? filters.platforms.filter((item) => item !== platform)
      : [...filters.platforms, platform];

    onFiltersChange({ platforms: nextPlatforms });
  };

  const selectedPlatformLabel =
    filters.platforms.length === 0
      ? "All platforms"
      : `${filters.platforms.length} selected`;

  return (
    <section className="deck-browser">
      <div className="panel panel--toolbar">
        <div className="toolbar-grid">
          <details className="filter-menu">
            <summary className="toolbar-button tap-target">
              Platform: {selectedPlatformLabel}
            </summary>
            <div className="filter-menu__content">
              {platforms.map((platform) => (
                <label key={platform} className="filter-option tap-target">
                  <input
                    type="checkbox"
                    checked={filters.platforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                  />
                  <span>{platform}</span>
                </label>
              ))}
            </div>
          </details>

          <label className="search-field">
            <span className="search-field__label search-field__label--sr-only">Search</span>
            <input
              className="search-input tap-target"
              type="search"
              value={filters.search}
              placeholder="Search cards"
              aria-label="Search command cards"
              onChange={(event) =>
                onFiltersChange({ search: event.currentTarget.value })
              }
            />
          </label>

          <label className="search-field">
            <span className="search-field__label search-field__label--sr-only">Sort</span>
            <select
              className="search-input tap-target"
              value={filters.sort}
              aria-label="Sort command cards"
              onChange={(event) =>
                onFiltersChange({ sort: event.currentTarget.value as SlashCardsFilters["sort"] })
              }
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="search-field">
            <span className="search-field__label search-field__label--sr-only">Category</span>
            <select
              className="search-input tap-target"
              value={filters.category ?? ""}
              aria-label="Filter by category"
              onChange={(event) =>
                onFiltersChange({
                  category: event.currentTarget.value || null,
                })
              }
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

        </div>
      </div>

      {(filters.platforms.length > 0 || filters.category || filters.search) && (
        <div className="deck-browser__summary">
          <button
            type="button"
            className="link-button tap-target"
            onClick={() =>
              onFiltersChange({ platforms: [], category: null, search: "" })
            }
          >
            Clear filters
          </button>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="panel empty-state">
          <strong>No commands match your filters</strong>
          <p>Try clearing one of the active filters or broadening the search.</p>
        </div>
      ) : (
        <div className="card-grid">
          {groups.map((group) => (
            <FlashCard
              key={group.topEntry.id}
              command={group.topEntry}
              onClick={() => setSelectedGroup(group)}
              stackCount={group.entries.length}
              stackPlatforms={group.platforms}
              isAvailableInSession={group.isAvailableInSession}
            />
          ))}
        </div>
      )}

      {selectedGroup ? (
        <CardDetailOverlay
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onOpenDocs={onOpenDocs}
          onSearchCommand={(cmd) => {
            setSelectedGroup(null);
            onFiltersChange({ search: cmd });
          }}
        />
      ) : null}
    </section>
  );
}
