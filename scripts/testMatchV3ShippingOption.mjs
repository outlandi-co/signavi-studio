import assert from "node:assert/strict"

import {
  matchV3ShippingOption
} from "../src/utils/matchV3ShippingOption.js"

const selected = {
  carrier: "USPS",
  serviceToken: "usps_ground_advantage",
  currency: "USD",
  amount: "6.59"
}

const option = {
  category: "standard",
  carrier: "USPS",
  serviceToken: "usps_ground_advantage",
  currency: "USD",
  amount: "6.59",
  signedQuote: "synthetic_signed_quote"
}

const match = options =>
  matchV3ShippingOption({ selected, options })

assert.equal(match([option]), option)
console.log("EXACT MATCH: PASS")

assert.equal(match([{ ...option, amount: "6.60" }]), null)
console.log("CHANGED PRICE: REJECTED")

assert.equal(
  match([{ ...option, serviceToken: "usps_priority" }]),
  null
)
console.log("CHANGED SERVICE: REJECTED")

assert.equal(match([{ ...option, carrier: "UPS" }]), null)
console.log("CHANGED CARRIER: REJECTED")

assert.equal(match([{ ...option, currency: "CAD" }]), null)
console.log("CHANGED CURRENCY: REJECTED")

assert.equal(match([{ ...option, signedQuote: "" }]), null)
console.log("MISSING SIGNED QUOTE: REJECTED")

assert.equal(match([option, { ...option }]), null)
console.log("AMBIGUOUS OPTIONS: REJECTED")

assert.equal(
  matchV3ShippingOption({
    selected: { ...selected, serviceToken: "" },
    options: [option]
  }),
  null
)
console.log("MISSING ORIGINAL SERVICE TOKEN: REJECTED")

console.log("ALL V3 SHIPPING MATCHING TESTS PASSED")