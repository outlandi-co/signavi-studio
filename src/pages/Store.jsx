import { useEffect, useState } from "react"
import api from "../services/api"
import { useCartContext } from "../context/useCartContext"
import toast from "react-hot-toast"

export default function Store() {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState({})

  const { addToCart } = useCartContext()

  const BASE_URL =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "https://signavi-backend.onrender.com"

  const PLACEHOLDER = "/image_placeholder/placeholder.png"

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products")
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.data || []
        setProducts(list)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getVariants = (product) => product.variants || []

  const getColors = (product) => [
    ...new Set(getVariants(product).map(v => v.color).filter(Boolean))
  ]

  const getSizes = (product, color) =>
    getVariants(product)
      .filter(v => v.color === color)
      .map(v => v.size)

  const getVariant = (product, color, size) =>
    getVariants(product).find(
      v => v.color === color && v.size === size
    )

  const resolveImage = (img) => {
    if (!img) return PLACEHOLDER
    if (img.startsWith("http")) return img
    const safe = img.startsWith("/") ? img : `/${img}`
    return `${BASE_URL}${safe}`
  }

  if (loading) return <div style={loadingWrap}>Loading...</div>

  return (
    <div style={page}>

      <div style={header}>
        <p style={eyebrow}>SignaVi Studio</p>
        <h1 style={title}>Store</h1>
      </div>

      <div style={grid}>

        {products.map(product => {

          const sel = selected[product._id] || {}
          const colors = getColors(product)
          const sizes = sel.color ? getSizes(product, sel.color) : []
          const variant = getVariant(product, sel.color, sel.size)

          let imageUrl = resolveImage(product.image)
          if (variant?.image) imageUrl = resolveImage(variant.image)

          const price =
            Number(variant?.price) ||
            Number(product?.price) ||
            Number(product?.basePrice) ||
            0

          return (
            <div key={product._id} className="product-card">

              <div className="img-wrap">
                <img
                  src={imageUrl}
                  alt=""
                  onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                />

                <button
                  className="quick-add"
                  onClick={() => {
                    if (!variant) return toast.error("Select options")
                    addToCart({
                      productId: product._id,
                      name: product.name,
                      image: imageUrl,
                      quantity: 1,
                      selectedVariant: variant
                    })
                    toast.success("Added")
                  }}
                >
                  Add
                </button>
              </div>

              <div className="content">

                <h3>{product.name}</h3>

                <p className="price">
                  ${price.toFixed(2)}
                </p>

                {/* COLORS */}
                <div className="options">
                  {colors.map(color => (
                    <button
                      key={color}
                      className={sel.color === color ? "active" : ""}
                      onClick={() =>
                        setSelected(prev => ({
                          ...prev,
                          [product._id]: { color }
                        }))
                      }
                    >
                      {color}
                    </button>
                  ))}
                </div>

                {/* SIZES */}
                <div className="options">
                  {sizes.map(size => (
                    <button
                      key={size}
                      className={sel.size === size ? "active" : ""}
                      onClick={() =>
                        setSelected(prev => ({
                          ...prev,
                          [product._id]: {
                            ...prev[product._id],
                            size
                          }
                        }))
                      }
                    >
                      {size}
                    </button>
                  ))}
                </div>

              </div>

            </div>
          )
        })}

      </div>

      {/* 🔥 CLEAN CSS */}
      <style>{`
        .product-card {
          width: 220px;
          background:#0f172a;
          border-radius:16px;
          overflow:hidden;
          transition:0.25s;
        }

        .product-card:hover {
          transform:translateY(-6px);
          box-shadow:0 20px 40px rgba(0,0,0,0.5);
        }

        .img-wrap {
          position:relative;
          overflow:hidden;
        }

        .img-wrap img {
          width:100%;
          height:130px;
          object-fit:cover;
          transition:0.3s;
        }

        .product-card:hover img {
          transform:scale(1.1);
        }

        .quick-add {
          position:absolute;
          bottom:10px;
          left:50%;
          transform:translateX(-50%) translateY(20px);
          opacity:0;
          background:#22c55e;
          border:none;
          padding:6px 12px;
          border-radius:20px;
          color:white;
          transition:0.25s;
          cursor:pointer;
        }

        .product-card:hover .quick-add {
          opacity:1;
          transform:translateX(-50%) translateY(0);
        }

        .content {
          padding:10px;
        }

        .price {
          color:#22c55e;
          font-weight:bold;
        }

        .options button {
          margin:3px;
          padding:4px 8px;
          font-size:11px;
          border-radius:8px;
          border:1px solid #334155;
          background:#020617;
          color:white;
          cursor:pointer;
        }

        .options .active {
          border:2px solid #22c55e;
        }
      `}</style>

    </div>
  )
}

/* layout */
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 220px)",
  justifyContent: "center",
  gap: 20
}

const page = { padding: 30 }
const header = { marginBottom: 20 }
const title = { fontSize: 32 }
const eyebrow = { color: "#22c55e" }
const loadingWrap = { padding: 50 }