import { useEffect, useState } from "react"
import api from "../services/api"
import toast from "react-hot-toast"

const defaultForm = {
  name: "",
  description: "",
  basePrice: "",
  stock: "",
  image: "",
  category: "",
  colors: "",
  sizes: ""
}

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(defaultForm)

  /* ================= LOAD PRODUCTS ================= */

  const loadProducts = () => {
    setLoading(true)

    api.get("/products")
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.data || []

        setProducts(list)
      })
      .catch((error) => {
        console.error("Failed to load products:", error)
        toast.error("Failed to load products")
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {

  const init = async () => {

    await loadProducts()
  }

  init()

}, [])

  /* ================= FORM ================= */

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getColorList = () => {
    return form.colors
      .split(",")
      .map(color => color.trim())
      .filter(Boolean)
  }

  const getSizeList = () => {
    return form.sizes
      .split(",")
      .map(size => size.trim().toUpperCase())
      .filter(Boolean)
  }

  const buildVariants = () => {
    const colorList = getColorList()
    const sizeList = getSizeList()

    const variants = []

    colorList.forEach(color => {
      sizeList.forEach(size => {
        variants.push({
          color,
          size,
          stock: Number(form.stock) || 0,
          price: Number(form.basePrice) || 0
        })
      })
    })

    return variants
  }

  const createProduct = async () => {
    try {
      if (!form.name.trim()) {
        toast.error("Product name is required")
        return
      }

      if (!form.basePrice || Number(form.basePrice) <= 0) {
        toast.error("Base price is required")
        return
      }

      const colorList = getColorList()
      const sizeList = getSizeList()

      if (!colorList.length) {
        toast.error("Add at least one color")
        return
      }

      if (!sizeList.length) {
        toast.error("Add at least one size")
        return
      }

      setSaving(true)

      const variants = buildVariants()

      const colors = colorList.map(color => ({
        name: color
      }))

      await api.post("/products", {
        name: form.name.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        category: form.category.trim() || "general",
        price: Number(form.basePrice),
        stock: Number(form.stock) || 0,
        sizes: sizeList,
        colors,
        variants,
        active: true
      })

      toast.success("Product created")

      setForm(defaultForm)

      loadProducts()

    } catch (err) {
      console.error("Create product error:", err)
      toast.error("Failed to create product")
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id) => {
    try {
      const confirmed = window.confirm(
        "Delete this product?"
      )

      if (!confirmed) return

      await api.delete(`/products/${id}`)

      toast.success("Product deleted")

      loadProducts()

    } catch (err) {
      console.error("Delete product error:", err)
      toast.error("Failed to delete product")
    }
  }

  const resetForm = () => {
    setForm(defaultForm)
  }

  const previewPrice = Number(form.basePrice || 0)
  const previewVariants = buildVariants()

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <div style={loadingWrap}>
        <h2>Loading products...</h2>
      </div>
    )
  }

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <p style={eyebrow}>
            Store Admin
          </p>

          <h1 style={title}>
            Product Manager
          </h1>

          <p style={subtitle}>
            Add products, generate variants, and manage the store cards.
          </p>
        </div>

        <button
          onClick={loadProducts}
          style={refreshButton}
        >
          Refresh
        </button>
      </div>

      <div style={topGrid}>
        {/* ================= FORM ================= */}

        <div style={formCard}>
          <h2 style={sectionTitle}>
            Add Product
          </h2>

          <div style={fieldGrid}>
            <div style={field}>
              <label style={label}>
                Product Name
              </label>

              <input
                name="name"
                placeholder="Classic Logo Hoodie"
                value={form.name}
                onChange={handleChange}
                style={input}
              />
            </div>

            <div style={field}>
              <label style={label}>
                Category
              </label>

              <input
                name="category"
                placeholder="apparel"
                value={form.category}
                onChange={handleChange}
                style={input}
              />
            </div>

            <div style={field}>
              <label style={label}>
                Base Price
              </label>

              <input
                name="basePrice"
                placeholder="45"
                value={form.basePrice}
                onChange={handleChange}
                style={input}
              />
            </div>

            <div style={field}>
              <label style={label}>
                Stock Per Variant
              </label>

              <input
                name="stock"
                placeholder="12"
                value={form.stock}
                onChange={handleChange}
                style={input}
              />
            </div>
          </div>

          <div style={field}>
            <label style={label}>
              Image URL
            </label>

            <input
              name="image"
              placeholder="https://..."
              value={form.image}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div style={field}>
            <label style={label}>
              Description
            </label>

            <textarea
              name="description"
              placeholder="Describe the product..."
              value={form.description}
              onChange={handleChange}
              style={textarea}
            />
          </div>

          <div style={fieldGrid}>
            <div style={field}>
              <label style={label}>
                Colors
              </label>

              <input
                name="colors"
                placeholder="Black, White, Red"
                value={form.colors}
                onChange={handleChange}
                style={input}
              />
            </div>

            <div style={field}>
              <label style={label}>
                Sizes
              </label>

              <input
                name="sizes"
                placeholder="S, M, L, XL, 2XL"
                value={form.sizes}
                onChange={handleChange}
                style={input}
              />
            </div>
          </div>

          <div style={variantInfo}>
            <strong>
              Variants to create:
            </strong>

            <span>
              {previewVariants.length}
            </span>
          </div>

          <div style={actionRow}>
            <button
              onClick={createProduct}
              disabled={saving}
              style={{
                ...createButton,
                opacity: saving ? 0.65 : 1
              }}
            >
              {saving ? "Saving..." : "Add Product"}
            </button>

            <button
              onClick={resetForm}
              type="button"
              style={secondaryButton}
            >
              Clear
            </button>
          </div>
        </div>

        {/* ================= LIVE PREVIEW ================= */}

        <div style={previewCard}>
          <h2 style={sectionTitle}>
            Store Card Preview
          </h2>

          <div style={mockCard}>
            {form.image ? (
              <img
                src={form.image}
                alt="Product preview"
                style={mockImage}
                onError={(e) => {
                  e.target.style.display = "none"
                }}
              />
            ) : (
              <div style={mockImageEmpty}>
                Image Preview
              </div>
            )}

            <div style={mockContent}>
              <h3 style={mockName}>
                {form.name || "Product Name"}
              </h3>

              <p style={mockPrice}>
                {previewPrice > 0
                  ? "$" + previewPrice.toFixed(2)
                  : "$0.00"}
              </p>

              <p style={mockDescription}>
                {form.description || "Product description will appear here."}
              </p>

              <div style={pillRow}>
                {getColorList().slice(0, 5).map(color => (
                  <span
                    key={color}
                    style={pill}
                  >
                    {color}
                  </span>
                ))}
              </div>

              <div style={pillRow}>
                {getSizeList().slice(0, 8).map(size => (
                  <span
                    key={size}
                    style={pill}
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= EXISTING PRODUCTS ================= */}

      <div style={productSection}>
        <h2 style={sectionTitle}>
          Existing Products
        </h2>

        {products.length === 0 && (
          <p style={emptyText}>
            No products added yet.
          </p>
        )}

        <div style={grid}>
          {products.map(product => (
            <div
              key={product._id}
              style={productCard}
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  style={productImage}
                  onError={(e) => {
                    e.target.style.display = "none"
                  }}
                />
              ) : (
                <div style={productImageEmpty}>
                  No Image
                </div>
              )}

              <div style={productContent}>
                <div>
                  <h3 style={productName}>
                    {product.name}
                  </h3>

                  <p style={productCategory}>
                    {product.category || "general"}
                  </p>
                </div>

                <p style={productPrice}>
                  {"$" + Number(product.price || 0).toFixed(2)}
                </p>

                <div style={metaGrid}>
                  <div style={metaBox}>
                    <span style={metaLabel}>
                      Stock
                    </span>

                    <strong>
                      {product.stock || 0}
                    </strong>
                  </div>

                  <div style={metaBox}>
                    <span style={metaLabel}>
                      Variants
                    </span>

                    <strong>
                      {product.variants?.length || 0}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => deleteProduct(product._id)}
                  style={deleteButton}
                >
                  Delete Product
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminProducts

/* ================= STYLES ================= */

const page = {
  minHeight: "100vh",
  padding: 30,
  background: "#020617",
  color: "white"
}

const loadingWrap = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#020617",
  color: "white"
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 20,
  marginBottom: 30
}

const eyebrow = {
  margin: 0,
  color: "#22c55e",
  fontWeight: "bold",
  letterSpacing: 1,
  textTransform: "uppercase",
  fontSize: 12
}

const title = {
  margin: "6px 0",
  fontSize: 40,
  lineHeight: 1.1
}

const subtitle = {
  margin: 0,
  color: "#94a3b8",
  maxWidth: 620
}

const refreshButton = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "white",
  cursor: "pointer"
}

const topGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(320px, 1.3fr) minmax(280px, 0.7fr)",
  gap: 24,
  alignItems: "start",
  marginBottom: 40
}

const formCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 22,
  padding: 24,
  boxShadow: "0 8px 30px rgba(0,0,0,0.35)"
}

const previewCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 22,
  padding: 24,
  boxShadow: "0 8px 30px rgba(0,0,0,0.35)"
}

const sectionTitle = {
  margin: "0 0 18px",
  fontSize: 22
}

const fieldGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 14
}

const field = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  marginBottom: 14
}

const label = {
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: "bold"
}

const input = {
  width: "100%",
  boxSizing: "border-box",
  padding: 14,
  borderRadius: 12,
  border: "1px solid #334155",
  background: "#111827",
  color: "white",
  fontSize: 14,
  outline: "none"
}

const textarea = {
  width: "100%",
  minHeight: 110,
  boxSizing: "border-box",
  padding: 14,
  borderRadius: 12,
  border: "1px solid #334155",
  background: "#111827",
  color: "white",
  fontSize: 14,
  outline: "none",
  resize: "vertical"
}

const variantInfo = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 14,
  borderRadius: 12,
  background: "#020617",
  border: "1px solid #1e293b",
  marginTop: 6,
  marginBottom: 16
}

