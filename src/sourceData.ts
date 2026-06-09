import type { Platform } from "./types.js";

export type SourceCapabilityKind = "slash-command" | "participant";
export type SourceTokenPrefix = "/" | "@";

export interface SourceRange {
  start: string;
  end?: string;
}

export interface SourceScope {
  id: string;
  kind: SourceCapabilityKind;
  tokenPrefixes: SourceTokenPrefix[];
  range: SourceRange;
}

export interface CommandSourceDefinition {
  id: string;
  platform: Platform;
  label: string;
  fetchUrl: string;
  docUrl: string;
  scopes: SourceScope[];
  expectedTokenRange: {
    min: number;
    max: number;
  };
  notes?: string;
}

export const PLATFORM_DOC_ROOTS: Record<string, string> = {
  "copilot-vscode": "https://code.visualstudio.com/docs/copilot/reference/copilot-vscode-features",
  "copilot-cli": "https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference",
  "copilot-github": "https://docs.github.com/en/copilot/reference/chat-cheat-sheet?tool=webui",
  "copilot-vs": "https://learn.microsoft.com/en-us/visualstudio/ide/copilot-chat-context?view=vs-2022",
  "copilot-jetbrains": "https://docs.github.com/en/copilot/reference/chat-cheat-sheet?tool=jetbrains",
  "copilot-xcode": "https://docs.github.com/en/copilot/reference/chat-cheat-sheet?tool=xcode",
  "claude-code": "https://code.claude.com/docs/en/commands",
  "claude-sdk": "https://code.claude.com/docs/en/commands",
};

const GITHUB_COPILOT_CHEAT_SHEET =
  "https://docs.github.com/en/copilot/reference/chat-cheat-sheet?tool=webui";

