'use strict';

// src/errors.ts
var ByteCraftError = class extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "ByteCraftError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
  code;
};
var BufferBoundsError = class extends ByteCraftError {
  constructor(offset, requested, total) {
    super(
      `Out of bounds read/write: offset ${offset} + requested ${requested} exceeds capacity of ${total} bytes.`,
      "ERR_OUT_OF_BOUNDS"
    );
    this.name = "BufferBoundsError";
  }
};
var EncodingError = class extends ByteCraftError {
  constructor(reason) {
    super(`Encoding or decoding failed: ${reason}`, "ERR_ENCODING");
    this.name = "EncodingError";
  }
};

// src/encoding/hex.ts
var HEX_CHARS_LOWER = "0123456789abcdef";
var HEX_CHARS_UPPER = "0123456789ABCDEF";
function toHex(bytes, options = {}) {
  const chars = options.uppercase ? HEX_CHARS_UPPER : HEX_CHARS_LOWER;
  const parts = [];
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    const high = chars[b >> 4 & 15];
    const low = chars[b & 15];
    parts.push(high + low);
  }
  const separator = options.byteSpacing ? " " : "";
  const hexStr = parts.join(separator);
  return options.prefix ? `0x${hexStr}` : hexStr;
}
function fromHex(hex) {
  let cleaned = hex.trim();
  if (cleaned.startsWith("0x") || cleaned.startsWith("0X")) {
    cleaned = cleaned.slice(2);
  }
  cleaned = cleaned.replace(/\s+/g, "");
  if (cleaned.length % 2 !== 0) {
    throw new EncodingError("Invalid hex string length: must be an even count of hex characters.");
  }
  const result = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    const pair = cleaned.substring(i, i + 2);
    const val = parseInt(pair, 16);
    if (Number.isNaN(val)) {
      throw new EncodingError(`Invalid hex character pair '${pair}' at index ${i}.`);
    }
    result[i / 2] = val;
  }
  return result;
}

// src/encoding/base64.ts
var B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function toBase64(bytes) {
  let output = "";
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;
    const triplet = b0 << 16 | b1 << 8 | b2;
    output += B64_CHARS[triplet >> 18 & 63];
    output += B64_CHARS[triplet >> 12 & 63];
    output += i + 1 < len ? B64_CHARS[triplet >> 6 & 63] : "=";
    output += i + 2 < len ? B64_CHARS[triplet & 63] : "=";
  }
  return output;
}
function fromBase64(b64) {
  const cleaned = b64.trim().replace(/\s+/g, "");
  if (cleaned.length % 4 !== 0) {
    throw new EncodingError("Base64 string length must be a multiple of 4.");
  }
  let padding = 0;
  if (cleaned.endsWith("==")) padding = 2;
  else if (cleaned.endsWith("=")) padding = 1;
  const byteLength = cleaned.length * 3 / 4 - padding;
  const result = new Uint8Array(byteLength);
  let byteIndex = 0;
  for (let i = 0; i < cleaned.length; i += 4) {
    const c0 = B64_CHARS.indexOf(cleaned[i]);
    const c1 = B64_CHARS.indexOf(cleaned[i + 1]);
    const c2 = cleaned[i + 2] === "=" ? 0 : B64_CHARS.indexOf(cleaned[i + 2]);
    const c3 = cleaned[i + 3] === "=" ? 0 : B64_CHARS.indexOf(cleaned[i + 3]);
    if (c0 === -1 || c1 === -1 || cleaned[i + 2] !== "=" && c2 === -1 || cleaned[i + 3] !== "=" && c3 === -1) {
      throw new EncodingError("String contains invalid Base64 characters.");
    }
    const triplet = c0 << 18 | c1 << 12 | c2 << 6 | c3;
    if (byteIndex < byteLength) result[byteIndex++] = triplet >> 16 & 255;
    if (byteIndex < byteLength) result[byteIndex++] = triplet >> 8 & 255;
    if (byteIndex < byteLength) result[byteIndex++] = triplet & 255;
  }
  return result;
}

