import { useMemo, useState } from "react"
import { useCartContext } from "../context/useCartContext"
import toast from "react-hot-toast"

const API_IMAGE_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "https://signavi-backend.onrender.com"

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
  if (img.startsWith("/uploads")) return `${API_IMAGE_BASE}${img}`
  if (img.startsWith("uploads")) return `${API_IMAGE_BASE}/${img}`

  return img
}

const getVariantStock = (variant = {}) => {
  return Number(variant.stock ?? variant.quantity ?? 0)
}

const getProductPrice = (product = {}, variant = null) => {
  return Number(
    variant?.price ||
      variant?.basePrice ||
      variant?.listPrice ||
      product?.price ||
      product?.basePrice ||
      product?.listPrice ||
      0
  )
}

export default function Card({ product }) {
  const { addToCart } = useCartContext()

  const [selected, setSelected] = useState({})
  const [imageIndex, setImageIndex] = useState(0)

  const productName = safeText(product?.name, "Product")
  const variants = useMemo(
    () => product?.variants || [],
    [product]
  )

  const colors = useMemo(() => {
    return [
      ...new Set(
        variants.map((variant) =>
          safeText(variant.color, "")
        )
      )
    ].filter(Boolean)
  }, [variants])

  const activeColor =
    selected.color ||
    colors[0] ||
    ""

  const colorVariants = useMemo(() => {
    if (!activeColor) return variants

    return variants.filter(
      (variant) =>
        safeText(variant.color, "") === activeColor
    )
  }, [variants, activeColor])

  const sizes = useMemo(() => {
    return [
      ...new Set(
        colorVariants.map((variant) =>
          safeText(variant.size, "")
        )
      )
    ].filter(Boolean)
  }, [colorVariants])

  const activeSize =
    selected.size ||
    sizes[0] ||
    ""

  const variant =
    variants.find(
      (item) =>
        safeText(item.color, "") === activeColor &&
        safeText(item.size, "") === activeSize
    ) ||
    colorVariants[0] ||
    variants[0] ||
    null

  const images = useMemo(() => {
    const variantImages = colorVariants.flatMap(
      (item) => item.images || []
    )

    const allImages = [
      ...variantImages,
      product?.image,
      product?.imageUrl,
      ...(product?.images || [])
    ].filter(Boolean)

    return [...new Set(allImages)]
  }, [
    colorVariants,
    product
  ])

  const safeIndex =
    imageIndex >= images.length
      ? 0
      : imageIndex

  const mainImage = resolveImageSafe(
    images[safeIndex] ||
      images[0] ||
      product?.image
  )

  const price = getProductPrice(product, variant)
  const stock = variant
    ? getVariantStock(variant)
    : Number(product?.stock ?? product?.quantity ?? 0)

  const outOfStock =
    variants.length > 0
      ? !variant || stock <= 0
      : stock <= 0

  const handleColorChange = (color) => {
    const firstVariant = variants.find(
      (item) =>
        safeText(item.color, "") === color
    )

    setSelected({
      color,
      size: safeText(firstVariant?.size, "")
    })

    setImageIndex(0)
  }

  const handleAddToCart = () => {
    if (outOfStock) {
      toast.error("This option is out of stock")
      return
    }

    if (variants.length > 0 && !variant) {
      toast.error("No variant available")
      return
    }

    addToCart({
      productId: product._id,
      name: productName,
      image: mainImage,
      quantity: 1,
      price,
      selectedVariant: variant
        ? {
            ...variant,
            color: activeColor,
            size: activeSize,
            price
          }
        : null
    })

    toast.success("Added to cart")
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 text-white shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-500">
      <div className="relative h-64 bg-white">
        <img
          src={mainImage}
          alt={productName}
          className="h-full w-full object-contain p-4"
          onError={(event) => {
            event.currentTarget.src =
              "/image_placeholder/placeholder.png"
          }}
        />

        {outOfStock && (
          <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
            Out of Stock
          </span>
        )}

        {!outOfStock && stock > 0 && (
          <span className="absolute left-4 top-4 rounded-full border border-emerald-400/40 bg-black/70 px-3 py-1 text-xs font-bold text-emerald-300">
            Stock: {stock}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-y border-slate-800 bg-[#020617] p-3">
          {images.map((img, index) => (
            <button
              key={`${img}-${index}`}
              type="button"
              onClick={() => setImageIndex(index)}
              className={
                index === safeIndex
                  ? "h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-cyan-400 bg-white"
                  : "h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-700 bg-white opacity-70 transition hover:opacity-100"
              }
            >
              <img
                src={resolveImageSafe(img)}
                alt={`${productName} thumbnail ${index + 1}`}
                className="h-full w-full object-contain p-1"
                onError={(event) => {
                  event.currentTarget.src =
                    "/image_placeholder/placeholder.png"
                }}
              />
            </button>
          ))}
        </div>
      )}

      <div className="p-5">
        <h3 className="text-xl font-extrabold">
          {productName}
        </h3>

        <p className="mt-2 text-2xl font-extrabold text-emerald-300">
          ${price.toFixed(2)}
        </p>

        {colors.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Color
            </p>

            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorChange(color)}
                  className={
                    activeColor === color
                      ? "rounded-full border border-cyan-400 bg-cyan-500/20 px-3 py-1 text-sm font-bold text-cyan-300"
                      : "rounded-full border border-slate-700 bg-[#020617] px-3 py-1 text-sm text-slate-300 hover:border-cyan-400 hover:text-cyan-300"
                  }
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Size
            </p>

            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const sizeVariant = variants.find(
                  (item) =>
                    safeText(item.color, "") === activeColor &&
                    safeText(item.size, "") === size
                )

                const sizeOutOfStock =
                  Number(
                    sizeVariant?.stock ??
                      sizeVariant?.quantity ??
                      0
                  ) <= 0

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={sizeOutOfStock}
                    onClick={() => {
                      setSelected((prev) => ({
                        ...prev,
                        color: activeColor,
                        size
                      }))
                    }}
                    className={
                      activeSize === size
                        ? "rounded-full border border-emerald-400 bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-300 disabled:opacity-40"
                        : "rounded-full border border-slate-700 bg-[#020617] px-3 py-1 text-sm text-slate-300 hover:border-emerald-400 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                    }
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="mt-6 w-full rounded-2xl bg-emerald-500 px-5 py-4 font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </article>
  )
}