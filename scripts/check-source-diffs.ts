import { COMMANDS } from "../src/commands.js";
import {
  COMMAND_SOURCES,
  type CommandSourceDefinition,
  type SourceCapabilityKind,
  type SourceScope,
  type SourceTokenPrefix,
} from "../src/sourceData.js";
import { PLATFORM_LABELS, type SlashCommand } from "../src/types.js";

const FETCH_TIMEOUT_MS = 20_000;
const EXIT_DIFF = 1;
const EXIT_SOURCE_ERROR = 2;

type Args = {
  allowDiffs: boolean;
  json: boolean;
};

type SourceToken = {
  token: string;
  normalized: string;
  platform: string;
  kind: SourceCapabilityKind;
  sourceId: string;
  scopeId: string;
};

type SourceResult = {
  source: CommandSourceDefinition;
  tokens: SourceToken[];
  fetchedBytes: number;
};

type DiffGroup = {
  platform: string;
  kind: SourceCapabilityKind;
  sourceCount: number;
  catalogCount: number;
  missingLocally: SourceToken[];
  staleLocally: SlashCommand[];
};

class SourceAuditError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceAuditError";
  }
}

function parseArgs(argv: string[]): Args {
  return {
    allowDiffs: argv.includes("--allow-diffs"),
    json: argv.includes("--json"),
  };
}

function decodeHtml(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, decimal: string) =>
      String.fromCodePoint(Number.parseInt(decimal, 10)),
    )
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, " ");
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeToken(value: string): string {
  return value.toLowerCase();
}

function formatKey(platform: string, kind: SourceCapabilityKind): string {
  return `${platform}::${kind}`;
}

function getSourceSlice(source: CommandSourceDefinition, scope: SourceScope, html: string): string {
  const startIndex = html.indexOf(scope.range.start);
  if (startIndex < 0) {
    throw new SourceAuditError(
      `${source.id}/${scope.id}: start marker not found: ${scope.range.start}`,
    );
  }

  const contentStart = startIndex + scope.range.start.length;
  const endIndex = scope.range.end
    ? html.indexOf(scope.range.end, contentStart)
    : html.length;

  if (scope.range.end && endIndex < 0) {
    throw new SourceAuditError(
      `${source.id}/${scope.id}: end marker not found after start: ${scope.range.end}`,
    );
  }

  return html.slice(startIndex, endIndex < 0 ? html.length : endIndex);
}

function getTableRows(section: string): string[] {
  const rows: string[] = [];
  const tableMatches = section.matchAll(/<table\b[\s\S]*?<\/table>/gi);

  for (const tableMatch of tableMatches) {
    const table = tableMatch[0];
    for (const rowMatch of table.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)) {
      rows.push(rowMatch[0]);
    }
  }

  return rows;
}

function getFirstCell(row: string): string | null {
  const match = row.match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/i);
  return match?.[0] ?? null;
}

function extractCodeSpanValues(value: string): string[] {
  return [...value.matchAll(/<code\b[^>]*>([\s\S]*?)<\/code>/gi)]
    .map((match) => normalizeWhitespace(decodeHtml(stripTags(match[1] ?? ""))))
    .filter(Boolean);
}

