import { useEffect, useState } from "react"
import api from "../../services/api"

export default function AdminInventory() {

  const [products, setProducts] = useState([])
  const [selected, setSelected] = useState(null)

  const [editData, setEditData] = useState({})
  const [editPreview, setEditPreview] = useState(null)

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "",
    cost: "",
    price: "",
    stock: "",
    image: null
  })

  const [preview, setPreview] = useState(null)

  const PROFIT_MULTIPLIER = 1.6

  /* ================= LOAD ================= */
  useEffect(() => {
    const loadProducts = async () => {
      const res = await api.get("/products")
      setProducts(res.data)
    }
    loadProducts()
  }, [])

  /* ================= CREATE ================= */
  const handleNewChange = (e) => {
    const { name, value } = e.target

    if (name === "cost") {
      const price = (Number(value) * PROFIT_MULTIPLIER).toFixed(2)
      setNewProduct(prev => ({ ...prev, cost: value, price }))
    } else {
      setNewProduct(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    setNewProduct(prev => ({ ...prev, image: file }))
    setPreview(URL.createObjectURL(file))
  }

  const createProduct = async () => {
    const formData = new FormData()

    Object.keys(newProduct).forEach(key => {
      if (newProduct[key]) {
        formData.append(key, newProduct[key])
      }
    })

    const res = await api.post("/products", formData)
    setProducts(prev => [res.data, ...prev])

    setNewProduct({
      name: "",
      description: "",
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
      price: p.price,
      cost: p.cost,
      stock: p.stock,
      image: null
    })

    setEditPreview(p.image ? `https://signavi-backend.onrender.com/${p.image}` : null)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target

    if (name === "cost") {
      const price = (Number(value) * PROFIT_MULTIPLIER).toFixed(2)
      setEditData(prev => ({ ...prev, cost: value, price }))
    } else {
      setEditData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleEditImage = (e) => {
    const file = e.target.files[0]
    setEditData(prev => ({ ...prev, image: file }))
    setEditPreview(URL.createObjectURL(file))
  }

  const saveEdit = async () => {
    const formData = new FormData()

    Object.keys(editData).forEach(key => {
      if (editData[key]) {
        formData.append(key, editData[key])
      }
    })

    const res = await api.put(`/products/${selected._id}`, formData)

    setProducts(prev =>
      prev.map(p => p._id === selected._id ? res.data : p)
    )

    setSelected(null)
  }

  /* ================= DELETE ================= */
  const deleteProduct = async (id) => {
    if (!confirm("Delete product?")) return

    await api.delete(`/products/${id}`)
    setProducts(prev => prev.filter(p => p._id !== id))
  }

  return (
    <div>

      <h1 className="text-2xl mb-4">📦 Inventory</h1>

      {/* CREATE */}
      <div className="mb-6 p-4 bg-gray-900 rounded">

        <div className="grid grid-cols-6 gap-2">

          <input name="name" placeholder="Name"
            value={newProduct.name}
            onChange={handleNewChange}
            className="bg-gray-800 text-white p-2 rounded"
          />

          <input name="description" placeholder="Description"
            value={newProduct.description}
            onChange={handleNewChange}
            className="bg-gray-800 text-white p-2 rounded"
          />

          <select name="category"
            value={newProduct.category}
            onChange={handleNewChange}
            className="bg-gray-800 text-white p-2 rounded"
          >
            <option value="">Category</option>
            <option value="shirts">Shirts</option>
            <option value="hats">Hats</option>
            <option value="stickers">Stickers</option>
          </select>

          <input name="cost" placeholder="Cost"
            value={newProduct.cost}
            onChange={handleNewChange}
            className="bg-gray-800 text-white p-2 rounded"
          />

          <input name="price" value={newProduct.price} readOnly
            className="bg-gray-700 text-white p-2 rounded"
          />

          <input name="stock" placeholder="Stock"
            value={newProduct.stock}
            onChange={handleNewChange}
            className="bg-gray-800 text-white p-2 rounded"
          />

        </div>

        {/* Upload */}
        <div className="mt-2">
          <label className="bg-gray-800 px-3 py-2 rounded cursor-pointer">
            📸 Upload
            <input type="file" onChange={handleImage} className="hidden" />
          </label>
        </div>

        {preview && <img src={preview} className="h-16 mt-2" />}

        <button onClick={createProduct} className="mt-3 bg-green-600 px-4 py-2 rounded">
          ➕ Create
        </button>

      </div>

      {/* TABLE */}
      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map(p => (
            <tr key={p._id}>

              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>${p.price}</td>
              <td>{p.stock}</td>

              <td>
                {p.image && (
                  <img src={`https://signavi-backend.onrender.com/${p.image}`} className="h-10" />
                )}
              </td>

              <td>
                <button onClick={() => openEdit(p)}>✏️</button>
                <button onClick={() => deleteProduct(p._id)}>🗑</button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔥 EDIT MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">

          <div className="bg-gray-900 p-6 rounded w-96">

            <h2 className="mb-3">Edit Product</h2>

            <input name="name" value={editData.name} onChange={handleEditChange} className="w-full mb-2 p-2 bg-gray-800 text-white" />
            <input name="cost" value={editData.cost} onChange={handleEditChange} className="w-full mb-2 p-2 bg-gray-800 text-white" />
            <input name="price" value={editData.price} readOnly className="w-full mb-2 p-2 bg-gray-700 text-white" />
            <input name="stock" value={editData.stock} onChange={handleEditChange} className="w-full mb-2 p-2 bg-gray-800 text-white" />

            {/* Image replace */}
            <label className="bg-gray-800 px-3 py-2 rounded cursor-pointer block mb-2">
              📸 Replace Image
              <input type="file" onChange={handleEditImage} className="hidden" />
            </label>

            {editPreview && <img src={editPreview} className="h-16 mb-2" />}

            <div className="flex justify-between">
              <button onClick={saveEdit} className="bg-green-600 px-3 py-2 rounded">
                Save
              </button>
              <button onClick={() => setSelected(null)} className="bg-gray-700 px-3 py-2 rounded">
                Cancel
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}