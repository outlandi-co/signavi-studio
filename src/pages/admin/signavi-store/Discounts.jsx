import { useEffect, useMemo, useState } from "react"
import api from "../../../services/api"

const money = (value = 0) =>
  Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })

const getPrice = (product) =>
  Number(product.listPrice || product.price || product.basePrice || 0)

const getSalePrice = (price, discountType, discountValue) => {
  const value = Number(discountValue || 0)

  if (!price || !value) return price

  if (discountType === "percent") {
    return Math.max(price - price * (value / 100), 0)
  }

  return Math.max(price - value, 0)
}

export default function Discounts() {
  const [products, setProducts] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const [discountType, setDiscountType] = useState("percent")
  const [discountValue, setDiscountValue] = useState("")
  const [discountLabel, setDiscountLabel] = useState("")

  const loadProducts = async () => {
    try {
      setLoading(true)

      const res = await api.get("/products", {
        params: {
          storefront: "signavi"
        }
      })

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || []

      setProducts(data)
    } catch (err) {
      console.error("❌ LOAD DISCOUNT PRODUCTS ERROR:", err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

 useEffect(() => {
  const timer = setTimeout(() => {
    loadProducts()
  }, 0)

  return () => clearTimeout(timer)
}, [])

  const categories = useMemo(() => {
    return [
      "all",
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      )
    ]
  }, [products])

  const filteredProducts = useMemo(() => {
    let data = [...products]

    if (search.trim()) {
      const term = search.trim().toLowerCase()

      data = data.filter((product) =>
        String(product.name || "").toLowerCase().includes(term) ||
        String(product.sku || "").toLowerCase().includes(term) ||
        String(product.category || "").toLowerCase().includes(term)
      )
    }

    if (categoryFilter !== "all") {
      data = data.filter(
        (product) => product.category === categoryFilter
      )
    }

    if (typeFilter !== "all") {
      data = data.filter(
        (product) =>
          String(product.productType || "physical") === typeFilter
      )
    }

    return data
  }, [products, search, categoryFilter, typeFilter])

  const selectedProducts = products.filter((product) =>
    selectedIds.includes(product._id)
  )

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    )
  }

  const selectFiltered = () => {
    setSelectedIds(filteredProducts.map((product) => product._id))
  }

  const clearSelected = () => {
    setSelectedIds([])
  }

  const applyDiscounts = async () => {
    if (selectedIds.length === 0) {
      alert("Select at least one product.")
      return
    }

    if (!discountValue || Number(discountValue) <= 0) {
      alert("Enter a valid discount value.")
      return
    }

    const confirmApply = window.confirm(
      `Apply discount to ${selectedIds.length} product(s)?`
    )

    if (!confirmApply) return

    try {
      setSaving(true)

      await Promise.all(
        selectedProducts.map((product) => {
          const price = getPrice(product)
          const salePrice = getSalePrice(
            price,
            discountType,
            discountValue
          )

          return api.patch(`/products/${product._id}`, {
            discountActive: true,
            discountType,
            discountValue: Number(discountValue),
            discountLabel:
              discountLabel ||
              (discountType === "percent"
                ? `${discountValue}% OFF`
                : `${money(discountValue)} OFF`),
            originalPrice: product.originalPrice || price,
            salePrice
          })
        })
      )

      await loadProducts()
      clearSelected()
      alert("Discounts applied successfully.")
    } catch (err) {
      console.error("❌ APPLY DISCOUNTS ERROR:", err)
      alert(
        err?.response?.data?.message ||
          "Failed to apply discounts"
      )
    } finally {
      setSaving(false)
    }
  }

  const removeDiscounts = async () => {
    if (selectedIds.length === 0) {
      alert("Select at least one product.")
      return
    }

    const confirmRemove = window.confirm(
      `Remove discounts from ${selectedIds.length} product(s)?`
    )

    if (!confirmRemove) return

    try {
      setSaving(true)

      await Promise.all(
        selectedProducts.map((product) =>
          api.patch(`/products/${product._id}`, {
            discountActive: false,
            discountType: "",
            discountValue: 0,
            discountLabel: "",
            salePrice: 0,
            originalPrice: product.originalPrice || getPrice(product)
          })
        )
      )

      await loadProducts()
      clearSelected()
      alert("Discounts removed successfully.")
    } catch (err) {
      console.error("❌ REMOVE DISCOUNTS ERROR:", err)
      alert(
        err?.response?.data?.message ||
          "Failed to remove discounts"
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main style={page}>
        Loading discount manager...
      </main>
    )
  }

  return (
    <main style={page}>
      <div style={header}>
        <div>
          <p style={eyebrow}>SignaVi Store</p>
          <h1 style={title}>Discount Manager</h1>
          <p style={subtitle}>
            Filter products, select items, and apply markdown pricing anytime.
          </p>
        </div>
      </div>

      <section style={panel}>
        <h2 style={sectionTitle}>Filters</h2>

        <div style={filterGrid}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, SKU, or category..."
            style={input}
          />

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            style={input}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            style={input}
          >
            <option value="all">All Types</option>
            <option value="physical">Physical</option>
            <option value="digital">Digital</option>
            <option value="service">Service</option>
          </select>
        </div>

        <div style={buttonRow}>
          <button type="button" onClick={selectFiltered} style={blueButton}>
            Select Filtered
          </button>

          <button type="button" onClick={clearSelected} style={darkButton}>
            Clear Selected
          </button>
        </div>
      </section>

      <section style={panel}>
        <h2 style={sectionTitle}>Discount Settings</h2>

        <div style={filterGrid}>
          <select
            value={discountType}
            onChange={(event) => setDiscountType(event.target.value)}
            style={input}
          >
            <option value="percent">Percent Off</option>
            <option value="fixed">Fixed Dollar Off</option>
          </select>

          <input
            type="number"
            min="0"
            step="0.01"
            value={discountValue}
            onChange={(event) => setDiscountValue(event.target.value)}
            placeholder={
              discountType === "percent"
                ? "Example: 20"
                : "Example: 5.00"
            }
            style={input}
          />

          <input
            value={discountLabel}
            onChange={(event) => setDiscountLabel(event.target.value)}
            placeholder="Label: 20% OFF, Clearance, Summer Sale..."
            style={input}
          />
        </div>

        <div style={summaryBox}>
          <strong>{selectedIds.length}</strong> product(s) selected
        </div>

        <div style={buttonRow}>
          <button
            type="button"
            onClick={applyDiscounts}
            disabled={saving}
            style={greenButton}
          >
            {saving ? "Applying..." : "Apply Discount"}
          </button>

          <button
            type="button"
            onClick={removeDiscounts}
            disabled={saving}
            style={redButton}
          >
            Remove Discount
          </button>
        </div>
      </section>

      <section style={panel}>
        <h2 style={sectionTitle}>Products</h2>

        {filteredProducts.length === 0 ? (
          <p style={subtitle}>No matching products found.</p>
        ) : (
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Select</th>
                  <th style={th}>Product</th>
                  <th style={th}>Category</th>
                  <th style={th}>Type</th>
                  <th style={th}>Price</th>
                  <th style={th}>Sale Price</th>
                  <th style={th}>Discount</th>
                  <th style={th}>Preview</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const price = getPrice(product)
                  const selected = selectedIds.includes(product._id)
                  const previewSalePrice = getSalePrice(
                    price,
                    discountType,
                    discountValue
                  )

                  return (
                    <tr key={product._id} style={selected ? selectedRow : row}>
                      <td style={td}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleSelected(product._id)}
                        />
                      </td>

                      <td style={td}>
                        <strong>{product.name || "Untitled"}</strong>
                        <br />
                        <span style={muted}>
                          {product.sku || product._id}
                        </span>
                      </td>

                      <td style={td}>{product.category || "N/A"}</td>
                      <td style={td}>{product.productType || "physical"}</td>
                      <td style={td}>{money(price)}</td>

                      <td style={td}>
                        {product.discountActive
                          ? money(product.salePrice)
                          : "—"}
                      </td>

                      <td style={td}>
                        {product.discountActive
                          ? product.discountLabel || "Active"
                          : "None"}
                      </td>

                      <td style={td}>
                        {discountValue
                          ? money(previewSalePrice)
                          : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

const page = {
  minHeight: "100vh",
  background: "#020617",
  color: "white",
  padding: 30
}

const header = {
  marginBottom: 24
}

const eyebrow = {
  color: "#22d3ee",
  textTransform: "uppercase",
  letterSpacing: "0.25em",
  fontWeight: "bold",
  fontSize: 13,
  marginBottom: 10
}

const title = {
  fontSize: 42,
  margin: 0
}

const subtitle = {
  color: "#94a3b8",
  marginTop: 8
}

const panel = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 20,
  padding: 22,
  marginBottom: 20
}

const sectionTitle = {
  marginTop: 0,
  marginBottom: 16,
  fontSize: 22
}

const filterGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14
}

const input = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
  outline: "none"
}

const buttonRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 16
}

const blueButton = {
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  borderRadius: 12,
  padding: "11px 14px",
  fontWeight: "bold",
  cursor: "pointer"
}

const greenButton = {
  ...blueButton,
  background: "#22c55e"
}

const redButton = {
  ...blueButton,
  background: "#ef4444",
  color: "white"
}

const darkButton = {
  ...blueButton,
  background: "#334155",
  color: "white"
}

const summaryBox = {
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: 14,
  padding: 14,
  marginTop: 16,
  color: "#e2e8f0"
}

const tableWrap = {
  overflowX: "auto"
}

const table = {
  width: "100%",
  borderCollapse: "collapse"
}

const th = {
  textAlign: "left",
  color: "#94a3b8",
  fontSize: 13,
  padding: "12px",
  borderBottom: "1px solid #334155"
}

const td = {
  padding: "12px",
  borderBottom: "1px solid #1e293b",
  verticalAlign: "top"
}

const row = {
  background: "transparent"
}

const selectedRow = {
  background: "rgba(34, 211, 238, 0.08)"
}

const muted = {
  color: "#64748b",
  fontSize: 12
}