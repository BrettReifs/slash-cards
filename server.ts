import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { COMMANDS } from "./src/commands.js";
import {
  CATEGORY_LABELS,
  PLATFORM_LABELS,
  type CommandComparisonContent,
  type SlashCardsContent,
  type SlashCommand,
} from "./src/types.js";

const DIST_DIR = path.join(import.meta.dirname, "dist");
const RESOURCE_URI = "ui://slash-cards/view.html";
const FILTER_SCHEMA = {
  platform: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
};

function normalize(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

function escapeMarkdownCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function filterCommands(filters: {
  platform?: string;
  category?: string;
  search?: string;
}): SlashCommand[] {
  const platform = normalize(filters.platform);
  const category = normalize(filters.category);
  const search = normalize(filters.search);

  return COMMANDS.filter((command) => {
    const platformLabel = PLATFORM_LABELS[command.platform];
    const categoryLabel = CATEGORY_LABELS[command.category];
    const matchesPlatform =
      !platform ||
      normalize(command.platform) === platform ||
      normalize(platformLabel) === platform;
    const matchesCategory =
      !category ||
      normalize(command.category) === category ||
      normalize(categoryLabel) === category;
    const matchesSearch =
      !search ||
      [
        command.platform,
        platformLabel,
        command.category,
        categoryLabel,
        command.command,
        command.description,
        command.whenToUse,
        command.example,
        ...command.aliases,
        ...command.tags,
      ]
        .map(normalize)
        .some((field) => field.includes(search));

    return matchesPlatform && matchesCategory && matchesSearch;
  });
}

function formatCommandTable(commands: SlashCommand[]): string {
  if (commands.length === 0) {
    return "No slash commands matched the provided filters.";
  }

  const rows = commands.map(
    (command) =>
      `| ${escapeMarkdownCell(PLATFORM_LABELS[command.platform])} | ${escapeMarkdownCell(CATEGORY_LABELS[command.category])} | ${escapeMarkdownCell(command.command)} | ${escapeMarkdownCell(command.description)} |`,
  );

  return [
    `Found ${commands.length} matching command${commands.length === 1 ? "" : "s"}.`,
    "",
    "| Platform | Category | Command | Description |",
    "| --- | --- | --- | --- |",
    ...rows,
  ].join("\n");
}

function summarizePlatforms(commandName: string, commands: SlashCommand[]): string {
  if (commands.length === 0) {
    return `No platforms currently expose ${commandName}.`;
  }

  const platforms = [
    ...new Set(commands.map((command) => PLATFORM_LABELS[command.platform])),
  ];
  return `${commandName} is available on ${platforms.join(", ")} (${commands.length} match${commands.length === 1 ? "" : "es"}).`;
}

async function readBundledHtml(): Promise<string> {
  return fs.readFile(path.join(DIST_DIR, "mcp-app.html"), "utf-8");
}

type CommandFilters = {
  platform?: string;
  category?: string;
  search?: string;
};

function registerUiFeatures(server: McpServer): void {
  registerAppResource(
    server,
    "Slash Cards View",
    RESOURCE_URI,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => ({
      contents: [
        {
          uri: RESOURCE_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: await readBundledHtml(),
        },
      ],
    }),
  );

  registerAppTool(
    server,
    "slash-cards",
    {
      title: "Slash Cards",
      description: "Browse slash commands by platform, category, or search term.",
      inputSchema: FILTER_SCHEMA,
      _meta: {
        ui: {
          resourceUri: RESOURCE_URI,
          visibility: ["model", "app"],
        },
      },
    },
    async (filters: CommandFilters) => {
      const commands = filterCommands(filters);
      const structuredContent: SlashCardsContent = { commands };

      return {
        content: [{ type: "text", text: formatCommandTable(commands) }],
        structuredContent,
      };
    },
  );

  registerAppTool(
    server,
    "refresh-commands",
    {
      title: "Refresh Commands",
      description: "Refresh the Slash Cards command dataset.",
      _meta: {
        ui: {
          resourceUri: RESOURCE_URI,
          visibility: ["app"],
        },
      },
    },
    async () => {
      const structuredContent: SlashCardsContent = { commands: COMMANDS };

      return {
        content: [
          {
            type: "text",
            text: `Command database refreshed with ${COMMANDS.length} commands`,
          },
        ],
        structuredContent,
      };
    },
  );

  registerAppTool(
    server,
    "compare-commands",
    {
      title: "Compare Commands",
      description: "Compare the same slash command across platforms.",
      inputSchema: {
        commandName: z.string(),
      },
      _meta: {
        ui: {
          resourceUri: RESOURCE_URI,
          visibility: ["app"],
        },
      },
    },
    async ({ commandName }) => {
      const trimmedCommandName = commandName.trim();
      const commands = COMMANDS.filter(
        (command) => normalize(command.command) === normalize(trimmedCommandName),
      );
      const structuredContent: CommandComparisonContent = {
        commandName: trimmedCommandName,
        commands,
      };

      return {
        content: [
          {
            type: "text",
            text: summarizePlatforms(trimmedCommandName, commands),
          },
        ],
        structuredContent,
      };
    },
  );
  registerAppTool(
    server,
    "discover-participants",
    {
      title: "Discover Participants",
      description: "Retrieve @ participant commands available in the current workspace context.",
      _meta: {
        ui: {
          resourceUri: RESOURCE_URI,
          visibility: ["model", "app"],
        },
      },
    },
    async () => {
      const participants = COMMANDS.filter(
        (command) => command.command.startsWith("@"),
      );
      const structuredContent: SlashCardsContent = { commands: participants };

      return {
        content: [
          {
            type: "text",
            text: participants.length > 0
              ? `Found ${participants.length} @ participant${participants.length === 1 ? "" : "s"}: ${participants.map((p) => p.command).join(", ")}`
              : "No @ participants found in the command catalog.",
          },
        ],
        structuredContent,
      };
    },
  );
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "Slash Cards MCP Server",
    version: "1.0.0",
  });

  // Register UI tools eagerly so the server declares tools+resources
  // capabilities during the initialize handshake. Non-UI hosts simply
  // ignore structuredContent and use the text in `content`.
  registerUiFeatures(server);

  return server;
}
