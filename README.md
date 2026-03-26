# Slash Cards

An MCP App that renders interactive flash cards for 145+ slash commands across GitHub Copilot (VS Code, CLI, GitHub.com, Visual Studio, JetBrains, Xcode) and Claude Code (CLI, Agent SDK).

## Quick Start

```bash
npm install
npm run build
npm run serve        # HTTP server at http://localhost:3001/mcp
# or
npm run serve -- --stdio  # stdio transport for MCP clients
```

## VS Code

Open this folder in VS Code. The `.vscode/mcp.json` configures the server automatically. Ask Copilot: *"Show me available slash commands"*.

## Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "slash-cards": {
      "command": "npx",
      "args": ["tsx", "/path/to/slash-cards/main.ts", "--stdio"]
    }
  }
}
```

## Features

- 145+ commands across 8 platforms
- Gallery-first browser with newest-first, workspace relevance, and alphabetical sorting
- Filterable command gallery (platform, category, search)
- Flip cards with command details, examples, documentation links, and new or updated badges
- Study mode with true/false, multiple choice, typed recall, and mixed mastery sessions
- Local retention tracking for reviewed commands and weak areas
- Host-native theming (adapts to VS Code and Claude themes)
- Standalone preview mode via `dist/mcp-app.html?preview=1`
- Text fallback for non-UI hosts
- Accessible (WCAG AA, keyboard navigation, reduced motion)

## Architecture

Built with the official MCP Apps SDK (`@modelcontextprotocol/ext-apps`) using the Tool + UI Resource pattern. React View bundled as a single HTML file via Vite.

## Testing

```bash
npm test
```

Runs an in-memory integration smoke test that starts the MCP server, connects a test client, and verifies tools and tool calls work correctly.

## HTTP Mode — Local Use Only

The HTTP server defaults to `127.0.0.1` (localhost) and is intended for local development only.

To override the bind address or CORS origin, set environment variables:

```bash
PORT=3001           # HTTP port (default: 3001)
HOST=127.0.0.1      # Bind address (default: 127.0.0.1)
CORS_ORIGIN=http://localhost:3001  # Allowed CORS origin (default: derived from HOST/PORT)
```

> ⚠️ **Do not expose the HTTP server on `0.0.0.0` or a public interface without an auth/proxy layer.** The server has no built-in authentication.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local dev setup, build, and test instructions.

## Security

See [SECURITY.md](SECURITY.md) for the vulnerability disclosure process.

