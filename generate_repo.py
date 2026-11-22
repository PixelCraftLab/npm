import os
import subprocess
import datetime

WORKSPACE = "/Users/vishalkumargowda/Desktop/npm"
os.chdir(WORKSPACE)

# Initialize git if not already initialized
subprocess.run(["git", "init", "-b", "main"], check=True)
subprocess.run(["git", "config", "user.name", "PixelCraftLab"], check=True)
subprocess.run(["git", "config", "user.email", "vishalgowdask65@gmail.com"], check=True)

# Add git remote if not present
res = subprocess.run(["git", "remote"], capture_output=True, text=True)
if "origin" not in res.stdout:
    subprocess.run(["git", "remote", "add", "origin", "https://github.com/PixelCraftLab/npm.git"], check=True)

start_time = datetime.datetime(2026, 11, 22, 10, 0, 0)

commit_count = 0

def make_commit(msg):
    global commit_count
    timestamp = start_time + datetime.timedelta(minutes=commit_count * 10)
    time_str = timestamp.strftime('%Y-%m-%d %H:%M:%S +0530')
    env = os.environ.copy()
    env["GIT_AUTHOR_DATE"] = time_str
    env["GIT_COMMITTER_DATE"] = time_str
    subprocess.run(["git", "add", "-A"], check=True)
    subprocess.run(["git", "commit", "-m", msg], env=env, check=True)
    commit_count += 1
    print(f"Commit {commit_count}: {msg} at {time_str}")

# 1. gitignore
with open(".gitignore", "w") as f:
    f.write("node_modules/\ndist/\n*.log\n.DS_Store\ncoverage/\n")
make_commit("init: setup gitignore configuration")

# 2. package.json basic
with open("package.json", "w") as f:
    f.write('''{
  "name": "byte-craft",
  "version": "1.0.0",
  "description": "Ultra-lightweight, zero-dependency binary and byte buffer manipulation toolkit for TypeScript and JavaScript",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "type": "module",
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts --clean",
    "test": "node --import tsx --test tests/**/*.test.ts",
    "prepublishOnly": "npm run build && npm test"
  },
  "keywords": ["binary", "buffer", "hex", "bitwise", "bitmask", "stream", "byte", "encoder"],
  "author": "PixelCraftLab <vishalgowdask65@gmail.com>",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/PixelCraftLab/npm.git"
  },
  "bugs": {
    "url": "https://github.com/PixelCraftLab/npm/issues"
  },
  "homepage": "https://github.com/PixelCraftLab/npm#readme",
  "license": "Apache-2.0",
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsup": "^8.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
''')
make_commit("build: initialize package descriptor with export maps and scripts")

# 3. tsconfig.json
with open("tsconfig.json", "w") as f:
    f.write('''{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
''')
make_commit("build: configure typescript compiler settings")

# 4. tsup.config.ts
with open("tsup.config.ts", "w") as f:
    f.write('''import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
});
''')
make_commit("build: configure tsup bundler for dual cjs and esm outputs")

# 5. .npmignore
with open(".npmignore", "w") as f:
    f.write('''src/
tests/
examples/
tsconfig.json
tsup.config.ts
.github/
generate_repo.py
*.log
''')
make_commit("build: add npmignore to exclude development files from publishing")

# 6. src/types.ts
os.makedirs("src", exist_ok=True)
with open("src/types.ts", "w") as f:
    f.write('''export type Endianness = "big" | "little";

export type HexFormatOptions = {
  uppercase?: boolean;
  prefix?: boolean;
  byteSpacing?: boolean;
};

export type HexDumpRow = {
  offset: number;
  hex: string;
  ascii: string;
};

export type BitValue = 0 | 1;

export interface IByteReader {
  readUint8(): number;
  readUint16(endianness?: Endianness): number;
  readUint32(endianness?: Endianness): number;
  readInt8(): number;
  readInt16(endianness?: Endianness): number;
  readInt32(endianness?: Endianness): number;
  readFloat32(endianness?: Endianness): number;
  readFloat64(endianness?: Endianness): number;
  readBytes(length: number): Uint8Array;
  readUtf8(length: number): string;
  hasMore(): boolean;
  getRemainingBytes(): number;
  getOffset(): number;
  seek(offset: number): void;
}

export interface IByteWriter {
  writeUint8(value: number): this;
  writeUint16(value: number, endianness?: Endianness): this;
  writeUint32(value: number, endianness?: Endianness): this;
  writeInt8(value: number): this;
  writeInt16(value: number, endianness?: Endianness): this;
  writeInt32(value: number, endianness?: Endianness): this;
  writeFloat32(value: number, endianness?: Endianness): this;
  writeFloat64(value: number, endianness?: Endianness): this;
  writeBytes(bytes: Uint8Array | number[]): this;
  writeUtf8(text: string): this;
  toUint8Array(): Uint8Array;
  getLength(): number;
}
''')
make_commit("feat(core): declare foundational binary contracts and interfaces")

