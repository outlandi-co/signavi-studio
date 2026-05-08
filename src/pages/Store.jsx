import { useEffect, useState } from "react"
import api from "../services/api"
import { useCartContext } from "../context/useCartContext"
import toast from "react-hot-toast"

export default function Store() {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState({})

  const { addToCart } = useCartContext()

  /* ================= LOAD PRODUCTS ================= */

  useEffect(() => {

    const load = async () => {

      try {

        const res = await api.get("/products")

        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.data || []

        setProducts(list)

      } catch (err) {

        console.error(
          "FAILED TO LOAD PRODUCTS:",
          err
        )

      } finally {

        setLoading(false)
      }
    }

    load()

  }, [])

  /* ================= HELPERS ================= */

  const getVariants = (product) => {
    return product.variants || []
  }

  const getColors = (product) => {
    return [
      ...new Set(
        getVariants(product)
          .map(v => v.color)
          .filter(Boolean)
      )
    ]
  }

  const getSizes = (product, color) => {
    return getVariants(product)
      .filter(v => v.color === color)
      .map(v => v.size)
      .filter(Boolean)
  }

  const getVariant = (product, color, size) => {
    return getVariants(product).find(
      v =>
        v.color === color &&
        v.size === size
    )
  }

  /* ================= LOADING ================= */

  if (loading) {

    return (
      <div style={loadingWrap}>
        <h2>Loading Store...</h2>
      </div>
    )
  }

  /* ================= RENDER ================= */

  return (
    <div style={page}>

      <div style={header}>
        <p style={eyebrow}>
          SignaVi Studio
        </p>

        <h1 style={title}>
          Store
        </h1>

        <p style={subtitle}>
          Custom apparel, print products, and creative production items.
        </p>
      </div>

      {products.length === 0 && (
        <p style={emptyText}>
          No products available yet.
        </p>
      )}

      <div style={grid}>

        {products.map(product => {

          const sel =
            selected[product._id] || {}

          const colors =
            getColors(product)

          const sizes =
            sel.color
              ? getSizes(product, sel.color)
              : []

          const variant =
            getVariant(
              product,
              sel.color,
              sel.size
            )

          const safePrice =
            Number(variant?.price) ||
            Number(product?.price) ||
            Number(product?.basePrice) ||
            0

          return (
            <div
              key={product._id}
              style={card}
            >

              {/* ================= IMAGE ================= */}

              {product.image ? (

                <img
                  src={product.image}
                  alt={product.name}
                  style={image}
                  onError={(e) => {
                    e.target.style.display = "none"
                  }}
                />

              ) : (

                <div style={imagePlaceholder}>
                  No Image
                </div>
              )}

              {/* ================= CONTENT ================= */}

              <div style={content}>

                <div>

                  <p style={category}>
                    {product.category || "general"}
                  </p>

                  <h2 style={productName}>
                    {product.name}
                  </h2>

                  {product.description && (
                    <p style={description}>
                      {product.description}
                    </p>
                  )}

                </div>

                <p style={price}>
                  {safePrice > 0
                    ? "$" + safePrice.toFixed(2)
                    : "No price"}
                </p>

                {/* ================= COLORS ================= */}

                <div>

                  <p style={label}>
                    Color
                  </p>

                  <div style={optionRow}>

                    {colors.length === 0 && (
                      <span style={muted}>
                        No colors
                      </span>
                    )}

                    {colors.map(color => (

                      <button
                        key={color}

                        onClick={() =>
                          setSelected(prev => ({
                            ...prev,
                            [product._id]: {
                              color,
                              size: ""
                            }
                          }))
                        }

                        style={{
                          ...optionButton,
                          border:
                            sel.color === color
                              ? "2px solid #22c55e"
                              : "1px solid #334155",
                          color:
                            sel.color === color
                              ? "#22c55e"
                              : "white"
                        }}
                      >
                        {color}
                      </button>
                    ))}

                  </div>

                </div>

                {/* ================= SIZES ================= */}

                <div>

                  <p style={label}>
                    Size
                  </p>

                  <div style={optionRow}>

                    {!sel.color && (
                      <span style={muted}>
                        Choose color first
                      </span>
                    )}

                    {sizes.map(size => (

                      <button
                        key={size}

                        onClick={() =>
                          setSelected(prev => ({
                            ...prev,
                            [product._id]: {
                              ...prev[product._id],
                              size
                            }
                          }))
                        }

                        style={{
                          ...optionButton,
                          border:
                            sel.size === size
                              ? "2px solid #38bdf8"
                              : "1px solid #334155",
                          color:
                            sel.size === size
                              ? "#38bdf8"
                              : "white"
                        }}
                      >
                        {size}
                      </button>
                    ))}

                  </div>

                </div>

                {/* ================= ADD TO CART ================= */}

                <button
                  onClick={() => {

                    if (!variant) {
                      toast.error(
                        "Please select color and size"
                      )
                      return
                    }

                    if (!safePrice || safePrice <= 0) {
                      toast.error(
                        "Invalid product price"
                      )
                      return
                    }

                    addToCart({
                      productId: product._id,
                      name: product.name,
                      image: product.image,
                      quantity: 1,
                      selectedVariant: {
                        color: variant.color,
                        size: variant.size,
                        price: safePrice
                      }
                    })

                    toast.success(
                      "Added to cart"
                    )
                  }}
                  style={addButton}
                >
                  Add to Cart
                </button>

              </div>

            </div>
          )
        })}

      </div>

    </div>
  )
}

