import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createServer } from "../server.js";
import type { SlashCardsContent, SlashCommand } from "../src/types.js";

type ToolTextContent = Array<{ type: string; text: string }>;
type ToolResult = {
  content?: ToolTextContent;
  structuredContent?: Record<string, unknown>;
};

const cleanupCallbacks: Array<() => Promise<void>> = [];

async function connectClient(): Promise<{ client: Client; server: McpServer }> {
  const server = createServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "slash-cards-test", version: "1.0.0" }, { capabilities: {} });
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  cleanupCallbacks.push(async () => {
    await client.close();
    await server.close();
  });

  return { client, server };
}

function asToolResult(value: unknown): ToolResult {
  return value as ToolResult;
}

function commandContent(result: ToolResult): SlashCommand[] {
  const structuredContent = result.structuredContent as SlashCardsContent | undefined;
  return structuredContent?.commands ?? [];
}

afterEach(async () => {
  while (cleanupCallbacks.length > 0) {
    const cleanup = cleanupCallbacks.pop();
    if (cleanup) {
      await cleanup();
    }
  }
});

describe("MCP tool evals", () => {
  it("lists the expected Slash Cards tools", async () => {
    const { client } = await connectClient();

    const tools = await client.listTools();

    assert.deepEqual(
      tools.tools.map((tool) => tool.name).sort(),
      ["compare-commands", "discover-participants", "refresh-commands", "slash-cards"],
    );
  });

  it("returns text and structured command content for filtered slash-card searches", async () => {
    const { client } = await connectClient();

    const result = asToolResult(
      await client.callTool({
        name: "slash-cards",
        arguments: { search: "Azure", platform: "Copilot VS Code" },
      }),
    );
    const commands = commandContent(result);

    assert.ok(result.content?.[0]?.text.includes("Found 1 matching command"));
    assert.deepEqual(
      commands.map((command) => command.command),
      ["@azure"],
    );
  });

  it("compares one command across platforms and keeps summary aligned with structured content", async () => {
    const { client } = await connectClient();

    const result = asToolResult(
      await client.callTool({
        name: "compare-commands",
        arguments: { commandName: "/plan" },
      }),
    );
    const commands = commandContent(result);

    assert.ok(commands.length >= 3);
    assert.ok(result.content?.[0]?.text.includes("/plan is available on"));
    assert.equal(commands.every((command) => command.command === "/plan"), true);
  });

  it("returns a well-formed empty result for unmatched filters", async () => {
    const { client } = await connectClient();

    const result = asToolResult(
      await client.callTool({
        name: "slash-cards",
        arguments: { platform: "not-a-platform", search: "not-a-command" },
      }),
    );

    assert.equal(result.content?.[0]?.text, "No slash commands matched the provided filters.");
    assert.deepEqual(commandContent(result), []);
  });
});