# 7. src/errors.ts
with open("src/errors.ts", "w") as f:
    f.write('''export class ByteCraftError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "ByteCraftError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BufferBoundsError extends ByteCraftError {
  constructor(offset: number, requested: number, total: number) {
    super(
      `Out of bounds read/write: offset ${offset} + requested ${requested} exceeds capacity of ${total} bytes.`,
      "ERR_OUT_OF_BOUNDS"
    );
    this.name = "BufferBoundsError";
  }
}

export class EncodingError extends ByteCraftError {
  constructor(reason: string) {
    super(`Encoding or decoding failed: ${reason}`, "ERR_ENCODING");
    this.name = "EncodingError";
  }
}
''')
make_commit("feat(errors): define custom domain error hierarchy")

# 8. src/encoding/hex.ts
os.makedirs("src/encoding", exist_ok=True)
with open("src/encoding/hex.ts", "w") as f:
    f.write('''import { HexFormatOptions } from "../types.js";
import { EncodingError } from "../errors.js";

const HEX_CHARS_LOWER = "0123456789abcdef";
const HEX_CHARS_UPPER = "0123456789ABCDEF";

export function toHex(bytes: Uint8Array, options: HexFormatOptions = {}): string {
  const chars = options.uppercase ? HEX_CHARS_UPPER : HEX_CHARS_LOWER;
  const parts: string[] = [];
  
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    const high = chars[(b >> 4) & 0x0f];
    const low = chars[b & 0x0f];
    parts.push(high + low);
  }
  
  const separator = options.byteSpacing ? " " : "";
  const hexStr = parts.join(separator);
  return options.prefix ? `0x${hexStr}` : hexStr;
}

export function fromHex(hex: string): Uint8Array {
  let cleaned = hex.trim();
  if (cleaned.startsWith("0x") || cleaned.startsWith("0X")) {
    cleaned = cleaned.slice(2);
  }
  cleaned = cleaned.replace(/\\s+/g, "");

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
''')
make_commit("feat(encoding): implement hexadecimal serialization and parsing")

# 9. tests/hex.test.ts
os.makedirs("tests", exist_ok=True)
with open("tests/hex.test.ts", "w") as f:
    f.write('''import { describe, it } from "node:test";
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
''')
make_commit("test(encoding): add test suite for hexadecimal encode and decode")

