import { describe, it, expect } from "vitest";
import { VISUAL_REGISTRY, getVisual } from "../registry";

const PROTOTYPE_IDS = [
  "fix",
  "compact",
  "new-scaffold",
  "new-fresh-chat",
  "yolo",
  "workspace",
  "diagnose",
  "model",
] as const;

describe("VISUAL_REGISTRY", () => {
  it("contains all 8 prototype visual IDs", () => {
    for (const id of PROTOTYPE_IDS) {
      expect(VISUAL_REGISTRY).toHaveProperty(id);
    }
  });

  it("each entry has a component function", () => {
    for (const id of PROTOTYPE_IDS) {
      const entry = VISUAL_REGISTRY[id];
      expect(typeof entry.component).toBe("function");
    }
  });

  it("each entry has concise alt text (6–20 words)", () => {
    for (const id of PROTOTYPE_IDS) {
      const entry = VISUAL_REGISTRY[id];
      const wordCount = entry.alt.trim().split(/\s+/).length;
      expect(wordCount).toBeGreaterThanOrEqual(6);
      expect(wordCount).toBeLessThanOrEqual(20);
    }
  });

  it("each entry has a non-empty sceneBrief", () => {
    for (const id of PROTOTYPE_IDS) {
      expect(VISUAL_REGISTRY[id].sceneBrief.length).toBeGreaterThan(10);
    }
  });

  it("each entry has a metaphorFamily", () => {
    for (const id of PROTOTYPE_IDS) {
      expect(VISUAL_REGISTRY[id].metaphorFamily.length).toBeGreaterThan(0);
    }
  });
});

describe("Semantic visual grouping (ADR-0002)", () => {
  it("new-scaffold and new-fresh-chat are separate entries", () => {
    const scaffold = getVisual("new-scaffold");
    const freshChat = getVisual("new-fresh-chat");
    expect(scaffold).toBeDefined();
    expect(freshChat).toBeDefined();
    expect(scaffold?.component).not.toBe(freshChat?.component);
  });

  it("fix entries share one visualId mapped to the same component", () => {
    const entry = getVisual("fix");
    expect(entry).toBeDefined();
    expect(entry?.component.name).toBe("FixVisual");
  });

  it("compact entries share one visualId mapped to the same component", () => {
    const entry = getVisual("compact");
    expect(entry).toBeDefined();
    expect(entry?.component.name).toBe("CompactVisual");
  });

  it("model entries share one visualId mapped to the same component", () => {
    const entry = getVisual("model");
    expect(entry).toBeDefined();
    expect(entry?.component.name).toBe("ModelVisual");
  });
});

describe("getVisual", () => {
  it("returns the entry for a known visualId", () => {
    const entry = getVisual("fix");
    expect(entry).toBeDefined();
    expect(entry?.alt).toMatch(/robot/i);
  });

  it("returns undefined for an unknown visualId", () => {
    const entry = getVisual("definitely-not-a-real-id");
    expect(entry).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    expect(getVisual("")).toBeUndefined();
  });
});

describe("SlashCommand visualId wiring", () => {
  it("visualId assignments verify semantic split for /new", async () => {
    const { COMMANDS } = await import("../../commands");
    const vscodeNew = COMMANDS.find((c) => c.id === "copilot-vscode--new");
    const githubNew = COMMANDS.find((c) => c.id === "copilot-github--new");
    expect(vscodeNew?.visualId).toBe("new-scaffold");
    expect(githubNew?.visualId).toBe("new-fresh-chat");
    expect(vscodeNew?.visualId).not.toBe(githubNew?.visualId);
  });

  it("all /fix platform entries share visualId 'fix'", async () => {
    const { COMMANDS } = await import("../../commands");
    const fixEntries = COMMANDS.filter((c) => c.command === "/fix");
    expect(fixEntries.length).toBeGreaterThan(0);
    for (const entry of fixEntries) {
      expect(entry.visualId).toBe("fix");
    }
  });

  it("all /compact platform entries share visualId 'compact'", async () => {
    const { COMMANDS } = await import("../../commands");
    const compactEntries = COMMANDS.filter((c) => c.command === "/compact");
    expect(compactEntries.length).toBeGreaterThan(0);
    for (const entry of compactEntries) {
      expect(entry.visualId).toBe("compact");
    }
  });

  it("diagnose skill entry has visualId 'diagnose'", async () => {
    const { COMMANDS } = await import("../../commands");
    const diagnose = COMMANDS.find((c) => c.id === "copilot-cli--skill-diagnose");
    expect(diagnose?.visualId).toBe("diagnose");
  });

  it("entries without visual coverage have undefined visualId", async () => {
    const { COMMANDS } = await import("../../commands");
    const help = COMMANDS.find((c) => c.command === "/help" && c.platform === "copilot-cli");
    expect(help?.visualId).toBeUndefined();
  });
});
