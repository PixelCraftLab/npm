import { IByteWriter, Endianness } from "../types.js";
export declare class ByteWriter implements IByteWriter {
    private buffer;
    private view;
    private length;
    constructor(initialCapacity?: number);
    private ensureCapacity;
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
//# sourceMappingURL=writer.d.ts.map