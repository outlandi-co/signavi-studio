import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
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

export default function Store() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState({})
  const [imageIndex, setImageIndex] = useState({})
  const [query, setQuery] = useState("")

  const { addToCart } = useCartContext()

  const scrollerRefs = useRef({})
  const dragState = useRef({})

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
        const res = await api.get("/products", {
          params: {
            storefrontVisible: true,
            storefront: "signavi"
          }
        })

        const productData = Array.isArray(res.data)
          ? res.data
          : res.data?.data || []

        if (isMounted) {
          setProducts(productData)
        }
      } catch (err) {
        console.error("❌ STORE PRODUCTS ERROR:", err.response?.data || err)

        if (isMounted) {
          setProducts([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    const timer = setTimeout(() => {
      load()
    }, 0)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [])

  const filteredProducts = products.filter((product) => {
    const text = query.toLowerCase()

    return (
      safeText(product.name).toLowerCase().includes(text) ||
      safeText(product.category).toLowerCase().includes(text) ||
      safeText(product.description).toLowerCase().includes(text)
    )
  })

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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] px-6 py-20 text-white">
        <p className="text-center text-slate-400">
          Loading products...
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Store
          </p>

          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
            Custom Products
            <br />
            Built To Stand Out
          </h1>

          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-400">
            Apparel, engraved products, promotional items, and creative
            merchandise crafted with quality and attention to detail.
          </p>
        </div>

        <div className="mb-10 rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/20 backdrop-blur">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-16 text-center">
            <h2 className="mb-2 text-2xl font-bold text-white">
              No Products Found
            </h2>

            <p className="text-slate-400">
              Try another search term or check back soon for new products.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const productId = product._id
              const productName = safeText(product.name, "Product")
              const productType = safeText(product.productType, "physical")

              const variants = product.variants || []
              const current = selected[productId] || {}

              const colors = [
                ...new Set(variants.map((v) => safeText(v.color, "")))
              ].filter(Boolean)

              const activeColor = current.color || colors[0]

              const colorVariants = variants.filter(
                (v) => safeText(v.color, "") === activeColor
              )

              const sizes = [
                ...new Set(colorVariants.map((v) => safeText(v.size, "")))
              ].filter(Boolean)

              const activeSize = current.size || sizes[0]

              const variant = variants.find(
                (v) =>
                  safeText(v.color, "") === activeColor &&
                  safeText(v.size, "") === activeSize
              )

              const images = [
                ...new Set(
                  variants
                    .filter((v) => safeText(v.color, "") === activeColor)
                    .flatMap((v) => v.images || [])
                )
              ]

              if (images.length === 0 && product.image) {
                images.push(product.image)
              }

              if (images.length === 0 && product.imageUrl) {
                images.push(product.imageUrl)
              }

              if (images.length === 0 && product.images?.length) {
                images.push(product.images[0])
              }

              const idx = imageIndex[productId] || 0
              const safeIdx = idx >= images.length ? 0 : idx
              const mainImage = resolve(images[safeIdx] || images[0])

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

              const stock =
                variant?.stock ??
                variant?.quantity ??
                product.stock ??
                product.quantity ??
                0

              return (
                <article
                  key={productId}
                  className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500"
                >
                  <div className="relative h-72 overflow-hidden bg-slate-900">
                    <img
                      src={mainImage}
                      alt={productName}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src =
                          "/image_placeholder/placeholder.png"
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

                    {safeText(product.category) && (
                      <span className="absolute left-4 top-4 rounded-full border border-cyan-400/30 bg-black/70 px-3 py-1 text-xs font-semibold text-cyan-300">
                        {safeText(product.category)}
                      </span>
                    )}

                    {product.featured && (
                      <span className="absolute right-4 top-4 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black">
                        Featured
                      </span>
                    )}
                  </div>

                  {images.length > 1 && (
                    <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => scroll(productId, "left")}
                        className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
                      >
                        ◀
                      </button>

                      <div
                        ref={(el) => {
                          if (el) scrollerRefs.current[productId] = el
                        }}
                        onMouseDown={(e) => handleMouseDown(e, productId)}
                        onMouseMove={(e) => handleMouseMove(e, productId)}
                        onMouseLeave={() => handleMouseUp(productId)}
                        onMouseUp={() => handleMouseUp(productId)}
                        className="flex flex-1 gap-2 overflow-x-auto"
                      >
                        {images.map((img, i) => (
                          <button
                            key={`${img}-${i}`}
                            type="button"
                            onClick={() =>
                              setImageIndex((prev) => ({
                                ...prev,
                                [productId]: i
                              }))
                            }
                            className={
                              i === safeIdx
                                ? "h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 border-cyan-400"
                                : "h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-700"
                            }
                          >
                            <img
                              src={resolve(img)}
                              alt={`${productName} thumbnail ${i + 1}`}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/image_placeholder/placeholder.png"
                              }}
                            />
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => scroll(productId, "right")}
                        className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
                      >
                        ▶
                      </button>
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="mb-2 text-2xl font-bold">
                      {productName}
                    </h3>

                    <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-slate-400">
                      {safeText(
                        product.description,
                        "Custom SignaVi product"
                      )}
                    </p>

                    {colors.length > 0 && (
                      <div className="mb-4">
                        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                          Color
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {colors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                const firstSize = variants.find(
                                  (v) => safeText(v.color, "") === color
                                )?.size

                                setSelected((prev) => ({
                                  ...prev,
                                  [productId]: {
                                    color,
                                    size: safeText(firstSize, "")
                                  }
                                }))

                                setImageIndex((prev) => ({
                                  ...prev,
                                  [productId]: 0
                                }))
                              }}
                              className={
                                activeColor === color
                                  ? "rounded-full border border-cyan-400 bg-cyan-400 px-3 py-1 text-xs font-bold text-black"
                                  : "rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
                              }
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {sizes.length > 0 && (
                      <div className="mb-5">
                        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                          Size
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {sizes.map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() =>
                                setSelected((prev) => ({
                                  ...prev,
                                  [productId]: {
                                    ...prev[productId],
                                    size
                                  }
                                }))
                              }
                              className={
                                activeSize === size
                                  ? "rounded-full border border-cyan-400 bg-cyan-400 px-3 py-1 text-xs font-bold text-black"
                                  : "rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
                              }
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs text-slate-500">
                          Starting at
                        </p>

                        <strong className="text-3xl font-bold text-cyan-400">
                          ${price.toFixed(2)}
                        </strong>

                        <p className="mt-1 text-xs text-slate-500">
                          In Stock: {stock}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3">
                      <Link
                        to={`/product/${productId}`}
                        className="block w-full rounded-xl border border-slate-700 px-4 py-3 text-center font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                      >
                        View Details
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          const added = addToCart({
                            productId,
                            name: productName,
                            image: mainImage,
                            quantity: 1,
                            price,
                            productType,
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
                        }}
                        className="rounded-xl bg-cyan-500 px-4 py-3 font-bold text-black transition hover:bg-cyan-400"
                      >
                        Add To Cart
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}