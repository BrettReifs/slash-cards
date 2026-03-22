# Contributing to Slash Cards

Thanks for your interest in contributing! Here's how to get started.

## Local Development

```bash
# Install dependencies
npm install

# Start dev server with hot reload (UI + MCP server)
npm run dev

# Or build once and serve
npm run build
npm run serve
```

The MCP server will be available at `http://localhost:3001/mcp`.

## Running Tests

```bash
npm test
```

This runs a smoke/integration test using the in-memory MCP transport. It verifies that the server starts, tools are registered, and key tool calls return expected output.

## Building

```bash
npm run build
```

This runs:
1. TypeScript type checking (`tsc --noEmit`)
2. Declaration emit for server files
3. Vite production build of the React UI into `dist/mcp-app.html`

## Code Structure

- `main.ts` — Transport bootstrap (HTTP and stdio)
- `server.ts` — MCP tool and resource registration
- `src/` — React UI, command data, and types
- `test.ts` — Integration smoke test

## Pull Requests

- Keep changes focused and minimal.
- Run `npm run build` and `npm test` before submitting.
- Add or update tests if you're changing tool behavior.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | HTTP server port |
| `HOST` | `127.0.0.1` | HTTP server bind address |
| `CORS_ORIGIN` | `http://localhost:3001` | Allowed CORS origin |
