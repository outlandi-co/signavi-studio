
import { useEffect, useState } from "react"
import api from "../services/api"
import { useCartContext } from "../context/useCartContext"
import toast from "react-hot-toast"

export default function Store() {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  /* ================= SELECTED ================= */

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

  const getVariants = (product) =>
    product.variants || []

  const getColors = (product) =>

    [...new Set(
      getVariants(product)
        .map(v => v.color)
    )]

  const getSizes = (
    product,
    color
  ) =>

    getVariants(product)
      .filter(v =>
        v.color === color
      )
      .map(v => v.size)

  const getVariant = (
    product,
    color,
    size
  ) =>

    getVariants(product)
      .find(v =>

        v.color === color &&
        v.size === size
      )

  /* ================= LOADING ================= */

  if (loading) {

    return (

      <div style={loadingWrap}>

        <h2>
          Loading Store...
        </h2>

      </div>
    )
  }

  /* ================= RENDER ================= */

  return (

    <div style={page}>

      <h1 style={title}>
        Store
      </h1>

      <div style={grid}>

        {products.map(product => {

          const sel =
            selected[product._id] || {}

          const colors =
            getColors(product)

          const sizes =
            sel.color
              ? getSizes(
                  product,
                  sel.color
                )
              : []

          const variant =
            getVariant(
              product,
              sel.color,
              sel.size
            )

          const safePrice =

            Number(
              variant?.price
            ) ||

            Number(
              product?.price
            ) ||

            0

          return (

            <div
              key={product._id}
              style={card}
            >

              {/* ================= IMAGE ================= */}

              <img
                src={
                  product.image ||
                  "/placeholder.png"
                }

                alt={product.name}

                style={image}

                onError={(e) => {
                  e.target.src =
                    "/placeholder.png"
                }}
              />

              {/* ================= CONTENT ================= */}

              <div style={content}>

                <h3 style={productName}>
                  {product.name}
                </h3>

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

                  <div style={buttonRow}>

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
                          ...variantButton,

                          border:
                            sel.color === color
                              ? "2px solid #22c55e"
                              : "1px solid #475569"
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

                  <div style={buttonRow}>

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
                          ...variantButton,

                          border:
                            sel.size === size
                              ? "2px solid #22c55e"
                              : "1px solid #475569"
                        }}
                      >
                        {size}
                      </button>
                    ))}

                  </div>

                </div>

                {/* ================= BUTTON ================= */}

                <button

                  onClick={() => {

                    if (!variant) {

                      toast.error(
                        "Select color and size"
                      )

                      return
                    }

                    if (
                      !safePrice ||
                      safePrice <= 0
                    ) {

                      toast.error(
                        "Invalid price"
                      )

                      return
                    }

                    addToCart({

                      productId:
                        product._id,

                      name:
                        product.name,

                      image:
                        product.image,

                      quantity: 1,

                      selectedVariant: {

                        color:
                          variant.color,

                        size:
                          variant.size,

                        price:
                          safePrice
                      }
                    })

                    toast.success(
                      "Added to cart"
                    )
                  }}

                  style={addButton}
                >
                  Add To Cart
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

  padding: 30,

  background: "#020617",

  minHeight: "100vh",

  color: "white"
}

const loadingWrap = {

  minHeight: "100vh",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  background: "#020617",

  color: "white"
}

const title = {

  fontSize: 38,

  fontWeight: "bold",

  marginBottom: 30
}

const grid = {

  display: "grid",

  gridTemplateColumns:
    "repeat(auto-fit, minmax(320px, 1fr))",

  gap: 24
}

const card = {

  background: "#0f172a",

  border:
    "1px solid #1e293b",

  borderRadius: 20,

  overflow: "hidden",

  boxShadow:
    "0 6px 24px rgba(0,0,0,0.35)",

  display: "flex",

  flexDirection: "column"
}

const image = {

  width: "100%",

  height: 280,

  objectFit: "cover",

  background: "#111827"
}

const content = {

  padding: 20,

  display: "flex",

  flexDirection: "column",

  gap: 16
}

const productName = {

  margin: 0,

  fontSize: 22
}

const price = {

  margin: 0,

  fontSize: 20,

  fontWeight: "bold",

  color: "#22c55e"
}

const label = {

  marginBottom: 8,

  fontSize: 14,

  fontWeight: "bold"
}

const buttonRow = {

  display: "flex",

  flexWrap: "wrap",

  gap: 8
}

const variantButton = {

  padding: "8px 12px",

  borderRadius: 10,

  background: "#111827",

  color: "white",

  cursor: "pointer"
}

const addButton = {

  marginTop: 10,

  padding: "14px 18px",

  borderRadius: 14,

  border: "none",

  background:
    "linear-gradient(to right, #22c55e, #16a34a)",

  color: "white",

  fontWeight: "bold",

  fontSize: 15,

  cursor: "pointer"
}

