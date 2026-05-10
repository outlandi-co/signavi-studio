import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"
import { useCartContext } from "../context/useCartContext"
import toast from "react-hot-toast"

export default function ProductDetail() {

  const { id } = useParams()
  const { addToCart } = useCartContext()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [imageIndex, setImageIndex] = useState(0)

  const BASE_URL =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "https://signavi-backend.onrender.com"

  const resolve = (img) => {
    if (!img) return "/image_placeholder/placeholder.png"
    return img.startsWith("http") ? img : `${BASE_URL}${img}`
  }

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/products/${id}`)
        const p = res.data

        setProduct(p)

        if (p?.variants?.length) {
          const first = p.variants[0]
          setSelectedColor(first.color)
          setSelectedSize(first.size)
        }

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>
  if (!product) return <div style={{ padding: 40 }}>Product not found</div>

  const variants = product.variants || []

  /* 🔥 SAFE COLORS */
  const colors = [
    ...new Set(variants.map(v => v.color))
  ].filter(Boolean)

  const activeColor = selectedColor || colors[0]

  const colorVariants = variants.filter(
    v => v.color === activeColor
  )

  /* 🔥 SAFE SIZES */
  const sizes = [
    ...new Set(colorVariants.map(v => v.size))
  ].filter(Boolean)

  const activeSize = selectedSize || sizes[0]

  const variant = variants.find(
    v =>
      v.color === activeColor &&
      v.size === activeSize
  )

  /* 🔥 IMAGES */
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

  const safeIndex =
    imageIndex >= images.length ? 0 : imageIndex

  const mainImage = resolve(images[safeIndex] || images[0])

  const price =
    variant?.price ||
    product.price ||
    0

  return (
    <div style={wrap}>

      {/* LEFT */}
      <div>

        <img src={mainImage} style={mainImg} />

        <div style={thumbRow}>
          {images.map((img, i) => (
            <img
              key={i}
              src={resolve(img)}
              onClick={() => setImageIndex(i)}
              style={{
                ...thumb,
                border:
                  i === safeIndex
                    ? "2px solid #22c55e"
                    : "1px solid #334155"
              }}
            />
          ))}
        </div>

      </div>

      {/* RIGHT */}
      <div>

        <h1>{product.name}</h1>
        <p style={priceText}>${price.toFixed(2)}</p>

        <p style={{ opacity: 0.7 }}>{product.description}</p>

        {/* COLORS */}
        <h4>Color</h4>
        <div style={row}>
          {colors.map(c => (
            <button
              key={c}
              onClick={() => {
                const firstSize =
                  variants.find(v => v.color === c)?.size

                setSelectedColor(c)
                setSelectedSize(firstSize)

                /* 🔥 RESET IMAGE */
                setImageIndex(0)
              }}
              style={{
                ...btn,
                background:
                  activeColor === c
                    ? "#22c55e"
                    : "#1e293b"
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* SIZES */}
        <h4>Size</h4>
        <div style={row}>
          {sizes.map(s => {
            const v = variants.find(
              v => v.color === activeColor && v.size === s
            )

            const out = v?.stock === 0

            return (
              <button
                key={s}
                disabled={out}
                onClick={() => setSelectedSize(s)}
                style={{
                  ...btn,
                  background:
                    activeSize === s
                      ? "#22c55e"
                      : "#1e293b",
                  opacity: out ? 0.3 : 1
                }}
              >
                {s}
              </button>
            )
          })}
        </div>

        {/* ADD */}
        <button
          style={addBtn}
          onClick={() => {

            if (!variant) {
              return toast.error("Select color + size")
            }

            addToCart({
              productId: product._id,
              name: product.name,
              image: mainImage,
              quantity: 1,
              selectedVariant: variant
            })

            toast.success("Added to cart")
          }}
        >
          Add to Cart
        </button>

      </div>

    </div>
  )
}

/* ================= STYLES ================= */

const wrap = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 40,
  padding: 40,
  color: "white"
}

const mainImg = {
  width: "100%",
  height: 500,
  objectFit: "cover",
  borderRadius: 12
}

const thumbRow = {
  display: "flex",
  gap: 10,
  marginTop: 10
}

const thumb = {
  width: 60,
  height: 60,
  objectFit: "cover",
  cursor: "pointer",
  borderRadius: 8
}

const priceText = {
  color: "#22c55e",
  fontSize: 20,
  fontWeight: "bold"
}

const row = {
  display: "flex",
  gap: 8,
  marginTop: 10,
  marginBottom: 20
}

const btn = {
  padding: "6px 12px",
  border: "none",
  color: "white",
  borderRadius: 6,
  cursor: "pointer"
}

const addBtn = {
  marginTop: 20,
  padding: 12,
  width: "100%",
  background: "#22c55e",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  cursor: "pointer"
}