export declare class BitMask {
    private value;
    constructor(initial?: number);
    set(bitPosition: number): this;
    clear(bitPosition: number): this;
    toggle(bitPosition: number): this;
    has(bitPosition: number): boolean;
    getBit(bitPosition: number): 0 | 1;
    getValue(): number;
    toBinaryString(length?: number): string;
    countOnes(): number;
}
//# sourceMappingURL=mask.d.ts.map