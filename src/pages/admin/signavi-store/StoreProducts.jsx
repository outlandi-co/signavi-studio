import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../../services/api"

const API_IMAGE_BASE =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://signavi-backend.onrender.com"

const money = (value = 0) =>
  Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })

const displayText = (value, fallback = "N/A") => {
  if (!value) return fallback
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)

  if (typeof value === "object") {
    return value.name || value.title || value.label || fallback
  }

  return fallback
}

const resolveImage = (image) => {
  if (!image || typeof image !== "string") {
    return "/image_placeholder/placeholder.png"
  }

  if (image.startsWith("http")) return image
  if (image.startsWith("data:image")) return image
  if (image.startsWith("/uploads")) return `${API_IMAGE_BASE}${image}`
  if (image.startsWith("uploads")) return `${API_IMAGE_BASE}/${image}`

  return image
}

const getProductImage = (product) => {
  const variantImage =
    product.variants?.find((variant) => variant.images?.length)?.images?.[0]

  return resolveImage(
    product.image ||
      product.imageUrl ||
      product.images?.[0] ||
      variantImage
  )
}

const getProductPrice = (product) => {
  return Number(
    product.listPrice ||
      product.price ||
      product.basePrice ||
      product.variants?.[0]?.price ||
      0
  )
}

const getProductStock = (product) => {
  if (product.variants?.length) {
    return product.variants.reduce(
      (sum, variant) =>
        sum + Number(variant.stock ?? variant.quantity ?? 0),
      0
    )
  }

  return Number(product.stock ?? product.quantity ?? 0)
}

export default function StoreProducts() {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const loadProducts = async () => {
    try {
      setLoading(true)

      const res = await api.get("/products", {
        params: {
          storefrontVisible: true,
          storefront: "signavi"
        }
      })

      const productData = Array.isArray(res.data)
        ? res.data
        : res.data?.data || []

      setProducts(productData)
    } catch (err) {
      console.error("❌ STORE PRODUCTS ERROR:", err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts()
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const filteredProducts = useMemo(() => {
    let data = [...products]

    if (typeFilter !== "all") {
      data = data.filter(
        (product) => displayText(product.productType, "physical") === typeFilter
      )
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase()

      data = data.filter((product) => {
        return (
          displayText(product.name).toLowerCase().includes(term) ||
          displayText(product.category).toLowerCase().includes(term) ||
          displayText(product.productType).toLowerCase().includes(term)
        )
      })
    }

    return data
  }, [products, search, typeFilter])

  const totalProducts = products.length

  const physicalProducts = products.filter(
    (product) => displayText(product.productType, "physical") === "physical"
  ).length

  const digitalProducts = products.filter(
    (product) => displayText(product.productType, "physical") === "digital"
  ).length

  const totalInventory = products.reduce(
    (sum, product) => sum + getProductStock(product),
    0
  )

  const hideProduct = async (id) => {
    const confirmHide = window.confirm(
      "Hide this product from signavi.store?"
    )

    if (!confirmHide) return

    try {
      await api.patch(`/products/${id}`, {
        storefrontVisible: false
      })

      setProducts((prev) =>
        prev.filter((product) => product._id !== id)
      )
    } catch (err) {
      console.error("❌ HIDE PRODUCT ERROR:", err)
      alert("Failed to hide product")
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        Loading store products...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              SignaVi Store
            </p>

            <h1 className="text-4xl font-extrabold md:text-5xl">
              Store Products
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Manage products currently visible on signavi.store.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/signavi-store/create")}
            className="rounded-full bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
          >
            Create Store Product
          </button>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Store Products" value={totalProducts} />
          <MetricCard label="Physical" value={physicalProducts} />
          <MetricCard label="Digital" value={digitalProducts} />
          <MetricCard label="Inventory" value={totalInventory} />
        </div>

        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_140px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            />

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            >
              <option value="all">All Types</option>
              <option value="physical">Physical</option>
              <option value="digital">Digital</option>
              <option value="service">Service</option>
            </select>

            <button
              type="button"
              onClick={loadProducts}
              className="rounded-2xl bg-slate-800 px-5 py-4 font-bold text-white transition hover:bg-slate-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-center">
            <h2 className="mb-3 text-2xl font-bold">
              No Store Products Found
            </h2>

            <p className="mb-6 text-slate-400">
              Create your first signavi.store product or adjust your filters.
            </p>

            <button
              type="button"
              onClick={() => navigate("/admin/signavi-store/create")}
              className="rounded-full bg-cyan-500 px-6 py-3 font-bold text-black transition hover:bg-cyan-400"
            >
              Create Product
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const price = getProductPrice(product)
              const stock = getProductStock(product)
              const image = getProductImage(product)

              return (
                <article
                  key={product._id}
                  className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-500"
                >
                  <div className="relative h-64 bg-[#020617]">
                    <img
                      src={image}
                      alt={displayText(product.name, "Store product")}
                      className="h-full w-full object-contain p-5"
                      onError={(event) => {
                        event.currentTarget.src =
                          "/image_placeholder/placeholder.png"
                      }}
                    />

                    <span className="absolute left-4 top-4 rounded-full border border-cyan-400/30 bg-black/70 px-3 py-1 text-xs font-bold text-cyan-300">
                      {displayText(product.productType, "physical")}
                    </span>

                    <span className="absolute right-4 top-4 rounded-full border border-emerald-400/30 bg-black/70 px-3 py-1 text-xs font-bold text-emerald-300">
                      Visible
                    </span>
                  </div>

                  <div className="p-6">
                    <h2 className="text-2xl font-bold">
                      {displayText(product.name, "Untitled Product")}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      {displayText(product.category, "No category")}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <Info label="Price" value={money(price)} />
                      <Info label="Stock" value={stock} />
                      <Info
                        label="Variants"
                        value={product.variants?.length || 0}
                      />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                        {displayText(product.storefront, "signavi")}
                      </span>

                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                        {displayText(product.salesChannel, "signavi_store")}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/admin/signavi-store/edit/${product._id}`)
                        }
                        className="rounded-xl bg-cyan-500 px-4 py-3 font-bold text-black transition hover:bg-cyan-400"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => hideProduct(product._id)}
                        className="rounded-xl bg-red-500 px-4 py-3 font-bold text-white transition hover:bg-red-400"
                      >
                        Hide
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

function MetricCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
      <p className="mb-2 text-sm text-slate-400">
        {label}
      </p>

      <h2 className="text-3xl font-extrabold text-cyan-300">
        {value}
      </h2>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#020617] p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-white">
        {value}
      </p>
    </div>
  )
}