// src/bitwise/mask.ts
var BitMask = class {
  value;
  constructor(initial = 0) {
    this.value = initial >>> 0;
  }
  set(bitPosition) {
    this.value = (this.value | 1 << bitPosition) >>> 0;
    return this;
  }
  clear(bitPosition) {
    this.value = (this.value & ~(1 << bitPosition)) >>> 0;
    return this;
  }
  toggle(bitPosition) {
    this.value = (this.value ^ 1 << bitPosition) >>> 0;
    return this;
  }
  has(bitPosition) {
    return (this.value >> bitPosition & 1) === 1;
  }
  getBit(bitPosition) {
    return (this.value >> bitPosition & 1) === 1 ? 1 : 0;
  }
  getValue() {
    return this.value;
  }
  toBinaryString(length = 32) {
    return this.value.toString(2).padStart(length, "0");
  }
  countOnes() {
    let count = 0;
    let n = this.value;
    while (n > 0) {
      count += n & 1;
      n >>>= 1;
    }
    return count;
  }
};

// src/bitwise/flags.ts
var FlagSet = class {
  flags = /* @__PURE__ */ new Map();
  currentMask = 0;
  constructor(flagNames) {
    if (flagNames) {
      flagNames.forEach((name, index) => {
        if (index >= 32) {
          throw new Error("Maximum of 32 distinct flags supported per FlagSet instance.");
        }
        this.flags.set(name, 1 << index);
      });
    }
  }
  register(flagName) {
    if (this.flags.has(flagName)) {
      return this.flags.get(flagName);
    }
    const currentSize = this.flags.size;
    if (currentSize >= 32) {
      throw new Error("Maximum 32 flags exceeded.");
    }
    const bit = 1 << currentSize;
    this.flags.set(flagName, bit);
    return bit;
  }
  enable(flagName) {
    const bit = this.flags.get(flagName);
    if (bit !== void 0) {
      this.currentMask |= bit;
    }
    return this;
  }
  disable(flagName) {
    const bit = this.flags.get(flagName);
    if (bit !== void 0) {
      this.currentMask &= ~bit;
    }
    return this;
  }
  isEnabled(flagName) {
    const bit = this.flags.get(flagName);
    if (bit === void 0) return false;
    return (this.currentMask & bit) !== 0;
  }
  getActiveFlags() {
    const active = [];
    for (const [name, bit] of this.flags.entries()) {
      if ((this.currentMask & bit) !== 0) {
        active.push(name);
      }
    }
    return active;
  }
  getMask() {
    return this.currentMask >>> 0;
  }
};

// src/stream/writer.ts
var ByteWriter = class {
  buffer;
  view;
  length = 0;
  constructor(initialCapacity = 64) {
    this.buffer = new Uint8Array(initialCapacity);
    this.view = new DataView(this.buffer.buffer);
  }
  ensureCapacity(additionalBytes) {
    const required = this.length + additionalBytes;
    if (required <= this.buffer.length) return;
    let newCap = Math.max(this.buffer.length * 2, 64);
    while (newCap < required) {
      newCap *= 2;
    }
    const nextBuf = new Uint8Array(newCap);
    nextBuf.set(this.buffer);
    this.buffer = nextBuf;
    this.view = new DataView(this.buffer.buffer);
  }
  writeUint8(value) {
    this.ensureCapacity(1);
    this.view.setUint8(this.length, value);
    this.length += 1;
    return this;
  }
  writeUint16(value, endianness = "big") {
    this.ensureCapacity(2);
    this.view.setUint16(this.length, value, endianness === "little");
    this.length += 2;
    return this;
  }
  writeUint32(value, endianness = "big") {
    this.ensureCapacity(4);
    this.view.setUint32(this.length, value, endianness === "little");
    this.length += 4;
    return this;
  }
  writeInt8(value) {
    this.ensureCapacity(1);
    this.view.setInt8(this.length, value);
    this.length += 1;
    return this;
  }
  writeInt16(value, endianness = "big") {
    this.ensureCapacity(2);
    this.view.setInt16(this.length, value, endianness === "little");
    this.length += 2;
    return this;
  }
  writeInt32(value, endianness = "big") {
    this.ensureCapacity(4);
    this.view.setInt32(this.length, value, endianness === "little");
    this.length += 4;
    return this;
  }
  writeFloat32(value, endianness = "big") {
    this.ensureCapacity(4);
    this.view.setFloat32(this.length, value, endianness === "little");
    this.length += 4;
    return this;
  }
  writeFloat64(value, endianness = "big") {
    this.ensureCapacity(8);
    this.view.setFloat64(this.length, value, endianness === "little");
    this.length += 8;
    return this;
  }
  writeBytes(bytes) {
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    this.ensureCapacity(arr.length);
    this.buffer.set(arr, this.length);
    this.length += arr.length;
    return this;
  }
  writeUtf8(text) {
    const encoded = new TextEncoder().encode(text);
    return this.writeBytes(encoded);
  }
  toUint8Array() {
    return this.buffer.slice(0, this.length);
  }
  getLength() {
    return this.length;
  }
};

