import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { COMMANDS } from "../src/commands.js";
import { CATEGORY_LABELS, PLATFORM_LABELS } from "../src/types.js";

const REFRESH_DATE = Date.parse("2026-06-09T00:00:00Z");

describe("catalog integrity evals", () => {
  it("keeps command ids unique and every entry structurally complete", () => {
    const ids = new Set<string>();

    for (const command of COMMANDS) {
      assert.equal(ids.has(command.id), false, `duplicate id: ${command.id}`);
      ids.add(command.id);

      assert.ok(command.command.trim(), `${command.id} command is empty`);
      assert.ok(command.description.trim(), `${command.id} description is empty`);
      assert.ok(command.whenToUse.trim(), `${command.id} whenToUse is empty`);
      assert.ok(command.example.trim(), `${command.id} example is empty`);
      assert.ok(command.docUrl.startsWith("https://"), `${command.id} has non-https docUrl`);
      assert.ok(command.tags.length > 0, `${command.id} has no tags`);
      assert.ok(PLATFORM_LABELS[command.platform], `${command.id} has invalid platform`);
      assert.ok(CATEGORY_LABELS[command.category], `${command.id} has invalid category`);
    }
  });

  it("keeps equivalent links pointing at existing commands", () => {
    const ids = new Set(COMMANDS.map((command) => command.id));

    for (const command of COMMANDS) {
      for (const equivalent of command.equivalents) {
        assert.ok(ids.has(equivalent), `${command.id} points to missing equivalent ${equivalent}`);
      }
    }
  });

  it("marks deprecated cards explicitly without letting them look current", () => {
    const deprecatedCommands = COMMANDS.filter((command) => command.tags.includes("deprecated"));

    assert.ok(deprecatedCommands.length > 0, "expected at least one deprecated catalog card");
    for (const command of deprecatedCommands) {
      const text = `${command.description} ${command.whenToUse}`.toLowerCase();
      assert.match(text, /deprecated|renamed|removed/, `${command.id} lacks deprecation copy`);
      assert.notEqual(command.priority, "new", `${command.id} should not be prioritized as new`);
    }
  });

  it("does not create future-dated freshness metadata", () => {
    for (const command of COMMANDS) {
      assert.ok(command.releasedAt, `${command.id} releasedAt is missing`);
      assert.ok(command.updatedAt, `${command.id} updatedAt is missing`);
      assert.ok(
        Date.parse(`${command.releasedAt}T00:00:00Z`) <= REFRESH_DATE,
        `${command.id} releasedAt is in the future`,
      );
      assert.ok(
        Date.parse(`${command.updatedAt}T00:00:00Z`) <= REFRESH_DATE,
        `${command.id} updatedAt is in the future`,
      );
    }
  });
});

