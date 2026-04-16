import { useEffect, useState } from "react"
import api from "../services/api"
import useCart from "../hooks/useCart"
import toast from "react-hot-toast"

export default function Store() {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  /* 🔥 TRACK USER SELECTION */
  const [selected, setSelected] = useState({})

  const { addToCart } = useCart()

  const BASE_URL = api.defaults.baseURL.replace("/api", "")

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products")
        setProducts(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  /* ================= HELPERS ================= */

  const getVariants = (product) => product.variants || []

  const getColors = (product) =>
    [...new Set(getVariants(product).map(v => v.color))]

  const getSizes = (product, color) =>
    getVariants(product)
      .filter(v => v.color === color)
      .map(v => v.size)

  const getVariant = (product, color, size) =>
    getVariants(product).find(
      v => v.color === color && v.size === size
    )

  /* ================= UI ================= */

  if (loading) return <div style={center}><h2>Loading...</h2></div>

  return (
    <div style={container}>
      <h1 style={title}>🛒 Store</h1>

      <div style={grid}>
        {products.map(product => {

          const sel = selected[product._id] || {}

          const colors = getColors(product)
          const sizes = sel.color ? getSizes(product, sel.color) : []
          const variant = getVariant(product, sel.color, sel.size)

          const imageUrl = product.image
            ? product.image.startsWith("/uploads")
              ? `${BASE_URL}${product.image}`
              : product.image
            : "/placeholders/hoodie.png"

          return (
            <div key={product._id} style={card}>

              <img src={imageUrl} style={image} />

              <h3>{product.name}</h3>

              {/* 🎨 COLORS */}
              <div>
                <p>Color</p>
                <div style={row}>
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() =>
                        setSelected(prev => ({
                          ...prev,
                          [product._id]: { color: c }
                        }))
                      }
                      style={{
                        ...btn,
                        background: sel.color === c ? "#22c55e" : "#333"
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* 📏 SIZES */}
              {sel.color && (
                <div>
                  <p>Size</p>
                  <div style={row}>
                    {sizes.map(s => (
                      <button
                        key={s}
                        onClick={() =>
                          setSelected(prev => ({
                            ...prev,
                            [product._id]: {
                              ...prev[product._id],
                              size: s
                            }
                          }))
                        }
                        style={{
                          ...btn,
                          background: sel.size === s ? "#3b82f6" : "#333"
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 💰 PRICE */}
              <p style={price}>
                {variant ? `$${variant.price}` : "Select options"}
              </p>

              {/* 🛒 */}
              <button
                disabled={!variant}
                onClick={() => {
                  addToCart({
                    ...product,
                    selectedVariant: variant
                  })
                  toast.success("Added to cart")
                }}
                style={{
                  ...button,
                  opacity: variant ? 1 : 0.5
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

const container = { padding: 20, background: "#020617", minHeight: "100vh", color: "white" }
const title = { marginBottom: 20 }
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 20 }
const card = { padding: 15, background: "#111", borderRadius: 10 }
const image = { width: "100%", height: 200, objectFit: "cover" }
const price = { color: "#22c55e", fontWeight: "bold" }
const row = { display: "flex", gap: 5, flexWrap: "wrap" }
const btn = { padding: 5, borderRadius: 5, border: "none", color: "white" }
const button = { marginTop: 10, padding: 10, background: "#06b6d4", border: "none" }
const center = { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }