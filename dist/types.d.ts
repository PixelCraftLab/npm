export type Endianness = "big" | "little";
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
//# sourceMappingURL=types.d.ts.map