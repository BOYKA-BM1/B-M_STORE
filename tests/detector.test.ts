import { describe, it, expect } from "vitest";
import { detectProject } from "../src/lib/demo/project-detector";

describe("Project detector", () => {
  it("detects Next.js", () => {
    const result = detectProject(
      ["package.json", "next.config.js", "app/page.tsx"],
      { dependencies: { next: "15.0.0", react: "19.0.0" } }
    );
    expect(result.type).toBe("nextjs");
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it("detects static HTML", () => {
    const result = detectProject(["index.html", "styles.css"]);
    expect(result.type).toBe("static");
  });

  it("returns unknown for empty", () => {
    const result = detectProject([]);
    expect(result.type).toBe("unknown");
  });
});