# 10. src/encoding/base64.ts
with open("src/encoding/base64.ts", "w") as f:
    f.write('''import { EncodingError } from "../errors.js";

const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function toBase64(bytes: Uint8Array): string {
  let output = "";
  const len = bytes.length;
  
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;

    const triplet = (b0 << 16) | (b1 << 8) | b2;

    output += B64_CHARS[(triplet >> 18) & 0x3f];
    output += B64_CHARS[(triplet >> 12) & 0x3f];
    output += i + 1 < len ? B64_CHARS[(triplet >> 6) & 0x3f] : "=";
    output += i + 2 < len ? B64_CHARS[triplet & 0x3f] : "=";
  }

  return output;
}

export function fromBase64(b64: string): Uint8Array {
  const cleaned = b64.trim().replace(/\\s+/g, "");
  if (cleaned.length % 4 !== 0) {
    throw new EncodingError("Base64 string length must be a multiple of 4.");
  }

  let padding = 0;
  if (cleaned.endsWith("==")) padding = 2;
  else if (cleaned.endsWith("=")) padding = 1;

  const byteLength = (cleaned.length * 3) / 4 - padding;
  const result = new Uint8Array(byteLength);
  let byteIndex = 0;

  for (let i = 0; i < cleaned.length; i += 4) {
    const c0 = B64_CHARS.indexOf(cleaned[i]);
    const c1 = B64_CHARS.indexOf(cleaned[i + 1]);
    const c2 = cleaned[i + 2] === "=" ? 0 : B64_CHARS.indexOf(cleaned[i + 2]);
    const c3 = cleaned[i + 3] === "=" ? 0 : B64_CHARS.indexOf(cleaned[i + 3]);

    if (c0 === -1 || c1 === -1 || (cleaned[i + 2] !== "=" && c2 === -1) || (cleaned[i + 3] !== "=" && c3 === -1)) {
      throw new EncodingError("String contains invalid Base64 characters.");
    }

    const triplet = (c0 << 18) | (c1 << 12) | (c2 << 6) | c3;

    if (byteIndex < byteLength) result[byteIndex++] = (triplet >> 16) & 0xff;
    if (byteIndex < byteLength) result[byteIndex++] = (triplet >> 8) & 0xff;
    if (byteIndex < byteLength) result[byteIndex++] = triplet & 0xff;
  }

  return result;
}
''')
make_commit("feat(encoding): add custom base64 encoder and decoder")

# 11. tests/base64.test.ts
with open("tests/base64.test.ts", "w") as f:
    f.write('''import { describe, it } from "node:test";
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
''')
make_commit("test(encoding): verify base64 serialization accuracy")

# 12. src/encoding/index.ts
with open("src/encoding/index.ts", "w") as f:
    f.write('''export * from "./hex.js";
export * from "./base64.js";
''')
make_commit("feat(encoding): export centralized encoding module")

# 13. src/bitwise/mask.ts
os.makedirs("src/bitwise", exist_ok=True)
with open("src/bitwise/mask.ts", "w") as f:
    f.write('''export class BitMask {
  private value: number;

  constructor(initial = 0) {
    this.value = initial >>> 0;
  }

  public set(bitPosition: number): this {
    this.value = (this.value | (1 << bitPosition)) >>> 0;
    return this;
  }

  public clear(bitPosition: number): this {
    this.value = (this.value & ~(1 << bitPosition)) >>> 0;
    return this;
  }

  public toggle(bitPosition: number): this {
    this.value = (this.value ^ (1 << bitPosition)) >>> 0;
    return this;
  }

  public has(bitPosition: number): boolean {
    return ((this.value >> bitPosition) & 1) === 1;
  }

  public getBit(bitPosition: number): 0 | 1 {
    return (((this.value >> bitPosition) & 1) === 1 ? 1 : 0);
  }

  public getValue(): number {
    return this.value;
  }

  public toBinaryString(length = 32): string {
    return this.value.toString(2).padStart(length, "0");
  }

  public countOnes(): number {
    let count = 0;
    let n = this.value;
    while (n > 0) {
      count += n & 1;
      n >>>= 1;
    }
    return count;
  }
}
''')
make_commit("feat(bitwise): implement BitMask for granular bit manipulations")

# 14. tests/bitwise.test.ts
with open("tests/bitwise.test.ts", "w") as f:
    f.write('''import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BitMask } from "../src/bitwise/mask.js";

describe("BitMask operations", () => {
  it("sets, toggles, and clears individual bits", () => {
    const mask = new BitMask(0);
    assert.equal(mask.has(3), false);

    mask.set(3);
    assert.equal(mask.has(3), true);
    assert.equal(mask.getBit(3), 1);
    assert.equal(mask.getValue(), 8);

    mask.toggle(3);
    assert.equal(mask.has(3), false);
    assert.equal(mask.getValue(), 0);

    mask.set(1).set(2);
    assert.equal(mask.getValue(), 6);
    mask.clear(1);
    assert.equal(mask.getValue(), 4);
  });

  it("calculates binary string and population count", () => {
    const mask = new BitMask(0b10110);
    assert.equal(mask.countOnes(), 3);
    assert.equal(mask.toBinaryString(8), "00010110");
  });
});
''')
make_commit("test(bitwise): add test coverage for BitMask utility")

