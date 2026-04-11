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

        const data = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : []

        console.log("🔥 PRODUCTS:", data)

        setProducts(data)

      } catch (err) {
        console.error("❌ STORE LOAD ERROR:", err)
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
        <h2 style={{ color: "white" }}>Loading products...</h2>
      </div>
    )
  }

  /* ================= UI ================= */
  return (
    <div style={container}>
      <h1 style={title}>🛒 Store</h1>

      {products.length === 0 ? (
        <p style={{ color: "white" }}>No products found.</p>
      ) : (
        <div style={grid}>
          {products.map(product => {

            const priceValue = Number(product.price || product.basePrice || 0)
            const stock = Number(product.stock ?? 0)
            const inStock = stock > 0

            return (
              <div
                key={product._id}
                className="product-card"
                style={card}
              >

                {/* IMAGE */}
                <img
                  src={product.image || "/placeholder.png"}
                  alt={product.name}
                  style={image}
                  onError={(e) => {
                    e.target.src = "/placeholder.png"
                  }}
                />

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
                  onMouseEnter={(e) => {
                    if (inStock) e.currentTarget.style.transform = "scale(1.05)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)"
                  }}
                >
                  Add to Cart
                </button>

              </div>
            )
          })}
        </div>
      )}
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
  textAlign: "center",
  transition: "transform 0.25s ease, box-shadow 0.25s ease",
  cursor: "pointer"
}

const image = {
  width: "100%",
  height: 200,
  objectFit: "cover",
  borderRadius: 8,
  marginBottom: 10
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
  fontWeight: "bold",
  transition: "transform 0.2s ease"
}

const center = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "#020617"
}