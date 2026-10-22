import { SIGNAVI_V2_API_ORIGIN } from "../../../config/v2Api.js";
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../../services/api"

const API_IMAGE_BASE =
  SIGNAVI_V2_API_ORIGIN?.replace("/api", "") ||
  "https://signavi-backend-v2.onrender.com"

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

const getProductCost = (product) => {
  return Number(
    product.cost ||
      product.wholesaleCost ||
      product.unitCost ||
      product.baseCost ||
      product.variants?.[0]?.cost ||
      product.variants?.[0]?.unitCost ||
      0
  )
}

const getProductProfit = (product) => {
  const price = getProductPrice(product)
  const cost = getProductCost(product)

  return price - cost
}

const getProductMargin = (product) => {
  const price = getProductPrice(product)
  const profit = getProductProfit(product)

  if (!price || price <= 0) return 0

  return (profit / price) * 100
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
  const [busyProductId, setBusyProductId] = useState(null)

  const loadProducts = async () => {
    try {
      setLoading(true)

      const res = await api.get("/products", {
        params: {
          storefront: "signavi_store"
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
        (product) =>
          displayText(product.productType, "physical") === typeFilter
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

  const totalProfit = products.reduce(
    (sum, product) => sum + getProductProfit(product),
    0
  )

  const toggleProductVisibility = async (product) => {
    const nextVisible = product.storefrontVisible !== true
    const action = nextVisible ? "show" : "hide"

    if (!window.confirm(`Do you want to ${action} "${product.name}" on signavi.store?`)) {
      return
    }

    try {
      setBusyProductId(product._id)
      const response = await api.patch(`/products/${product._id}`, {
        storefrontVisible: nextVisible
      })

      if (response.data?.success === false) {
        throw new Error(response.data.message || "Visibility update failed")
      }

      setProducts((previous) =>
        previous.map((item) =>
          item._id === product._id
            ? { ...item, storefrontVisible: nextVisible }
            : item
        )
      )
    } catch (error) {
      console.error("STORE PRODUCT VISIBILITY ERROR:", error)
      alert(error.response?.data?.message || error.message || "Failed to update product visibility")
    } finally {
      setBusyProductId(null)
    }
  }

  const deleteProduct = async (product) => {
    if (!window.confirm(
      `PERMANENTLY DELETE "${product.name}"?\n\n` +
      "This removes the product record and cannot be undone. " +
      "Choose Cancel and use Hide if you may sell it again."
    )) {
      return
    }

    try {
      setBusyProductId(product._id)
      const response = await api.delete(`/products/${product._id}`)

      if (response.data?.success === false) {
        throw new Error(response.data.message || "Delete failed")
      }

      setProducts((previous) =>
        previous.filter((item) => item._id !== product._id)
      )
    } catch (error) {
      console.error("DELETE STORE PRODUCT ERROR:", error)
      alert(error.response?.data?.message || error.message || "Failed to delete product")
    } finally {
      setBusyProductId(null)
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

            <h1 className="text-4xl font-extrabold md:text-5xl text-red-500">
  STORE PRODUCTS PROFIT TEST
</h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Manage all signavi.store products, including hidden products.
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

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Store Products" value={totalProducts} />
          <MetricCard label="Physical" value={physicalProducts} />
          <MetricCard label="Digital" value={digitalProducts} />
          <MetricCard label="Inventory" value={totalInventory} />
          <MetricCard label="Projected Profit" value={money(totalProfit)} />
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
              const cost = getProductCost(product)
              const profit = getProductProfit(product)
              const margin = getProductMargin(product)
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

                    <span
                      className={`absolute right-4 top-4 rounded-full border bg-black/70 px-3 py-1 text-xs font-bold ${
                        product.storefrontVisible === true
                          ? "border-emerald-400/30 text-emerald-300"
                          : "border-amber-400/30 text-amber-300"
                      }`}
                    >
                      {product.storefrontVisible === true ? "Visible" : "Hidden"}
                    </span>
                  </div>

                  <div className="p-6">
                    <h2 className="text-2xl font-bold">
                      {displayText(product.name, "Untitled Product")}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      {displayText(product.category, "No category")}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <Info label="Price" value={money(price)} />
                      <Info label="Cost" value={money(cost)} />
                      <Info
                        label="Profit"
                        value={money(profit)}
                        valueClass={
                          profit >= 0
                            ? "text-emerald-300"
                            : "text-red-300"
                        }
                      />
                      <Info
                        label="Margin"
                        value={`${margin.toFixed(1)}%`}
                        valueClass={
                          margin >= 40
                            ? "text-emerald-300"
                            : margin >= 20
                              ? "text-yellow-300"
                              : "text-red-300"
                        }
                      />
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

                    <div className="mt-6 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        disabled={busyProductId === product._id}
                        onClick={() =>
                          navigate(`/admin/signavi-store/edit/${product._id}`)
                        }
                        className="rounded-xl bg-cyan-500 px-3 py-3 font-bold text-black transition hover:bg-cyan-400 disabled:opacity-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={busyProductId === product._id}
                        onClick={() => toggleProductVisibility(product)}
                        className={`rounded-xl px-3 py-3 font-bold text-black transition disabled:opacity-50 ${
                          product.storefrontVisible === true
                            ? "bg-amber-400 hover:bg-amber-300"
                            : "bg-emerald-400 hover:bg-emerald-300"
                        }`}
                      >
                        {product.storefrontVisible === true ? "Hide" : "Show"}
                      </button>

                      <button
                        type="button"
                        disabled={busyProductId === product._id}
                        onClick={() => deleteProduct(product)}
                        className="rounded-xl bg-red-500 px-3 py-3 font-bold text-white transition hover:bg-red-400 disabled:opacity-50"
                      >
                        Delete
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

function Info({ label, value, valueClass = "text-white" }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#020617] p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className={`mt-1 font-bold ${valueClass}`}>
        {value}
      </p>
    </div>
  )
}