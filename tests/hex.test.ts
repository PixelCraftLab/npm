import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toHex, fromHex } from "../src/encoding/hex.js";
import { EncodingError } from "../src/errors.js";

describe("Hex utilities", () => {
  it("converts bytes to hex string", () => {
    const raw = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    assert.equal(toHex(raw), "deadbeef");
    assert.equal(toHex(raw, { uppercase: true }), "DEADBEEF");
    assert.equal(toHex(raw, { prefix: true }), "0xdeadbeef");
    assert.equal(toHex(raw, { byteSpacing: true }), "de ad be ef");
  });

  it("parses hex string to byte array", () => {
    const bytes = fromHex("cafebabe");
    assert.deepEqual(Array.from(bytes), [0xca, 0xfe, 0xba, 0xbe]);

    const prefixed = fromHex("0x010203");
    assert.deepEqual(Array.from(prefixed), [1, 2, 3]);

    const spaced = fromHex("aa bb cc dd");
    assert.deepEqual(Array.from(spaced), [0xaa, 0xbb, 0xcc, 0xdd]);
  });

  it("throws EncodingError on malformed hex", () => {
    assert.throws(() => fromHex("123"), EncodingError);
    assert.throws(() => fromHex("12zz"), EncodingError);
  });
});
