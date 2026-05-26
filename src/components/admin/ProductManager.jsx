import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react"

import {
  useNavigate
} from "react-router-dom"

import api from "../../services/api"
import toast from "react-hot-toast"

const API_IMAGE_BASE =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://signavi-backend.onrender.com"

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const getProductArray = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.products)) return data.products

  return []
}

const resolveImage = (image) => {
  if (!image) return "/image_placeholder/placeholder.png"
  if (typeof image !== "string") return "/image_placeholder/placeholder.png"

  if (image.startsWith("http")) return image
  if (image.startsWith("data:image")) return image
  if (image.startsWith("/uploads")) return `${API_IMAGE_BASE}${image}`
  if (image.startsWith("uploads")) return `${API_IMAGE_BASE}/${image}`

  return image
}

const getProductImage = (product = {}) => {
  const variantImage =
    product.variants
      ?.find((variant) => variant.images?.length)
      ?.images?.[0]

  const image =
    product.digitalProduct?.previewImage ||
    product.image ||
    product.imageUrl ||
    product.images?.[0] ||
    variantImage

  return resolveImage(image)
}

const getProductPrice = (product = {}) => {
  return Number(
    product.price ||
      product.basePrice ||
      product.listPrice ||
      product.variants?.[0]?.price ||
      0
  )
}

const getProductStock = (product = {}) => {
  if (product.variants?.length) {
    return product.variants.reduce(
      (sum, variant) =>
        sum + Number(variant.stock ?? variant.quantity ?? 0),
      0
    )
  }

  return Number(product.stock ?? product.quantity ?? 0)
}

