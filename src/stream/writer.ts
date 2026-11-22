import { IByteWriter, Endianness } from "../types.js";

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
