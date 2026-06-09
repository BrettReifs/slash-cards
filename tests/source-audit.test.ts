import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SourceAuditError,
  buildDiffs,
  buildScorecard,
  extractScopeTokens,
  getSourceSlice,
  type SourceResult,
} from "../scripts/check-source-diffs.js";
import type { CommandSourceDefinition, SourceScope } from "../src/sourceData.js";
import type { SlashCommand } from "../src/types.js";

const source: CommandSourceDefinition = {
  id: "fixture-source",
  platform: "copilot-cli",
  label: "Fixture source",
  fetchUrl: "https://example.test/source",
  docUrl: "https://example.test/source",
  scopes: [],
  expectedTokenRange: { min: 1, max: 20 },
};

const slashScope: SourceScope = {
  id: "fixture-slash",
  kind: "slash-command",
  tokenPrefixes: ["/"],
  range: {
    start: "<h2>Slash commands</h2>",
    end: "<h2>Next section</h2>",
  },
};

function command(overrides: Partial<SlashCommand>): SlashCommand {
  return {
    id: "fixture--clear",
    command: "/clear",
    platform: "copilot-cli",
    category: "session",
    description: "Start over",
    aliases: [],
    whenToUse: "Use this to start over.",
    example: "/clear",
    equivalents: [],
    docUrl: "https://example.test/clear",
    tags: ["slash-command"],
    ...overrides,
  };
}

describe("source audit parser evals", () => {
  it("extracts only scoped first-cell command tokens and preserves command casing", () => {
    const html = [
      "<h2>Slash commands</h2>",
      "<table>",
      "<tr><th>Command</th><th>Purpose</th></tr>",
      "<tr><td><code>/clear [PROMPT]</code>, <code>/reset [PROMPT]</code></td><td>Use <code>/ignored</code> in prose.</td></tr>",
      "<tr><td><code>/setupTests</code></td><td>Configure tests.</td></tr>",
      "</table>",
      "<h2>Next section</h2>",
      "<table><tr><td><code>/outside</code></td><td>Outside scope.</td></tr></table>",
    ].join("");

    const tokens = extractScopeTokens(source, slashScope, html);

    assert.deepEqual(
      tokens.map((token) => token.token),
      ["/clear", "/reset", "/setupTests"],
    );
    assert.equal(tokens[2]?.normalized, "/setuptests");
  });

  it("fails fast when a source marker drifts instead of returning a false diff", () => {
    assert.throws(
      () => getSourceSlice(source, slashScope, "<h2>Other section</h2>"),
      SourceAuditError,
    );
  });

  it("scores alias coverage and ignores deprecated local-only commands as stale", () => {
    const sourceResult: SourceResult = {
      source,
      fetchedBytes: 123,
      tokens: ["/clear", "/reset", "/missing"].map((token) => ({
        token,
        normalized: token,
        platform: "copilot-cli",
        kind: "slash-command",
        sourceId: source.id,
        scopeId: slashScope.id,
      })),
    };
    const diffs = buildDiffs(
      [sourceResult],
      [
        command({ command: "/clear", aliases: ["/reset"] }),
        command({
          id: "fixture--old",
          command: "/old",
          aliases: [],
          tags: ["slash-command", "deprecated"],
        }),
      ],
    );

    assert.equal(diffs.length, 1);
    assert.deepEqual(
      diffs[0]?.aliasCovered.map((token) => token.token),
      ["/reset"],
    );
    assert.deepEqual(
      diffs[0]?.missingLocally.map((token) => token.token),
      ["/missing"],
    );
    assert.deepEqual(diffs[0]?.staleLocally, []);

    const scorecard = buildScorecard(diffs);
    assert.equal(scorecard[0]?.coveragePercent, 66.67);
    assert.equal(scorecard[0]?.aliasCoveredCount, 1);
    assert.equal(scorecard[0]?.status, "diff");
  });
});

