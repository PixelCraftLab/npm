import { EncodingError } from "../errors.js";

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
  const cleaned = b64.trim().replace(/\s+/g, "");
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
