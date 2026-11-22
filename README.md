# byte-craft

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
