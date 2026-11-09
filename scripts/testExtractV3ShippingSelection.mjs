import assert from "node:assert/strict"
import {
  extractV3ShippingSelection
} from "../src/utils/extractV3ShippingSelection.js"

const original = {
  provider: "USPS",
  servicelevel: {
    token: "usps_ground_advantage",
    name: "Ground Advantage"
  },
  currency: "USD",
  amount: "6.59"
}

const selected = {
  provider: "USPS",
  servicelevel: "Ground Advantage",
  amount: 6.59,
  raw: original
}

assert.deepEqual(
  { ...extractV3ShippingSelection(selected) },
  {
    carrier: "USPS",
    serviceToken: "usps_ground_advantage",
    currency: "USD",
    amount: "6.59"
  }
)
console.log("ORIGINAL SHIPPO SERVICE TOKEN: PASS")

assert.equal(
  extractV3ShippingSelection({
    ...selected,
    raw: { ...original, servicelevel: "Ground Advantage" }
  }),
  null
)
console.log("DISPLAY-ONLY SERVICE: REJECTED")

assert.equal(
  extractV3ShippingSelection({ ...selected, amount: 6.60 }),
  null
)
console.log("CHANGED DISPLAYED PRICE: REJECTED")

assert.equal(
  extractV3ShippingSelection({
    ...selected,
    raw: { ...original, currency: "" }
  }),
  null
)
console.log("MISSING CURRENCY: REJECTED")

assert.equal(
  extractV3ShippingSelection({ ...selected, raw: null }),
  null
)
console.log("MISSING ORIGINAL RATE: REJECTED")

assert.equal(
  extractV3ShippingSelection({
    ...selected,
    raw: { ...original, amount: "invalid" }
  }),
  null
)
console.log("INVALID CARRIER AMOUNT: REJECTED")

console.log("ALL SHIPPING SELECTION EXTRACTION TESTS PASSED")