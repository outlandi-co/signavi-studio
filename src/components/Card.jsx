import { useState } from "react"
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

const resolveImageSafe = (img) => {
  if (!img || typeof img !== "string") {
    return "/image_placeholder/placeholder.png"
  }

  if (img.startsWith("data:image")) return img
  if (img.startsWith("http")) return img

  return `https://signavi-backend.onrender.com${img}`
}

export default function Card({ product }) {
  const { addToCart } = useCartContext()

  const [selected, setSelected] = useState({})
  const [imageIndex, setImageIndex] = useState(0)

  const productName = safeText(product?.name, "Product")
  const variants = product?.variants || []

  const colors = [
    ...new Set(variants.map(v => safeText(v.color, "")))
  ].filter(Boolean)

  const activeColor = selected.color || colors[0]

  const colorVariants = variants.filter(
    v => safeText(v.color, "") === activeColor
  )

  const sizes = [
    ...new Set(colorVariants.map(v => safeText(v.size, "")))
  ].filter(Boolean)

  const activeSize = selected.size || sizes[0]

  const variant = variants.find(
    v =>
      safeText(v.color, "") === activeColor &&
      safeText(v.size, "") === activeSize
  ) || colorVariants[0]

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
        alt={productName}
        style={{ width: "100%", height: 200, objectFit: "cover" }}
        onError={(e) => {
          e.currentTarget.src = "/image_placeholder/placeholder.png"
        }}
      />

      {images.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          {images.map((img, i) => (
            <img
              key={`${img}-${i}`}
              src={resolveImageSafe(img)}
              alt={`${productName} thumbnail ${i + 1}`}
              style={{
                width: 50,
                height: 50,
                objectFit: "cover",
                cursor: "pointer",
                border: i === safeIndex ? "2px solid #22c55e" : "1px solid #ccc"
              }}
              onClick={() => setImageIndex(i)}
              onError={(e) => {
                e.currentTarget.src = "/image_placeholder/placeholder.png"
              }}
            />
          ))}
        </div>
      )}

      <h3>{productName}</h3>

      <p>${price.toFixed(2)}</p>

      {colors.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {colors.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => {
                const firstSize = variants.find(
                  v => safeText(v.color, "") === color
                )?.size

                setSelected({
                  color,
                  size: safeText(firstSize, "")
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

      {sizes.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {sizes.map(size => {
            const sizeVariant = variants.find(
              v =>
                safeText(v.color, "") === activeColor &&
                safeText(v.size, "") === size
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