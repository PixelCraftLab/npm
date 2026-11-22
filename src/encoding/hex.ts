import { HexFormatOptions } from "../types.js";
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
