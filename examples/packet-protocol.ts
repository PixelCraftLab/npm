import { ByteWriter, ByteReader, crc32, formatHexDump } from "../src/index.js";

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
console.log("\n=== Deserialized Packet ===");
console.log(parsed);