/* ================= STYLES ================= */

const page = {
  minHeight: "100vh",
  background: "#020617",
  color: "white",
  padding: "40px 30px"
}

const loadingWrap = {
  minHeight: "100vh",
  background: "#020617",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}

const header = {
  marginBottom: 34
}

const eyebrow = {
  margin: 0,
  color: "#22c55e",
  fontSize: 13,
  fontWeight: "bold",
  letterSpacing: 1,
  textTransform: "uppercase"
}

const title = {
  margin: "6px 0",
  fontSize: 44,
  lineHeight: 1.1
}

const subtitle = {
  margin: 0,
  color: "#94a3b8",
  maxWidth: 640
}

const emptyText = {
  color: "#94a3b8"
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 340px))",
  gap: 26,
  alignItems: "start"
}

const card = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 22,
  overflow: "hidden",
  boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
  display: "flex",
  flexDirection: "column",
  maxWidth: 340,
  width: "100%"
}

const image = {
  width: "100%",
  height: 250,
  objectFit: "cover",
  background: "#111827",
  borderBottom: "1px solid #1e293b"
}

const imagePlaceholder = {
  height: 250,
  background: "#111827",
  borderBottom: "1px solid #1e293b",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748b"
}

const content = {
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 16
}

const category = {
  margin: "0 0 6px",
  color: "#38bdf8",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1,
  fontWeight: "bold"
}

const productName = {
  margin: 0,
  fontSize: 22,
  lineHeight: 1.2
}

const description = {
  margin: "10px 0 0",
  color: "#94a3b8",
  fontSize: 14,
  lineHeight: 1.45
}

const price = {
  margin: 0,
  color: "#22c55e",
  fontSize: 22,
  fontWeight: "bold"
}

const label = {
  margin: "0 0 8px",
  fontSize: 13,
  color: "#cbd5e1",
  fontWeight: "bold"
}

const optionRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8
}

const optionButton = {
  padding: "7px 10px",
  borderRadius: 10,
  background: "#020617",
  cursor: "pointer",
  fontSize: 13
}

const muted = {
  color: "#64748b",
  fontSize: 13
}

const addButton = {
  marginTop: 4,
  padding: "14px 18px",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(to right, #22c55e, #16a34a)",
  color: "white",
  fontWeight: "bold",
  fontSize: 15,
  cursor: "pointer"
}