# 15. src/bitwise/flags.ts
with open("src/bitwise/flags.ts", "w") as f:
    f.write('''export class FlagSet<T extends string = string> {
  private flags = new Map<T, number>();
  private currentMask = 0;

  constructor(flagNames?: T[]) {
    if (flagNames) {
      flagNames.forEach((name, index) => {
        if (index >= 32) {
          throw new Error("Maximum of 32 distinct flags supported per FlagSet instance.");
        }
        this.flags.set(name, 1 << index);
      });
    }
  }

  public register(flagName: T): number {
    if (this.flags.has(flagName)) {
      return this.flags.get(flagName)!;
    }
    const currentSize = this.flags.size;
    if (currentSize >= 32) {
      throw new Error("Maximum 32 flags exceeded.");
    }
    const bit = 1 << currentSize;
    this.flags.set(flagName, bit);
    return bit;
  }

  public enable(flagName: T): this {
    const bit = this.flags.get(flagName);
    if (bit !== undefined) {
      this.currentMask |= bit;
    }
    return this;
  }

  public disable(flagName: T): this {
    const bit = this.flags.get(flagName);
    if (bit !== undefined) {
      this.currentMask &= ~bit;
    }
    return this;
  }

  public isEnabled(flagName: T): boolean {
    const bit = this.flags.get(flagName);
    if (bit === undefined) return false;
    return (this.currentMask & bit) !== 0;
  }

  public getActiveFlags(): T[] {
    const active: T[] = [];
    for (const [name, bit] of this.flags.entries()) {
      if ((this.currentMask & bit) !== 0) {
        active.push(name);
      }
    }
    return active;
  }

  public getMask(): number {
    return this.currentMask >>> 0;
  }
}
''')
make_commit("feat(bitwise): implement type-safe FlagSet registry")

# 16. tests/flags.test.ts
with open("tests/flags.test.ts", "w") as f:
    f.write('''import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FlagSet } from "../src/bitwise/flags.js";

describe("FlagSet", () => {
  it("enables, disables and queries registered flags", () => {
    type Perms = "READ" | "WRITE" | "EXECUTE" | "ADMIN";
    const perms = new FlagSet<Perms>(["READ", "WRITE", "EXECUTE", "ADMIN"]);

    assert.equal(perms.isEnabled("READ"), false);
    perms.enable("READ").enable("WRITE");

    assert.equal(perms.isEnabled("READ"), true);
    assert.equal(perms.isEnabled("WRITE"), true);
    assert.equal(perms.isEnabled("EXECUTE"), false);

    assert.deepEqual(perms.getActiveFlags(), ["READ", "WRITE"]);

    perms.disable("WRITE");
    assert.deepEqual(perms.getActiveFlags(), ["READ"]);
  });
});
''')
make_commit("test(bitwise): add unit tests for FlagSet operations")

# 17. src/bitwise/index.ts
with open("src/bitwise/index.ts", "w") as f:
    f.write('''export * from "./mask.js";
export * from "./flags.js";
''')
make_commit("feat(bitwise): export centralized bitwise module")

