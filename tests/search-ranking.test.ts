import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getVisibleCommands,
  groupByCommand,
  matchesSearch,
  sortCommands,
} from "../src/commandUtils.js";
import type { SlashCardsFilters, SlashCommand } from "../src/types.js";

function command(overrides: Partial<SlashCommand>): SlashCommand {
  return {
    id: "copilot-cli--clear",
    command: "/clear",
    platform: "copilot-cli",
    category: "session",
    description: "Start a new conversation",
    aliases: [],
    whenToUse: "Use this to clear the current session.",
    example: "/clear",
    equivalents: [],
    docUrl: "https://example.test/clear",
    tags: ["slash-command", "session"],
    releasedAt: "2026-01-01",
    updatedAt: "2026-01-01",
    catalogIndex: 1,
    workspaceWeight: 1,
    ...overrides,
  };
}

const filters: SlashCardsFilters = {
  platforms: [],
  category: null,
  search: "",
  sort: "relevance",
};

describe("search and ranking evals", () => {
  it("matches practical user searches across descriptions, aliases, tags, and equivalents", () => {
    const debugCommand = command({
      id: "copilot-cli--diagnose",
      command: "/diagnose",
      description: "Analyze session debug logs",
      aliases: ["/debug-log"],
      equivalents: ["claude-code--debug"],
      tags: ["slash-command", "diagnostics"],
    });

    assert.equal(matchesSearch(debugCommand, "debug logs"), true);
    assert.equal(matchesSearch(debugCommand, "/debug-log"), true);
    assert.equal(matchesSearch(debugCommand, "claude-code--debug"), true);
    assert.equal(matchesSearch(debugCommand, "Azure"), false);
  });

  it("filters by platform, category, and search before returning visible commands", () => {
    const commands = [
      command({ id: "copilot-cli--clear", platform: "copilot-cli", category: "session" }),
      command({
        id: "copilot-vscode--azure",
        command: "@azure",
        platform: "copilot-vscode",
        category: "integration",
        description: "Ask about Azure services",
        tags: ["participant", "azure"],
      }),
    ];

    const visible = getVisibleCommands(commands, {
      platforms: ["copilot-vscode"],
      category: "integration",
      search: "Azure",
      sort: "alphabetical-asc",
    });

    assert.deepEqual(
      visible.map((entry) => entry.id),
      ["copilot-vscode--azure"],
    );
  });

  it("sorts newest commands by metadata instead of catalog position", () => {
    const sorted = sortCommands(
      [
        command({ id: "old", command: "/old", updatedAt: "2025-01-01", catalogIndex: 999 }),
        command({ id: "new", command: "/newer", updatedAt: "2026-06-09", catalogIndex: 1 }),
      ],
      "newest",
      filters,
    );

    assert.deepEqual(
      sorted.map((entry) => entry.id),
      ["new", "old"],
    );
  });

  it("groups equivalent command names and prefers the current session platform", () => {
    const groups = groupByCommand(
      [
        command({ id: "copilot-cli--clear", platform: "copilot-cli", workspaceWeight: 10 }),
        command({ id: "copilot-vscode--clear", platform: "copilot-vscode", workspaceWeight: 1 }),
      ],
      "copilot-vscode",
    );

    assert.equal(groups.length, 1);
    assert.equal(groups[0]?.isAvailableInSession, true);
    assert.equal(groups[0]?.topEntry.id, "copilot-vscode--clear");
    assert.deepEqual(groups[0]?.platforms, ["copilot-vscode", "copilot-cli"]);
  });
});

