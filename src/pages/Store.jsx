import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
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

const money = (value = 0) => `$${Number(value || 0).toFixed(2)}`

const getAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem("adminUser") || "null")
  } catch {
    return null
  }
}

export default function Store() {
  const navigate = useNavigate()
  const { addToCart } = useCartContext()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [selected, setSelected] = useState({})
  const [imageIndex, setImageIndex] = useState({})
  const [quantity, setQuantity] = useState({})
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const [sort, setSort] = useState("newest")

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist") || "[]")
    } catch {
      return []
    }
  })

  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recentlyViewed") || "[]")
    } catch {
      return []
    }
  })

  const [zoomImage, setZoomImage] = useState(null)
  const [sizeChartOpen, setSizeChartOpen] = useState(false)
  const [artworkFiles, setArtworkFiles] = useState({})
  const [personalization, setPersonalization] = useState({})
  const [mockupPreview, setMockupPreview] = useState(null)

  const scrollerRefs = useRef({})
  const dragState = useRef({})

  const adminUser = getAdminUser()
  const isAdmin = adminUser?.role === "admin"

  const BASE_URL =
    import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
    "https://signavi-backend.onrender.com"

  const resolve = (img) => {
    if (!img || typeof img !== "string") return "/image_placeholder/placeholder.png"
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
        const res = await api.get("/products", {
          params: {
            storefrontVisible: true,
            storefront: "signavi"
          }
        })

        const productData = Array.isArray(res.data)
          ? res.data
          : res.data?.data || []

        if (isMounted) setProducts(productData)
      } catch (err) {
        console.error("❌ STORE PRODUCTS ERROR:", err.response?.data || err)
        if (isMounted) setProducts([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }, 0)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist))
  }, [wishlist])

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(products.map((p) => safeText(p.category)).filter(Boolean))
    ]
  }, [products])

  const filteredProducts = useMemo(() => {
    const text = query.trim().toLowerCase()

    const filtered = products.filter((product) => {
      const matchesSearch =
        !text ||
        safeText(product.name).toLowerCase().includes(text) ||
        safeText(product.category).toLowerCase().includes(text) ||
        safeText(product.description).toLowerCase().includes(text)

      const matchesCategory =
        category === "All" || safeText(product.category) === category

      return matchesSearch && matchesCategory
    })

    return filtered.sort((a, b) => {
      const priceA = getProductPrice(a)
      const priceB = getProductPrice(b)

      if (sort === "priceLow") return priceA - priceB
      if (sort === "priceHigh") return priceB - priceA
      if (sort === "name") return safeText(a.name).localeCompare(safeText(b.name))

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  }, [products, query, category, sort])

  const scroll = (id, dir) => {
    const el = scrollerRefs.current[id]
    if (!el) return

    el.scrollBy({
      left: dir === "left" ? -120 : 120,
      behavior: "smooth"
    })
  }

  const handleMouseDown = (event, id) => {
    const el = scrollerRefs.current[id]
    if (!el) return

    dragState.current[id] = {
      isDown: true,
      startX: event.pageX,
      scrollLeft: el.scrollLeft
    }
  }

  const handleMouseMove = (event, id) => {
    const state = dragState.current[id]
    const el = scrollerRefs.current[id]

    if (!state?.isDown || !el) return

    const walk = (event.pageX - state.startX) * 1.5
    el.scrollLeft = state.scrollLeft - walk
  }

  const handleMouseUp = (id) => {
    if (dragState.current[id]) dragState.current[id].isDown = false
  }

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const addRecent = (product) => {
    const next = [
      {
        _id: product._id,
        name: product.name,
        image: getProductImages(product, selected[product._id]?.color)[0],
        price: getProductPrice(product)
      },
      ...recentlyViewed.filter((item) => item._id !== product._id)
    ].slice(0, 4)

    setRecentlyViewed(next)
    localStorage.setItem("recentlyViewed", JSON.stringify(next))
  }

  const handleAddToCart = ({
    product,
    variant,
    mainImage,
    price,
    productType,
    stock
  }) => {
    const productId = product._id
    const qty = quantity[productId] || 1

    if (stock <= 0) {
      toast.error("This item is out of stock")
      return
    }

    const added = addToCart({
      productId,
      name: safeText(product.name, "Product"),
      image: mainImage,
      quantity: qty,
      price,
      productType,
      selectedVariant: variant ? { ...variant, price } : null,
      artworkFileName: artworkFiles[productId]?.name || "",
      personalization: personalization[productId] || ""
    })

    if (added) {
      addRecent(product)
      toast.success("Added to cart")
    } else {
      toast.error("Could not add item to cart")
    }
  }

  const handleBuyNow = async ({
    product,
    variant,
    mainImage,
    price,
    productType
  }) => {
    try {
      const productId = product._id
      const qty = quantity[productId] || 1
      const subtotal = price * qty
      const tax = subtotal * 0.0825

      const res = await api.post("/orders", {
        email:
          JSON.parse(localStorage.getItem("customerUser") || "null")?.email ||
          "guest@signavi.com",
        customerName:
          JSON.parse(localStorage.getItem("customerUser") || "null")?.name ||
          "Guest Customer",
        source: "store",
        status: "payment_required",
        items: [
          {
            productId,
            name: safeText(product.name, "Product"),
            quantity: qty,
            price,
            image: mainImage,
            productType,
            variant: variant ? { ...variant, price } : null,
            artworkFileName: artworkFiles[productId]?.name || "",
            personalization: personalization[productId] || ""
          }
        ],
        subtotal,
        tax,
        finalPrice: subtotal + tax
      })

      const order = res.data?.data || res.data?.order || res.data

      if (!order?._id) throw new Error("No order ID returned")

      localStorage.setItem("lastOrderId", order._id)
      addRecent(product)
      navigate(`/client-checkout/${order._id}`)
    } catch (err) {
      console.error("❌ BUY NOW ERROR:", err.response?.data || err)
      toast.error(err.response?.data?.message || "Buy now failed")
    }
  }

  const handleQuickStock = async (product, newStock) => {
    try {
      await api.put(`/products/${product._id}`, {
        ...product,
        stock: Number(newStock)
      })

      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id
            ? { ...p, stock: Number(newStock) }
            : p
        )
      )

      toast.success("Stock updated")
    } catch (err) {
      console.error("❌ STOCK UPDATE ERROR:", err.response?.data || err)
      toast.error("Stock update failed")
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] px-6 py-20 text-white">
        <p className="text-center text-slate-400">Loading products...</p>
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

        <div className="mb-6 grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/20 backdrop-blur md:grid-cols-[1fr_auto_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
          >
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
          >
            <option value="newest">Newest</option>
            <option value="name">Name A-Z</option>
            <option value="priceLow">Price Low</option>
            <option value="priceHigh">Price High</option>
          </select>
        </div>

        <div className="mb-10 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={
                category === cat
                  ? "rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-black"
                  : "rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-cyan-400 hover:text-cyan-300"
              }
            >
              {cat}
            </button>
          ))}
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

              const images = getProductImages(product, activeColor)
              const idx = imageIndex[productId] || 0
              const safeIdx = idx >= images.length ? 0 : idx
              const mainImage = resolve(images[safeIdx] || images[0])

              const basePrice = getProductPrice(product, variant)
              const qty = quantity[productId] || 1
              const price = getDiscountedPrice(basePrice, qty, product)
              const salePrice = Number(product.salePrice || 0)
              const hasSale = salePrice > 0 && salePrice < basePrice

              const stock =
                variant?.stock ??
                variant?.quantity ??
                product.stock ??
                product.quantity ??
                0

              const reviews = product.reviews || []
              const avgRating =
                reviews.length > 0
                  ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
                    reviews.length
                  : Number(product.rating || 0)

              const related = products
                .filter(
                  (p) =>
                    p._id !== productId &&
                    safeText(p.category) === safeText(product.category)
                )
                .slice(0, 3)

              return (
                <article
                  key={productId}
                  className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500"
                >
                  <div className="relative h-72 overflow-hidden bg-slate-900">
                    <button
                      type="button"
                      onClick={() => setZoomImage(mainImage)}
                      className="h-full w-full"
                    >
                      <img
                        src={mainImage}
                        alt={productName}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.src =
                            "/image_placeholder/placeholder.png"
                        }}
                      />
                    </button>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

                    {safeText(product.category) && (
                      <span className="absolute left-4 top-4 rounded-full border border-cyan-400/30 bg-black/70 px-3 py-1 text-xs font-semibold text-cyan-300">
                        {safeText(product.category)}
                      </span>
                    )}

                    {hasSale && (
                      <span className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                        Sale
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleWishlist(productId)}
                      className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-2 text-lg"
                    >
                      {wishlist.includes(productId) ? "❤️" : "🤍"}
                    </button>
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
                        onMouseDown={(event) => handleMouseDown(event, productId)}
                        onMouseMove={(event) => handleMouseMove(event, productId)}
                        onMouseLeave={() => handleMouseUp(productId)}
                        onMouseUp={() => handleMouseUp(productId)}
                        className="flex flex-1 gap-2 overflow-x-auto"
                      >
                        {images.map((img, index) => (
                          <button
                            key={`${img}-${index}`}
                            type="button"
                            onClick={() =>
                              setImageIndex((prev) => ({
                                ...prev,
                                [productId]: index
                              }))
                            }
                            className={
                              index === safeIdx
                                ? "h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 border-cyan-400"
                                : "h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-700"
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

                    <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-slate-400">
                      {safeText(product.description, "Custom SignaVi product")}
                    </p>

                    <div className="mb-4 flex items-center justify-between text-sm">
                      <span className="text-yellow-300">
                        ⭐ {avgRating ? avgRating.toFixed(1) : "New"}
                      </span>

                      <button
                        type="button"
                        onClick={() => setSizeChartOpen(true)}
                        className="text-cyan-300 hover:text-cyan-200"
                      >
                        Size Chart
                      </button>
                    </div>

                    {colors.length > 0 && (
                      <OptionButtons
                        label="Color"
                        options={colors}
                        active={activeColor}
                        onSelect={(color) => {
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
                      />
                    )}

                    {sizes.length > 0 && (
                      <OptionButtons
                        label="Size"
                        options={sizes}
                        active={activeSize}
                        onSelect={(size) =>
                          setSelected((prev) => ({
                            ...prev,
                            [productId]: {
                              ...prev[productId],
                              size
                            }
                          }))
                        }
                      />
                    )}

                    <div className="mb-4">
                      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                        Quantity
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((prev) => ({
                              ...prev,
                              [productId]: Math.max(1, qty - 1)
                            }))
                          }
                          className="rounded-xl border border-slate-700 px-3 py-2"
                        >
                          -
                        </button>

                        <input
                          type="number"
                          min="1"
                          value={qty}
                          onChange={(event) =>
                            setQuantity((prev) => ({
                              ...prev,
                              [productId]: Math.max(1, Number(event.target.value || 1))
                            }))
                          }
                          className="w-full rounded-xl border border-slate-700 bg-[#020617] px-3 py-2 text-center"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((prev) => ({
                              ...prev,
                              [productId]: qty + 1
                            }))
                          }
                          className="rounded-xl border border-slate-700 px-3 py-2"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="mb-4 rounded-2xl border border-slate-800 bg-[#020617] p-4">
                      <p className="text-xs text-slate-500">
                        SignaVi Options
                      </p>

                      <input
                        type="text"
                        placeholder="Laser text / personalization"
                        value={personalization[productId] || ""}
                        onChange={(event) =>
                          setPersonalization((prev) => ({
                            ...prev,
                            [productId]: event.target.value
                          }))
                        }
                        className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                      />

                      <input
                        type="file"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null

                          setArtworkFiles((prev) => ({
                            ...prev,
                            [productId]: file
                          }))

                          if (file && file.type.startsWith("image")) {
                            setMockupPreview(URL.createObjectURL(file))
                          }
                        }}
                        className="mt-3 w-full text-xs text-slate-400"
                      />

                      {artworkFiles[productId] && (
                        <p className="mt-2 text-xs text-cyan-300">
                          Artwork: {artworkFiles[productId].name}
                        </p>
                      )}

                      {mockupPreview && artworkFiles[productId] && (
                        <img
                          src={mockupPreview}
                          alt="Mockup preview"
                          className="mt-3 max-h-32 w-full rounded-xl object-contain"
                        />
                      )}
                    </div>

                    <PricingNotice product={product} qty={qty} />

                    <div className="mt-6">
                      <p className="text-xs text-slate-500">Starting at</p>

                      <div className="flex items-end gap-3">
                        {hasSale && (
                          <span className="text-lg text-slate-500 line-through">
                            {money(basePrice)}
                          </span>
                        )}

                        <strong className="text-3xl font-bold text-cyan-400">
                          {money(hasSale ? salePrice : price)}
                        </strong>
                      </div>

                      <p
                        className={
                          stock <= 3
                            ? "mt-1 text-xs font-bold text-red-400"
                            : "mt-1 text-xs text-slate-500"
                        }
                      >
                        {stock <= 0
                          ? "Out of stock"
                          : stock <= 3
                            ? `Only ${stock} left`
                            : `In Stock: ${stock}`}
                      </p>
                    </div>

                    {isAdmin && (
                      <div className="mt-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
                          Admin Tools
                        </p>

                        <div className="grid gap-2">
                          <Link
                            to={`/admin/products/edit/${productId}`}
                            className="rounded-xl border border-yellow-500/30 px-3 py-2 text-center text-sm font-bold text-yellow-300"
                          >
                            Edit Product
                          </Link>

                          <input
                            type="number"
                            placeholder="Quick stock"
                            onBlur={(event) => {
                              if (event.target.value) {
                                handleQuickStock(product, event.target.value)
                              }
                            }}
                            className="rounded-xl border border-slate-700 bg-[#020617] px-3 py-2 text-sm"
                          />

                          <Link
                            to={`/admin/products/${productId}/variants`}
                            className="rounded-xl border border-slate-700 px-3 py-2 text-center text-sm"
                          >
                            Variant Manager
                          </Link>

                          <p className="text-xs text-slate-400">
                            Sold: {product.sold || 0} | Revenue:{" "}
                            {money(product.revenue || 0)}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 grid gap-3">
                      <Link
                        to={`/product/${productId}`}
                        onClick={() => addRecent(product)}
                        className="block w-full rounded-xl border border-slate-700 px-4 py-3 text-center font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                      >
                        View Details
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleAddToCart({
                            product,
                            variant,
                            mainImage,
                            price: hasSale ? salePrice : price,
                            productType,
                            stock
                          })
                        }
                        className="rounded-xl bg-cyan-500 px-4 py-3 font-bold text-black transition hover:bg-cyan-400"
                      >
                        Add To Cart
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleBuyNow({
                            product,
                            variant,
                            mainImage,
                            price: hasSale ? salePrice : price,
                            productType
                          })
                        }
                        className="rounded-xl bg-emerald-500 px-4 py-3 font-bold text-black transition hover:bg-emerald-400"
                      >
                        Buy Now
                      </button>

                      <Link
                        to={`/quote?service=${encodeURIComponent(productName)}`}
                        className="rounded-xl border border-cyan-400/40 px-4 py-3 text-center font-bold text-cyan-300 transition hover:bg-cyan-400 hover:text-black"
                      >
                        Custom Quote
                      </Link>
                    </div>

                    {related.length > 0 && (
                      <div className="mt-5 border-t border-slate-800 pt-4">
                        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                          Related
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {related.map((item) => (
                            <Link
                              key={item._id}
                              to={`/product/${item._id}`}
                              className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-cyan-400"
                            >
                              {safeText(item.name, "Product")}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {recentlyViewed.length > 0 && (
          <section className="mt-16 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <h2 className="mb-5 text-2xl font-bold">Recently Viewed</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentlyViewed.map((item) => (
                <Link
                  key={item._id}
                  to={`/product/${item._id}`}
                  className="rounded-2xl border border-slate-800 bg-[#020617] p-4 hover:border-cyan-500"
                >
                  <img
                    src={resolve(item.image)}
                    alt={item.name}
                    className="mb-3 h-32 w-full rounded-xl object-cover"
                  />

                  <p className="font-bold">{item.name}</p>
                  <p className="text-cyan-300">{money(item.price)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>

      {zoomImage && (
        <button
          type="button"
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
        >
          <img
            src={zoomImage}
            alt="Zoom"
            className="max-h-[90vh] max-w-[90vw] rounded-3xl object-contain"
          />
        </button>
      )}

      {sizeChartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-950 p-6">
            <h2 className="mb-4 text-2xl font-bold">Size Chart</h2>

            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              {["Size", "Chest", "Length", "Sleeve"].map((h) => (
                <strong key={h} className="rounded bg-slate-800 p-2">
                  {h}
                </strong>
              ))}

              {[
                ["S", "18", "28", "16"],
                ["M", "20", "29", "17"],
                ["L", "22", "30", "18"],
                ["XL", "24", "31", "19"],
                ["2XL", "26", "32", "20"]
              ].flatMap((row) =>
                row.map((cell, index) => (
                  <span key={`${row[0]}-${index}`} className="rounded bg-[#020617] p-2">
                    {cell}
                  </span>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => setSizeChartOpen(false)}
              className="mt-6 w-full rounded-xl bg-cyan-500 px-4 py-3 font-bold text-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

function OptionButtons({ label, options, active, onSelect }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={
              active === option
                ? "rounded-full border border-cyan-400 bg-cyan-400 px-3 py-1 text-xs font-bold text-black"
                : "rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
            }
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function PricingNotice({ product, qty }) {
  const category = safeText(product.category).toLowerCase()
  const name = safeText(product.name).toLowerCase()

  let text = "Bulk pricing may apply at higher quantities."

  if (category.includes("dtf") || name.includes("dtf")) {
    text = "DTF gang sheet pricing available for multi-design orders."
  }

  if (category.includes("screen") || name.includes("screen")) {
    text =
      qty >= 48
        ? "Screen print quantity discount applied."
        : "Screen print discounts usually improve at 24, 48, and 100+ pieces."
  }

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-xs text-cyan-200">
      {text}
    </div>
  )
}

function getProductImages(product, activeColor) {
  const variants = product.variants || []

  const images = [
    ...new Set(
      variants
        .filter((v) => !activeColor || safeText(v.color, "") === activeColor)
        .flatMap((v) => v.images || [])
    )
  ]

  if (images.length === 0 && product.image) images.push(product.image)
  if (images.length === 0 && product.imageUrl) images.push(product.imageUrl)
  if (images.length === 0 && product.images?.length) images.push(...product.images)
  if (images.length === 0) images.push("/image_placeholder/placeholder.png")

  return images
}

function getProductPrice(product, variant = null) {
  const variantPrices = product.variants
    ?.map((v) => Number(v.price || v.basePrice || v.listPrice || 0))
    .filter((price) => price > 0)

  return Number(
    variant?.price ||
      variant?.basePrice ||
      variant?.listPrice ||
      (variantPrices?.length ? Math.min(...variantPrices) : 0) ||
      product.price ||
      product.basePrice ||
      product.listPrice ||
      product.finalPrice ||
      0
  )
}

function getDiscountedPrice(basePrice, qty, product) {
  const category = safeText(product.category).toLowerCase()
  const name = safeText(product.name).toLowerCase()

  if (category.includes("screen") || name.includes("screen")) {
    if (qty >= 100) return basePrice * 0.75
    if (qty >= 48) return basePrice * 0.85
    if (qty >= 24) return basePrice * 0.92
  }

  if (category.includes("dtf") || name.includes("dtf")) {
    if (qty >= 10) return basePrice * 0.9
  }

  return basePrice
}