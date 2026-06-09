import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const htmlPath = path.join(process.cwd(), "dist", "mcp-app.html");

describe("browser artifact smoke evals", () => {
  it("builds a standalone Slash Cards preview artifact", () => {
    assert.equal(fs.existsSync(htmlPath), true, "dist/mcp-app.html must exist after build");

    const html = fs.readFileSync(htmlPath, "utf-8");
    assert.ok(html.includes("<title>Slash Cards</title>"));
    assert.ok(html.includes("preview"));
    assert.ok(html.includes("Slash Cards"));
  });
});

