import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toBase64, fromBase64 } from "../src/encoding/base64.js";

describe("Base64 utilities", () => {
  it("encodes and decodes arbitrary binary buffers", () => {
    const sample = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const encoded = toBase64(sample);
    assert.equal(encoded, "SGVsbG8=");

    const decoded = fromBase64(encoded);
    assert.deepEqual(Array.from(decoded), Array.from(sample));
  });

  it("handles empty buffers correctly", () => {
    assert.equal(toBase64(new Uint8Array([])), "");
    assert.deepEqual(fromBase64(""), new Uint8Array([]));
  });
});
