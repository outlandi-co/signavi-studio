import { useEffect, useState } from "react"
import api from "../services/api"

function Store() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get("/products")

        console.log("PRODUCTS:", res.data) // 🔥 DEBUG

        const activeProducts = res.data.filter(
          (p) => p.active !== false
        )

        setProducts(activeProducts)
      } catch (error) {
        console.error("Failed to load products:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  return (
    <div style={{ padding: "30px" }}>
      <h1>Store</h1>

      {loading && <p>Loading products...</p>}

      {!loading && products.length === 0 && (
        <p>No products available</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "20px"
        }}
      >
        {products.map((product) => (
          <div
            key={product._id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "8px",
              background: "#fff"
            }}
          >
            <img
              src={
                product.image && product.image !== ""
                  ? product.image
                  : "https://via.placeholder.com/200"
              }
              alt={product.name}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover"
              }}
            />

            <h3>{product.name || "No Name"}</h3>

            <p style={{ fontWeight: "bold" }}>
              ${product.price || 0}
            </p>

            <button
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "8px",
                background: "#000",
                color: "#fff",
                border: "none",
                cursor: "pointer"
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Store