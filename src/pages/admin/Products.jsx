import { useEffect, useState } from "react"
import api from "../../services/api"
import { Link } from "react-router-dom"

export default function Products() {

  const [products, setProducts] = useState([])

  /* 🔥 FIXED LOAD FUNCTION */
  const load = async () => {
    try {
      const res = await api.get("/products")
      setProducts(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  /* 🔥 FIX: wrap in async inside effect */
  useEffect(() => {
    const init = async () => {
      await load()
    }

    init()
  }, [])

  const handleDelete = async (id) => {
    await api.delete(`/products/${id}`)
    load()
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Products</h1>

      <Link to="/admin/new-product">➕ New Product</Link>

      <div style={{ marginTop: 20 }}>
        {products.map(p => (
          <div key={p._id}>

            {p.name} - ${p.price}

            <button onClick={() => handleDelete(p._id)}>
              Delete
            </button>

          </div>
        ))}
      </div>
    </div>
  )
}