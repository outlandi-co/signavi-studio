import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import useCart from "../hooks/useCart"

export default function Store() {

  const [products, setProducts] = useState([])
  const [category, setCategory] = useState("all")

  const navigate = useNavigate()
  const { addToCart } = useCart()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products")
        setProducts(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  const filtered = category === "all"
    ? products
    : products.filter(p => p.category === category)

  return (
    <div style={{ padding: 20 }}>

      <h1 style={{ color: "white" }}>Store</h1>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{
          marginBottom: 20,
          padding: "8px",
          borderRadius: "6px",
          background: "#020617",
          color: "#fff"
        }}
      >
        <option value="all">All</option>
        <option value="shirts">Shirts</option>
        <option value="hats">Hats</option>
        <option value="stickers">Stickers</option>
        <option value="prints">Prints</option>
      </select>

      <div style={grid}>

        {filtered.map(p => (
          <div
            key={p._id}
            onClick={() => navigate(`/product/${p._id}`)}
            style={card}
          >

            <img
              src={p.image ? `http://localhost:5050/${p.image}` : "/placeholder.png"}
              style={image}
            />

            <h3 style={title}>{p.name}</h3>

            <p style={desc}>{p.description}</p>

            <p style={price}>
              ${Number(p.price || 0).toFixed(2)}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation()
                addToCart(p)
              }}
              style={button}
            >
              🛒 Add to Cart
            </button>

          </div>
        ))}

      </div>
    </div>
  )
}

/* STYLES */

const grid = {
  display: "grid",
  gap: "20px",
  gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))"
}

const card = {
  background: "#020617",
  padding: "16px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
  cursor: "pointer"
}

const image = {
  width: "100%",
  height: "200px",
  objectFit: "cover",
  borderRadius: "10px"
}

const title = {
  color: "white",
  marginTop: "10px"
}

const desc = {
  color: "#94a3b8",
  fontSize: "14px"
}

const price = {
  color: "#22d3ee",
  fontWeight: "bold"
}

const button = {
  background: "#06b6d4",
  color: "#fff",
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  marginTop: "10px",
  border: "none",
  fontWeight: "600",
  boxShadow: "0 4px 12px rgba(6,182,212,0.4)",
  cursor: "pointer"
}