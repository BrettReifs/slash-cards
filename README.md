# Slash Cards

An MCP App that renders interactive flash cards for 145+ slash commands across GitHub Copilot (VS Code, CLI, GitHub.com, Visual Studio, JetBrains, Xcode) and Claude Code (CLI, Agent SDK).

## Quick Start

```bash
npm install
npm run build
npm run serve        # HTTP server at http://localhost:3001/mcp
# or
npm run serve --stdio  # stdio transport for MCP clients
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