# 18. src/stream/writer.ts
os.makedirs("src/stream", exist_ok=True)
with open("src/stream/writer.ts", "w") as f:
    f.write('''import { IByteWriter, Endianness } from "../types.js";

export class ByteWriter implements IByteWriter {
  private buffer: Uint8Array;
  private view: DataView;
  private length = 0;

  constructor(initialCapacity = 64) {
    this.buffer = new Uint8Array(initialCapacity);
    this.view = new DataView(this.buffer.buffer);
  }

  private ensureCapacity(additionalBytes: number): void {
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

  public writeUint8(value: number): this {
    this.ensureCapacity(1);
    this.view.setUint8(this.length, value);
    this.length += 1;
    return this;
  }

  public writeUint16(value: number, endianness: Endianness = "big"): this {
    this.ensureCapacity(2);
    this.view.setUint16(this.length, value, endianness === "little");
    this.length += 2;
    return this;
  }

  public writeUint32(value: number, endianness: Endianness = "big"): this {
    this.ensureCapacity(4);
    this.view.setUint32(this.length, value, endianness === "little");
    this.length += 4;
    return this;
  }

  public writeInt8(value: number): this {
    this.ensureCapacity(1);
    this.view.setInt8(this.length, value);
    this.length += 1;
    return this;
  }

  public writeInt16(value: number, endianness: Endianness = "big"): this {
    this.ensureCapacity(2);
    this.view.setInt16(this.length, value, endianness === "little");
    this.length += 2;
    return this;
  }

  public writeInt32(value: number, endianness: Endianness = "big"): this {
    this.ensureCapacity(4);
    this.view.setInt32(this.length, value, endianness === "little");
    this.length += 4;
    return this;
  }

  public writeFloat32(value: number, endianness: Endianness = "big"): this {
    this.ensureCapacity(4);
    this.view.setFloat32(this.length, value, endianness === "little");
    this.length += 4;
    return this;
  }

  public writeFloat64(value: number, endianness: Endianness = "big"): this {
    this.ensureCapacity(8);
    this.view.setFloat64(this.length, value, endianness === "little");
    this.length += 8;
    return this;
  }

  public writeBytes(bytes: Uint8Array | number[]): this {
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    this.ensureCapacity(arr.length);
    this.buffer.set(arr, this.length);
    this.length += arr.length;
    return this;
  }

  public writeUtf8(text: string): this {
    const encoded = new TextEncoder().encode(text);
    return this.writeBytes(encoded);
  }

  public toUint8Array(): Uint8Array {
    return this.buffer.slice(0, this.length);
  }

  public getLength(): number {
    return this.length;
  }
}
''')
make_commit("feat(stream): implement dynamic ByteWriter with auto-growth")

# 19. src/stream/reader.ts
with open("src/stream/reader.ts", "w") as f:
    f.write('''import { IByteReader, Endianness } from "../types.js";
import { BufferBoundsError } from "../errors.js";

export class ByteReader implements IByteReader {
  private view: DataView;
  private offset = 0;

  constructor(private readonly bytes: Uint8Array) {
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  private checkBounds(size: number): void {
    if (this.offset + size > this.bytes.length) {
      throw new BufferBoundsError(this.offset, size, this.bytes.length);
    }
  }

  public readUint8(): number {
    this.checkBounds(1);
    const val = this.view.getUint8(this.offset);
    this.offset += 1;
    return val;
  }

  public readUint16(endianness: Endianness = "big"): number {
    this.checkBounds(2);
    const val = this.view.getUint16(this.offset, endianness === "little");
    this.offset += 2;
    return val;
  }

  public readUint32(endianness: Endianness = "big"): number {
    this.checkBounds(4);
    const val = this.view.getUint32(this.offset, endianness === "little");
    this.offset += 4;
    return val;
  }

  public readInt8(): number {
    this.checkBounds(1);
    const val = this.view.getInt8(this.offset);
    this.offset += 1;
    return val;
  }

  public readInt16(endianness: Endianness = "big"): number {
    this.checkBounds(2);
    const val = this.view.getInt16(this.offset, endianness === "little");
    this.offset += 2;
    return val;
  }

  public readInt32(endianness: Endianness = "big"): number {
    this.checkBounds(4);
    const val = this.view.getInt32(this.offset, endianness === "little");
    this.offset += 4;
    return val;
  }

  public readFloat32(endianness: Endianness = "big"): number {
    this.checkBounds(4);
    const val = this.view.getFloat32(this.offset, endianness === "little");
    this.offset += 4;
    return val;
  }

  public readFloat64(endianness: Endianness = "big"): number {
    this.checkBounds(8);
    const val = this.view.getFloat64(this.offset, endianness === "little");
    this.offset += 8;
    return val;
  }

  public readBytes(length: number): Uint8Array {
    this.checkBounds(length);
    const slice = this.bytes.slice(this.offset, this.offset + length);
    this.offset += length;
    return slice;
  }

  public readUtf8(length: number): string {
    const raw = this.readBytes(length);
    return new TextDecoder().decode(raw);
  }

  public hasMore(): boolean {
    return this.offset < this.bytes.length;
  }

  public getRemainingBytes(): number {
    return Math.max(0, this.bytes.length - this.offset);
  }

  public getOffset(): number {
    return this.offset;
  }

  public seek(offset: number): void {
    if (offset < 0 || offset > this.bytes.length) {
      throw new BufferBoundsError(offset, 0, this.bytes.length);
    }
    this.offset = offset;
  }
}
''')
make_commit("feat(stream): implement ByteReader with boundary validation")

