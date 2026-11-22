import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BitMask } from "../src/bitwise/mask.js";

describe("BitMask operations", () => {
  it("sets, toggles, and clears individual bits", () => {
    const mask = new BitMask(0);
    assert.equal(mask.has(3), false);

    mask.set(3);
    assert.equal(mask.has(3), true);
    assert.equal(mask.getBit(3), 1);
    assert.equal(mask.getValue(), 8);

    mask.toggle(3);
    assert.equal(mask.has(3), false);
    assert.equal(mask.getValue(), 0);

    mask.set(1).set(2);
    assert.equal(mask.getValue(), 6);
    mask.clear(1);
    assert.equal(mask.getValue(), 4);
  });

  it("calculates binary string and population count", () => {
    const mask = new BitMask(0b10110);
    assert.equal(mask.countOnes(), 3);
    assert.equal(mask.toBinaryString(8), "00010110");
  });
});
