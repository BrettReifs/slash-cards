import { createLogger, defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import react from "@vitejs/plugin-react";

const INPUT = process.env.INPUT || "mcp-app.html";
const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.VITEST === "true";

const prefixedLogger = createLogger();
for (const level of ["info", "warn", "error"] as const) {
  const fn = prefixedLogger[level];
  prefixedLogger[level] = (msg, opts) =>
    fn(msg.replace(/^/gm, "[vite] "), opts);
}

export default defineConfig({
  customLogger: isTest ? undefined : prefixedLogger,
  plugins: isTest ? [react()] : [viteSingleFile()],
  build: {
    sourcemap: isDevelopment ? "inline" : undefined,
    cssMinify: !isDevelopment,
    minify: !isDevelopment,
    rollupOptions: { input: INPUT },
    outDir: "dist",
    emptyOutDir: false,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
  },
});