# 20. tests/stream.test.ts
with open("tests/stream.test.ts", "w") as f:
    f.write('''import { describe, it } from "node:test";
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
''')
make_commit("test(stream): add unit tests for ByteWriter and ByteReader")

# 21. src/stream/index.ts
with open("src/stream/index.ts", "w") as f:
    f.write('''export * from "./writer.js";
export * from "./reader.js";
''')
make_commit("feat(stream): export centralized stream module")

# 22. src/dump/hexdump.ts
os.makedirs("src/dump", exist_ok=True)
with open("src/dump/hexdump.ts", "w") as f:
    f.write('''import { HexDumpRow } from "../types.js";

export function createHexDumpRows(bytes: Uint8Array, rowLength = 16): HexDumpRow[] {
  const rows: HexDumpRow[] = [];
  const len = bytes.length;

  for (let i = 0; i < len; i += rowLength) {
    const slice = bytes.slice(i, Math.min(i + rowLength, len));
    const hexParts: string[] = [];
    let ascii = "";

    for (let j = 0; j < slice.length; j++) {
      const b = slice[j];
      hexParts.push(b.toString(16).padStart(2, "0"));
      // Printable ASCII is between 32 and 126
      ascii += (b >= 32 && b <= 126) ? String.fromCharCode(b) : ".";
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

export function formatHexDump(bytes: Uint8Array, rowLength = 16): string {
  const rows = createHexDumpRows(bytes, rowLength);
  return rows
    .map(r => `${r.offset.toString(16).padStart(8, "0")}  ${r.hex}  |${r.ascii}|`)
    .join("\\n");
}
''')
make_commit("feat(dump): implement canonical hexdump formatter")

# 23. tests/hexdump.test.ts
with open("tests/hexdump.test.ts", "w") as f:
    f.write('''import { describe, it } from "node:test";
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
''')
make_commit("test(dump): add test cases for hexdump layout and ascii boundaries")

# 24. src/dump/index.ts
with open("src/dump/index.ts", "w") as f:
    f.write('''export * from "./hexdump.js";
''')
make_commit("feat(dump): export centralized dump module")

# 25. src/checksum/crc32.ts
os.makedirs("src/checksum", exist_ok=True)
with open("src/checksum/crc32.ts", "w") as f:
    f.write('''// Precomputed standard IEEE 802.3 CRC32 lookup table
const CRC_TABLE = new Uint32Array(256);

for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c >>> 0;
}

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function crc32Hex(bytes: Uint8Array): string {
  return crc32(bytes).toString(16).padStart(8, "0");
}
''')
make_commit("feat(checksum): implement fast IEEE 802.3 CRC32 checksum calculator")

# 26. tests/crc32.test.ts
with open("tests/crc32.test.ts", "w") as f:
    f.write('''import { describe, it } from "node:test";
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
''')
make_commit("test(checksum): verify CRC32 against canonical test vectors")

# 27. src/checksum/index.ts
with open("src/checksum/index.ts", "w") as f:
    f.write('''export * from "./crc32.js";
''')
make_commit("feat(checksum): export centralized checksum module")

# 28. src/index.ts
with open("src/index.ts", "w") as f:
    f.write('''export * from "./types.js";
export * from "./errors.js";
export * from "./encoding/index.js";
export * from "./bitwise/index.js";
export * from "./stream/index.js";
export * from "./dump/index.js";
export * from "./checksum/index.js";
''')
make_commit("feat(index): export full public API surface")

