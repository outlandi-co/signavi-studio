import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../../services/api"

const BASE_URL =
  (import.meta.env.VITE_API_URL || "https://signavi-backend.onrender.com/api")
    .replace("/api", "")

export default function AdminProducts() {

  const [products, setProducts] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    const load = async () => {
      const res = await api.get("/products")
      setProducts(res.data)
    }
    load()
  }, [])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete product?")) return

    await api.delete(`/products/${id}`)
    setProducts(prev => prev.filter(p => p._id !== id))
  }

  return (
    <div className="p-6 bg-black text-white min-h-screen">

      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">📦 Products</h1>

        <Link
          to="/admin/products/new"
          className="bg-green-500 px-4 py-2 rounded text-black"
        >
          ➕ Add Product
        </Link>
      </div>

      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="p-2 bg-gray-800 rounded w-full mb-6"
      />

      <div className="grid grid-cols-4 gap-4">

        {filtered.map(p => (
          <div key={p._id} className="bg-gray-900 p-4 rounded">

            <img
              src={p.image ? `${BASE_URL}/${p.image}` : "/placeholder.png"}
              className="h-32 w-full object-cover rounded mb-2"
            />

            <h3>{p.name}</h3>
            <p>{p.category}</p>
            <p>${p.price}</p>

            <button
              onClick={() => deleteProduct(p._id)}
              className="mt-2 bg-red-500 px-2 py-1 rounded"
            >
              Delete
            </button>

          </div>
        ))}

      </div>

    </div>
  )
}