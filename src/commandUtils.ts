import type { CommandGroup, HostContext, SlashCardsFilters, SlashCardsSort, SlashCommand } from "./types";

export const SORT_LABELS: Record<SlashCardsSort, string> = {
  "relevance": "Relevance",
  "newest": "Newest to oldest",
  "workspace-relevance": "Workspace relevance",
  "alphabetical-asc": "Alphabetical A-Z",
  "alphabetical-desc": "Alphabetical Z-A",
};

/* ── Session platform detection ──────────────────────────── */

const PLATFORM_HINTS: [test: RegExp, platform: string][] = [
  [/vscode|vs\s*code/i, "copilot-vscode"],
  [/github\.com|github/i, "copilot-github"],
  [/claude/i, "claude-code"],
];

export function detectSessionPlatform(hostContext?: HostContext): string {
  if (!hostContext) return "copilot-vscode";

  const ua = [
    hostContext.userAgent,
    hostContext.platform,
    hostContext.locale,
  ]
    .filter(Boolean)
    .join(" ");

  for (const [test, platform] of PLATFORM_HINTS) {
    if (test.test(ua)) return platform;
  }

  if (hostContext.platform === "desktop") return "copilot-vscode";
  if (hostContext.platform === "web") return "copilot-github";

  return "copilot-vscode";
}

/* ── Search matching ─────────────────────────────────────── */

export function matchesSearch(command: SlashCommand, searchValue: string) {
  const query = searchValue.trim().toLowerCase();

  if (!query) return true;

  return [
    command.command,
    command.description,
    command.platform,
    command.category,
    command.whenToUse,
    command.example,
    command.releaseVersion,
    ...command.aliases,
    ...command.tags,
    ...command.equivalents,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

/* ── Study progress (localStorage) ───────────────────────── */

const PROGRESS_KEY = "slash-cards-progress";

interface ProgressMap {
  [commandId: string]: { correct: number; total: number; lastReviewedAt?: string };
}

function readProgress(): ProgressMap {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

function needsReviewScore(command: SlashCommand): number {
  const progress = readProgress();
  const entry = progress[command.id];
  if (!entry || entry.total === 0) return 10;
  const retention = entry.correct / entry.total;
  const daysSinceReview = entry.lastReviewedAt
    ? (Date.now() - Date.parse(entry.lastReviewedAt)) / 86_400_000
    : 999;
  if (daysSinceReview > 14) return 8;
  if (retention < 0.5) return 7;
  if (retention < 0.75) return 4;
  return 1;
}

/* ── Sorting helpers ─────────────────────────────────────── */

function getTimestamp(value?: string) {
  if (!value) return 0;
  return Date.parse(`${value}T00:00:00Z`) || 0;
}

function compareAlphabetical(left: SlashCommand, right: SlashCommand) {
  const commandOrder = left.command.localeCompare(right.command);
  return commandOrder !== 0
    ? commandOrder
    : left.platform.localeCompare(right.platform);
}

function getWorkspaceScore(command: SlashCommand, filters: SlashCardsFilters, hostContext?: HostContext) {
  const search = filters.search.trim().toLowerCase();
  const selectedPlatforms = new Set(filters.platforms);
  const priorityWeight =
    command.priority === "new" ? 6
      : command.priority === "essential" ? 5
        : command.priority === "common" ? 3 : 1;
  const platformBoost = selectedPlatforms.has(command.platform) ? 8 : 0;
  const hostBoost =
    hostContext?.platform === "desktop" && command.platform === "copilot-vscode" ? 4
      : hostContext?.platform === "web" && command.platform === "copilot-github" ? 4 : 0;
  const searchBoost = search && matchesSearch(command, search) ? 3 : 0;

  return (command.workspaceWeight ?? 0) + priorityWeight + platformBoost + hostBoost + searchBoost;
}

function freshnessScore(command: SlashCommand): number {
  const ts = getTimestamp(command.updatedAt ?? command.releasedAt);
  if (ts === 0) return 10;
  const daysSince = (Date.now() - ts) / 86_400_000;
  if (daysSince < 30) return 50;
  if (daysSince < 90) return 35;
  if (daysSince < 180) return 20;
  return 10;
}

function relevanceScore(command: SlashCommand, sessionPlatform: string): number {
  const sessionBoost = command.platform === sessionPlatform ? 100 : 0;
  return sessionBoost + freshnessScore(command) + needsReviewScore(command);
}

export function sortCommands(
  commands: SlashCommand[],
  sort: SlashCardsSort,
  filters: SlashCardsFilters,
  hostContext?: HostContext,
  sessionPlatform?: string,
) {
  const nextCommands = [...commands];
  const sp = sessionPlatform ?? detectSessionPlatform(hostContext);

  nextCommands.sort((left, right) => {
    if (sort === "alphabetical-asc") return compareAlphabetical(left, right);
    if (sort === "alphabetical-desc") return compareAlphabetical(right, left);

    if (sort === "relevance") {
      const delta = relevanceScore(right, sp) - relevanceScore(left, sp);
      if (delta !== 0) return delta;
    }

    if (sort === "workspace-relevance") {
      const delta =
        getWorkspaceScore(right, filters, hostContext) -
        getWorkspaceScore(left, filters, hostContext);
      if (delta !== 0) return delta;
    }

    const dateDelta =
      getTimestamp(right.updatedAt ?? right.releasedAt) -
      getTimestamp(left.updatedAt ?? left.releasedAt);
    if (dateDelta !== 0) return dateDelta;

    const catalogDelta = (right.catalogIndex ?? -1) - (left.catalogIndex ?? -1);
    if (catalogDelta !== 0) return catalogDelta;

    return compareAlphabetical(left, right);
  });

  return nextCommands;
}

/* ── Filtering ───────────────────────────────────────────── */

export function getVisibleCommands(
  commands: SlashCommand[],
  filters: SlashCardsFilters,
  hostContext?: HostContext,
  sessionPlatform?: string,
) {
  const filtered = commands.filter((command) => {
    const matchesPlatform =
      filters.platforms.length === 0 ||
      filters.platforms.includes(command.platform);
    const matchesCategory =
      !filters.category || command.category === filters.category;
    return matchesPlatform && matchesCategory && matchesSearch(command, filters.search);
  });

  return sortCommands(filtered, filters.sort, filters, hostContext, sessionPlatform);
}

/* ── Command grouping (deduplication) ────────────────────── */

export function groupByCommand(
  commands: SlashCommand[],
  sessionPlatform: string,
): CommandGroup[] {
  const map = new Map<string, SlashCommand[]>();

  for (const cmd of commands) {
    const key = cmd.command.toLowerCase();
    const list = map.get(key);
    if (list) {
      list.push(cmd);
    } else {
      map.set(key, [cmd]);
    }
  }

  const groups: CommandGroup[] = [];

  for (const entries of map.values()) {
    const platforms = [...new Set(entries.map((entry) => entry.platform))];
    const isAvailable = entries.some((entry) => entry.platform === sessionPlatform);

    groups.push({
      command: entries[0].command,
      topEntry: entries[0],
      entries,
      platforms,
      isAvailableInSession: isAvailable,
    });
  }

  return groups;
}
