import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import useCart from "../hooks/useCart"

const BASE_URL =
  (import.meta.env.VITE_API_URL || "https://signavi-backend.onrender.com/api")
    .replace("/api", "")

export default function Store({ setCartOpen }) {

  const [products, setProducts] = useState([])
  const [category, setCategory] = useState("all")

  const navigate = useNavigate()
  const { addToCart } = useCart()

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products")
        setProducts(res.data)
      } catch (err) {
        console.error("❌ PRODUCT LOAD ERROR:", err)
      }
    }
    load()
  }, [])

  const filtered =
    category === "all"
      ? products
      : products.filter(p => p.category === category)

  const getImage = (p) => {
    if (!p.image) return "/placeholder.png"
    return `${BASE_URL}/${p.image}`
  }

  return (
    <div style={{ padding: 20 }}>

      <h1 style={{ color: "white", fontSize: "28px", marginBottom: "20px" }}>
        🛍 Store
      </h1>

      {/* FILTER */}
      <select
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        style={select}
      >
        <option value="all">All</option>
        <option value="shirts">Shirts</option>
        <option value="hats">Hats</option>
        <option value="stickers">Stickers</option>
        <option value="prints">Prints</option>
      </select>

      {/* GRID */}
      <div style={grid}>

        {filtered.map(p => (
          <div
            key={p._id}
            onClick={() => navigate(`/product/${p._id}`)}
            style={card}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = "scale(1.04)"
              event.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.8)"
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = "scale(1)"
              event.currentTarget.style.boxShadow = card.boxShadow
            }}
          >

            {/* IMAGE */}
            <img
              src={getImage(p)}
              alt={p.name}
              style={image}
              onError={(event) => {
                event.target.src = "/placeholder.png"
              }}
              onMouseEnter={(event) => {
                event.target.style.transform = "scale(1.1)"
              }}
              onMouseLeave={(event) => {
                event.target.style.transform = "scale(1)"
              }}
            />

            {/* TITLE */}
            <h3 style={title}>{p.name}</h3>

            {/* DESC */}
            <p style={desc}>{p.description}</p>

            {/* PRICE */}
            <p style={price}>
              {p.price
                ? `$${Number(p.price).toFixed(2)}`
                : "Contact"}
            </p>

            {/* BUTTON */}
            <button
              onClick={(event) => {
                event.stopPropagation()

                if (typeof addToCart !== "function") {
                  console.error("❌ addToCart is not a function")
                  return
                }

                addToCart(p)

                // 🔥 auto open cart if available
                if (typeof setCartOpen === "function") {
                  setCartOpen(true)
                }
              }}
              style={button}
              onMouseEnter={(event) => {
                event.target.style.transform = "scale(1.05)"
              }}
              onMouseLeave={(event) => {
                event.target.style.transform = "scale(1)"
              }}
            >
              🛒 Add to Cart
            </button>

          </div>
        ))}

      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const grid = {
  display: "grid",
  gap: "20px",
  gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))"
}

const card = {
  background: "#020617",
  padding: "16px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
  cursor: "pointer",
  transition: "all 0.25s ease"
}

const image = {
  width: "100%",
  height: "220px",
  objectFit: "cover",
  borderRadius: "10px",
  transition: "transform 0.3s ease"
}

const title = {
  color: "white",
  marginTop: "12px",
  fontSize: "18px",
  fontWeight: "600"
}

const desc = {
  color: "#94a3b8",
  fontSize: "13px",
  marginTop: "4px"
}

const price = {
  color: "#22d3ee",
  fontWeight: "bold",
  marginTop: "8px",
  fontSize: "16px"
}

const button = {
  background: "#06b6d4",
  color: "#fff",
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  marginTop: "12px",
  border: "none",
  fontWeight: "600",
  boxShadow: "0 4px 12px rgba(6,182,212,0.4)",
  cursor: "pointer",
  transition: "all 0.2s ease"
}

const select = {
  marginBottom: 20,
  padding: "10px",
  borderRadius: "8px",
  background: "#020617",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.1)"
}