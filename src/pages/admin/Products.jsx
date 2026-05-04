import { useEffect, useState } from "react"
import api from "../../services/api"
import { Link } from "react-router-dom"

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  /* ================= LOAD ================= */
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

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this product?")
    if (!confirmDelete) return

    try {
      await api.delete(`/products/${id}`)

      setProducts(prev => prev.filter(p => p._id !== id))
    } catch (err) {
      console.error("❌ DELETE ERROR:", err)
      alert("Delete failed")
    }
  }

  /* ================= UI ================= */
  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Loading products...</h2>
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Products</h1>

      <Link to="/admin/new-product">➕ New Product</Link>

      <div style={{ marginTop: 20 }}>
        {products.length === 0 && <p>No products found</p>}

        {products.map(p => (
          <div
            key={p._id}
            style={{
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 8,
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <strong>{p.name}</strong>
              <p style={{ margin: 0 }}>
                ${Number(p.price || 0).toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => handleDelete(p._id)}
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                padding: "6px 10px",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}