import { createServer } from "./server.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

async function test() {
  console.log("=== Slash Cards MCP Server Test ===\n");

  // Test 1: UI-capable client (should get 3 tools + 1 resource)
  {
    const server = createServer();
    const [ct, st] = InMemoryTransport.createLinkedPair();
    const client = new Client(
      { name: "test-ui", version: "1.0.0" },
      {
        capabilities: {
          extensions: {
            "io.modelcontextprotocol/ui": {
              mimeTypes: ["text/html;profile=mcp-app"],
            },
          },
        },
      },
    );

    await Promise.all([client.connect(ct), server.connect(st)]);

    const tools = await client.listTools();
    console.log("[UI client] Tools:", tools.tools.length);
    for (const t of tools.tools) {
      const uiMeta = (t._meta as Record<string, unknown>)?.ui as
        | Record<string, unknown>
        | undefined;
      console.log(
        `  - ${t.name} ${uiMeta ? "(UI: " + uiMeta.resourceUri + ")" : "(text)"}`,
      );
    }

    const resources = await client.listResources();
    console.log("[UI client] Resources:", resources.resources.length);
    for (const r of resources.resources) {
      console.log(`  - ${r.uri}`);
    }

    // Test calling slash-cards tool
    const result = await client.callTool({
      name: "slash-cards",
      arguments: { search: "clear" },
    });
    const textContent = result.content as Array<{ type: string; text: string }>;
    console.log(
      "[UI client] slash-cards(/clear search):",
      textContent[0]?.text?.substring(0, 80) + "...",
    );

    // Test compare-commands tool
    const cmpResult = await client.callTool({
      name: "compare-commands",
      arguments: { commandName: "/plan" },
    });
    const cmpText = cmpResult.content as Array<{ type: string; text: string }>;
    console.log("[UI client] compare-commands(/plan):", cmpText[0]?.text);

    await client.close();
    await server.close();
  }

  console.log("");

  // Test 2: Text-only client (should get 1 text-only tool, no resources)
  {
    const server = createServer();
    const [ct, st] = InMemoryTransport.createLinkedPair();
    const client = new Client(
      { name: "test-text", version: "1.0.0" },
      { capabilities: {} },
    );

    await Promise.all([client.connect(ct), server.connect(st)]);

    const tools = await client.listTools();
    console.log("[Text client] Tools:", tools.tools.length);
    for (const t of tools.tools) {
      console.log(`  - ${t.name}`);
    }

    const resources = await client.listResources();
    console.log("[Text client] Resources:", resources.resources.length);

    // Test calling text-only slash-cards tool
    const result = await client.callTool({
      name: "slash-cards",
      arguments: { platform: "claude-code", category: "session" },
    });
    const textContent = result.content as Array<{ type: string; text: string }>;
    console.log(
      "[Text client] slash-cards(claude-code/session):",
      textContent[0]?.text?.substring(0, 100) + "...",
    );

    await client.close();
    await server.close();
  }

  console.log("\n=== All tests passed ===");
}

test().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
