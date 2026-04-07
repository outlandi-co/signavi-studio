import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"

export default function ProductDetail() {

  const { id } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products")
        const found = res.data.find(p => p._id === id)
        setProduct(found)
      } catch (err) {
        console.error(err)
      }
    }

    load()
  }, [id])

  if (!product) return <p style={{ padding: 20 }}>Loading...</p>

  const addToCart = async () => {
    try {
      await api.post("/cart", {
        productId: product._id,
        quantity: 1
      })

      alert("Added to cart")
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ padding: 20, color: "white" }}>

      <img
        src={`http://localhost:5050/${product.image}`}
        style={{ width: 300, borderRadius: 10 }}
      />

      <h1>{product.name}</h1>

      <p style={{ color: "#94a3b8" }}>
        {product.description}
      </p>

      <h2 style={{ color: "#06b6d4" }}>
        ${Number(product.price).toFixed(2)}
      </h2>

      <button
        onClick={addToCart}
        style={{
          marginTop: 10,
          background: "#06b6d4",
          padding: 10,
          borderRadius: 6
        }}
      >
        🛒 Add to Cart
      </button>

    </div>
  )
}