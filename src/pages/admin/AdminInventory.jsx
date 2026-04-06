import { useEffect, useState } from "react"
import api from "../../services/api"

export default function AdminInventory() {

  const [products, setProducts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products")
        setProducts(res.data)
      } catch (err) {
        console.error("LOAD PRODUCTS ERROR:", err)
      }
    }

    fetchProducts()
  }, [])

  const startEdit = (p) => {
    setEditingId(p._id)
    setEditData({
      name: p.name,
      price: p.price,
      stock: p.stock || p.quantity || 0
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({ ...prev, [name]: value }))
  }

  const saveEdit = async (id) => {
    try {
      const res = await api.put(`/products/${id}`, editData)

      setProducts(prev =>
        prev.map(p => p._id === id ? res.data : p)
      )

      setEditingId(null)
    } catch (err) {
      console.error("UPDATE ERROR:", err)
    }
  }

  const deleteProduct = async (id) => {
    if (!confirm("Delete product?")) return

    try {
      await api.delete(`/products/${id}`)
      setProducts(prev => prev.filter(p => p._id !== id))
    } catch (err) {
      console.error("DELETE ERROR:", err)
    }
  }

  return (
    <div>
      <h1 className="text-2xl mb-4">📦 Inventory</h1>

      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-gray-700">
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map(p => (
            <tr key={p._id} className="border-b border-gray-800">

              <td>
                {editingId === p._id ? (
                  <input name="name" value={editData.name} onChange={handleChange} />
                ) : p.name}
              </td>

              <td>
                {editingId === p._id ? (
                  <input name="price" value={editData.price} onChange={handleChange} />
                ) : `$${p.price}`}
              </td>

              <td>
                {editingId === p._id ? (
                  <input name="stock" value={editData.stock} onChange={handleChange} />
                ) : (p.stock || p.quantity)}
              </td>

              <td>
                {editingId === p._id ? (
                  <>
                    <button onClick={() => saveEdit(p._id)}>💾 Save</button>
                    <button onClick={() => setEditingId(null)}>❌</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(p)}>✏️</button>
                    <button onClick={() => deleteProduct(p._id)}>🗑</button>
                  </>
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}