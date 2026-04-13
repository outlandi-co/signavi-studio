import { useEffect, useState } from "react"
import api from "../../services/api"

const BASE_URL =
  (import.meta.env.VITE_API_URL || "https://signavi-backend.onrender.com/api")
    .replace("/api", "")

export default function AdminInventory() {

  const [products, setProducts] = useState([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const [selected, setSelected] = useState(null)
  const [editData, setEditData] = useState({})
  const [editPreview, setEditPreview] = useState(null)

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    cost: "",
    price: "",
    stock: "",
    image: null
  })

  const [preview, setPreview] = useState(null)

  /* ================= LOAD ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products")
        setProducts(res.data)
      } catch (err) {
        console.error("❌ Load products failed:", err)
      }
    }
    fetchProducts()
  }, [])

  /* ================= PRICING ================= */
  const calculatePrice = async (baseCost, quantity, category) => {
    try {
      const res = await api.post("/pricing/calculate", {
        baseCost,
        quantity,
        category
      })
      return res.data.unit
    } catch {
      return baseCost
    }
  }

  /* ================= CREATE ================= */
  const handleNewChange = async (e) => {
    const { name, value } = e.target

    let updated = { ...newProduct, [name]: value }

    if (name === "cost" || name === "category" || name === "stock") {
      const price = await calculatePrice(
        updated.cost,
        updated.stock || 1,
        updated.category || "general"
      )
      updated.price = price
    }

    setNewProduct(updated)
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    setNewProduct(prev => ({ ...prev, image: file }))
    setPreview(URL.createObjectURL(file))
  }

  const createProduct = async () => {
    const formData = new FormData()

    const finalPrice = await calculatePrice(
      newProduct.cost,
      newProduct.stock || 1,
      newProduct.category || "general"
    )

    Object.entries({
      ...newProduct,
      price: finalPrice
    }).forEach(([k, v]) => {
      if (v) formData.append(k, v)
    })

    const res = await api.post("/products", formData)
    setProducts(prev => [res.data, ...prev])

    setNewProduct({
      name: "",
      category: "",
      cost: "",
      price: "",
      stock: "",
      image: null
    })

    setPreview(null)
  }

  /* ================= EDIT ================= */
  const openEdit = (p) => {
    setSelected(p)

    setEditData({
      name: p.name,
      category: p.category,
      cost: p.cost,
      price: p.price,
      stock: p.stock,
      image: null
    })

    setEditPreview(
      p.image ? `${BASE_URL}/${p.image}` : "/placeholder.png"
    )
  }

  const handleEditChange = async (e) => {
    const { name, value } = e.target

    let updated = { ...editData, [name]: value }

    if (name === "cost" || name === "category" || name === "stock") {
      const price = await calculatePrice(
        updated.cost,
        updated.stock || 1,
        updated.category || "general"
      )
      updated.price = price
    }

    setEditData(updated)
  }

  const handleEditImage = (e) => {
    const file = e.target.files[0]
    setEditData(prev => ({ ...prev, image: file }))
    setEditPreview(URL.createObjectURL(file))
  }

  const saveEdit = async () => {
    const formData = new FormData()

    Object.entries(editData).forEach(([k, v]) => {
      if (v) formData.append(k, v)
    })

    const res = await api.put(`/products/${selected._id}`, formData)

    setProducts(prev =>
      prev.map(p => p._id === selected._id ? res.data : p)
    )

    setSelected(null)
  }

  /* ================= DELETE ================= */
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete product?")) return

    await api.delete(`/products/${id}`)
    setProducts(prev => prev.filter(p => p._id !== id))
  }

  /* ================= FILTER ================= */
  const filtered = products.filter(p => {
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === "all" || p.category === categoryFilter)
    )
  })

  return (
    <div className="p-6 bg-black text-white min-h-screen">

      <h1 className="text-3xl mb-6 font-bold">📦 Inventory Dashboard</h1>

      {/* SEARCH + FILTER */}
      <div className="flex gap-4 mb-6">

        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 bg-gray-800 rounded w-full"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 bg-gray-800 rounded"
        >
          <option value="all">All</option>
          <option value="shirts">Shirts</option>
          <option value="hats">Hats</option>
          <option value="stickers">Stickers</option>
        </select>

      </div>

      {/* CREATE */}
      <div className="bg-gray-900 p-4 rounded mb-8">

        <div className="grid grid-cols-6 gap-2">

          <input name="name" placeholder="Name"
            value={newProduct.name}
            onChange={handleNewChange}
            className="bg-gray-800 p-2 rounded"
          />

          <input name="category" placeholder="Category"
            value={newProduct.category}
            onChange={handleNewChange}
            className="bg-gray-800 p-2 rounded"
          />

          <input name="cost" placeholder="Cost"
            value={newProduct.cost}
            onChange={handleNewChange}
            className="bg-gray-800 p-2 rounded"
          />

          <input name="price" value={newProduct.price} readOnly
            className="bg-gray-700 p-2 rounded"
          />

          <input name="stock" placeholder="Stock"
            value={newProduct.stock}
            onChange={handleNewChange}
            className="bg-gray-800 p-2 rounded"
          />

          <input type="file" onChange={handleImage} />

        </div>

        {preview && (
          <img src={preview} className="h-16 mt-2 rounded" />
        )}

        <button
          onClick={createProduct}
          className="mt-3 bg-green-500 px-4 py-2 rounded"
        >
          Add Product
        </button>

      </div>

      {/* GRID */}
      <div className="grid grid-cols-4 gap-4">

        {filtered.map(p => {
          const lowStock = p.stock < 5
          const profit = p.price - p.cost

          return (
            <div key={p._id} className="bg-gray-900 p-4 rounded border">

              <img
                src={p.image ? `${BASE_URL}/${p.image}` : "/placeholder.png"}
                className="h-32 w-full object-cover rounded mb-2"
              />

              <h3>{p.name}</h3>
              <p>{p.category}</p>

              <p>${p.price}</p>
              <p className="text-green-400">Profit: ${profit.toFixed(2)}</p>

              <p className={lowStock ? "text-red-400" : ""}>
                Stock: {p.stock}
              </p>

              <div className="flex gap-2 mt-3">

                <button
                  onClick={() => openEdit(p)}
                  className="bg-yellow-500 px-2 py-1 rounded text-black"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteProduct(p._id)}
                  className="bg-red-500 px-2 py-1 rounded"
                >
                  Delete
                </button>

              </div>

            </div>
          )
        })}

      </div>

      {/* EDIT MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">

          <div className="bg-gray-900 p-6 rounded w-96">

            <h2 className="mb-4">Edit Product</h2>

            <input name="name" value={editData.name} onChange={handleEditChange} />
            <input name="cost" value={editData.cost} onChange={handleEditChange} />
            <input name="price" value={editData.price} readOnly />
            <input name="stock" value={editData.stock} onChange={handleEditChange} />

            <input type="file" onChange={handleEditImage} />

            {editPreview && <img src={editPreview} className="h-16 mt-2" />}

            <div className="flex gap-2 mt-4">
              <button onClick={saveEdit} className="bg-green-500 px-3 py-1 rounded">
                Save
              </button>

              <button
                onClick={() => setSelected(null)}
                className="bg-gray-600 px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}