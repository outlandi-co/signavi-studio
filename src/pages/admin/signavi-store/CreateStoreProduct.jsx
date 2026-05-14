import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../../services/api"

export default function CreateStoreProduct() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    basePrice: "",
    listPrice: "",
    stock: "",
    productType: "physical",
    sizes: "",
    colors: ""
  })

  const [images, setImages] = useState([])
  const [saving, setSaving] = useState(false)

  const updateForm = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImages = (event) => {
    setImages(Array.from(event.target.files || []))
  }

  const createProduct = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)

      const formData = new FormData()

      formData.append("name", form.name)
      formData.append("description", form.description)
      formData.append("category", form.category)

      formData.append("productType", form.productType)

      formData.append("price", form.price)
      formData.append("basePrice", form.basePrice || form.price)
      formData.append("listPrice", form.listPrice || form.price)

      formData.append("stock", form.stock)
      formData.append("quantity", form.stock)

      formData.append("storefrontVisible", "true")
      formData.append("storefront", "signavi")
      formData.append("salesChannel", "signavi_store")
      formData.append("active", "true")

      const sizes = form.sizes
        .split(",")
        .map(size => size.trim())
        .filter(Boolean)

      const colors = form.colors
        .split(",")
        .map(color => ({
          name: color.trim()
        }))
        .filter(color => color.name)

      formData.append(
        "sizes",
        JSON.stringify(sizes.length ? sizes : ["One Size"])
      )

      formData.append(
        "colors",
        JSON.stringify(colors.length ? colors : [{ name: "Default" }])
      )

      const variants = []

      const finalSizes = sizes.length ? sizes : ["One Size"]
      const finalColors = colors.length ? colors : [{ name: "Default" }]

      finalColors.forEach(color => {
        finalSizes.forEach(size => {
          variants.push({
            color: color.name,
            size,
            stock: Number(form.stock || 0),
            quantity: Number(form.stock || 0),
            price: Number(form.price || 0),
            basePrice: Number(form.basePrice || form.price || 0),
            listPrice: Number(form.listPrice || form.price || 0)
          })
        })
      })

      formData.append(
        "variants",
        JSON.stringify(variants)
      )

      images.forEach(file => {
        formData.append("images", file)
        formData.append(
          "imageColors",
          colors[0]?.name || "Default"
        )
      })

      await api.post(
        "/products",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      )

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
            Create products specifically for signavi.store
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/signavi-store/products")}
          style={backButton}
        >
          ← Back to Store Products
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
              onChange={event => updateForm("name", event.target.value)}
              style={input}
              placeholder="Example: Signavi Hoodie"
            />
          </label>

          <label style={label}>
            Description
            <textarea
              value={form.description}
              onChange={event => updateForm("description", event.target.value)}
              style={textarea}
              placeholder="Describe the product..."
            />
          </label>

          <label style={label}>
            Category
            <input
              required
              value={form.category}
              onChange={event => updateForm("category", event.target.value)}
              style={input}
              placeholder="Apparel, Accessories, Digital, etc."
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
        </section>

        <section style={section}>
          <h2 style={sectionTitle}>Pricing + Stock</h2>

          <div style={grid2}>
            <label style={label}>
              Price
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={event => updateForm("price", event.target.value)}
                style={input}
              />
            </label>

            <label style={label}>
              Base Price
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.basePrice}
                onChange={event => updateForm("basePrice", event.target.value)}
                style={input}
                placeholder="Optional"
              />
            </label>

            <label style={label}>
              List Price
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.listPrice}
                onChange={event => updateForm("listPrice", event.target.value)}
                style={input}
                placeholder="Optional"
              />
            </label>

            <label style={label}>
              Stock
              <input
                required
                type="number"
                min="0"
                value={form.stock}
                onChange={event => updateForm("stock", event.target.value)}
                style={input}
              />
            </label>
          </div>
        </section>

        <section style={section}>
          <h2 style={sectionTitle}>Variants</h2>

          <label style={label}>
            Sizes
            <input
              value={form.sizes}
              onChange={event => updateForm("sizes", event.target.value)}
              style={input}
              placeholder="S, M, L, XL"
            />
          </label>

          <label style={label}>
            Colors
            <input
              value={form.colors}
              onChange={event => updateForm("colors", event.target.value)}
              style={input}
              placeholder="Black, White, Red"
            />
          </label>

          <p style={helper}>
            Separate sizes and colors with commas.
          </p>
        </section>

        <section style={section}>
          <h2 style={sectionTitle}>Images</h2>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImages}
            style={fileInput}
          />

          {images.length > 0 && (
            <p style={helper}>
              {images.length} image(s) selected
            </p>
          )}
        </section>

        <section style={lockedBox}>
          <h2 style={sectionTitle}>Storefront Defaults</h2>

          <p>
            This product will automatically be assigned to:
          </p>

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
  maxWidth: 900
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