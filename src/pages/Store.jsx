import { useEffect, useState } from "react"
import api from "../services/api"
import useCart from "../hooks/useCart"
import toast from "react-hot-toast"

export default function Store() {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const { addToCart } = useCart()

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products")

        console.log("🔥 RAW RESPONSE:", res.data)

        // ✅ ALWAYS FORCE ARRAY
        const safeProducts = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : []

        setProducts(safeProducts)

      } catch (err) {
        console.error("❌ STORE LOAD ERROR:", err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div style={center}>
        <h2 style={{ color: "white" }}>⏳ Loading products...</h2>
      </div>
    )
  }

  /* ================= EMPTY ================= */
  if (!products.length) {
    return (
      <div style={center}>
        <h2 style={{ color: "white" }}>No products found.</h2>
      </div>
    )
  }

  /* ================= UI ================= */
  return (
    <div style={container}>
      <h1 style={title}>🛒 Store</h1>

      <div style={grid}>
        {products.map(product => {

          const priceValue = Number(product.price || 0)
          const stock = Number(product.stock ?? 0)
          const inStock = stock > 0

          return (
            <div key={product._id} style={card}>

              {/* IMAGE */}
              {product.image ? (
                <img src={product.image} alt={product.name} style={image} />
              ) : (
                <div style={imagePlaceholder}>No Image</div>
              )}

              {/* NAME */}
              <h3 style={{ color: "white" }}>
                {product.name}
              </h3>

              {/* DESCRIPTION */}
              <p style={{ color: "#94a3b8", fontSize: 13 }}>
                {product.description || "No description"}
              </p>

              {/* PRICE */}
              <p style={price}>
                ${priceValue.toFixed(2)}
              </p>

              {/* STOCK */}
              <p style={{ fontSize: 12, opacity: 0.6 }}>
                {inStock ? `Stock: ${stock}` : "Out of Stock"}
              </p>

              {/* BUTTON */}
              <button
                style={{
                  ...button,
                  opacity: inStock ? 1 : 0.5,
                  cursor: inStock ? "pointer" : "not-allowed"
                }}
                disabled={!inStock}
                onClick={() => {
                  addToCart(product)
                  toast.success(`${product.name} added to cart`)
                }}
              >
                Add to Cart
              </button>

            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  padding: 20,
  background: "#020617",
  minHeight: "100vh"
}

const title = {
  color: "white",
  marginBottom: 20
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
  gap: 20
}

const card = {
  borderRadius: 12,
  padding: 15,
  textAlign: "center"
}

const image = {
  width: "100%",
  height: 200,
  objectFit: "cover",
  borderRadius: 8,
  marginBottom: 10
}

const imagePlaceholder = {
  width: "100%",
  height: 200,
  borderRadius: 8,
  marginBottom: 10,
  background: "#0f172a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#475569",
  fontSize: 12,
  border: "1px dashed #1e293b"
}

const price = {
  color: "#22c55e",
  fontWeight: "bold",
  marginTop: 10
}

const button = {
  marginTop: 10,
  padding: "8px 12px",
  borderRadius: 6,
  background: "#06b6d4",
  border: "none",
  color: "black",
  fontWeight: "bold"
}

const center = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "#020617"
}