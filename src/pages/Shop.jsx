import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "")

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const normalizeProducts = (payload) => {
  const data =
    payload?.data ||
    payload?.products ||
    payload ||
    []

  return Array.isArray(data) ? data : []
}

const getProductImage = (product = {}) => {
  const variantImage = product.variants?.[0]?.images?.[0]
  const productImage = product.images?.[0]
  const image =
    variantImage ||
    productImage ||
    product.imageUrl ||
    product.image

  if (!image || typeof image !== "string") {
    return "/image_placeholder/placeholder.png"
  }

  if (image.startsWith("http")) return image
  if (image.startsWith("/uploads")) return `${BACKEND_URL}${image}`
  if (image.startsWith("uploads")) return `${BACKEND_URL}/${image}`

  return image
}

const getStartingPrice = (product = {}) => {
  const variantPrices = product.variants
    ?.map((variant) =>
      Number(
        variant.price ||
          variant.basePrice ||
          variant.listPrice ||
          0
      )
    )
    .filter((price) => price > 0)

  if (variantPrices?.length) {
    return Math.min(...variantPrices)
  }

  return Number(
    product.price ||
      product.basePrice ||
      product.listPrice ||
      product.finalPrice ||
      0
  )
}

export default function Shop() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError("")

        const res = await api.get("/products")

        if (!isMounted) return

        setProducts(normalizeProducts(res.data))
      } catch (err) {
        if (!isMounted) return

        console.error("❌ LOAD SHOP PRODUCTS ERROR:", err.response?.data || err)

        setProducts([])
        setError("Failed to load products")
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
  }, [])

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      )
    ]
  }, [products])

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesCategory =
        category === "All" ||
        product.category === category

      const matchesSearch =
        !term ||
        [
          product.name,
          product.description,
          product.category,
          product.sku
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)

      return matchesCategory && matchesSearch
    })
  }, [products, search, category])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading products...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold md:text-6xl">
            Shop Products
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Browse apparel, custom merch, promotional products, and ready-to-order items.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-3xl border border-red-500/40 bg-red-950/40 p-6 text-red-300">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <p className="mb-6 text-sm text-slate-500">
          Showing {filteredProducts.length} product
          {filteredProducts.length === 1 ? "" : "s"}
        </p>

        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-center shadow-xl shadow-black/20">
            <h2 className="mb-3 text-2xl font-bold">
              No Products Found
            </h2>

            <p className="text-slate-400">
              Try another search or category.
            </p>
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const image = getProductImage(product)
              const price = getStartingPrice(product)
              const variantCount = product.variants?.length || 0

              return (
                <article
                  key={product._id}
                  className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500"
                >
                  <Link to={`/products/${product._id}`}>
                    <div className="relative h-64 overflow-hidden bg-slate-900">
                      <img
                        src={image}
                        alt={product.name || "Product"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.src =
                            "/image_placeholder/placeholder.png"
                        }}
                      />

                      {product.category && (
                        <span className="absolute left-4 top-4 rounded-full border border-cyan-400/30 bg-black/70 px-4 py-1 text-xs font-semibold text-cyan-300">
                          {product.category}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-5">
                    <h2 className="mb-2 text-xl font-bold">
                      {product.name || "Product"}
                    </h2>

                    <p className="mb-4 text-sm leading-6 text-slate-400 line-clamp-2">
                      {product.description ||
                        "Custom product by SignaVi Studio."}
                    </p>

                    <p className="text-sm text-slate-500">
                      Starting at
                    </p>

                    <p className="mb-4 text-3xl font-extrabold text-cyan-300">
                      {money(price)}
                    </p>

                    {variantCount > 0 && (
                      <p className="mb-4 text-sm text-slate-500">
                        {variantCount} variant
                        {variantCount === 1 ? "" : "s"} available
                      </p>
                    )}

                    <div className="grid gap-3">
                      <Link
                        to={`/products/${product._id}`}
                        className="rounded-2xl bg-cyan-500 px-5 py-3 text-center font-bold text-black transition hover:bg-cyan-400"
                      >
                        View Product
                      </Link>

                      <Link
                        to={`/customize/${product._id}`}
                        className="rounded-2xl border border-slate-700 px-5 py-3 text-center font-bold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
                      >
                        Customize
                      </Link>
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