// src/stream/reader.ts
var ByteReader = class {
  constructor(bytes) {
    this.bytes = bytes;
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }
  bytes;
  view;
  offset = 0;
  checkBounds(size) {
    if (this.offset + size > this.bytes.length) {
      throw new BufferBoundsError(this.offset, size, this.bytes.length);
    }
  }
  readUint8() {
    this.checkBounds(1);
    const val = this.view.getUint8(this.offset);
    this.offset += 1;
    return val;
  }
  readUint16(endianness = "big") {
    this.checkBounds(2);
    const val = this.view.getUint16(this.offset, endianness === "little");
    this.offset += 2;
    return val;
  }
  readUint32(endianness = "big") {
    this.checkBounds(4);
    const val = this.view.getUint32(this.offset, endianness === "little");
    this.offset += 4;
    return val;
  }
  readInt8() {
    this.checkBounds(1);
    const val = this.view.getInt8(this.offset);
    this.offset += 1;
    return val;
  }
  readInt16(endianness = "big") {
    this.checkBounds(2);
    const val = this.view.getInt16(this.offset, endianness === "little");
    this.offset += 2;
    return val;
  }
  readInt32(endianness = "big") {
    this.checkBounds(4);
    const val = this.view.getInt32(this.offset, endianness === "little");
    this.offset += 4;
    return val;
  }
  readFloat32(endianness = "big") {
    this.checkBounds(4);
    const val = this.view.getFloat32(this.offset, endianness === "little");
    this.offset += 4;
    return val;
  }
  readFloat64(endianness = "big") {
    this.checkBounds(8);
    const val = this.view.getFloat64(this.offset, endianness === "little");
    this.offset += 8;
    return val;
  }
  readBytes(length) {
    this.checkBounds(length);
    const slice = this.bytes.slice(this.offset, this.offset + length);
    this.offset += length;
    return slice;
  }
  readUtf8(length) {
    const raw = this.readBytes(length);
    return new TextDecoder().decode(raw);
  }
  hasMore() {
    return this.offset < this.bytes.length;
  }
  getRemainingBytes() {
    return Math.max(0, this.bytes.length - this.offset);
  }
  getOffset() {
    return this.offset;
  }
  seek(offset) {
    if (offset < 0 || offset > this.bytes.length) {
      throw new BufferBoundsError(offset, 0, this.bytes.length);
    }
    this.offset = offset;
  }
};

// src/dump/hexdump.ts
function createHexDumpRows(bytes, rowLength = 16) {
  const rows = [];
  const len = bytes.length;
  for (let i = 0; i < len; i += rowLength) {
    const slice = bytes.slice(i, Math.min(i + rowLength, len));
    const hexParts = [];
    let ascii = "";
    for (let j = 0; j < slice.length; j++) {
      const b = slice[j];
      hexParts.push(b.toString(16).padStart(2, "0"));
      ascii += b >= 32 && b <= 126 ? String.fromCharCode(b) : ".";
    }
    const hex = hexParts.join(" ").padEnd(rowLength * 3 - 1, " ");
    rows.push({
      offset: i,
      hex,
      ascii
    });
  }
  return rows;
}
function formatHexDump(bytes, rowLength = 16) {
  const rows = createHexDumpRows(bytes, rowLength);
  return rows.map((r) => `${r.offset.toString(16).padStart(8, "0")}  ${r.hex}  |${r.ascii}|`).join("\n");
}

// src/checksum/crc32.ts
var CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
  }
  CRC_TABLE[i] = c >>> 0;
}
function crc32(bytes) {
  let crc = 4294967295;
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    crc = crc >>> 8 ^ CRC_TABLE[(crc ^ byte) & 255];
  }
  return (crc ^ 4294967295) >>> 0;
}
function crc32Hex(bytes) {
  return crc32(bytes).toString(16).padStart(8, "0");
}

exports.BitMask = BitMask;
exports.BufferBoundsError = BufferBoundsError;
exports.ByteCraftError = ByteCraftError;
exports.ByteReader = ByteReader;
exports.ByteWriter = ByteWriter;
exports.EncodingError = EncodingError;
exports.FlagSet = FlagSet;
exports.crc32 = crc32;
exports.crc32Hex = crc32Hex;
exports.createHexDumpRows = createHexDumpRows;
exports.formatHexDump = formatHexDump;
exports.fromBase64 = fromBase64;
exports.fromHex = fromHex;
exports.toBase64 = toBase64;
exports.toHex = toHex;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map