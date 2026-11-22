import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ByteWriter } from "../src/stream/writer.js";
import { ByteReader } from "../src/stream/reader.js";
import { BufferBoundsError } from "../src/errors.js";

describe("ByteStream reader and writer", () => {
  it("serializes and deserializes mixed numerical and string fields", () => {
    const writer = new ByteWriter();
    writer
      .writeUint8(42)
      .writeUint16(1337, "big")
      .writeUint32(100000, "little")
      .writeFloat64(3.1415926535)
      .writeUtf8("Hello, ByteCraft!");

    const bytes = writer.toUint8Array();
    assert.ok(bytes.length > 0);

    const reader = new ByteReader(bytes);
    assert.equal(reader.readUint8(), 42);
    assert.equal(reader.readUint16("big"), 1337);
    assert.equal(reader.readUint32("little"), 100000);
    assert.ok(Math.abs(reader.readFloat64() - 3.1415926535) < 1e-6);
    assert.equal(reader.readUtf8(17), "Hello, ByteCraft!");
    assert.equal(reader.hasMore(), false);
  });

  it("throws BufferBoundsError on premature EOF", () => {
    const reader = new ByteReader(new Uint8Array([1, 2]));
    reader.readUint16();
    assert.throws(() => reader.readUint8(), BufferBoundsError);
  });
});
