import { useEffect, useState } from "react"
import api from "../services/api"

export default function Store() {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products")

        const data = res.data.data || res.data || []

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

  if (loading) {
    return (
      <div style={center}>
        <h2 style={{ color: "white" }}>Loading products...</h2>
      </div>
    )
  }

  return (
    <div style={container}>
      <h1 style={title}>🛒 Store</h1>

      {products.length === 0 ? (
        <p style={{ color: "white" }}>No products found.</p>
      ) : (
        <div style={grid}>
          {products.map(product => (
            <div key={product._id} style={card}>

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
                ${Number(product.price || product.basePrice || 0).toFixed(2)}
              </p>

              {/* STOCK */}
              <p style={{ fontSize: 12, opacity: 0.6 }}>
                Stock: {product.stock ?? 0}
              </p>

              {/* BUTTON */}
              <button style={button}>
                Add to Cart
              </button>

            </div>
          ))}
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
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 12,
  padding: 15,
  textAlign: "center",
  transition: "0.2s"
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
  cursor: "pointer",
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