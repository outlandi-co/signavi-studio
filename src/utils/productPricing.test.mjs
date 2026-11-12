import test from "node:test";
import assert from "node:assert/strict";
import { calculateProductPricing } from "./productPricing.js";

test("calculates 60 percent markup", () => {
  assert.deepEqual(calculateProductPricing(10, 60), {
    unitCost: 10,
    markupPercent: 60,
    sellingPrice: 16,
    profit: 6,
    margin: 37.5
  });
});

test("calculates zero markup", () => {
  assert.equal(calculateProductPricing(20, 0).sellingPrice, 20);
});

test("rejects negative costs", () => {
  assert.throws(() => calculateProductPricing(-10, 50));
});

test("rejects invalid markup", () => {
  assert.throws(() => calculateProductPricing(10, "invalid"));
});