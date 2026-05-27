import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
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
    import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
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

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/products/${id}`)
        const loadedProduct =
          res.data?.data ||
          res.data?.product ||
          res.data

        if (!isMounted) return

        setProduct(loadedProduct)
        setImageIndex(0)

        if (loadedProduct?.variants?.length) {
          const firstVariant = loadedProduct.variants[0]

          setSelectedColor(safeText(firstVariant.color, ""))
          setSelectedSize(safeText(firstVariant.size, ""))
        } else {
          setSelectedColor(null)
          setSelectedSize(null)
        }
      } catch (err) {
        if (!isMounted) return

        console.error(
          "❌ PRODUCT DETAIL ERROR:",
          err.response?.data || err
        )

        toast.error("Failed to load product")
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }, 0)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [id])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6 py-20 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

          <p className="text-slate-400">
            Loading product...
          </p>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#020617] px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-950 p-10 text-center">
          <h1 className="mb-3 text-3xl font-bold">
            Product Not Found
          </h1>

          <p className="mb-6 text-slate-400">
            This product may no longer be available.
          </p>

          <Link
            to="/store"
            className="inline-flex rounded-full bg-cyan-500 px-6 py-3 font-bold text-black transition hover:bg-cyan-400"
          >
            Back To Store
          </Link>
        </div>
      </main>
    )
  }

  const productName = safeText(product.name, "Product")

  const productDescription = safeText(
    product.description,
    "Custom SignaVi product made with quality and attention to detail."
  )

  const variants = Array.isArray(product.variants)
    ? product.variants
    : []

  const colors = [
    ...new Set(
      variants.map((variant) =>
        safeText(variant.color, "")
      )
    )
  ].filter(Boolean)

  const activeColor = selectedColor || colors[0] || ""

  const colorVariants = variants.filter(
    (variant) => safeText(variant.color, "") === activeColor
  )

  const sizes = [
    ...new Set(
      colorVariants.map((variant) =>
        safeText(variant.size, "")
      )
    )
  ].filter(Boolean)

  const activeSize = selectedSize || sizes[0] || ""

  const variant =
    variants.length > 0
      ? variants.find(
          (item) =>
            safeText(item.color, "") === activeColor &&
            safeText(item.size, "") === activeSize
        ) || colorVariants[0]
      : null

  const images = [
    ...new Set(
      variants
        .filter((item) => safeText(item.color, "") === activeColor)
        .flatMap((item) => item.images || [])
    )
  ]

  if (images.length === 0 && product.image) {
    images.push(product.image)
  }

  if (images.length === 0 && product.imageUrl) {
    images.push(product.imageUrl)
  }

  if (images.length === 0 && product.images?.length) {
    images.push(...product.images)
  }

  if (images.length === 0) {
    images.push("/image_placeholder/placeholder.png")
  }

  const safeIndex =
    imageIndex >= images.length
      ? 0
      : imageIndex

  const mainImage =
    resolve(images[safeIndex] || images[0])

  const price = Number(
    variant?.price ||
      variant?.basePrice ||
      variant?.listPrice ||
      product.price ||
      product.basePrice ||
      product.listPrice ||
      product.finalPrice ||
      0
  )

  const stock = Number(
    variant?.stock ??
      variant?.quantity ??
      product.stock ??
      product.quantity ??
      0
  )

  const category = safeText(product.category, "Custom Product")
  const sku = safeText(variant?.sku || product.sku, "N/A")

  const handleAddToCart = () => {
    if (typeof addToCart !== "function") {
      toast.error("Cart system unavailable")
      return
    }

    if (variants.length > 0 && !variant) {
      toast.error("Select color and size")
      return
    }

    if (stock <= 0) {
      toast.error("This option is out of stock")
      return
    }

    const added = addToCart({
      productId: product._id,
      name: productName,
      image: mainImage,
      quantity: 1,
      price,
      productType: safeText(product.productType, "physical"),
      selectedVariant: variant
        ? {
            ...variant,
            price
          }
        : null
    })

    if (added) {
      toast.success("Added to cart")
    } else {
      toast.error("Could not add item to cart")
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-7xl">
        <Link
          to="/store"
          className="mb-8 inline-flex text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back To Store
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl shadow-black/20">
              <img
                src={mainImage}
                alt={productName}
                className="h-[520px] w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src =
                    "/image_placeholder/placeholder.png"
                }}
              />
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => setImageIndex(index)}
                    className={
                      index === safeIndex
                        ? "h-20 w-20 overflow-hidden rounded-2xl border-2 border-cyan-400"
                        : "h-20 w-20 overflow-hidden rounded-2xl border border-slate-700"
                    }
                  >
                    <img
                      src={resolve(img)}
                      alt={`${productName} thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src =
                          "/image_placeholder/placeholder.png"
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-black/20">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              {category}
            </p>

            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              {productName}
            </h1>

            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300">
                {stock > 0 ? `${stock} Available` : "Out Of Stock"}
              </span>

              {product.featured && (
                <span className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black">
                  Featured
                </span>
              )}

              <span className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
                SKU: {sku}
              </span>
            </div>

            <p className="mb-3 text-sm text-slate-500">
              Starting at
            </p>

            <p className="mb-6 text-5xl font-extrabold text-cyan-400">
              ${price.toFixed(2)}
            </p>

            <p className="mb-8 leading-relaxed text-slate-400">
              {productDescription}
            </p>

            {colors.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Color
                </p>

                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        const firstSize = variants.find(
                          (item) =>
                            safeText(item.color, "") === color
                        )?.size

                        setSelectedColor(color)
                        setSelectedSize(safeText(firstSize, ""))
                        setImageIndex(0)
                      }}
                      className={
                        activeColor === color
                          ? "rounded-full border border-cyan-400 bg-cyan-400 px-4 py-2 text-sm font-bold text-black"
                          : "rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
                      }
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="mb-8">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Size
                </p>

                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const sizeVariant = variants.find(
                      (item) =>
                        safeText(item.color, "") === activeColor &&
                        safeText(item.size, "") === size
                    )

                    const outOfStock =
                      Number(
                        sizeVariant?.stock ??
                          sizeVariant?.quantity ??
                          0
                      ) <= 0

                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={outOfStock}
                        onClick={() => setSelectedSize(size)}
                        className={
                          activeSize === size
                            ? "rounded-full border border-cyan-400 bg-cyan-400 px-4 py-2 text-sm font-bold text-black"
                            : "rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
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
              disabled={stock <= 0}
              className="w-full rounded-2xl bg-cyan-500 px-6 py-4 text-lg font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {stock > 0 ? "Add To Cart" : "Out Of Stock"}
            </button>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <TrustBadge label="Veteran Owned" />
              <TrustBadge label="Secure Checkout" />
              <TrustBadge label="Local Pickup" />
              <TrustBadge label="Shipping Available" />
            </div>
          </div>
        </div>

        <section className="mt-14 grid gap-6 lg:grid-cols-3">
          <InfoPanel
            title="Product Details"
            items={[
              "Premium quality materials",
              "Custom production available",
              "Multiple sizes and color options",
              "Designed by SignaVi Studio"
            ]}
          />

          <InfoPanel
            title="Ordering Notes"
            items={[
              "Review selected size and color before checkout",
              "Availability may vary by product variant",
              "Custom requests may require a separate quote",
              "Bulk pricing may be available"
            ]}
          />

          <InfoPanel
            title="Pickup & Shipping"
            items={[
              "Local pickup may be available",
              "Shipping options depend on product type",
              "Tracking is provided when available",
              "Production time varies by order"
            ]}
          />
        </section>

        <section className="mt-16 rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-10 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Need This Customized?
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-slate-300">
            Want this product with your logo, artwork, business name, or
            custom design? Request a quote and we’ll review the details.
          </p>

          <Link
            to={`/quote?service=${encodeURIComponent(category)}`}
            className="inline-flex rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-105"
          >
            Request Custom Quote
          </Link>
        </section>
      </section>
    </main>
  )
}

function TrustBadge({ label }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#020617] px-4 py-3 text-center text-sm font-semibold text-cyan-300">
      {label}
    </div>
  )
}

function InfoPanel({ title, items }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
      <h3 className="mb-4 text-xl font-bold text-white">
        {title}
      </h3>

      <ul className="space-y-3 text-sm text-slate-400">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="text-cyan-300">
              ✓
            </span>

            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}