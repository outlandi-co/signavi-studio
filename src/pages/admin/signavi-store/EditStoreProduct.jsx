import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../../services/api"
import MaterialUsageEditor, { useMaterialsCatalog, serializeMaterialUsage } from "./MaterialUsageEditor"

const blankVariant = {
  color: "",
  size: "",
  stock: "",
  price: "",
  basePrice: "",
  listPrice: "",
  images: [],
  newImages: [],
  materialUsage: []
}

/* Shipping measurements for ONE item, before packing. */
const blankShipping = {
  weightOz: "",
  lengthIn: "",
  widthIn: "",
  heightIn: "",
  packagingType: "unassigned",
  shipSeparately: false
}

const shippingMeasurements = [
  ["weightOz", "Item Weight (oz)"],
  ["lengthIn", "Item Length (in)"],
  ["widthIn", "Item Width (in)"],
  ["heightIn", "Item Height (in)"]
]

export default function EditStoreProduct() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    productType: "physical",
    storefrontVisible: true,
    storefront: "signavi_store",
    active: true
  })

  const [shipping, setShipping] = useState({ ...blankShipping })
  const [shippingEdited, setShippingEdited] = useState(false)
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [materialUsage, setMaterialUsage] = useState([])
  const { materials, loading: materialsLoading, error: materialsError } = useMaterialsCatalog()

  useEffect(() => {
    let ignore = false

    const loadProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`)
        const product = res.data?.data || res.data

        if (ignore) return

        setForm({
          name: product.name || "",
          description: product.description || "",
          category: product.category || "",
          productType: product.productType || "physical",
          storefrontVisible: product.storefrontVisible ?? true,
          storefront: product.storefront || "signavi_store",
          active: product.active ?? true
        })

        setMaterialUsage(Array.isArray(product.materialUsage) ? product.materialUsage : [])
        const savedShipping = product.shipping || {}
        setShipping({
          weightOz: savedShipping.weightOz == null ? "" : String(savedShipping.weightOz),
          lengthIn: savedShipping.lengthIn == null ? "" : String(savedShipping.lengthIn),
          widthIn: savedShipping.widthIn == null ? "" : String(savedShipping.widthIn),
          heightIn: savedShipping.heightIn == null ? "" : String(savedShipping.heightIn),
          packagingType: savedShipping.packagingType || "unassigned",
          shipSeparately: Boolean(savedShipping.shipSeparately)
        })
        setShippingEdited(false)

        const loadedVariants = Array.isArray(product.variants) && product.variants.length > 0
          ? product.variants.map(variant => ({
              color: variant.color || "",
              size: variant.size || "",
              stock: String(variant.stock ?? variant.quantity ?? 0),
              price: String(variant.price ?? product.price ?? 0),
              basePrice: String(variant.basePrice ?? product.basePrice ?? variant.price ?? 0),
              listPrice: String(variant.listPrice ?? product.listPrice ?? variant.price ?? 0),
              images: Array.isArray(variant.images) ? variant.images : [],
              materialUsage: Array.isArray(variant.materialUsage) ? variant.materialUsage : [],
              newImages: []
            }))
          : [
              {
                ...blankVariant,
                color: product.colors?.[0]?.name || product.colors?.[0] || "Default",
                size: product.sizes?.[0] || "One Size",
                stock: String(product.stock ?? product.quantity ?? 0),
                price: String(product.price ?? product.listPrice ?? 0),
                basePrice: String(product.basePrice ?? product.price ?? 0),
                listPrice: String(product.listPrice ?? product.price ?? 0),
                images: product.images || [],
                materialUsage: [],
                newImages: []
              }
            ]

        setVariants(loadedVariants)

      } catch (err) {
        console.error("❌ LOAD STORE PRODUCT ERROR:", err)
        alert("Failed to load product")
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      ignore = true
    }
  }, [id])

  const updateForm = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateShipping = (field, value) => {
    setShipping((prev) => ({ ...prev, [field]: value }))
    setShippingEdited(true)
  }

  const updateVariant = (index, field, value) => {
    setVariants(prev =>
      prev.map((variant, i) =>
        i === index
          ? { ...variant, [field]: value }
          : variant
      )
    )
  }

  const updateVariantImages = (index, files) => {
    setVariants(prev =>
      prev.map((variant, i) =>
        i === index
          ? { ...variant, newImages: Array.from(files || []) }
          : variant
      )
    )
  }

  const addVariant = () => {
    setVariants(prev => [
      ...prev,
      { ...blankVariant }
    ])
  }

  const removeVariant = (index) => {
    setVariants(prev =>
      prev.filter((_, i) => i !== index)
    )
  }

  const removeExistingImage = (variantIndex, imageIndex) => {
    setVariants(prev =>
      prev.map((variant, i) => {
        if (i !== variantIndex) return variant

        return {
          ...variant,
          images: variant.images.filter((_, imgIndex) => imgIndex !== imageIndex)
        }
      })
    )
  }

  const saveProduct = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)

      const validVariants = variants.filter(variant =>
        variant.color.trim() &&
        variant.size.trim()
      )

      if (validVariants.length === 0) {
        alert("Add at least one valid variant.")
        return
      }

      // Leave legacy products untouched unless the shipping form is edited.
      // Incomplete measurements must never be converted to zero.
      let shippingPayload = null
      if (form.productType === "physical" && shippingEdited) {
        const validMeasurements = shippingMeasurements.every(([field]) => {
          const value = String(shipping[field]).trim()
          return value !== "" && Number.isFinite(Number(value)) && Number(value) > 0
        })

        if (!validMeasurements || shipping.packagingType === "unassigned") {
          alert("Enter all four positive shipping measurements and a packaging type.")
          return
        }

        shippingPayload = {
          weightOz: Number(shipping.weightOz),
          lengthIn: Number(shipping.lengthIn),
          widthIn: Number(shipping.widthIn),
          heightIn: Number(shipping.heightIn),
          packagingType: shipping.packagingType,
          shipSeparately: Boolean(shipping.shipSeparately)
        }
      }

      const firstVariant = validVariants[0]

      const uniqueSizes = [
        ...new Set(validVariants.map(variant => variant.size.trim()))
      ]

      const uniqueColors = [
        ...new Map(
          validVariants.map(variant => [
            variant.color.trim(),
            { name: variant.color.trim() }
          ])
        ).values()
      ]

      const totalStock = validVariants.reduce(
  (total, variant) => total + Math.max(0, Number(variant.stock) || 0),
  0
)

      const formData = new FormData()

      formData.append("name", form.name)
      formData.append("description", form.description)
      formData.append("category", form.category)
      formData.append("productType", form.productType)

      formData.append("price", firstVariant.price || 0)
      formData.append("basePrice", firstVariant.basePrice || firstVariant.price || 0)
      formData.append("listPrice", firstVariant.listPrice || firstVariant.price || 0)

      formData.append("stock", totalStock)
      formData.append("quantity", totalStock)

      formData.append("storefrontVisible", String(form.storefrontVisible))
      // This editor belongs to Signavi Store. Keep both channel fields in sync.
      formData.append("storefront", "signavi_store")
      formData.append("salesChannel", "signavi_store")
      formData.append("active", String(form.active))

      formData.append("sizes", JSON.stringify(uniqueSizes))
      formData.append("colors", JSON.stringify(uniqueColors))
      formData.append("materialUsage", JSON.stringify(serializeMaterialUsage(materialUsage)))

      if (shippingPayload) {
        // Multipart form field: the backend route must JSON.parse this.
        formData.append("shipping", JSON.stringify(shippingPayload))
      }

      const cleanVariants = validVariants.map(variant => ({
        color: variant.color.trim(),
        size: variant.size.trim(),
        stock: Number(variant.stock || 0),
        quantity: Number(variant.stock || 0),
        price: Number(variant.price || firstVariant.price || 0),
        basePrice: Number(variant.basePrice || variant.price || firstVariant.price || 0),
        listPrice: Number(variant.listPrice || variant.price || firstVariant.price || 0),
        images: Array.isArray(variant.images) ? variant.images : [],
        materialUsage: serializeMaterialUsage(variant.materialUsage || [])
      }))

      formData.append("variants", JSON.stringify(cleanVariants))

      validVariants.forEach(variant => {
        ;(variant.newImages || []).forEach(file => {
          formData.append("images", file)

          // Backend currently maps uploaded files by color.
          formData.append("imageColors", variant.color.trim())
        })
      })

      await api.patch(
        `/products/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      )

      navigate("/admin/signavi-store/products")

    } catch (err) {
      console.error("❌ UPDATE STORE PRODUCT ERROR:", err)

      alert(
        err?.response?.data?.message ||
        "Failed to update store product"
      )

    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={page}>
        <p style={subtitle}>Loading product...</p>
      </div>
    )
  }

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h1 style={title}>✏️ Edit Store Product</h1>
          <p style={subtitle}>
            Update signavi.store product variants, images, pricing, and stock.
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

      <form onSubmit={saveProduct} style={formStyle}>
        <section style={section}>
          <h2 style={sectionTitle}>Product Info</h2>

          <label style={label}>
            Product Name
            <input
              required
              value={form.name}
              onChange={event => updateForm("name", event.target.value)}
              style={input}
            />
          </label>

          <label style={label}>
            Description
            <textarea
              value={form.description}
              onChange={event => updateForm("description", event.target.value)}
              style={textarea}
            />
          </label>

          <label style={label}>
            Category
            <input
              required
              value={form.category}
              onChange={event => updateForm("category", event.target.value)}
              style={input}
            />
          </label>

          <label style={label}>
            Product Type
            <select
              value={form.productType}
              onChange={event => updateForm("productType", event.target.value)}
              style={input}
            >
              <option value="physical">Physical</option>
              <option value="digital">Digital</option>
              <option value="service">Service</option>
            </select>
          </label>

          <div style={toggleRow}>
            <label style={checkboxLabel}>
              <input
                type="checkbox"
                checked={form.storefrontVisible}
                onChange={event => updateForm("storefrontVisible", event.target.checked)}
              />
              Show on signavi.store
            </label>

            <label style={checkboxLabel}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={event => updateForm("active", event.target.checked)}
              />
              Active product
            </label>
          </div>
        </section>

        {/* SHIPPING INFORMATION */}
        {form.productType === "physical" && (
          <section style={section}>
            <h2 style={sectionTitle}>Shipping Information</h2>
            <p style={helper}>
              Enter measurements for ONE item before packaging, not the entire order.
              Missing measurements are left unset on existing products until you edit this section.
              Your packaging calculator will handle bulk quantities later.
            </p>

            <div style={grid2}>
              {shippingMeasurements.map(([key, name]) => (
                <label key={key} style={label}>
                  {name}
                  <input
                    style={input}
                    type="number"
                    min="0.01"
                    step="any"
                    value={shipping[key]}
                    onChange={(event) => updateShipping(key, event.target.value)}
                    placeholder="Not set"
                  />
                </label>
              ))}
              <label style={label}>
                Packaging Category
                <select
                  style={input}
                  value={shipping.packagingType}
                  onChange={(event) => updateShipping("packagingType", event.target.value)}
                >
                  <option value="unassigned">Not assigned</option>
                  <option value="mailer">Mailer</option>
                  <option value="box">Box</option>
                  <option value="fragile">Fragile / Protective Packaging</option>
                  <option value="oversized">Oversized</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
              <label style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={shipping.shipSeparately}
                  onChange={(event) => updateShipping("shipSeparately", event.target.checked)}
                />
                Ship this item separately
              </label>
            </div>
            <p style={helper}>
              The same measurements apply to all color and size variants for now.
              Digital products and services do not need carrier shipping.
            </p>
          </section>
        )}

        <MaterialUsageEditor
  title="Shared Materials (all variants)"
  value={materialUsage}
  onChange={setMaterialUsage}
  materials={materials}
  loading={materialsLoading}
  error={materialsError}
