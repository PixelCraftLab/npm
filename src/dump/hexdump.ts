import { HexDumpRow } from "../types.js";

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
    .join("\n");
}
