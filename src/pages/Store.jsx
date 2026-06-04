import { useEffect, useMemo, useState } from "react"
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

export default function Store() {
  const navigate = useNavigate()
  const { addToCart } = useCartContext()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
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
      const priceA = getDisplayPricing(a).displayPrice
      const priceB = getDisplayPricing(b).displayPrice

      if (sort === "priceLow") return priceA - priceB
      if (sort === "priceHigh") return priceB - priceA
      if (sort === "name") {
        return safeText(a.name).localeCompare(safeText(b.name))
      }

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  }, [products, query, category, sort])

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const addRecent = (product) => {
    const pricing = getDisplayPricing(product)

    const next = [
      {
        _id: product._id,
        name: product.name,
        image: getProductImages(product)[0],
        price: pricing.displayPrice
      },
      ...recentlyViewed.filter((item) => item._id !== product._id)
    ].slice(0, 4)

    setRecentlyViewed(next)
    localStorage.setItem("recentlyViewed", JSON.stringify(next))
  }

  const handleAddToCart = ({
    product,
    mainImage,
    price,
    regularPrice,
    productType,
    stock
  }) => {
    const productId = product._id
    const qty = quantity[productId] || 1

    if (stock <= 0) {
      toast.error("This item is out of stock")
      return
    }

    const cartPrice = Number(price || 0)
    const originalPrice = Number(regularPrice || cartPrice || 0)

    const cartItem = {
      productId,
      _id: productId,
      id: productId,
      name: safeText(product.name, "Product"),
      image: mainImage,
      quantity: qty,

      price: cartPrice,
      unitPrice: cartPrice,
      salePrice: cartPrice,
      finalPrice: cartPrice,

      originalPrice,
      regularPrice: originalPrice,
      listPrice: originalPrice,

      discountActive: Boolean(product.discountActive),
      discountType: product.discountType || "",
      discountValue: Number(product.discountValue || 0),
      discountLabel: product.discountLabel || "",

      productType,
      selectedVariant: null
    }

    addToCart(cartItem)
    addRecent(product)
    toast.success("Added to cart")
  }

  const handleBuyNow = async ({
    product,
    mainImage,
    price,
    regularPrice,
    productType
  }) => {
    try {
      const productId = product._id
      const qty = quantity[productId] || 1
      const cartPrice = Number(price || 0)
      const originalPrice = Number(regularPrice || cartPrice || 0)
      const subtotal = cartPrice * qty
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

            price: cartPrice,
            unitPrice: cartPrice,
            salePrice: cartPrice,
            finalPrice: cartPrice,

            originalPrice,
            regularPrice: originalPrice,
            listPrice: originalPrice,

            discountActive: Boolean(product.discountActive),
            discountType: product.discountType || "",
            discountValue: Number(product.discountValue || 0),
            discountLabel: product.discountLabel || "",

            image: mainImage,
            productType,
            variant: null
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] px-6 py-20 text-white">
        <p className="text-center text-slate-400">Loading products...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Store
          </p>

          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-6xl">
            Custom Products
            <br />
            Built To Stand Out
          </h1>

          <p className="mx-auto max-w-3xl text-base leading-relaxed text-slate-400">
            Apparel, engraved products, promotional items, and creative
            merchandise crafted with quality and attention to detail.
          </p>
        </div>

        <div className="mb-5 grid gap-3 rounded-3xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl shadow-black/20 backdrop-blur md:grid-cols-[1fr_auto_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
          >
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
          >
            <option value="newest">Newest</option>
            <option value="name">Name A-Z</option>
            <option value="priceLow">Price Low</option>
            <option value="priceHigh">Price High</option>
          </select>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={
                category === cat
                  ? "rounded-full bg-cyan-400 px-3 py-1.5 text-xs font-bold text-black"
                  : "rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-400 hover:text-cyan-300"
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-12 text-center">
            <h2 className="mb-2 text-2xl font-bold text-white">
              No Products Found
            </h2>

            <p className="text-slate-400">
              Try another search term or check back soon for new products.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const productId = product._id
              const productName = safeText(product.name, "Product")
              const productType = safeText(product.productType, "physical")

              const images = getProductImages(product)
              const mainImage = resolve(images[0])

              const qty = quantity[productId] || 1
              const regularPrice = getRegularPrice(product)
              const salePrice = Number(product.salePrice || 0)

              const hasSale =
                product.discountActive === true &&
                salePrice > 0

              const displayPrice = hasSale
                ? salePrice
                : getDiscountedPrice(regularPrice, qty, product)

              const stock =
                product.stock ??
                product.quantity ??
                0

              const reviews = product.reviews || []
              const avgRating =
                reviews.length > 0
                  ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
                    reviews.length
                  : Number(product.rating || 0)

              return (
                <article
                  key={productId}
                  className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500"
                >
                  <div className="relative h-40 overflow-hidden bg-slate-900">
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
                      <span className="absolute left-3 top-3 rounded-full border border-cyan-400/30 bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
                        {safeText(product.category)}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleWishlist(productId)}
                      className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1.5 text-base"
                    >
                      {wishlist.includes(productId) ? "❤️" : "🤍"}
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="mb-1 line-clamp-2 text-lg font-bold">
                      {productName}
                    </h3>

                    <p className="mb-2 line-clamp-2 text-sm text-slate-400">
                      {safeText(product.description, "Custom SignaVi product")}
                    </p>

                    <div className="mb-3 flex items-center justify-between gap-2 text-xs">
                      <span className="text-yellow-300">
                        ⭐ {avgRating ? avgRating.toFixed(1) : "New"}
                      </span>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/product/${productId}`}
                          onClick={() => addRecent(product)}
                          className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                        >
                          View Info
                        </Link>

                        <button
                          type="button"
                          onClick={() => setSizeChartOpen(true)}
                          className="text-cyan-300 hover:text-cyan-200"
                        >
                          Size Chart
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
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
                          className="rounded-lg border border-slate-700 px-2.5 py-1 text-sm"
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
                              [productId]: Math.max(
                                1,
                                Number(event.target.value || 1)
                              )
                            }))
                          }
                          className="w-full rounded-lg border border-slate-700 bg-[#020617] px-2 py-1 text-center text-sm"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((prev) => ({
                              ...prev,
                              [productId]: qty + 1
                            }))
                          }
                          className="rounded-lg border border-slate-700 px-2.5 py-1 text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <PricingNotice product={product} qty={qty} />

                    <div className="mt-3 rounded-xl border border-slate-800 bg-[#020617] p-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                          Starting at
                        </p>

                        <div className="flex items-end gap-2">
                          {hasSale && (
                            <span className="text-xs text-slate-500 line-through">
                              {money(regularPrice)}
                            </span>
                          )}

                          <strong className="text-xl font-bold text-cyan-400">
                            {money(displayPrice)}
                          </strong>
                        </div>

                        <p
                          className={
                            stock <= 3
                              ? "mt-1 text-[10px] font-bold text-red-400"
                              : "mt-1 text-[10px] text-slate-500"
                          }
                        >
                          {stock <= 0
                            ? "Out of stock"
                            : stock <= 3
                              ? `Only ${stock} left`
                              : `In Stock: ${stock}`}
                        </p>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleAddToCart({
                              product,
                              mainImage,
                              price: displayPrice,
                              regularPrice,
                              productType,
                              stock
                            })
                          }
                          className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-bold text-black transition hover:bg-cyan-400"
                        >
                          Add Cart
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleBuyNow({
                              product,
                              mainImage,
                              price: displayPrice,
                              regularPrice,
                              productType
                            })
                          }
                          className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-black transition hover:bg-emerald-400"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {recentlyViewed.length > 0 && (
          <section className="mt-12 rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <h2 className="mb-4 text-2xl font-bold">Recently Viewed</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentlyViewed.map((item) => {
                const freshProduct =
                  products.find((product) => product._id === item._id) || item

                const pricing = getDisplayPricing(freshProduct)

                const freshImage =
                  getProductImages(freshProduct)[0] ||
                  item.image ||
                  "/image_placeholder/placeholder.png"

                return (
                  <Link
                    key={item._id}
                    to={`/product/${item._id}`}
                    className="rounded-2xl border border-slate-800 bg-[#020617] p-3 hover:border-cyan-500"
                  >
                    <img
                      src={resolve(freshImage)}
                      alt={safeText(freshProduct.name, item.name)}
                      className="mb-3 h-28 w-full rounded-xl object-cover"
                      onError={(event) => {
                        event.currentTarget.src =
                          "/image_placeholder/placeholder.png"
                      }}
                    />

                    <p className="font-bold">
                      {safeText(freshProduct.name, item.name)}
                    </p>

                    <p className="text-cyan-300">
                      {money(pricing.displayPrice)}
                    </p>
                  </Link>
                )
              })}
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
                  <span
                    key={`${row[0]}-${index}`}
                    className="rounded bg-[#020617] p-2"
                  >
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
        : "Screen print discounts improve at 24, 48, and 100+ pieces."
  }

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2 text-[11px] text-cyan-200">
      {text}
    </div>
  )
}

function getProductImages(product) {
  const variants = product.variants || []

  const images = [...new Set(variants.flatMap((v) => v.images || []))]

  if (images.length === 0 && product.image) images.push(product.image)
  if (images.length === 0 && product.imageUrl) images.push(product.imageUrl)
  if (images.length === 0 && product.images?.length) {
    images.push(...product.images)
  }
  if (images.length === 0) images.push("/image_placeholder/placeholder.png")

  return images
}

function getProductPrice(product) {
  const variantPrices = product.variants
    ?.map((v) => Number(v.price || v.basePrice || v.listPrice || 0))
    .filter((price) => price > 0)

  return Number(
    (variantPrices?.length ? Math.min(...variantPrices) : 0) ||
      product.price ||
      product.basePrice ||
      product.listPrice ||
      product.finalPrice ||
      0
  )
}

function getRegularPrice(product) {
  return Number(
    product.originalPrice ||
      product.listPrice ||
      product.price ||
      getProductPrice(product) ||
      0
  )
}

function getDisplayPricing(product) {
  const regularPrice = getRegularPrice(product)
  const salePrice = Number(product.salePrice || 0)

  const hasSale = product.discountActive === true && salePrice > 0

  return {
    regularPrice,
    salePrice,
    hasSale,
    displayPrice: hasSale ? salePrice : regularPrice
  }
}

function getDiscountedPrice(basePrice, qty, product) {
  const category = safeText(product.category).toLowerCase()
  const name = safeText(product.name).toLowerCase()

  if (product.discountActive && Number(product.salePrice || 0) > 0) {
    return Number(product.salePrice || basePrice)
  }

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