import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { crc32, crc32Hex } from "../src/checksum/crc32.js";

describe("CRC32 Checksum", () => {
  it("calculates known CRC32 values", () => {
    // "123456789" is canonical test vector: 0xcbf43926
    const text = new TextEncoder().encode("123456789");
    assert.equal(crc32(text), 0xcbf43926);
    assert.equal(crc32Hex(text), "cbf43926");
  });

  it("handles empty byte buffer", () => {
    assert.equal(crc32(new Uint8Array([])), 0);
  });
});
