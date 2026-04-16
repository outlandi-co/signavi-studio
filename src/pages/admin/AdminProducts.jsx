import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../../services/api"

const BASE_URL =
  (import.meta.env.VITE_API_URL || "https://signavi-backend.onrender.com/api")
    .replace("/api", "")

export default function AdminProducts() {

  const [products, setProducts] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  /* ================= LOAD ================= */
  const loadProducts = async () => {
    try {
      const res = await api.get("/products")

      const safe =
        Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : []

      setProducts(safe)

    } catch (err) {
      console.error("❌ LOAD PRODUCTS ERROR:", err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  /* ================= FILTER ================= */
  const filtered = products.filter(p =>
    p?.name?.toLowerCase().includes(search.toLowerCase())
  )

  /* ================= DELETE ================= */
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete product?")) return

    try {
      await api.delete(`/products/${id}`)
      setProducts(prev => prev.filter(p => p._id !== id))
    } catch (err) {
      console.error("❌ DELETE ERROR:", err)
      alert("Delete failed")
    }
  }

  /* ================= IMAGE HANDLER ================= */
  const getImage = (p) => {
    if (!p?.image) return "/placeholders/hoodie.png"

    if (p.image.startsWith("/uploads")) {
      return `${BASE_URL}${p.image}`
    }

    return p.image
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="p-6 bg-black text-white min-h-screen flex items-center justify-center">
        <h2>⏳ Loading products...</h2>
      </div>
    )
  }

  /* ================= EMPTY ================= */
  if (filtered.length === 0) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        <h1 className="text-3xl font-bold mb-6">📦 Products</h1>

        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 bg-gray-800 rounded w-full mb-6"
        />

        <p className="text-gray-400">No products found.</p>
      </div>
    )
  }

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-black text-white min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-3xl font-bold">📦 Products</h1>

        <Link
          to="/admin/products/new"
          className="bg-green-500 px-4 py-2 rounded text-black font-bold"
        >
          ➕ Add Product
        </Link>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="p-3 bg-gray-800 rounded w-full mb-6"
      />

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {filtered.map(p => (
          <div
            key={p._id}
            className="bg-gray-900 p-4 rounded-lg shadow hover:shadow-lg transition"
          >

            {/* IMAGE */}
            <img
              src={getImage(p)}
              alt={p.name}
              className="h-40 w-full object-cover rounded mb-3"
              onError={(e) => {
                e.target.src = "/placeholders/hoodie.png"
              }}
            />

            {/* INFO */}
            <h3 className="font-bold text-lg">{p.name}</h3>

            <p className="text-sm text-gray-400">
              {p.category || "general"}
            </p>

            <p className="text-green-400 font-bold mt-1">
              ${Number(p.price || 0).toFixed(2)}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Stock: {p.stock ?? 0}
            </p>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-4">

              <Link
                to={`/admin/products/edit/${p._id}`}
                className="flex-1 bg-blue-500 text-center py-1 rounded text-black font-bold"
              >
                Edit
              </Link>

              <button
                onClick={() => deleteProduct(p._id)}
                className="flex-1 bg-red-500 py-1 rounded text-black font-bold"
              >
                Delete
              </button>

            </div>

          </div>
        ))}

      </div>
    </div>
  )
}