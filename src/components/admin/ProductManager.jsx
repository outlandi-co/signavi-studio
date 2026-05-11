import { useEffect, useState } from "react"
import api from "../../services/api"
import toast from "react-hot-toast"

const API_IMAGE_BASE =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://signavi-backend.onrender.com"

export default function ProductManager() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let alive = true

    api.get("/products")
      .then(res => {
        if (!alive) return

        const productData = Array.isArray(res.data)
          ? res.data
          : res.data?.data || []

        setProducts(productData)
      })
      .catch(err => {
        if (!alive) return

        console.error("❌ LOAD PRODUCTS ERROR:", err.response?.data || err)
        toast.error("Failed to load products")
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)

      const res = await api.get("/products")

      const productData = Array.isArray(res.data)
        ? res.data
        : res.data?.data || []

      setProducts(productData)
    } catch (err) {
      console.error("❌ LOAD PRODUCTS ERROR:", err.response?.data || err)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const resolveImage = (image) => {
    if (!image) return "/image_placeholder/placeholder.png"
    if (typeof image !== "string") return "/image_placeholder/placeholder.png"

    if (image.startsWith("http")) return image
    if (image.startsWith("data:image")) return image
    if (image.startsWith("/uploads")) return `${API_IMAGE_BASE}${image}`
    if (image.startsWith("uploads")) return `${API_IMAGE_BASE}/${image}`

    return image
  }

  const getProductImage = (product) => {
    const variantImage = product.variants
      ?.find(variant => variant.images?.length)
      ?.images?.[0]

    const image =
      product.digitalProduct?.previewImage ||
      product.image ||
      product.images?.[0] ||
      variantImage

    return resolveImage(image)
  }

  const getProductPrice = (product) => {
    return Number(
      product.price ||
      product.basePrice ||
      product.listPrice ||
      product.variants?.[0]?.price ||
      0
    )
  }

  const formatType = (type) => {
    if (!type) return "Physical"

    return String(type)
      .replace("-", " ")
      .replace(/\b\w/g, letter => letter.toUpperCase())
  }

  const deleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This cannot be undone.`
    )

    if (!confirmed) return

    try {
      setDeletingId(product._id)

      await api.delete(`/products/${product._id}`)

      toast.success("Product deleted")

      setProducts(prev =>
        prev.filter(item => item._id !== product._id)
      )
    } catch (err) {
      console.error("❌ DELETE PRODUCT ERROR:", err.response?.data || err)
      toast.error(err.response?.data?.message || "Delete failed")
    } finally {
      setDeletingId(null)
    }
  }

  const editProduct = (product) => {
    toast("Edit is next — delete is active now")

    console.log("EDIT PRODUCT:", product)
  }

  return (
    <div style={section}>
      <div style={header}>
        <div>
          <h2 style={title}>Current Products</h2>
          <p style={subtitle}>
            Manage products already saved in your store.
          </p>
        </div>

        <button
          type="button"
          onClick={loadProducts}
          style={refreshBtn}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p style={helperText}>Loading products...</p>
      ) : products.length === 0 ? (
        <p style={helperText}>No products found.</p>
      ) : (
        <div style={grid}>
          {products.map(product => (
            <div key={product._id} style={card}>
              <div style={imageBox}>
                <img
                  src={getProductImage(product)}
                  alt={product.name || "Product"}
                  style={image}
                  onError={(e) => {
                    e.currentTarget.src = "/image_placeholder/placeholder.png"
                  }}
                />
              </div>

              <div style={info}>
                <h3 style={name}>{product.name}</h3>

                <p style={meta}>
                  {formatType(product.productType)} • {product.category || "general"}
                </p>

                <p style={price}>
                  ${getProductPrice(product).toFixed(2)}
                </p>

                {product.productType === "digital" && (
                  <p style={digitalBadge}>
                    Digital Download
                  </p>
                )}

                {product.digitalProduct?.licenseType && (
                  <p style={licenseText}>
                    License: {product.digitalProduct.licenseType}
                  </p>
                )}

                {product.variants?.length > 0 && (
                  <p style={meta}>
                    {product.variants.length} variants
                  </p>
                )}
              </div>

              <div style={actions}>
                <button
                  type="button"
                  onClick={() => editProduct(product)}
                  style={editBtn}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => deleteProduct(product)}
                  disabled={deletingId === product._id}
                  style={{
                    ...deleteBtn,
                    opacity: deletingId === product._id ? 0.65 : 1,
                    cursor: deletingId === product._id ? "not-allowed" : "pointer"
                  }}
                >
                  {deletingId === product._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const section = {
  marginTop: 30,
  padding: 20,
  background: "#020617",
  borderRadius: 14,
  border: "1px solid #1e293b",
  color: "#fff"
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 18
}

const title = {
  margin: 0
}

const subtitle = {
  margin: "6px 0 0",
  color: "#94a3b8"
}

const helperText = {
  color: "#94a3b8",
  marginTop: 0
}

const refreshBtn = {
  background: "#38bdf8",
  color: "#020617",
  border: "none",
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 800
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
  gap: 16
}

const card = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 14,
  padding: 12
}

const imageBox = {
  width: "100%",
  height: 150,
  background: "#ffffff",
  borderRadius: 10,
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 10
}

const image = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  padding: 6,
  boxSizing: "border-box"
}

const info = {
  minHeight: 120
}

const name = {
  margin: "0 0 6px",
  fontSize: 16
}

const meta = {
  margin: "0 0 6px",
  color: "#94a3b8",
  fontSize: 13
}

const price = {
  margin: "0 0 6px",
  color: "#22c55e",
  fontWeight: 800
}

const digitalBadge = {
  margin: "0 0 6px",
  color: "#38bdf8",
  fontSize: 13,
  fontWeight: 800
}

const licenseText = {
  margin: "0 0 6px",
  color: "#cbd5e1",
  fontSize: 12
}

const actions = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
  marginTop: 10
}

const editBtn = {
  background: "#38bdf8",
  color: "#020617",
  border: "none",
  borderRadius: 8,
  padding: 8,
  cursor: "pointer",
  fontWeight: 800
}

const deleteBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: 8,
  fontWeight: 800
}