import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../../services/api"

const blankVariant = {
  color: "",
  size: "",
  stock: "",
  price: "",
  basePrice: "",
  listPrice: "",
  images: []
}

const money = (value = 0) =>
  Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })

export default function CreateStoreProduct() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    productType: "physical"
  })

  const [variants, setVariants] = useState([{ ...blankVariant }])
  const [saving, setSaving] = useState(false)

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const updateVariant = (index, field, value) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    )
  }

  const updateVariantImages = (index, files) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index
          ? { ...variant, images: Array.from(files || []) }
          : variant
      )
    )
  }

  const applyMarkup = (index, markupPercent) => {
    setVariants((prev) =>
      prev.map((variant, i) => {
        if (i !== index) return variant

        const cost = Number(variant.basePrice || 0)

        if (!cost || cost <= 0) {
          alert("Enter Base Price / Cost first.")
          return variant
        }

        const sellingPrice = cost * (1 + markupPercent / 100)

        return {
          ...variant,
          price: sellingPrice.toFixed(2),
          listPrice: sellingPrice.toFixed(2)
        }
      })
    )
  }

  const addVariant = () => {
    setVariants((prev) => [...prev, { ...blankVariant }])
  }

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  const createProduct = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)

      const validVariants = variants.filter(
        (variant) => variant.color.trim() && variant.size.trim()
      )

      if (validVariants.length === 0) {
        alert("Add at least one color/size variant.")
        return
      }

      const firstVariant = validVariants[0]

      const uniqueSizes = [
        ...new Set(validVariants.map((variant) => variant.size.trim()))
      ]

      const uniqueColors = [
        ...new Map(
          validVariants.map((variant) => [
            variant.color.trim(),
            { name: variant.color.trim() }
          ])
        ).values()
      ]

      const totalStock = validVariants.reduce((sum, variant) => {
        return sum + Number(variant.stock || 0)
      }, 0)

      const formData = new FormData()

      formData.append("name", form.name)
      formData.append("description", form.description)
      formData.append("category", form.category)
      formData.append("productType", form.productType)

      formData.append("price", firstVariant.price || 0)
      formData.append(
        "basePrice",
        firstVariant.basePrice || firstVariant.price || 0
      )
      formData.append(
        "listPrice",
        firstVariant.listPrice || firstVariant.price || 0
      )

      formData.append("cost", firstVariant.basePrice || 0)
      formData.append("unitCost", firstVariant.basePrice || 0)

      formData.append("stock", totalStock)
      formData.append("quantity", totalStock)

      formData.append("storefrontVisible", "true")
      formData.append("storefront", "signavi")
      formData.append("salesChannel", "signavi_store")
      formData.append("active", "true")

      formData.append("sizes", JSON.stringify(uniqueSizes))
      formData.append("colors", JSON.stringify(uniqueColors))

      const cleanVariants = validVariants.map((variant) => ({
        color: variant.color.trim(),
        size: variant.size.trim(),
        stock: Number(variant.stock || 0),
        quantity: Number(variant.stock || 0),
        price: Number(variant.price || firstVariant.price || 0),
        basePrice: Number(
          variant.basePrice || variant.price || firstVariant.price || 0
        ),
        listPrice: Number(
          variant.listPrice || variant.price || firstVariant.price || 0
        ),
        cost: Number(
          variant.basePrice || variant.price || firstVariant.price || 0
        ),
        unitCost: Number(
          variant.basePrice || variant.price || firstVariant.price || 0
        )
      }))

      formData.append("variants", JSON.stringify(cleanVariants))

      validVariants.forEach((variant) => {
        variant.images.forEach((file) => {
          formData.append("images", file)
          formData.append("imageColors", variant.color.trim())
        })
      })

      await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      navigate("/admin/signavi-store/products")
    } catch (err) {
      console.error("❌ CREATE STORE PRODUCT ERROR:", err)

      alert(
        err?.response?.data?.message ||
          "Failed to create store product"
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h1 style={title}>➕ Create Store Product</h1>
          <p style={subtitle}>
            Add products for signavi.store with stock per size/color.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/signavi-store/products")}
          style={backButton}
        >
          ← Back
        </button>
      </div>

      <form onSubmit={createProduct} style={formStyle}>
        <section style={section}>
          <h2 style={sectionTitle}>Product Info</h2>

          <label style={label}>
            Product Name
            <input
              required
              value={form.name}
              onChange={(event) =>
                updateForm("name", event.target.value)
              }
              style={input}
              placeholder="Example: Signavi Hoodie"
            />
          </label>

          <label style={label}>
            Description
            <textarea
              value={form.description}
              onChange={(event) =>
                updateForm("description", event.target.value)
              }
              style={textarea}
              placeholder="Describe the product..."
            />
          </label>

          <label style={label}>
            Category
            <input
              required
              value={form.category}
              onChange={(event) =>
                updateForm("category", event.target.value)
              }
              style={input}
              placeholder="Apparel, Accessories, Digital, etc."
            />
          </label>

          <label style={label}>
            Product Type
            <select
              value={form.productType}
              onChange={(event) =>
                updateForm("productType", event.target.value)
              }
              style={input}
            >
              <option value="physical">Physical</option>
              <option value="digital">Digital</option>
              <option value="service">Service</option>
            </select>
          </label>
        </section>

        <section style={section}>
          <div style={variantHeader}>
            <div>
              <h2 style={sectionTitle}>Variants</h2>
              <p style={helper}>
                Add stock, base cost, markup adjustment, and images by color/size.
              </p>
            </div>

            <button
              type="button"
              onClick={addVariant}
              style={smallButton}
            >
              + Add Variant
            </button>
          </div>

          {variants.map((variant, index) => {
            const basePrice = Number(variant.basePrice || 0)
            const listPrice = Number(variant.listPrice || variant.price || 0)
            const profit = listPrice - basePrice
            const markup =
              basePrice > 0 ? (profit / basePrice) * 100 : 0
            const margin =
              listPrice > 0 ? (profit / listPrice) * 100 : 0

            return (
              <div key={index} style={variantBox}>
                <div style={variantTop}>
                  <h3 style={variantTitle}>
                    Variant #{index + 1}
                  </h3>

                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      style={dangerSmallButton}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div style={grid2}>
                  <label style={label}>
                    Color
                    <input
                      required
                      value={variant.color}
                      onChange={(event) =>
                        updateVariant(index, "color", event.target.value)
                      }
                      style={input}
                      placeholder="Black"
                    />
                  </label>

                  <label style={label}>
                    Size
                    <input
                      required
                      value={variant.size}
                      onChange={(event) =>
                        updateVariant(index, "size", event.target.value)
                      }
                      style={input}
                      placeholder="M"
                    />
                  </label>

                  <label style={label}>
                    Quantity In Stock
                    <input
                      required
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(event) =>
                        updateVariant(index, "stock", event.target.value)
                      }
                      style={input}
                    />
                  </label>

                  <label style={label}>
                    Base Price / Cost
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.basePrice}
                      onChange={(event) =>
                        updateVariant(index, "basePrice", event.target.value)
                      }
                      style={input}
                      placeholder="Example: 20.00"
                    />
                  </label>

                  <label style={label}>
                    Selling Price
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price}
                      onChange={(event) => {
                        updateVariant(index, "price", event.target.value)
                        updateVariant(index, "listPrice", event.target.value)
                      }}
                      style={input}
                      placeholder="Example: 30.00"
                    />
                  </label>

                  <label style={label}>
                    List Price
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.listPrice}
                      onChange={(event) =>
                        updateVariant(index, "listPrice", event.target.value)
                      }
                      style={input}
                      placeholder="Optional"
                    />
                  </label>
                </div>

                <div style={pricingBox}>
                  <div>
                    <h4 style={pricingTitle}>Markup Adjustment</h4>
                    <p style={helper}>
                      Choose a markup percentage. The button updates Selling Price and List Price from Base Price / Cost.
                    </p>
                  </div>

                  <div style={buttonRow}>
                    <button
                      type="button"
                      onClick={() => applyMarkup(index, 40)}
                      style={pricingButton}
                    >
                      40% Markup
                    </button>

                    <button
                      type="button"
                      onClick={() => applyMarkup(index, 50)}
                      style={pricingButton}
                    >
                      50% Markup
                    </button>

                    <button
                      type="button"
                      onClick={() => applyMarkup(index, 60)}
                      style={pricingButton}
                    >
                      60% Markup
                    </button>

                    <button
                      type="button"
                      onClick={() => applyMarkup(index, 80)}
                      style={pricingButton}
                    >
                      80% Markup
                    </button>
                  </div>

                  <div style={pricingStats}>
                    <div style={statBox}>
                      <span style={statLabel}>Cost</span>
                      <strong>{money(basePrice)}</strong>
                    </div>

                    <div style={statBox}>
                      <span style={statLabel}>Sell</span>
                      <strong>{money(listPrice)}</strong>
                    </div>

                    <div style={statBox}>
                      <span style={statLabel}>Profit</span>
                      <strong>{money(profit)}</strong>
                    </div>

                    <div style={statBox}>
                      <span style={statLabel}>Markup</span>
                      <strong>{markup.toFixed(1)}%</strong>
                    </div>

                    <div style={statBox}>
                      <span style={statLabel}>Margin</span>
                      <strong>{margin.toFixed(1)}%</strong>
                    </div>
                  </div>
                </div>

                <label style={label}>
                  Images for this color
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(event) =>
                      updateVariantImages(index, event.target.files)
                    }
                    style={fileInput}
                  />
                </label>

                {variant.images.length > 0 && (
                  <p style={helper}>
                    {variant.images.length} image(s) selected for{" "}
                    {variant.color || "this variant"}
                  </p>
                )}
              </div>
            )
          })}
        </section>

        <section style={lockedBox}>
          <h2 style={sectionTitle}>Storefront Defaults</h2>

          <ul>
            <li>storefrontVisible: true</li>
            <li>storefront: signavi</li>
            <li>salesChannel: signavi_store</li>
          </ul>
        </section>

        <button
          type="submit"
          disabled={saving}
          style={{
            ...submitButton,
            opacity: saving ? 0.6 : 1
          }}
        >
          {saving ? "Creating..." : "Create Store Product"}
        </button>
      </form>
    </div>
  )
}

