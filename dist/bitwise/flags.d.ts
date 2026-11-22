export declare class FlagSet<T extends string = string> {
    private flags;
    private currentMask;
    constructor(flagNames?: T[]);
    register(flagName: T): number;
    enable(flagName: T): this;
    disable(flagName: T): this;
    isEnabled(flagName: T): boolean;
    getActiveFlags(): T[];
    getMask(): number;
}
//# sourceMappingURL=flags.d.ts.map