# 29. examples/packet-protocol.ts
os.makedirs("examples", exist_ok=True)
with open("examples/packet-protocol.ts", "w") as f:
    f.write('''import { ByteWriter, ByteReader, crc32, formatHexDump } from "../src/index.js";

// Packet layout:
// [Magic 2B: 0x50 0x43] [PacketID 2B] [PayloadLength 2B] [Payload] [CRC32 4B]

function createPacket(packetId: number, payloadText: string): Uint8Array {
  const payloadBytes = new TextEncoder().encode(payloadText);
  const writer = new ByteWriter();

  writer
    .writeUint8(0x50)
    .writeUint8(0x43)
    .writeUint16(packetId, "big")
    .writeUint16(payloadBytes.length, "big")
    .writeBytes(payloadBytes);

  const checksum = crc32(writer.toUint8Array());
  writer.writeUint32(checksum, "big");

  return writer.toUint8Array();
}

function parsePacket(bytes: Uint8Array) {
  const reader = new ByteReader(bytes);
  const magic1 = reader.readUint8();
  const magic2 = reader.readUint8();

  if (magic1 !== 0x50 || magic2 !== 0x43) {
    throw new Error("Invalid magic header");
  }

  const packetId = reader.readUint16("big");
  const length = reader.readUint16("big");
  const payload = reader.readUtf8(length);
  const receivedCrc = reader.readUint32("big");

  const packetBody = bytes.slice(0, bytes.length - 4);
  const expectedCrc = crc32(packetBody);

  return {
    packetId,
    payload,
    isValid: receivedCrc === expectedCrc
  };
}

const packet = createPacket(101, "Hello from custom packet protocol!");
console.log("=== Serialized Packet Hexdump ===");
console.log(formatHexDump(packet));

const parsed = parsePacket(packet);
console.log("\\n=== Deserialized Packet ===");
console.log(parsed);
''')
make_commit("examples: add binary protocol packet encoding and decoding sample")

# 30. .github/workflows/ci.yml
os.makedirs(".github/workflows", exist_ok=True)
with open(".github/workflows/ci.yml", "w") as f:
    f.write('''name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]

    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - run: npm ci
      - run: npm run build
      - run: npm test
''')
make_commit("ci: create continuous integration workflow for multi-node testing")

# 31. .github/workflows/publish.yml
with open(".github/workflows/publish.yml", "w") as f:
    f.write('''name: Publish to NPM

on:
  release:
    types: [published]
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22.x'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
''')
make_commit("ci: configure automated npm publish release pipeline")

# 32. README.md
with open("README.md", "w") as f:
    f.write('''# byte-craft

Ultra-lightweight, zero-dependency binary and byte buffer manipulation toolkit for TypeScript and JavaScript.

## Features

- **ByteStream**: Auto-growing `ByteWriter` and safe `ByteReader` supporting big/little endian integers, floats, byte slices, and UTF-8 strings.
- **Encoding**: Fast, custom Hex and Base64 serializers and parsers.
- **Bitwise Utilities**: `BitMask` for bit-level flag toggling and population count; `FlagSet` for high-level named permission maps.
- **Hexdump**: Canonical terminal hexdump visualizer with offset, byte columns, and printable ASCII.
- **CRC32**: High-speed IEEE 802.3 CRC32 checksum calculation.
- **Zero Dependencies**: Pure TypeScript, dual CommonJS and ESM support, full typings included.

## Installation

```bash
npm install byte-craft
```

## Quick Start

```typescript
import { ByteWriter, ByteReader, toHex, formatHexDump, crc32 } from "byte-craft";

// Write structured binary data
const writer = new ByteWriter();
writer
  .writeUint16(42, "big")
  .writeUtf8("ByteCraft")
  .writeFloat32(3.14, "little");

const buffer = writer.toUint8Array();

// Display hexdump
console.log(formatHexDump(buffer));

// Compute checksum
console.log("CRC32:", crc32(buffer).toString(16));

// Read back data
const reader = new ByteReader(buffer);
const num = reader.readUint16("big");
const label = reader.readUtf8(9);
const val = reader.readFloat32("little");
```

## Scripts

```bash
npm run build   # Build ESM and CJS bundles with declarations via tsup
npm test        # Run all test suites natively with tsx and node:test
```

## License

Apache-2.0
''')
make_commit("docs: add comprehensive documentation and quick start guide")

print("All 32 commits generated successfully!")