const page = {
  color: "white",
  padding: 30
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 30
}

const title = {
  fontSize: 32,
  margin: 0
}

const subtitle = {
  color: "#94a3b8",
  marginTop: 8
}

const formStyle = {
  display: "grid",
  gap: 20,
  maxWidth: 1000
}

const section = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 18,
  padding: 24,
  display: "grid",
  gap: 16
}

const lockedBox = {
  background: "#082f49",
  border: "1px solid #38bdf8",
  borderRadius: 18,
  padding: 24,
  color: "#e0f2fe"
}

const sectionTitle = {
  margin: 0,
  fontSize: 22
}

const label = {
  display: "grid",
  gap: 8,
  color: "#cbd5e1",
  fontWeight: "bold"
}

const input = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #334155",
  background: "#020617",
  color: "white"
}

const textarea = {
  ...input,
  minHeight: 120,
  resize: "vertical"
}

const fileInput = {
  color: "#cbd5e1"
}

const grid2 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16
}

const helper = {
  color: "#94a3b8",
  margin: 0
}

const submitButton = {
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  padding: "14px 20px",
  borderRadius: 14,
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: 16
}

const backButton = {
  background: "transparent",
  color: "#22d3ee",
  border: "1px solid #22d3ee",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: "bold",
  cursor: "pointer"
}

const variantHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16
}

const variantBox = {
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: 16,
  padding: 18,
  display: "grid",
  gap: 16
}

const variantTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
}

const variantTitle = {
  margin: 0,
  color: "#e2e8f0"
}

const pricingBox = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 14,
  padding: 16,
  display: "grid",
  gap: 14
}

const pricingTitle = {
  margin: 0,
  color: "#e2e8f0",
  fontSize: 18
}

const buttonRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10
}

const pricingButton = {
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  padding: "9px 12px",
  borderRadius: 10,
  fontWeight: "bold",
  cursor: "pointer"
}

const pricingStats = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: 10
}

const statBox = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 12,
  padding: 12,
  display: "grid",
  gap: 4
}

const statLabel = {
  color: "#94a3b8",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.08em"
}

const smallButton = {
  background: "#22c55e",
  color: "#020617",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: "bold",
  cursor: "pointer"
}

const dangerSmallButton = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: 10,
  fontWeight: "bold",
  cursor: "pointer"
}