import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"
import useCart from "../hooks/useCart"

const BASE_URL =
  (import.meta.env.VITE_API_URL || "https://signavi-backend.onrender.com/api")
    .replace("/api", "")

export default function ProductDetail() {

  const { id } = useParams()
  const [product, setProduct] = useState(null)

  const { addToCart } = useCart()

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products")
        const found = res.data.find(p => p._id === id)
        setProduct(found)
      } catch (err) {
        console.error("❌ PRODUCT LOAD ERROR:", err)
      }
    }

    load()
  }, [id])

  if (!product) return <p style={{ padding: 20 }}>Loading...</p>

  const handleAddToCart = (event) => {
    event.stopPropagation()

    if (typeof addToCart !== "function") {
      console.error("❌ addToCart not available")
      return
    }

    addToCart(product)
  }

  return (
    <div style={{ padding: 20, color: "white" }}>

      {/* IMAGE */}
      <img
        src={product.image ? `${BASE_URL}/${product.image}` : "/placeholder.png"}
        alt={product.name}
        style={{ width: 300, borderRadius: 10 }}
        onError={(e) => {
          e.currentTarget.src = "/placeholder.png"
        }}
      />

      {/* NAME */}
      <h1>{product.name}</h1>

      {/* DESC */}
      <p style={{ color: "#94a3b8" }}>
        {product.description}
      </p>

      {/* PRICE */}
      <h2 style={{ color: "#06b6d4" }}>
        ${Number(product.price || 0).toFixed(2)}
      </h2>

      {/* BUTTON */}
      <button
        onClick={handleAddToCart}
        style={{
          marginTop: 10,
          background: "#06b6d4",
          padding: 10,
          borderRadius: 6,
          border: "none",
          color: "#fff",
          cursor: "pointer"
        }}
      >
        🛒 Add to Cart
      </button>

    </div>
  )
}