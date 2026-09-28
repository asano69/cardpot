import { describe, expect, it } from "vitest";
import { reindentForCodeBlock } from "./pasteCodeBlockIndent";

describe("reindentForCodeBlock", () => {
  it("prefixes every line after the first with the block indent", () => {
    // Regression test: unindented pasted lines used to end the code: block.
    expect(reindentForCodeBlock("def f():\n\treturn 1", "\t", "\t")).toBe(
      "def f():\n\t\treturn 1",
    );
  });

  it("keeps blank lines inside the block as whitespace-only lines", () => {
    // A truly empty line has indent 0 and would end the block.
    expect(reindentForCodeBlock("a\n\nb", "\t", "\t")).toBe("a\n\t\n\tb");
  });

  it("indents a trailing newline's empty last line too", () => {
    expect(reindentForCodeBlock("a\nb\n", "\t", "\t")).toBe("a\n\tb\n\t");
  });

  it("normalizes CRLF line endings", () => {
    expect(reindentForCodeBlock("a\r\nb", "\t", "\t")).toBe("a\n\tb");
  });

  it("supplies the missing block indent when pasting at the start of a body line", () => {
    expect(reindentForCodeBlock("a\nb", "\t", "")).toBe("\ta\n\tb");
  });

  it("does not add indent before the first line after real text", () => {
    expect(reindentForCodeBlock("x\ny", "\t", "\tfoo(")).toBe("x\n\ty");
  });
});
