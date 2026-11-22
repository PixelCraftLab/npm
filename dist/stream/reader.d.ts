import { IByteReader, Endianness } from "../types.js";
export declare class ByteReader implements IByteReader {
    private readonly bytes;
    private view;
    private offset;
    constructor(bytes: Uint8Array);
    private checkBounds;
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
//# sourceMappingURL=reader.d.ts.map