export const COMMAND_SOURCES: CommandSourceDefinition[] = [
  {
    id: "copilot-vscode-feature-reference",
    platform: "copilot-vscode",
    label: "VS Code Copilot feature reference",
    fetchUrl: "https://code.visualstudio.com/docs/copilot/reference/copilot-vscode-features",
    docUrl: PLATFORM_DOC_ROOTS["copilot-vscode"],
    scopes: [
      {
        id: "vscode-slash-commands",
        kind: "slash-command",
        tokenPrefixes: ["/"],
        range: {
          start: '<h2 id="_slash-commands"',
          end: '<h2 id="_chat-participants"',
        },
      },
      {
        id: "vscode-chat-participants",
        kind: "participant",
        tokenPrefixes: ["@"],
        range: {
          start: '<h2 id="_chat-participants"',
          end: '<h2 id="_use-agents"',
        },
      },
    ],
    expectedTokenRange: { min: 20, max: 80 },
    notes:
      "Primary VS Code source for current slash commands; participants are supplemented by the GitHub cheat sheet.",
  },
  {
    id: "copilot-vscode-cheat-sheet",
    platform: "copilot-vscode",
    label: "GitHub Copilot cheat sheet: VS Code panel",
    fetchUrl: GITHUB_COPILOT_CHEAT_SHEET,
    docUrl: "https://docs.github.com/en/copilot/reference/chat-cheat-sheet?tool=vscode",
    scopes: [
      {
        id: "github-cheat-vscode-slash-commands",
        kind: "slash-command",
        tokenPrefixes: ["/"],
        range: {
          start: '<div class="ghd-tool vscode">',
          end: '<h2 id="chat-variables"',
        },
      },
      {
        id: "github-cheat-vscode-chat-participants",
        kind: "participant",
        tokenPrefixes: ["@"],
        range: {
          start: '<h2 id="chat-participants"',
          end: '<div class="ghd-tool visualstudio">',
        },
      },
    ],
    expectedTokenRange: { min: 10, max: 35 },
    notes:
      "The GitHub cheat sheet ships every tool panel in one HTML page, so scopes are panel-aware.",
  },
  {
    id: "copilot-github-cheat-sheet",
    platform: "copilot-github",
    label: "GitHub Copilot cheat sheet: GitHub.com panel",
    fetchUrl: GITHUB_COPILOT_CHEAT_SHEET,
    docUrl: PLATFORM_DOC_ROOTS["copilot-github"],
    scopes: [
      {
        id: "github-cheat-webui-slash-commands",
        kind: "slash-command",
        tokenPrefixes: ["/"],
        range: {
          start: '<div class="ghd-tool webui">',
          end: '<h2 id="mcp-skills"',
        },
      },
    ],
    expectedTokenRange: { min: 3, max: 20 },
  },
  {
    id: "copilot-vs-cheat-sheet",
    platform: "copilot-vs",
    label: "GitHub Copilot cheat sheet: Visual Studio panel",
    fetchUrl: GITHUB_COPILOT_CHEAT_SHEET,
    docUrl: "https://docs.github.com/en/copilot/reference/chat-cheat-sheet?tool=visualstudio",
    scopes: [
      {
        id: "github-cheat-visualstudio-slash-commands",
        kind: "slash-command",
        tokenPrefixes: ["/"],
        range: {
          start: '<div class="ghd-tool visualstudio">',
          end: '<h2 id="references"',
        },
      },
    ],
    expectedTokenRange: { min: 5, max: 20 },
  },
  {
    id: "copilot-jetbrains-cheat-sheet",
    platform: "copilot-jetbrains",
    label: "GitHub Copilot cheat sheet: JetBrains panel",
    fetchUrl: GITHUB_COPILOT_CHEAT_SHEET,
    docUrl: PLATFORM_DOC_ROOTS["copilot-jetbrains"],
    scopes: [
      {
        id: "github-cheat-jetbrains-slash-commands",
        kind: "slash-command",
        tokenPrefixes: ["/"],
        range: {
          start: '<div class="ghd-tool jetbrains">',
          end: '<div class="ghd-tool xcode">',
        },
      },
    ],
    expectedTokenRange: { min: 4, max: 15 },
  },
  {
    id: "copilot-xcode-cheat-sheet",
    platform: "copilot-xcode",
    label: "GitHub Copilot cheat sheet: Xcode panel",
    fetchUrl: GITHUB_COPILOT_CHEAT_SHEET,
    docUrl: PLATFORM_DOC_ROOTS["copilot-xcode"],
    scopes: [
      {
        id: "github-cheat-xcode-slash-commands",
        kind: "slash-command",
        tokenPrefixes: ["/"],
        range: {
          start: '<div class="ghd-tool xcode">',
          end: "</div>",
        },
      },
    ],
    expectedTokenRange: { min: 5, max: 15 },
  },
  {
    id: "copilot-cli-reference",
    platform: "copilot-cli",
    label: "Copilot CLI command reference",
    fetchUrl: "https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference",
    docUrl: PLATFORM_DOC_ROOTS["copilot-cli"],
    scopes: [
      {
        id: "copilot-cli-interactive-slash-commands",
        kind: "slash-command",
        tokenPrefixes: ["/"],
        range: {
          start: '<h2 id="slash-commands-in-the-interactive-interface"',
          end: '<h2 id="command-line-options"',
        },
      },
    ],
    expectedTokenRange: { min: 35, max: 120 },
  },
  {
    id: "claude-code-commands",
    platform: "claude-code",
    label: "Claude Code commands reference",
    fetchUrl: "https://code.claude.com/docs/en/commands",
    docUrl: PLATFORM_DOC_ROOTS["claude-code"],
    scopes: [
      {
        id: "claude-code-all-commands",
        kind: "slash-command",
        tokenPrefixes: ["/"],
        range: {
          start: '<span class="cursor-pointer">All commands</span></h2>',
          end: '<span class="cursor-pointer">MCP prompts</span></h2>',
        },
      },
    ],
    expectedTokenRange: { min: 70, max: 150 },
  },
];
