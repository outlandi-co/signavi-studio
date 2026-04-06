import { useEffect, useState } from "react"
import api from "../../services/api"

/* 🔥 PLACEMENTS */
const placementOptions = [
  { id: "front", label: "Front", price: 3 },
  { id: "back", label: "Back", price: 4 },
  { id: "sleeve", label: "Sleeve", price: 2 }
]

export default function AdminPricing() {

  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState("")

  const [category, setCategory] = useState("tshirt")
  const [baseCost, setBaseCost] = useState(5)

  const [selectedTier, setSelectedTier] = useState(0.6)
  const [placements, setPlacements] = useState([])
  const [quantity, setQuantity] = useState(1)

  const [pricing, setPricing] = useState({
    unit: 0,
    total: 0,
    discount: 0
  })

  const [isPreview, setIsPreview] = useState(false)

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products")
        setProducts(res.data)
      } catch (err) {
        console.error("❌ LOAD PRODUCTS ERROR:", err)
      }
    }
    load()
  }, [])

  /* ================= CALCULATE ================= */
  const calculatePrice = async (override = {}) => {
    try {
      const currentBase = override.baseCost ?? baseCost
      const currentQty = override.quantity ?? quantity
      const currentCategory = (override.category ?? category)?.toLowerCase().trim()
      const currentPlacements = override.placements ?? placements

      const res = await api.post("/pricing/calculate", {
        baseCost: currentBase,
        quantity: currentQty,
        category: currentCategory
      })

      let backendUnit = Number(res.data.unit) || 0

      const placementTotal = placementOptions
        .filter(p => currentPlacements.includes(p.id))
        .reduce((sum, p) => sum + p.price, 0)

      const finalUnit = backendUnit + placementTotal
      const total = finalUnit * currentQty

      setPricing({
        unit: finalUnit.toFixed(2),
        total: total.toFixed(2),
        discount: res.data?.breakdown?.discount || 0
      })

      setIsPreview(false)

    } catch (err) {
      console.error("❌ CALC ERROR:", err)
    }
  }

  /* ================= SELECT PRODUCT ================= */
  const handleProductChange = (e) => {
    const product = products.find(p => p._id === e.target.value)
    if (!product) return

    setSelectedProduct(product._id)
    setBaseCost(Number(product.baseCost) || 0)
    setCategory(product.category || "tshirt")

    calculatePrice({
      baseCost: product.baseCost,
      category: product.category
    })
  }

  /* ================= BASE COST ================= */
  const handleBaseCost = (val) => {
    const cost = Number(val) || 0
    setBaseCost(cost)
    calculatePrice({ baseCost: cost })
  }

  /* ================= SAVE BASE COST ================= */
  const updateBaseCost = async () => {
    try {
      if (!selectedProduct) {
        alert("Select a product first")
        return
      }

      await api.put(`/products/${selectedProduct}`, {
        baseCost: Number(baseCost)
      })

      alert("✅ Base cost saved")

    } catch (err) {
      console.error("❌ BASE COST ERROR:", err)
      alert("Failed to update base cost")
    }
  }

  /* ================= QUANTITY ================= */
  const handleQuantity = (val) => {
    const q = Number(val) || 1
    setQuantity(q)
    calculatePrice({ quantity: q })
  }

  /* ================= PLACEMENTS ================= */
  const togglePlacement = (id) => {
    const updated = placements.includes(id)
      ? placements.filter(p => p !== id)
      : [...placements, id]

    setPlacements(updated)
    calculatePrice({ placements: updated })
  }

  /* ================= PROFIT PREVIEW ================= */
  const previewTier = (t) => {
    setSelectedTier(t)
    setIsPreview(true)

    const previewProfit = baseCost * t
    const previewUnit = baseCost + previewProfit

    const placementTotal = placementOptions
      .filter(p => placements.includes(p.id))
      .reduce((sum, p) => sum + p.price, 0)

    const finalUnit = previewUnit + placementTotal
    const total = finalUnit * quantity

    setPricing({
      unit: finalUnit.toFixed(2),
      total: total.toFixed(2),
      discount: 0
    })
  }

  /* ================= APPLY ================= */
  const applyGlobalPricing = async () => {
    try {
      await api.put(`/pricing/${category}`, {
        profitMultiplier: Number(selectedTier),
        setupFee: 0
      })

      alert(`🔥 Pricing applied to ${category}`)

      calculatePrice()

    } catch (err) {
      console.error("❌ APPLY ERROR:", err)
      alert("Failed to apply pricing")
    }
  }

  return (
    <div className="space-y-6 p-6">

      <h1 className="text-3xl font-bold text-white">💰 Pricing Engine</h1>

      {isPreview && (
        <p className="text-yellow-400">⚡ Preview Mode (not saved)</p>
      )}

      {/* PRODUCT */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <label className="text-sm text-gray-400 block mb-2">Select Product</label>
        <select
          value={selectedProduct}
          onChange={handleProductChange}
          className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white"
        >
          <option value="">-- Choose Product --</option>
          {products.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* CATEGORY */}
      <div className="text-white">
        Applying pricing to: <strong>{category}</strong>
      </div>

      {/* QUANTITY */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <input
          type="number"
          value={quantity}
          onChange={(e) => handleQuantity(e.target.value)}
          className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white"
        />
      </div>

      {/* BASE COST */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <input
          type="number"
          value={baseCost}
          onChange={(e) => handleBaseCost(e.target.value)}
          className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white"
        />

        <button
          onClick={updateBaseCost}
          className="mt-3 w-full bg-blue-500 text-black font-bold py-2 rounded"
        >
          💾 Save Base Cost
        </button>
      </div>

      {/* PROFIT TIERS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0.8, 0.6, 0.5, 0.4].map(t => (
          <button
            key={t}
            onClick={() => previewTier(t)}
            className={`p-3 rounded-lg border ${
              selectedTier === t
                ? "bg-cyan-600"
                : "bg-black border-gray-700"
            }`}
          >
            {t * 100}%
          </button>
        ))}
      </div>

      {/* PLACEMENTS */}
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

      {/* RESULT */}
      <div className="text-white">
        <p>Unit: ${pricing.unit}</p>
        <p>Total: ${pricing.total}</p>
      </div>

      {/* APPLY */}
      <button
        onClick={applyGlobalPricing}
        className="w-full bg-green-500 py-3 rounded text-lg"
      >
        🚀 Apply Pricing
      </button>

    </div>
  )
}