import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FlagSet } from "../src/bitwise/flags.js";

describe("FlagSet", () => {
  it("enables, disables and queries registered flags", () => {
    type Perms = "READ" | "WRITE" | "EXECUTE" | "ADMIN";
    const perms = new FlagSet<Perms>(["READ", "WRITE", "EXECUTE", "ADMIN"]);

    assert.equal(perms.isEnabled("READ"), false);
    perms.enable("READ").enable("WRITE");

    assert.equal(perms.isEnabled("READ"), true);
    assert.equal(perms.isEnabled("WRITE"), true);
    assert.equal(perms.isEnabled("EXECUTE"), false);

    assert.deepEqual(perms.getActiveFlags(), ["READ", "WRITE"]);

    perms.disable("WRITE");
    assert.deepEqual(perms.getActiveFlags(), ["READ"]);
  });
});
