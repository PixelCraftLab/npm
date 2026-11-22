import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatHexDump, createHexDumpRows } from "../src/dump/hexdump.js";

describe("Hexdump formatting", () => {
  it("formats binary buffer into canonical hex and ascii output", () => {
    const sample = new TextEncoder().encode("Hello world! This is ByteCraft.");
    const dump = formatHexDump(sample, 16);
    
    assert.ok(dump.includes("00000000"));
    assert.ok(dump.includes("|Hello world! Thi|"));
    assert.ok(dump.includes("|s is ByteCraft.|"));

    const rows = createHexDumpRows(sample, 16);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].offset, 0);
    assert.equal(rows[1].offset, 16);
  });
});
