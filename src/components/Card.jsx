import { useState } from "react"
import { useCartContext } from "../context/useCartContext"
import toast from "react-hot-toast"

/* 🔥 SAFE IMAGE RESOLVER */
const resolveImageSafe = (img) => {
  if (!img) return "/image_placeholder/placeholder.png"

  if (img.startsWith("http")) return img

  return `https://signavi-backend.onrender.com${img}`
}

export default function Card({ product, resolve }) {

  const { addToCart } = useCartContext()

  const [selected, setSelected] = useState({})
  const [imageIndex, setImageIndex] = useState(0)

  const variants = product?.variants || []

  const colors = [...new Set(variants.map(v => v.color))]

  const activeColor = selected.color || colors[0]

  const colorVariants = variants.filter(v => v.color === activeColor)

  /* 🔥 COLLECT IMAGES */
  const images = [
    ...new Set(colorVariants.flatMap(v => v.images || []))
  ]

  /* 🔥 SAFE INDEX */
  const safeIndex = imageIndex >= images.length ? 0 : imageIndex

  /* 🔥 MAIN IMAGE */
  const mainImage = resolveImageSafe(
    images[safeIndex] || images[0] || product?.image,
    resolve
  )

  /* 🔥 SAFE VARIANT MATCH */
  const variant = variants.find(
    v =>
      v.color === activeColor &&
      (selected.size ? v.size === selected.size : true)
  ) || colorVariants[0]

  return (
    <div className="card">

      {/* 🔥 MAIN IMAGE */}
      <img
        src={mainImage}
        alt={product.name}
        style={{ width: "100%", height: 200, objectFit: "cover" }}
      />

      {/* 🔥 THUMBNAILS */}
      {images.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          {images.map((img, i) => (
            <img
              key={i}
              src={resolveImageSafe(img, resolve)}
              style={{
                width: 50,
                height: 50,
                objectFit: "cover",
                cursor: "pointer",
                border: i === safeIndex ? "2px solid #22c55e" : "1px solid #ccc"
              }}
              onClick={() => setImageIndex(i)}
            />
          ))}
        </div>
      )}

      <h3>{product.name}</h3>
      <p>${(variant?.price || product.price || 0).toFixed(2)}</p>

      {/* 🔥 COLORS */}
      <div style={{ marginBottom: 8 }}>
        {colors.map(c => (
          <button
            key={c}
            onClick={() => {
              setSelected({ color: c })
              setImageIndex(0)
            }}
            style={{
              marginRight: 6,
              background: activeColor === c ? "#22c55e" : "#1e293b",
              color: "white",
              border: "none",
              padding: "4px 8px",
              cursor: "pointer"
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          if (!variant) return toast.error("No variant available")

          addToCart({
            productId: product._id,
            name: product.name,
            image: mainImage,
            quantity: 1,
            selectedVariant: variant
          })

          toast.success("Added to cart")
        }}
        style={{
          background: "#22c55e",
          border: "none",
          padding: "8px",
          width: "100%",
          cursor: "pointer"
        }}
      >
        Add
      </button>

    </div>
  )
}