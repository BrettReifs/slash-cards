import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import type { Request, Response } from "express";
import path from "node:path";
import { createServer } from "./server.js";

const DIST_DIR = path.join(import.meta.dirname, "dist");

/**
 * Starts an MCP server with Streamable HTTP transport in stateless mode.
 *
 * @param createServerInstance - Factory function that creates a new McpServer instance per request.
 */
export async function startStreamableHTTPServer(
  createServerInstance: () => McpServer,
): Promise<void> {
  const port = parseInt(process.env.PORT ?? "3001", 10);
  const host = process.env.HOST ?? "127.0.0.1";
  const corsOrigin =
    process.env.CORS_ORIGIN ?? `http://${host === "0.0.0.0" ? "localhost" : host}:${port}`;

  const app = createMcpExpressApp({ host });
  app.use(cors({ origin: corsOrigin }));

  // Serve the built UI for browser preview
  app.get("/", (_req: Request, res: Response) => {
    res.sendFile(path.join(DIST_DIR, "mcp-app.html"));
  });

  app.all("/mcp", async (req: Request, res: Response) => {
    const server = createServerInstance();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close().catch(() => {});
      server.close().catch(() => {});
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("MCP error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  const httpServer = app.listen(port, host, (err) => {
    if (err) {
      console.error("Failed to start server:", err);
      process.exit(1);
    }

    console.log(`MCP server listening on http://${host}:${port}/mcp`);
  });

  const shutdown = () => {
    console.log("\nShutting down...");
    httpServer.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

/**
 * Starts an MCP server with stdio transport.
 *
 * @param createServerInstance - Factory function that creates a new McpServer instance.
 */
export async function startStdioServer(
  createServerInstance: () => McpServer,
): Promise<void> {
  await createServerInstance().connect(new StdioServerTransport());
}

async function main(): Promise<void> {
  if (process.argv.includes("--stdio")) {
    await startStdioServer(createServer);
    return;
  }

  await startStreamableHTTPServer(createServer);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