function extractMarkdownFirstCells(section: string): string[] {
  const values: string[] = [];

  for (const line of section.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || /^[:\-\s|]+$/.test(trimmed)) {
      continue;
    }

    const cells = trimmed
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    const firstCell = cells[0];
    if (!firstCell || /^\*\*?command\*\*?$/i.test(firstCell)) {
      continue;
    }

    values.push(firstCell.replace(/`([^`]+)`/g, "$1").replace(/\*\*/g, ""));
  }

  return values;
}

function tokenFromValue(value: string, prefixes: SourceTokenPrefix[]): string | null {
  const decoded = normalizeWhitespace(decodeHtml(stripTags(value)));
  const prefixPattern = prefixes.map((prefix) => `\\${prefix}`).join("");
  const match = decoded.match(new RegExp(`^([${prefixPattern}][A-Za-z][A-Za-z0-9_-]*)`));

  return match?.[1] ?? null;
}

function extractScopeTokens(
  source: CommandSourceDefinition,
  scope: SourceScope,
  html: string,
): SourceToken[] {
  const section = getSourceSlice(source, scope, html);
  const rawValues: string[] = [];
  const rows = getTableRows(section);

  for (const row of rows) {
    const firstCell = getFirstCell(row);
    if (!firstCell) {
      continue;
    }

    const codeValues = extractCodeSpanValues(firstCell);
    rawValues.push(...(codeValues.length > 0 ? codeValues : [firstCell]));
  }

  if (rows.length === 0) {
    rawValues.push(...extractMarkdownFirstCells(section));
  }

  const seen = new Set<string>();
  const tokens: SourceToken[] = [];

  for (const rawValue of rawValues) {
    const token = tokenFromValue(rawValue, scope.tokenPrefixes);
    if (!token) {
      continue;
    }

    const normalized = normalizeToken(token);
    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    tokens.push({
      token,
      normalized,
      platform: source.platform,
      kind: scope.kind,
      sourceId: source.id,
      scopeId: scope.id,
    });
  }

  return tokens;
}

async function fetchWithTimeout(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "slash-cards-source-audit/1.0",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new SourceAuditError(`${url}: HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function auditSources(): Promise<SourceResult[]> {
  const cache = new Map<string, string>();
  const results: SourceResult[] = [];

  for (const source of COMMAND_SOURCES) {
    const html = cache.get(source.fetchUrl) ?? (await fetchWithTimeout(source.fetchUrl));
    cache.set(source.fetchUrl, html);

    const tokens = source.scopes.flatMap((scope) => extractScopeTokens(source, scope, html));
    if (
      tokens.length < source.expectedTokenRange.min ||
      tokens.length > source.expectedTokenRange.max
    ) {
      throw new SourceAuditError(
        `${source.id}: extracted ${tokens.length} tokens, expected ${source.expectedTokenRange.min}-${source.expectedTokenRange.max}`,
      );
    }

    results.push({ source, tokens, fetchedBytes: html.length });
  }

  return results;
}

function getLocalKind(command: SlashCommand): SourceCapabilityKind | null {
  if (command.command.startsWith("@")) {
    return "participant";
  }

  if (command.command.startsWith("/")) {
    return "slash-command";
  }

  return null;
}

function localCoverageTokens(command: SlashCommand): string[] {
  return [command.command, ...command.aliases]
    .filter((token) => token.startsWith("/") || token.startsWith("@"))
    .map(normalizeToken);
}

function isDeprecated(command: SlashCommand): boolean {
  return command.tags.includes("deprecated");
}

function appendToMapList<TKey, TValue>(map: Map<TKey, TValue[]>, key: TKey, value: TValue): void {
  const existing = map.get(key);
  if (existing) {
    existing.push(value);
  } else {
    map.set(key, [value]);
  }
}

function buildDiffs(sourceResults: SourceResult[]): DiffGroup[] {
  const sourceTokensByGroup = new Map<string, Map<string, SourceToken>>();
  const localCommandsByGroup = new Map<string, SlashCommand[]>();
  const localCoverageByGroup = new Map<string, Set<string>>();

  for (const result of sourceResults) {
    for (const token of result.tokens) {
      const key = formatKey(token.platform, token.kind);
      const tokens = sourceTokensByGroup.get(key) ?? new Map<string, SourceToken>();
      tokens.set(token.normalized, token);
      sourceTokensByGroup.set(key, tokens);
    }
  }

  for (const command of COMMANDS) {
    const kind = getLocalKind(command);
    if (!kind) {
      continue;
    }

    const key = formatKey(command.platform, kind);
    appendToMapList(localCommandsByGroup, key, command);

    const coverage = localCoverageByGroup.get(key) ?? new Set<string>();
    for (const token of localCoverageTokens(command)) {
      coverage.add(token);
    }
    localCoverageByGroup.set(key, coverage);
  }

  const groups = [...new Set([...sourceTokensByGroup.keys(), ...localCommandsByGroup.keys()])]
    .filter((key) => sourceTokensByGroup.has(key))
    .sort();

  return groups.map((key) => {
    const [platform, kind] = key.split("::") as [string, SourceCapabilityKind];
    const sourceTokens = sourceTokensByGroup.get(key) ?? new Map<string, SourceToken>();
    const localCommands = localCommandsByGroup.get(key) ?? [];
    const localCoverage = localCoverageByGroup.get(key) ?? new Set<string>();
    const missingLocally = [...sourceTokens.values()]
      .filter((token) => !localCoverage.has(token.normalized))
      .sort(compareSourceTokens);
    const staleLocally = localCommands
      .filter((command) => !isDeprecated(command))
      .filter((command) =>
        localCoverageTokens(command).every((token) => !sourceTokens.has(token)),
      )
      .sort((left, right) => left.command.localeCompare(right.command));

    return {
      platform,
      kind,
      sourceCount: sourceTokens.size,
      catalogCount: localCommands.length,
      missingLocally,
      staleLocally,
    };
  });
}

function compareSourceTokens(left: SourceToken, right: SourceToken): number {
  return left.token.localeCompare(right.token) || left.sourceId.localeCompare(right.sourceId);
}

function hasDiffs(diffs: DiffGroup[]): boolean {
  return diffs.some(
    (diff) => diff.missingLocally.length > 0 || diff.staleLocally.length > 0,
  );
}

function formatTokenList(tokens: SourceToken[]): string {
  return tokens.map((token) => token.token).join(", ");
}

function formatCommandList(commands: SlashCommand[]): string {
  return commands.map((command) => command.command).join(", ");
}

function writeTextReport(sourceResults: SourceResult[], diffs: DiffGroup[]): void {
  const totalTokens = sourceResults.reduce((sum, result) => sum + result.tokens.length, 0);
  console.log(
    `Source audit fetched ${sourceResults.length} source definitions and extracted ${totalTokens} scoped tokens.`,
  );

  for (const result of sourceResults) {
    console.log(
      `- ${result.source.id}: ${result.tokens.length} tokens (${result.fetchedBytes.toLocaleString()} bytes)`,
    );
  }

  console.log("");

  for (const diff of diffs) {
    const label = PLATFORM_LABELS[diff.platform] ?? diff.platform;
    const clean = diff.missingLocally.length === 0 && diff.staleLocally.length === 0;
    console.log(
      `${clean ? "OK" : "DIFF"} ${label} ${diff.kind}: ${diff.sourceCount} source / ${diff.catalogCount} catalog`,
    );

    if (diff.missingLocally.length > 0) {
      console.log(`  Missing locally: ${formatTokenList(diff.missingLocally)}`);
    }

    if (diff.staleLocally.length > 0) {
      console.log(`  Stale locally: ${formatCommandList(diff.staleLocally)}`);
    }
  }
}

function writeJsonReport(sourceResults: SourceResult[], diffs: DiffGroup[]): void {
  console.log(
    JSON.stringify(
      {
        sources: sourceResults.map((result) => ({
          id: result.source.id,
          platform: result.source.platform,
          label: result.source.label,
          fetchUrl: result.source.fetchUrl,
          docUrl: result.source.docUrl,
          fetchedBytes: result.fetchedBytes,
          tokens: result.tokens.map((token) => ({
            token: token.token,
            kind: token.kind,
            scopeId: token.scopeId,
          })),
        })),
        diffs: diffs.map((diff) => ({
          platform: diff.platform,
          kind: diff.kind,
          sourceCount: diff.sourceCount,
          catalogCount: diff.catalogCount,
          missingLocally: diff.missingLocally.map((token) => ({
            token: token.token,
            sourceId: token.sourceId,
            scopeId: token.scopeId,
          })),
          staleLocally: diff.staleLocally.map((command) => ({
            id: command.id,
            command: command.command,
            aliases: command.aliases,
          })),
        })),
      },
      null,
      2,
    ),
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  try {
    const sourceResults = await auditSources();
    const diffs = buildDiffs(sourceResults);

    if (args.json) {
      writeJsonReport(sourceResults, diffs);
    } else {
      writeTextReport(sourceResults, diffs);
    }

    if (hasDiffs(diffs) && !args.allowDiffs) {
      process.exitCode = EXIT_DIFF;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (args.json) {
      console.error(JSON.stringify({ error: message }, null, 2));
    } else {
      console.error(`Source audit failed: ${message}`);
    }
    process.exitCode = EXIT_SOURCE_ERROR;
  }
}

void main();