const formatType = (type) => {
  if (!type) return "Physical"

  return String(type)
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const productMatchesSearch = (product = {}, search = "") => {
  if (!search.trim()) return true

  const term = search.trim().toLowerCase()

  return [
    product.name,
    product.sku,
    product.category,
    product.productType,
    product.description,
    product.vendor
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(term)
}

export default function ProductManager() {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)

      const res = await api.get("/products")
      setProducts(getProductArray(res.data))
    } catch (err) {
      console.error("❌ LOAD PRODUCTS ERROR:", err.response?.data || err)
      toast.error("Failed to load products")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts()
    }, 0)

    return () => clearTimeout(timer)
  }, [loadProducts])

  const filteredProducts = useMemo(() => {
    let data = [...products]

    if (typeFilter !== "all") {
      data = data.filter(
        (product) =>
          String(product.productType || "physical") === typeFilter
      )
    }

    data = data.filter((product) =>
      productMatchesSearch(product, search)
    )

    return data
  }, [
    products,
    search,
    typeFilter
  ])

  const totalProducts = products.length

  const physicalProducts = products.filter(
    (product) => String(product.productType || "physical") === "physical"
  ).length

  const digitalProducts = products.filter(
    (product) => product.productType === "digital"
  ).length

  const serviceProducts = products.filter(
    (product) => product.productType === "service"
  ).length

  const inventoryCount = products.reduce(
    (sum, product) => sum + getProductStock(product),
    0
  )

  const deleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This cannot be undone.`
    )

    if (!confirmed) return

    try {
      setDeletingId(product._id)

      await api.delete(`/products/${product._id}`)

      toast.success("Product deleted")

      setProducts((prev) =>
        prev.filter((item) => item._id !== product._id)
      )
    } catch (err) {
      console.error("❌ DELETE PRODUCT ERROR:", err.response?.data || err)
      toast.error(err.response?.data?.message || "Delete failed")
    } finally {
      setDeletingId(null)
    }
  }

  const editProduct = (product) => {
    navigate(`/admin/products/edit/${product._id}`)
  }

  const toggleStoreVisibility = async (product) => {
    try {
      const nextValue = !product.storefrontVisible

      await api.patch(`/products/${product._id}`, {
        storefrontVisible: nextValue
      })

      setProducts((prev) =>
        prev.map((item) =>
          item._id === product._id
            ? {
                ...item,
                storefrontVisible: nextValue
              }
            : item
        )
      )

      toast.success(
        nextValue
          ? "Product visible on storefront"
          : "Product hidden from storefront"
      )
    } catch (err) {
      console.error("❌ VISIBILITY ERROR:", err.response?.data || err)
      toast.error("Could not update visibility")
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-white shadow-xl shadow-black/20">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            Product Catalog
          </p>

          <h2 className="text-3xl font-extrabold">
            Current Products
          </h2>

          <p className="mt-2 text-slate-400">
            Manage products already saved in your store.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/products/create")}
            className="rounded-full bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
          >
            Add Product
          </button>

          <button
            type="button"
            onClick={loadProducts}
            className="rounded-full border border-slate-700 px-5 py-3 font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Total"
          value={totalProducts}
          accent="text-cyan-300"
        />

        <MetricCard
          label="Physical"
          value={physicalProducts}
          accent="text-emerald-300"
        />

        <MetricCard
          label="Digital"
          value={digitalProducts}
          accent="text-purple-300"
        />

        <MetricCard
          label="Services"
          value={serviceProducts}
          accent="text-blue-300"
        />

        <MetricCard
          label="Inventory"
          value={inventoryCount}
          accent="text-yellow-300"
        />
      </div>

      <div className="mb-6 rounded-3xl border border-slate-800 bg-[#020617] p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product, SKU, category, vendor..."
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
          />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
          >
            <option value="all">
              All Types
            </option>

            <option value="physical">
              Physical
            </option>

            <option value="digital">
              Digital
            </option>

            <option value="service">
              Service
            </option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400">
          Loading products...
        </p>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-[#020617] p-10 text-center">
          <h3 className="mb-3 text-2xl font-bold">
            No products found
          </h3>

          <p className="text-slate-400">
            Try changing your search or filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const price = getProductPrice(product)
            const stock = getProductStock(product)
            const productType = product.productType || "physical"

            return (
              <article
                key={product._id}
                className="overflow-hidden rounded-3xl border border-slate-800 bg-[#020617] shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-500"
              >
                <div className="relative h-56 bg-white">
                  <img
                    src={getProductImage(product)}
                    alt={product.name || "Product"}
                    className="h-full w-full object-contain p-4"
                    onError={(event) => {
                      event.currentTarget.src =
                        "/image_placeholder/placeholder.png"
                    }}
                  />

                  <span className="absolute left-4 top-4 rounded-full border border-cyan-400/30 bg-black/70 px-3 py-1 text-xs font-bold text-cyan-300">
                    {formatType(productType)}
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleStoreVisibility(product)}
                    className={
                      product.storefrontVisible
                        ? "absolute right-4 top-4 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300"
                        : "absolute right-4 top-4 rounded-full border border-slate-500/30 bg-black/70 px-3 py-1 text-xs font-bold text-slate-300"
                    }
                  >
                    {product.storefrontVisible ? "Visible" : "Hidden"}
                  </button>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-extrabold">
                    {product.name || "Untitled Product"}
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    {product.category || "general"}
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Info
                      label="Price"
                      value={money(price)}
                    />

                    <Info
                      label="Stock"
                      value={stock}
                    />

                    <Info
                      label="Variants"
                      value={product.variants?.length || 0}
                    />
                  </div>

                  {product.productType === "digital" && (
                    <p className="mt-4 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300">
                      Digital Download
                    </p>
                  )}

                  {product.digitalProduct?.licenseType && (
                    <p className="mt-3 text-sm text-slate-300">
                      License: {product.digitalProduct.licenseType}
                    </p>
                  )}

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => editProduct(product)}
                      className="rounded-xl bg-cyan-500 px-4 py-3 font-bold text-black transition hover:bg-cyan-400"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteProduct(product)}
                      disabled={deletingId === product._id}
                      className="rounded-xl bg-red-500 px-4 py-3 font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === product._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function MetricCard({
  label,
  value,
  accent
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#020617] p-5">
      <p className="mb-2 text-sm text-slate-400">
        {label}
      </p>

      <h3 className={`text-3xl font-extrabold ${accent}`}>
        {value}
      </h3>
    </div>
  )
}

function Info({
  label,
  value
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-white">
        {value}
      </p>
    </div>
  )
}