import { useEffect, useState } from "react"
import api from "../services/api"
import { useCartContext } from "../context/useCartContext"
import toast from "react-hot-toast"

export default function Store() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // selection per product: { [productId]: { color, size } }
  const [selected, setSelected] = useState({})

  const { addToCart } = useCartContext()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products")
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.data || []
        setProducts(list)
      } catch (err) {
        console.error("❌ Failed to load products:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h2>Loading...</h2>
      </div>
    )
  }

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>🛒 Store</h1>

      <div style={{ display: "grid", gap: 20 }}>
        {products.map(product => {
          const sel = selected[product._id] || {}
          const colors = getColors(product)
          const sizes = sel.color ? getSizes(product, sel.color) : []
          const variant = getVariant(product, sel.color, sel.size)

          // fallback: variant price → product price → 0
          const safePrice =
            Number(variant?.price) ||
            Number(product?.price) ||
            0

          return (
            <div key={product._id} style={{ padding: 20, background: "#111" }}>
              <h3>{product.name}</h3>

              {/* COLORS */}
              <div style={{ marginBottom: 10 }}>
                <strong>Color:</strong>{" "}
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() =>
                      setSelected(prev => ({
                        ...prev,
                        [product._id]: { color, size: "" }
                      }))
                    }
                    style={{
                      marginRight: 6,
                      padding: "4px 8px",
                      borderRadius: 6,
                      border:
                        sel.color === color
                          ? "2px solid #22c55e"
                          : "1px solid #555",
                      background: "transparent",
                      color: "#fff",
                      cursor: "pointer"
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>

              {/* SIZES */}
              <div style={{ marginBottom: 10 }}>
                <strong>Size:</strong>{" "}
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() =>
                      setSelected(prev => ({
                        ...prev,
                        [product._id]: { ...prev[product._id], size }
                      }))
                    }
                    style={{
                      marginRight: 6,
                      padding: "4px 8px",
                      borderRadius: 6,
                      border:
                        sel.size === size
                          ? "2px solid #22c55e"
                          : "1px solid #555",
                      background: "transparent",
                      color: "#fff",
                      cursor: "pointer"
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <p>
                {safePrice > 0
                  ? `$${safePrice.toFixed(2)}`
                  : "No price set"}
              </p>

              <button
                onClick={() => {
                  console.log("🛒 ADDING:", {
                    product: product.name,
                    variant,
                    safePrice
                  })

                  if (!variant) {
                    toast.error("Please select color and size")
                    return
                  }

                  if (!variant.color || !variant.size) {
                    toast.error("Select color and size")
                    return
                  }

                  if (!safePrice || safePrice <= 0) {
                    toast.error("Invalid price")
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

                  toast.success("Added to cart")
                }}
                style={{
                  marginTop: 10,
                  padding: "8px 12px",
                  background: "#22c55e",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer"
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