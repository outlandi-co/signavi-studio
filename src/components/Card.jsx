import { useState } from "react"
import { useCartContext } from "../context/useCartContext"
import toast from "react-hot-toast"

/* 🔥 SAFE IMAGE RESOLVER */
const resolveImageSafe = (img) => {
  if (!img) return "/image_placeholder/placeholder.png"

  if (img.startsWith("data:image")) return img

  if (img.startsWith("http")) return img

  return `https://signavi-backend.onrender.com${img}`
}

export default function Card({ product }) {
  const { addToCart } = useCartContext()

  const [selected, setSelected] = useState({})
  const [imageIndex, setImageIndex] = useState(0)

  const variants = product?.variants || []

  const colors = [
    ...new Set(variants.map(v => v.color))
  ].filter(Boolean)

  const activeColor = selected.color || colors[0]

  const colorVariants = variants.filter(v => v.color === activeColor)

  const sizes = [
    ...new Set(colorVariants.map(v => v.size))
  ].filter(Boolean)

  const activeSize = selected.size || sizes[0]

  /* 🔥 SAFE VARIANT MATCH */
  const variant = variants.find(
    v => v.color === activeColor && v.size === activeSize
  ) || colorVariants[0]

  /* 🔥 COLLECT IMAGES */
  const images = [
    ...new Set(colorVariants.flatMap(v => v.images || []))
  ]

  if (images.length === 0 && product?.image) {
    images.push(product.image)
  }

  const safeIndex = imageIndex >= images.length ? 0 : imageIndex

  const mainImage = resolveImageSafe(
    images[safeIndex] || images[0] || product?.image
  )

  /* ✅ VARIANT PRICE FIX */
  const price = Number(
    variant?.price ||
    variant?.basePrice ||
    variant?.listPrice ||
    product?.price ||
    product?.basePrice ||
    product?.listPrice ||
    0
  )

  return (
    <div className="card">

      <img
        src={mainImage}
        alt={product.name}
        style={{ width: "100%", height: 200, objectFit: "cover" }}
      />

      {images.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          {images.map((img, i) => (
            <img
              key={i}
              src={resolveImageSafe(img)}
              alt={`${product.name} thumbnail ${i + 1}`}
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

      <p>${price.toFixed(2)}</p>

      {/* COLORS */}
      {colors.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {colors.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => {
                const firstSize = variants.find(v => v.color === color)?.size

                setSelected({
                  color,
                  size: firstSize
                })

                setImageIndex(0)
              }}
              style={{
                marginRight: 6,
                marginBottom: 6,
                background: activeColor === color ? "#22c55e" : "#1e293b",
                color: "white",
                border: "none",
                borderRadius: 6,
                padding: "4px 8px",
                cursor: "pointer"
              }}
            >
              {color}
            </button>
          ))}
        </div>
      )}

      {/* SIZES / VARIANTS */}
      {sizes.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {sizes.map(size => {
            const sizeVariant = variants.find(
              v => v.color === activeColor && v.size === size
            )

            const outOfStock =
              Number(sizeVariant?.stock ?? sizeVariant?.quantity ?? 0) <= 0

            return (
              <button
                key={size}
                type="button"
                disabled={outOfStock}
                onClick={() => {
                  setSelected(prev => ({
                    ...prev,
                    color: activeColor,
                    size
                  }))
                }}
                style={{
                  marginRight: 6,
                  marginBottom: 6,
                  background: activeSize === size ? "#22c55e" : "#1e293b",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  padding: "4px 8px",
                  cursor: outOfStock ? "not-allowed" : "pointer",
                  opacity: outOfStock ? 0.4 : 1
                }}
              >
                {size}
              </button>
            )
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          if (!variant) {
            return toast.error("No variant available")
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

          toast.success("Added to cart")
        }}
        style={{
          background: "#22c55e",
          color: "#020617",
          border: "none",
          borderRadius: 8,
          padding: "8px",
          width: "100%",
          cursor: "pointer",
          fontWeight: 700
        }}
      >
        Add
      </button>

    </div>
  )
}