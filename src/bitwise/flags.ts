export class FlagSet<T extends string = string> {
  private flags = new Map<T, number>();
  private currentMask = 0;

  constructor(flagNames?: T[]) {
    if (flagNames) {
      flagNames.forEach((name, index) => {
        if (index >= 32) {
          throw new Error("Maximum of 32 distinct flags supported per FlagSet instance.");
        }
        this.flags.set(name, 1 << index);
      });
    }
  }

  public register(flagName: T): number {
    if (this.flags.has(flagName)) {
      return this.flags.get(flagName)!;
    }
    const currentSize = this.flags.size;
    if (currentSize >= 32) {
      throw new Error("Maximum 32 flags exceeded.");
    }
    const bit = 1 << currentSize;
    this.flags.set(flagName, bit);
    return bit;
  }

  public enable(flagName: T): this {
    const bit = this.flags.get(flagName);
    if (bit !== undefined) {
      this.currentMask |= bit;
    }
    return this;
  }

  public disable(flagName: T): this {
    const bit = this.flags.get(flagName);
    if (bit !== undefined) {
      this.currentMask &= ~bit;
    }
    return this;
  }

  public isEnabled(flagName: T): boolean {
    const bit = this.flags.get(flagName);
    if (bit === undefined) return false;
    return (this.currentMask & bit) !== 0;
  }

  public getActiveFlags(): T[] {
    const active: T[] = [];
    for (const [name, bit] of this.flags.entries()) {
      if ((this.currentMask & bit) !== 0) {
        active.push(name);
      }
    }
    return active;
  }

  public getMask(): number {
    return this.currentMask >>> 0;
  }
}
