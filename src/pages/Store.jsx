import { useEffect, useRef, useState } from "react"
import api from "../services/api"
import { useCartContext } from "../context/useCartContext"
import toast from "react-hot-toast"

export default function Store() {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState({})
  const [imageIndex, setImageIndex] = useState({})

  const { addToCart } = useCartContext()

  const scrollerRefs = useRef({})
  const dragState = useRef({})

  const BASE_URL =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "https://signavi-backend.onrender.com"

  const resolve = (img) => {
  if (!img) return "/image_placeholder/placeholder.png"

  // ✅ BASE64 (your current system)
  if (img.startsWith("data:image")) return img

  // ✅ FULL URL
  if (img.startsWith("http")) return img

  // ✅ BACKEND PATH (future proof)
  return `${BASE_URL}${img}`
}

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products")
        setProducts(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const scroll = (id, dir) => {
    const el = scrollerRefs.current[id]
    if (!el) return
    el.scrollBy({
      left: dir === "left" ? -120 : 120,
      behavior: "smooth"
    })
  }

  const handleMouseDown = (e, id) => {
    const el = scrollerRefs.current[id]
    if (!el) return

    dragState.current[id] = {
      isDown: true,
      startX: e.pageX,
      scrollLeft: el.scrollLeft
    }
  }

  const handleMouseMove = (e, id) => {
    const state = dragState.current[id]
    const el = scrollerRefs.current[id]

    if (!state?.isDown || !el) return

    const walk = (e.pageX - state.startX) * 1.5
    el.scrollLeft = state.scrollLeft - walk
  }

  const handleMouseUp = (id) => {
    if (dragState.current[id]) {
      dragState.current[id].isDown = false
    }
  }

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>

  return (
    <div style={grid}>

      {products.map(product => {

        const variants = product.variants || []

        const current = selected[product._id] || {}

        /* 🔥 SAFE COLORS */
        const colors = [
          ...new Set(variants.map(v => v.color))
        ].filter(Boolean)

        const activeColor = current.color || colors[0]

        const colorVariants = variants.filter(
          v => v.color === activeColor
        )

        /* 🔥 FIXED SIZES (DEDUPED) */
        const sizes = [
          ...new Set(colorVariants.map(v => v.size))
        ].filter(Boolean)

        const activeSize = current.size || sizes[0]

        const variant = variants.find(
          v => v.color === activeColor && v.size === activeSize
        )

        /* 🔥 CLEAN IMAGES */
        const images = [
  ...new Set(
    variants
      .filter(v => v.color === activeColor)
      .flatMap(v => v.images || [])
  )
]

// fallback if somehow empty
if (images.length === 0 && product.image) {
  images.push(product.image)
}

        const idx = imageIndex[product._id] || 0
        const safeIdx = idx >= images.length ? 0 : idx

        const mainImage = resolve(images[safeIdx] || images[0])
        const price = Number(
  variant?.price ||
  variant?.basePrice ||
  variant?.listPrice ||
  product.price ||
  product.basePrice ||
  product.listPrice ||
  0
)

        return (
          <div key={product._id} className="card">

            <img src={mainImage} />

            {images.length > 1 && (
              <div className="carouselWrap">

                <button onClick={() => scroll(product._id, "left")}>◀</button>

                <div
                  className="thumbScroller"
                  ref={(el) => {
                    if (el) scrollerRefs.current[product._id] = el
                  }}
                  onMouseDown={(e) => handleMouseDown(e, product._id)}
                  onMouseMove={(e) => handleMouseMove(e, product._id)}
                  onMouseLeave={() => handleMouseUp(product._id)}
                  onMouseUp={() => handleMouseUp(product._id)}
                >
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={resolve(img)}
                      onClick={() =>
                        setImageIndex(prev => ({
                          ...prev,
                          [product._id]: i
                        }))
                      }
                      className={i === safeIdx ? "activeThumb" : ""}
                    />
                  ))}
                </div>

                <button onClick={() => scroll(product._id, "right")}>▶</button>

              </div>
            )}

            <h3>{product.name}</h3>
            <p>${price.toFixed(2)}</p>

            {/* COLORS */}
            <div className="row">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    const firstSize = variants.find(v => v.color === c)?.size

                    setSelected(prev => ({
                      ...prev,
                      [product._id]: {
                        color: c,
                        size: firstSize
                      }
                    }))

                    /* 🔥 RESET IMAGE ON COLOR CHANGE */
                    setImageIndex(prev => ({
                      ...prev,
                      [product._id]: 0
                    }))
                  }}
                  className={activeColor === c ? "active" : ""}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* SIZES */}
            <div className="row">
              {sizes.map(s => {
                const v = variants.find(
                  v => v.color === activeColor && v.size === s
                )

                const out = v?.stock === 0

                return (
                  <button
                    key={s}
                    disabled={out}
                    onClick={() =>
                      setSelected(prev => ({
                        ...prev,
                        [product._id]: {
                          ...prev[product._id],
                          size: s
                        }
                      }))
                    }
                    className={`${activeSize === s ? "active" : ""} ${out ? "disabled" : ""}`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>

            <button
              className="add"
              onClick={() => {
                if (!variant) {
                  return toast.error("Select options")
                }

                addToCart({
  productId: product._id,
  name: product.name,
  image: mainImage,
  quantity: 1,
  price,
  selectedVariant: {
    ...variant,
    price
  }
})

                toast.success("Added")
              }}
            >
              Add to Cart
            </button>

          </div>
        )
      })}

      <style>{`
        .card {
          width: 240px;
          background: #0f172a;
          padding: 12px;
          border-radius: 12px;
          color: white;
        }

        img {
          width: 100%;
          height: 150px;
          object-fit: cover;
        }

        .carouselWrap {
          display: flex;
          align-items: center;
        }

        .thumbScroller {
          display: flex;
          overflow-x: auto;
          gap: 6px;
          cursor: grab;
        }

        .thumbScroller img {
          width: 40px;
          height: 40px;
          border-radius: 6px;
          cursor: pointer;
        }

        .activeThumb {
          border: 2px solid #22c55e;
        }

        .row {
          display: flex;
          gap: 6px;
          margin-top: 8px;
        }

        button.active {
          background: #22c55e;
        }

        button.disabled {
          opacity: 0.3;
          pointer-events: none;
        }

        .add {
          margin-top: 10px;
          width: 100%;
          background: #22c55e;
        }
      `}</style>

    </div>
  )
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 240px)",
  justifyContent: "center",
  gap: 20
}