/>

        <section style={section}>
          <div style={variantHeader}>
            <div>
              <h2 style={sectionTitle}>Variants</h2>
              <p style={helper}>
                Edit quantity, price, color, size, and images.
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

          {variants.map((variant, index) => (
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
                    onChange={event =>
                      updateVariant(index, "color", event.target.value)
                    }
                    style={input}
                  />
                </label>

                <label style={label}>
                  Size
                  <input
                    required
                    value={variant.size}
                    onChange={event =>
                      updateVariant(index, "size", event.target.value)
                    }
                    style={input}
                  />
                </label>

                <label style={label}>
                  Quantity In Stock
                  <input
                    required
                    type="number"
                    min="0"
                    value={variant.stock}
                    onChange={event =>
                      updateVariant(index, "stock", event.target.value)
                    }
                    style={input}
                  />
                </label>

                <label style={label}>
                  Price
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.price}
                    onChange={event =>
                      updateVariant(index, "price", event.target.value)
                    }
                    style={input}
                  />
                </label>

                <label style={label}>
                  Base Price
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.basePrice}
                    onChange={event =>
                      updateVariant(index, "basePrice", event.target.value)
                    }
                    style={input}
                  />
                </label>

                <label style={label}>
                  List Price
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.listPrice}
                    onChange={event =>
                      updateVariant(index, "listPrice", event.target.value)
                    }
                    style={input}
                  />
                </label>
              </div>

              <MaterialUsageEditor
                title="Materials for this variant"
                value={variant.materialUsage || []}
                onChange={(next) => updateVariant(index, "materialUsage", next)}
                materials={materials}
                loading={materialsLoading}
                error={materialsError}
              />
              {variant.images.length > 0 && (
                <div style={imageGrid}>
                  {variant.images.map((image, imageIndex) => (
                    <div key={`${image}-${imageIndex}`} style={imageBox}>
                      <img
                        src={image}
                        alt={`${variant.color} ${variant.size}`}
                        style={imagePreview}
                      />

                      <button
                        type="button"
                        onClick={() => removeExistingImage(index, imageIndex)}
                        style={removeImageButton}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label style={label}>
                Add New Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={event =>
                    updateVariantImages(index, event.target.files)
                  }
                  style={fileInput}
                />
              </label>

              {variant.newImages.length > 0 && (
                <p style={helper}>
                  {variant.newImages.length} new image(s) selected for {variant.color || "this variant"}
                </p>
              )}
            </div>
          ))}
        </section>

        <section style={lockedBox}>
          <h2 style={sectionTitle}>Storefront Defaults</h2>

          <ul>
            <li>storefront: signavi_store</li>
            <li>salesChannel: signavi_store</li>
            <li>Editable visibility: {String(form.storefrontVisible)}</li>
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
          {saving ? "Saving..." : "Save Store Product"}
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
  maxWidth: 1100
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

const toggleRow = {
  display: "flex",
  gap: 20,
  flexWrap: "wrap"
}

const checkboxLabel = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "#cbd5e1",
  fontWeight: "bold"
}

const imageGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
  gap: 12
}

const imageBox = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 12,
  overflow: "hidden"
}

const imagePreview = {
  width: "100%",
  height: 100,
  objectFit: "cover",
  display: "block"
}

const removeImageButton = {
  width: "100%",
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: 8,
  cursor: "pointer",
  fontWeight: "bold"
}