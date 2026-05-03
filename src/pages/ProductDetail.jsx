import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"
import { useCartContext } from "../context/useCartContext"

const BASE_URL =
  (import.meta.env.VITE_API_URL || "https://signavi-backend.onrender.com/api")
    .replace("/api", "")

export default function ProductDetail() {

  const { id } = useParams()
  const [product, setProduct] = useState(null)

  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")

  const { addToCart } = useCartContext()

  useEffect(() => {
    const load = async () => {
      const res = await api.get("/products")

      // 🔥 FIX
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.data || []

      const found = list.find(p => p._id === id)
      setProduct(found)
    }

    load()
  }, [id])

  if (!product) return <p style={{ padding: 20 }}>Loading...</p>

  const selectedVariant = product.variants?.find(v =>
    v.color === selectedColor &&
    v.size === selectedSize
  )

  const displayPrice = selectedVariant?.price ?? product.price

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert("Please select color and size")
      return
    }

    addToCart({
      productId: product._id,
      name: product.name,
      image: product.image,
      selectedVariant: {
        color: selectedVariant.color,
        size: selectedVariant.size,
        price: selectedVariant.price
      }
    })
  }

  return (
    <div style={{ padding: 20, color: "white" }}>
      <img
        src={product.image ? `${BASE_URL}/${product.image}` : "/placeholder.png"}
        alt={product.name}
        style={{ width: 300 }}
      />

      <h1>{product.name}</h1>

      <select onChange={(e)=>setSelectedColor(e.target.value)}>
        <option>Select Color</option>
        {[...new Set(product.variants.map(v => v.color))].map(color => (
          <option key={color}>{color}</option>
        ))}
      </select>

      <select onChange={(e)=>setSelectedSize(e.target.value)}>
        <option>Select Size</option>
        {product.variants
          .filter(v => v.color === selectedColor)
          .map(v => (
            <option key={v.size}>{v.size}</option>
          ))
        }
      </select>

      <h2 style={{ color: "#06b6d4" }}>
        ${Number(displayPrice).toFixed(2)}
      </h2>

      <button onClick={handleAddToCart}>
        🛒 Add to Cart
      </button>
    </div>
  )
}