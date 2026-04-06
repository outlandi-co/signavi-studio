import { useEffect, useState } from "react"
import api from "../../services/api"

export default function Inventory() {

  const [products, setProducts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})

  // LOAD PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products")
        setProducts(res.data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchProducts()
  }, [])

  // DELETE
  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return

    try {
      await api.delete(`/products/${id}`)
      setProducts(prev => prev.filter(p => p._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  // START EDIT
  const startEdit = (product) => {
    setEditingId(product._id)
    setEditData({
      name: product.name,
      price: product.price,
      stock: product.stock || product.quantity || 0
    })
  }

  // HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // SAVE
  const saveEdit = async (id) => {
    try {
      const res = await api.put(`/products/${id}`, editData)

      setProducts(prev =>
        prev.map(p => p._id === id ? res.data : p)
      )

      setEditingId(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 Inventory</h1>

      <table style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map(p => (
            <tr key={p._id}>

              {/* NAME */}
              <td>
                {editingId === p._id ? (
                  <input
                    name="name"
                    value={editData.name}
                    onChange={handleChange}
                  />
                ) : (
                  p.name
                )}
              </td>

              {/* PRICE */}
              <td>
                {editingId === p._id ? (
                  <input
                    name="price"
                    value={editData.price}
                    onChange={handleChange}
                  />
                ) : (
                  `$${p.price}`
                )}
              </td>

              {/* STOCK */}
              <td style={{
                color: (p.stock || p.quantity) < 5 ? "red" : "white"
              }}>
                {editingId === p._id ? (
                  <input
                    name="stock"
                    value={editData.stock}
                    onChange={handleChange}
                  />
                ) : (
                  p.stock || p.quantity
                )}
              </td>

              {/* ACTIONS */}
              <td>

                {editingId === p._id ? (
                  <>
                    <button onClick={() => saveEdit(p._id)}>
                      💾 Save
                    </button>

                    <button onClick={() => setEditingId(null)}>
                      ❌ Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(p)}>
                      ✏️ Edit
                    </button>

                    <button onClick={() => deleteProduct(p._id)}>
                      🗑 Delete
                    </button>
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