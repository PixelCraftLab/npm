export class BitMask {
  private value: number;

  constructor(initial = 0) {
    this.value = initial >>> 0;
  }

  public set(bitPosition: number): this {
    this.value = (this.value | (1 << bitPosition)) >>> 0;
    return this;
  }

  public clear(bitPosition: number): this {
    this.value = (this.value & ~(1 << bitPosition)) >>> 0;
    return this;
  }

  public toggle(bitPosition: number): this {
    this.value = (this.value ^ (1 << bitPosition)) >>> 0;
    return this;
  }

  public has(bitPosition: number): boolean {
    return ((this.value >> bitPosition) & 1) === 1;
  }

  public getBit(bitPosition: number): 0 | 1 {
    return (((this.value >> bitPosition) & 1) === 1 ? 1 : 0);
  }

  public getValue(): number {
    return this.value;
  }

  public toBinaryString(length = 32): string {
    return this.value.toString(2).padStart(length, "0");
  }

  public countOnes(): number {
    let count = 0;
    let n = this.value;
    while (n > 0) {
      count += n & 1;
      n >>>= 1;
    }
    return count;
  }
}
