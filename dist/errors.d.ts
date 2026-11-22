export declare class ByteCraftError extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
export declare class BufferBoundsError extends ByteCraftError {
    constructor(offset: number, requested: number, total: number);
}
export declare class EncodingError extends ByteCraftError {
    constructor(reason: string);
}
//# sourceMappingURL=errors.d.ts.map