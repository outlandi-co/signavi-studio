import { useEffect, useState } from "react"
import api from "../services/api"

export default function Store() {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const load = async () => {
      console.log("🚀 STORE LOADING...")

      try {
        console.log("📡 CALLING API...")

        const res = await api.get("/products")

        console.log("✅ RESPONSE:", res.data)

        setProducts(res.data || [])

      } catch (err) {
        console.error("❌ STORE ERROR:", err)
      } finally {
        setLoading(false)
      }
    }

    load()

  }, [])

  if (loading) {
    return <h2 style={{ color: "white" }}>Loading...</h2>
  }

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>Store</h1>

      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        products.map(p => (
          <div key={p._id} style={{ marginBottom: 20 }}>
            <h3>{p.name}</h3>
            <p>${p.price}</p>
          </div>
        ))
      )}
    </div>
  )
}