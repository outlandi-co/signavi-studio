import { useState } from "react"

/* 🔥 INVENTORY */
const inventory = [
  { id: "3001", name: "Bella Canvas 3001 T-Shirt", baseCost: 5.5 },
  { id: "3719", name: "Bella Canvas 3719 Hoodie", baseCost: 12 },
  { id: "5000", name: "Gildan 5000 T-Shirt", baseCost: 4 }
]

/* 🔥 PLACEMENTS */
const placementOptions = [
  { id: "front", label: "Front", price: 3 },
  { id: "back", label: "Back", price: 4 },
  { id: "sleeve", label: "Sleeve", price: 2 }
]

/* 🔥 BULK DISCOUNTS */
const quantityTiers = [
  { min: 1, discount: 0 },       // no discount
  { min: 12, discount: 0.1 },    // 10% off
  { min: 24, discount: 0.2 },    // 20% off
  { min: 50, discount: 0.3 }     // 30% off
]

export default function AdminPricing() {
  const [selectedProduct, setSelectedProduct] = useState("")
  const [baseCost, setBaseCost] = useState(5)
  const [selectedTier, setSelectedTier] = useState(0.8)
  const [placements, setPlacements] = useState([])
  const [quantity, setQuantity] = useState(1)

  const tiers = [
    { label: "80%", value: 0.8 },
    { label: "60%", value: 0.6 },
    { label: "50%", value: 0.5 },
    { label: "40%", value: 0.4 }
  ]

  /* PRODUCT SELECT */
  const handleProductChange = (e) => {
    const product = inventory.find(p => p.id === e.target.value)
    setSelectedProduct(e.target.value)
    setBaseCost(product?.baseCost || 0)
  }

  /* TOGGLE PLACEMENTS */
  const togglePlacement = (id) => {
    setPlacements(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    )
  }

  /* 🔥 GET BULK DISCOUNT */
  const getDiscount = () => {
    let discount = 0

    for (let tier of quantityTiers) {
      if (quantity >= tier.min) {
        discount = tier.discount
      }
    }

    return discount
  }

  /* 🔥 CALCULATION */
  const calculatePrice = () => {
    const profit = baseCost * selectedTier
    const productPrice = baseCost + profit

    const placementTotal = placementOptions
      .filter(p => placements.includes(p.id))
      .reduce((sum, p) => sum + p.price, 0)

    const unitPrice = productPrice + placementTotal

    const discount = getDiscount()
    const discountedUnit = unitPrice * (1 - discount)

    const total = discountedUnit * quantity

    return {
      unit: discountedUnit.toFixed(2),
      total: total.toFixed(2),
      discount: discount
    }
  }

  const pricing = calculatePrice()

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">💰 Pricing Engine</h1>

      {/* PRODUCT */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <label className="text-sm text-gray-400 block mb-2">Select Product</label>

        <select
          value={selectedProduct}
          onChange={handleProductChange}
          className="w-full p-3 bg-black border border-gray-700 rounded-lg"
        >
          <option value="">-- Choose Product --</option>
          {inventory.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* QUANTITY */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <label className="text-sm text-gray-400 block mb-2">Quantity</label>

        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full p-3 bg-black border border-gray-700 rounded-lg"
        />
      </div>

      {/* BASE COST */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <label className="text-sm text-gray-400 block mb-2">Base Cost</label>

        <input
          type="number"
          value={baseCost}
          onChange={(e) => setBaseCost(Number(e.target.value))}
          className="w-full p-3 bg-black border border-gray-700 rounded-lg"
        />
      </div>

      {/* TIERS */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="mb-4 text-lg font-semibold">Profit Tier</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tiers.map(t => (
            <button
              key={t.value}
              onClick={() => setSelectedTier(t.value)}
              className={`p-3 rounded-lg border ${
                selectedTier === t.value
                  ? "bg-cyan-600"
                  : "bg-black border-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* PLACEMENTS */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="mb-4 text-lg font-semibold">Print Placement</h2>

        <div className="flex gap-4 flex-wrap">
          {placementOptions.map(p => (
            <button
              key={p.id}
              onClick={() => togglePlacement(p.id)}
              className={`px-4 py-2 rounded-lg border ${
                placements.includes(p.id)
                  ? "bg-cyan-600"
                  : "bg-black border-gray-700"
              }`}
            >
              {p.label} (+${p.price})
            </button>
          ))}
        </div>
      </div>

      {/* RESULT */}
      <div className="bg-black p-6 rounded-xl border border-gray-800 space-y-2">
        <p className="text-gray-400">Unit Price</p>
        <p className="text-2xl text-cyan-400 font-bold">${pricing.unit}</p>

        <p className="text-gray-400">Total Price</p>
        <p className="text-4xl text-green-400 font-bold">${pricing.total}</p>

        <p className="text-sm text-gray-500">
          Discount Applied: {pricing.discount * 100}%
        </p>
      </div>

    </div>
  )
}