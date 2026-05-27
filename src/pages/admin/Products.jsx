import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../../services/api"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const BASE_URL = API_URL.replace(/\/api\/?$/, "")

const resolveImageUrl = (value = "") => {
  if (!value) return "/image_placeholder/placeholder.png"
  if (value.startsWith("http")) return value
  if (value.startsWith("/uploads")) return `${BASE_URL}${value}`
  if (value.startsWith("uploads")) return `${BASE_URL}/${value}`

  return `${BASE_URL}/uploads/${value}`
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchProducts = async () => {
      try {
        const res = await api.get("/products")

        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.data || []

        if (mounted) {
          setProducts(list)
        }
      } catch (err) {
        console.error("❌ LOAD PRODUCTS ERROR:", err)
        toast.error("Failed to load products")
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchProducts()

    return () => {
      mounted = false
    }
  }, [])

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this product?")
    if (!confirmDelete) return

    try {
      await api.delete(`/products/${id}`)

      setProducts((prev) =>
        prev.filter((product) => product._id !== id)
      )

      toast.success("Product deleted")
    } catch (err) {
      console.error("❌ DELETE PRODUCT ERROR:", err)
      toast.error("Delete failed")
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        <p className="text-slate-300">Loading products...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="mx-auto max-w-6xl p-6">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              SignaVi Studio
            </p>

            <h1 className="text-4xl font-extrabold">
              Products
            </h1>

            <p className="mt-3 text-slate-400">
              Manage your storefront products, pricing, images, and inventory.
            </p>
          </div>

          <Link
            to="/admin/new-product"
            className="rounded-2xl bg-cyan-500 px-5 py-3 text-center font-bold text-black transition hover:bg-cyan-400"
          >
            ➕ New Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 text-slate-300">
            No products found.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product._id}
                className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-black/20"
              >
                <img
                  src={resolveImageUrl(product.image)}
                  alt={product.name || "Product"}
                  className="h-56 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "/image_placeholder/placeholder.png"
                  }}
                />

                <div className="p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-extrabold">
                        {product.name || "Untitled Product"}
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        {product.category || "Uncategorized"}
                      </p>
                    </div>

                    <span className="rounded-full bg-cyan-400 px-3 py-1 text-sm font-black text-black">
                      ${Number(product.price || 0).toFixed(2)}
                    </span>
                  </div>

                  <p className="mb-5 line-clamp-2 text-sm text-slate-400">
                    {product.description || "No description added."}
                  </p>

                  <div className="mb-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-800 bg-[#020617] p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500">
                        Stock
                      </p>

                      <p className="mt-1 text-lg font-black">
                        {product.stock ?? product.quantity ?? 0}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-[#020617] p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500">
                        Variants
                      </p>

                      <p className="mt-1 text-lg font-black">
                        {product.variants?.length || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to={`/admin/products/edit/${product._id}`}
                      className="flex-1 rounded-2xl border border-cyan-500 px-4 py-3 text-center font-bold text-cyan-300 transition hover:bg-cyan-500 hover:text-black"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 rounded-2xl bg-red-500 px-4 py-3 font-bold text-white transition hover:bg-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}