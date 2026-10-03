import { describe, expect, it } from "vitest";
import { declarationLanguage, mermaidSource } from "./mermaidSource";

describe("declarationLanguage", () => {
  it("reads a bare language and an explicit one in parentheses", () => {
    expect(declarationLanguage("code:mermaid")).toBe("mermaid");
    expect(declarationLanguage("code: mermaid")).toBe("mermaid");
    expect(declarationLanguage("code:diagram.mmd(mermaid)")).toBe("mermaid");
  });

  it("ignores the declaration's own indentation", () => {
    expect(declarationLanguage("\t\u3000code:ts")).toBe("ts");
  });
});

describe("mermaidSource", () => {
  it("returns the body without the block's own indent level", () => {
    expect(mermaidSource("code:mermaid\n\tgraph TD\n\t\tA-->B")).toBe(
      "graph TD\n\tA-->B",
    );
  });

  it("is relative to the declaration's indentation", () => {
    expect(mermaidSource("\tcode:mermaid\n\t\tgraph TD")).toBe("graph TD");
  });

  it("matches the language case-insensitively, also in parentheses", () => {
    expect(mermaidSource("code:Mermaid\n\tx")).toBe("x");
    expect(mermaidSource("code:a.mmd(mermaid)\n\tx")).toBe("x");
  });

  it("returns an empty source for a block without a body", () => {
    expect(mermaidSource("code:mermaid")).toBe("");
  });

  it("returns null for other languages", () => {
    expect(mermaidSource("code:ts\n\tx")).toBeNull();
    expect(mermaidSource("code:mermaidx\n\tx")).toBeNull();
    expect(mermaidSource("code:\n\tx")).toBeNull();
  });
});