const actionRow = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap"
}

const createButton = {
  flex: 1,
  minWidth: 180,
  padding: "14px 20px",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(to right, #22c55e, #16a34a)",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer"
}

const secondaryButton = {
  padding: "14px 20px",
  borderRadius: 14,
  border: "1px solid #334155",
  background: "#111827",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer"
}

const mockCard = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 18,
  overflow: "hidden"
}

const mockImage = {
  width: "100%",
  height: 250,
  objectFit: "cover",
  background: "#111827"
}

const mockImageEmpty = {
  height: 250,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#111827",
  color: "#64748b"
}

const mockContent = {
  padding: 18
}

const mockName = {
  margin: "0 0 8px",
  fontSize: 22
}

const mockPrice = {
  margin: "0 0 12px",
  color: "#22c55e",
  fontWeight: "bold",
  fontSize: 20
}

const mockDescription = {
  margin: "0 0 14px",
  color: "#94a3b8",
  fontSize: 14
}

const pillRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 8
}

const pill = {
  padding: "6px 9px",
  borderRadius: 999,
  background: "#111827",
  border: "1px solid #334155",
  color: "#e5e7eb",
  fontSize: 12
}

const productSection = {
  marginTop: 10
}

const emptyText = {
  color: "#94a3b8"
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 24
}

const productCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 20,
  overflow: "hidden",
  boxShadow: "0 6px 24px rgba(0,0,0,0.3)"
}

const productImage = {
  width: "100%",
  height: 230,
  objectFit: "cover",
  background: "#111827"
}

const productImageEmpty = {
  height: 230,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#111827",
  color: "#64748b"
}

const productContent = {
  padding: 18
}

const productName = {
  margin: "0 0 4px",
  fontSize: 20
}

const productCategory = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 13
}

const productPrice = {
  color: "#22c55e",
  fontSize: 20,
  fontWeight: "bold",
  margin: "14px 0"
}

const metaGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 10
}

const metaBox = {
  padding: 10,
  borderRadius: 12,
  background: "#020617",
  border: "1px solid #1e293b"
}

const metaLabel = {
  display: "block",
  color: "#94a3b8",
  fontSize: 11,
  marginBottom: 4
}

const deleteButton = {
  marginTop: 16,
  width: "100%",
  padding: "11px 14px",
  borderRadius: 12,
  border: "none",
  background: "#dc2626",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer"
}