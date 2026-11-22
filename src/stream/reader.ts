import { IByteReader, Endianness } from "../types.js";
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
