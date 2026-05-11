import { useEffect, useState } from "react"
import api from "../../services/api"
import toast from "react-hot-toast"

const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"]

const API_IMAGE_BASE = "https://signavi-backend.onrender.com"

const normalizeSize = (s) => {
  if (!s) return null

  const value = String(s).trim()
  const key = value.toUpperCase()

  const map = {
    SMALL: "Small",
    MEDIUM: "Medium",
    LARGE: "Large",

    S: "S",
    M: "M",
    L: "L",
    XL: "XL",
    XXL: "XXL",

    "3XL": "3XL",
    "3X": "3XL",
    XXXL: "3XL",
    "XXX-LARGE": "3XL",
    "XXX LARGE": "3XL",

    "ONE SIZE": "One Size",

    "12 INCH": "12 inch",
    "18 INCH": "18 inch",
    "24 INCH": "24 inch",

    "11 OZ": "11 oz",
    "15 OZ": "15 oz",
    "20 OZ": "20 oz"
  }

  return map[key] || value
}

const defaultForm = {
  name: "",
  description: "",
  basePrice: "",
  stock: "",
  category: "",
  colors: "",
  sizes: [],
  colorImages: {}
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    let isMounted = true

    api.get("/products")
      .then((res) => {
        if (!isMounted) return

        const productData = Array.isArray(res.data)
          ? res.data
          : res.data?.data || []

        setProducts(productData)
      })
      .catch((err) => {
        if (!isMounted) return

        console.error("❌ LOAD PRODUCTS ERROR:", err.response?.data || err)
        toast.error("Failed to load products")
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

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
      .map(c => c.trim())
      .filter(Boolean)
  }

  const handleImageUpload = (e, color) => {
    const files = Array.from(e.target.files || [])

    if (!files.length) return

    setForm(prev => ({
      ...prev,
      colorImages: {
        ...prev.colorImages,
        [color]: [
          ...(prev.colorImages[color] || []),
          ...files
        ]
      }
    }))

    e.target.value = null
    toast.success(`${color} images added`)
  }

  const removePreviewImage = (color, index) => {
    setForm(prev => ({
      ...prev,
      colorImages: {
        ...prev.colorImages,
        [color]: prev.colorImages[color].filter((_, i) => i !== index)
      }
    }))
  }

  const buildVariants = () => {
    const variants = []

    const colors = getColorList()

    const sizes = form.sizes
      .map(s => normalizeSize(s))
      .filter(Boolean)

    colors.forEach(color => {
      sizes.forEach(size => {
        variants.push({
          color,
          size,
          stock: Number(form.stock) || 0,
          quantity: Number(form.stock) || 0,
          price: Number(form.basePrice) || 0,
          basePrice: Number(form.basePrice) || 0,
          listPrice: Number(form.basePrice) || 0
        })
      })
    })

    return variants
  }

  const createProduct = async () => {
    const colors = getColorList()

    const sizes = form.sizes
      .map(s => normalizeSize(s))
      .filter(Boolean)

    const variants = buildVariants()

    if (!form.name.trim()) return toast.error("Name required")
    if (!form.basePrice) return toast.error("Price required")
    if (!colors.length) return toast.error("Add colors")
    if (!sizes.length) return toast.error("Select sizes")

    const price = Number(form.basePrice) || 0
    const stock = Number(form.stock) || 0

    const formData = new FormData()

    formData.append("name", form.name.trim())
    formData.append("description", form.description)
    formData.append("category", form.category)

    // ✅ Send multiple price field names for backend compatibility
    formData.append("price", price)
    formData.append("basePrice", price)
    formData.append("listPrice", price)

    // ✅ Send multiple stock field names for backend compatibility
    formData.append("stock", stock)
    formData.append("quantity", stock)

    formData.append("sizes", JSON.stringify(sizes))
    formData.append("colors", JSON.stringify(colors.map(name => ({ name }))))
    formData.append("variants", JSON.stringify(variants))

    Object.entries(form.colorImages).forEach(([color, files]) => {
      files.forEach(file => {
        formData.append("images", file)
        formData.append("imageColors", color)
      })
    })

    try {
      setCreating(true)

      const res = await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      const createdProduct = res.data?.data || res.data

      if (createdProduct?._id) {
        setProducts(prev => [createdProduct, ...prev])
      } else {
        const refresh = await api.get("/products")

        const productData = Array.isArray(refresh.data)
          ? refresh.data
          : refresh.data?.data || []

        setProducts(productData)
      }

      toast.success("Product created")
      setForm(defaultForm)
    } catch (err) {
      console.error("❌ PRODUCT ERROR STATUS:", err.response?.status)
      console.error("❌ PRODUCT ERROR DATA:", err.response?.data)
      console.error("❌ PRODUCT ERROR FULL:", err)

      toast.error(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Create failed"
      )
    } finally {
      setCreating(false)
    }
  }

  const getProductImage = (product) => {
    const variantImage = product.variants?.[0]?.images?.[0]
    const productImage = product.images?.[0]
    const image = variantImage || productImage

    if (!image) return "/image_placeholder/placeholder.png"

    if (image.startsWith("http")) return image

    return `${API_IMAGE_BASE}${image}`
  }

  if (loading) {
    return (
      <div style={loadingPage}>
        <p>Loading products...</p>
      </div>
    )
  }

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h1 style={heading}>Admin Products</h1>
          <p style={subheading}>
            Add products, upload color-based images, and manage your product cards.
          </p>
        </div>
      </div>

      <div style={card}>
        <h2 style={sectionTitle}>Add New Product</h2>

        <input
          name="name"
          value={form.name}
          placeholder="Product Name"
          onChange={handleChange}
          style={input}
        />

        <input
          name="category"
          value={form.category}
          placeholder="Category"
          onChange={handleChange}
          style={input}
        />

        <input
          name="basePrice"
          value={form.basePrice}
          placeholder="Price"
          type="number"
          min="0"
          onChange={handleChange}
          style={input}
        />

        <input
          name="stock"
          value={form.stock}
          placeholder="Stock"
          type="number"
          min="0"
          onChange={handleChange}
          style={input}
        />

        <input
          name="colors"
          value={form.colors}
          placeholder="Colors: Black, White, Red"
          onChange={handleChange}
          style={input}
        />

        <textarea
          name="description"
          value={form.description}
          placeholder="Description"
          onChange={handleChange}
          style={textarea}
        />

        <h4 style={label}>Sizes</h4>

        <div style={sizeWrap}>
          {SIZE_OPTIONS.map(size => {
            const active = form.sizes.includes(size)

            return (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setForm(prev => ({
                    ...prev,
                    sizes: active
                      ? prev.sizes.filter(s => s !== size)
                      : [...prev.sizes, size]
                  }))
                }}
                style={{
                  ...sizeBtn,
                  background: active ? "#22c55e" : "#1e293b",
                  color: active ? "#020617" : "#fff"
                }}
              >
                {size}
              </button>
            )
          })}
        </div>

        {getColorList().length > 0 && (
          <div style={uploadSection}>
            <h4 style={label}>Color Images</h4>

            {getColorList().map(color => (
              <div key={color} style={colorUploadBox}>
                <p style={colorName}>{color}</p>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, color)}
                  style={fileInput}
                />

                <div style={previewWrap}>
                  {(form.colorImages[color] || []).map((file, i) => (
                    <div key={`${color}-${i}`} style={previewBox}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`${color} preview ${i + 1}`}
                        style={previewImage}
                      />

                      <button
                        type="button"
                        onClick={() => removePreviewImage(color, i)}
                        style={removeBtn}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={createProduct}
          disabled={creating}
          style={{
            ...btn,
            opacity: creating ? 0.7 : 1,
            cursor: creating ? "not-allowed" : "pointer"
          }}
        >
          {creating ? "Creating Product..." : "Add Product"}
        </button>
      </div>

      <div style={productsHeader}>
        <h2 style={sectionTitle}>Current Products</h2>
        <p style={countText}>{products.length} products loaded</p>
      </div>

      {products.length === 0 ? (
        <div style={emptyBox}>
          No products found yet.
        </div>
      ) : (
        <div style={grid}>
          {products.map(product => (
            <div key={product._id} style={productCard}>
              <div style={imageBox}>
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  style={productImage}
                />
              </div>

              <div style={productContent}>
                <h4 style={productName}>{product.name}</h4>

                <p style={productCategory}>
                  {product.category || "No category"}
                </p>

                <p style={productPrice}>
                  ${Number(product.price || product.basePrice || product.listPrice || 0).toFixed(2)}
                </p>

                <p style={productStock}>
                  Stock: {product.stock ?? product.quantity ?? 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ================= STYLES ================= */

const loadingPage = {
  padding: 40,
  background: "#020617",
  color: "white",
  minHeight: "100vh"
}

const page = {
  padding: 24,
  background: "#020617",
  color: "white",
  minHeight: "100vh"
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20
}

const heading = {
  margin: 0,
  fontSize: 32
}

const subheading = {
  marginTop: 6,
  color: "#94a3b8"
}

const card = {
  background: "#0f172a",
  padding: 20,
  borderRadius: 16,
  marginBottom: 28,
  border: "1px solid #1e293b",
  maxWidth: 900
}

const sectionTitle = {
  marginTop: 0,
  marginBottom: 14
}

const input = {
  display: "block",
  marginBottom: 12,
  padding: 12,
  width: "100%",
  background: "#fff",
  color: "#000",
  border: "none",
  borderRadius: 8,
  boxSizing: "border-box"
}

const textarea = {
  display: "block",
  marginBottom: 12,
  padding: 12,
  width: "100%",
  minHeight: 90,
  background: "#fff",
  color: "#000",
  border: "none",
  borderRadius: 8,
  resize: "vertical",
  boxSizing: "border-box"
}

const label = {
  marginBottom: 8
}

const sizeWrap = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 16
}

const sizeBtn = {
  padding: "8px 14px",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700
}

const uploadSection = {
  marginTop: 18,
  marginBottom: 18
}

const colorUploadBox = {
  background: "#020617",
  padding: 12,
  borderRadius: 12,
  marginBottom: 12,
  border: "1px solid #1e293b"
}

const colorName = {
  marginTop: 0,
  marginBottom: 8,
  fontWeight: 700
}

const fileInput = {
  display: "block",
  marginBottom: 10,
  padding: 10,
  width: "100%",
  background: "#fff",
  color: "#000",
  borderRadius: 8,
  boxSizing: "border-box"
}

const previewWrap = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap"
}

const previewBox = {
  position: "relative",
  width: 64,
  height: 64
}

const previewImage = {
  width: 64,
  height: 64,
  objectFit: "cover",
  borderRadius: 8,
  border: "1px solid #334155"
}

const removeBtn = {
  position: "absolute",
  top: -6,
  right: -6,
  width: 22,
  height: 22,
  borderRadius: "50%",
  border: "none",
  background: "#ef4444",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700
}

const btn = {
  padding: 14,
  background: "#22c55e",
  color: "#020617",
  border: "none",
  width: "100%",
  borderRadius: 10,
  fontWeight: 800,
  fontSize: 16
}

const productsHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 14
}

const countText = {
  color: "#94a3b8",
  margin: 0
}

const emptyBox = {
  background: "#0f172a",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #1e293b",
  color: "#94a3b8"
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: 20,
  alignItems: "stretch"
}

const productCard = {
  background: "#0f172a",
  borderRadius: 16,
  overflow: "hidden",
  border: "1px solid #1e293b",
  boxShadow: "0 12px 30px rgba(0,0,0,0.25)"
}

const imageBox = {
  width: "100%",
  height: 180,
  background: "#020617",
  overflow: "hidden"
}

const productImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block"
}

const productContent = {
  padding: 14
}

const productName = {
  margin: "0 0 6px",
  fontSize: 17
}

const productCategory = {
  margin: "0 0 8px",
  color: "#94a3b8",
  fontSize: 14
}

const productPrice = {
  margin: "0 0 6px",
  color: "#22c55e",
  fontWeight: 800
}

const productStock = {
  margin: 0,
  color: "#cbd5e1",
  fontSize: 14
}