import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"
import { useCartContext } from "../context/useCartContext"
import toast from "react-hot-toast"

const safeText = (value, fallback = "") => {
  if (value === null || value === undefined || value === "") return fallback
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  if (typeof value === "boolean") return value ? "Yes" : "No"

  if (typeof value === "object") {
    return value.name || value.title || value.label || value.value || fallback
  }

  return fallback
}

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
    if (!img || typeof img !== "string") {
      return "/image_placeholder/placeholder.png"
    }

    if (img.startsWith("data:image")) return img
    if (img.startsWith("http")) return img
    if (img.startsWith("/uploads")) return `${BASE_URL}${img}`
    if (img.startsWith("uploads")) return `${BASE_URL}/${img}`

    return img
  }

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const res = await api.get(`/products/${id}`)
        const p = res.data?.data || res.data

        if (!isMounted) return

        setProduct(p)

        if (p?.variants?.length) {
          const first = p.variants[0]

          setSelectedColor(safeText(first.color, ""))
          setSelectedSize(safeText(first.size, ""))
        }
      } catch (err) {
        if (!isMounted) return

        console.error("❌ PRODUCT DETAIL ERROR:", err.response?.data || err)
        toast.error("Failed to load product")
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>
  if (!product) return <div style={{ padding: 40 }}>Product not found</div>

  const productName = safeText(product.name, "Product")
  const productDescription = safeText(product.description, "")

  const variants = product.variants || []

  const colors = [
    ...new Set(variants.map(v => safeText(v.color, "")))
  ].filter(Boolean)

  const activeColor = selectedColor || colors[0]

  const colorVariants = variants.filter(
    v => safeText(v.color, "") === activeColor
  )

  const sizes = [
    ...new Set(colorVariants.map(v => safeText(v.size, "")))
  ].filter(Boolean)

  const activeSize = selectedSize || sizes[0]

  const variant = variants.find(
    v =>
      safeText(v.color, "") === activeColor &&
      safeText(v.size, "") === activeSize
  ) || colorVariants[0]

  const images = [
    ...new Set(
      variants
        .filter(v => safeText(v.color, "") === activeColor)
        .flatMap(v => v.images || [])
    )
  ]

  if (images.length === 0 && product.image) {
    images.push(product.image)
  }

  if (images.length === 0 && product.images?.length) {
    images.push(...product.images)
  }

  const safeIndex = imageIndex >= images.length ? 0 : imageIndex

  const mainImage = resolve(images[safeIndex] || images[0])

  const price = Number(
    variant?.price ||
    variant?.basePrice ||
    variant?.listPrice ||
    product.price ||
    product.basePrice ||
    product.listPrice ||
    0
  )

  const stock = Number(
    variant?.stock ??
    variant?.quantity ??
    product.stock ??
    product.quantity ??
    0
  )

  return (
    <div style={wrap}>
      <div>
        <img
          src={mainImage}
          alt={productName}
          style={mainImg}
          onError={(e) => {
            e.currentTarget.src = "/image_placeholder/placeholder.png"
          }}
        />

        {images.length > 1 && (
          <div style={thumbRow}>
            {images.map((img, i) => (
              <img
                key={`${img}-${i}`}
                src={resolve(img)}
                alt={`${productName} thumbnail ${i + 1}`}
                onClick={() => setImageIndex(i)}
                style={{
                  ...thumb,
                  border:
                    i === safeIndex
                      ? "2px solid #22c55e"
                      : "1px solid #334155"
                }}
                onError={(e) => {
                  e.currentTarget.src = "/image_placeholder/placeholder.png"
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h1>{productName}</h1>

        <p style={priceText}>
          ${price.toFixed(2)}
        </p>

        <p style={stockText}>
          {stock > 0 ? `${stock} available` : "Out of stock"}
        </p>

        <p style={{ opacity: 0.7 }}>
          {productDescription}
        </p>

        {colors.length > 0 && (
          <>
            <h4>Color</h4>

            <div style={row}>
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    const firstSize =
                      variants.find(v => safeText(v.color, "") === color)?.size

                    setSelectedColor(color)
                    setSelectedSize(safeText(firstSize, ""))
                    setImageIndex(0)
                  }}
                  style={{
                    ...btn,
                    background:
                      activeColor === color
                        ? "#22c55e"
                        : "#1e293b",
                    color:
                      activeColor === color
                        ? "#020617"
                        : "#ffffff"
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </>
        )}

        {sizes.length > 0 && (
          <>
            <h4>Size</h4>

            <div style={row}>
              {sizes.map(size => {
                const sizeVariant = variants.find(
                  v =>
                    safeText(v.color, "") === activeColor &&
                    safeText(v.size, "") === size
                )

                const out = Number(
                  sizeVariant?.stock ??
                  sizeVariant?.quantity ??
                  0
                ) <= 0

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={out}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      ...btn,
                      background:
                        activeSize === size
                          ? "#22c55e"
                          : "#1e293b",
                      color:
                        activeSize === size
                          ? "#020617"
                          : "#ffffff",
                      opacity: out ? 0.3 : 1,
                      cursor: out ? "not-allowed" : "pointer"
                    }}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </>
        )}

        <button
          type="button"
          style={{
            ...addBtn,
            opacity: !variant || stock <= 0 ? 0.5 : 1,
            cursor: !variant || stock <= 0 ? "not-allowed" : "pointer"
          }}
          disabled={!variant || stock <= 0}
          onClick={() => {
            if (!variant) {
              return toast.error("Select color + size")
            }

            if (stock <= 0) {
              return toast.error("This option is out of stock")
            }

            addToCart({
              productId: product._id,
              name: productName,
              image: mainImage,
              quantity: 1,
              price,
              selectedVariant: {
                ...variant,
                price
              }
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
  marginTop: 10,
  flexWrap: "wrap"
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
  fontSize: 24,
  fontWeight: "bold",
  marginBottom: 6
}

const stockText = {
  color: "#94a3b8",
  marginTop: 0,
  marginBottom: 16
}

const row = {
  display: "flex",
  gap: 8,
  marginTop: 10,
  marginBottom: 20,
  flexWrap: "wrap"
}

const btn = {
  padding: "6px 12px",
  border: "none",
  color: "white",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 700
}

const addBtn = {
  marginTop: 20,
  padding: 12,
  width: "100%",
  background: "#22c55e",
  color: "#020617",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold"
}