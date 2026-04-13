import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

export default function CreateProduct() {

  const navigate = useNavigate()

  const [product, setProduct] = useState({
    name: "",
    category: "",
    cost: "",
    price: "",
    stock: "",
    image: null
  })

  const [preview, setPreview] = useState(null)

  const calculatePrice = async (cost, qty, category) => {
    try {
      const res = await api.post("/pricing/calculate", {
        baseCost: cost,
        quantity: qty,
        category
      })
      return res.data.unit
    } catch {
      return cost
    }
  }

  const handleChange = async (e) => {
    const { name, value } = e.target

    let updated = { ...product, [name]: value }

    if (["cost", "category", "stock"].includes(name)) {
      const price = await calculatePrice(
        updated.cost,
        updated.stock || 1,
        updated.category || "general"
      )
      updated.price = price
    }

    setProduct(updated)
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    setProduct(prev => ({ ...prev, image: file }))
    setPreview(URL.createObjectURL(file))
  }

  const createProduct = async () => {
    const formData = new FormData()

    Object.entries(product).forEach(([k, v]) => {
      if (v) formData.append(k, v)
    })

    await api.post("/products", formData)

    navigate("/admin/products")
  }

  return (
    <div className="p-6 bg-black text-white min-h-screen">

      <h1 className="text-3xl mb-6">➕ Create Product</h1>

      <div className="grid grid-cols-2 gap-6">

        <div className="flex flex-col gap-3">

          <input name="name" placeholder="Name"
            value={product.name}
            onChange={handleChange}
            className="bg-gray-800 p-3 rounded"
          />

          <input name="category" placeholder="Category"
            value={product.category}
            onChange={handleChange}
            className="bg-gray-800 p-3 rounded"
          />

          <input name="cost" placeholder="Cost"
            value={product.cost}
            onChange={handleChange}
            className="bg-gray-800 p-3 rounded"
          />

          <input name="stock" placeholder="Stock"
            value={product.stock}
            onChange={handleChange}
            className="bg-gray-800 p-3 rounded"
          />

          <input value={product.price} readOnly
            className="bg-gray-700 p-3 rounded text-green-400"
          />

        </div>

        <div className="flex flex-col items-center justify-center border border-gray-700 rounded p-4">

          {preview ? (
            <img src={preview} className="h-40 rounded mb-3" />
          ) : (
            <p>No Image</p>
          )}

          <input type="file" onChange={handleImage} />

        </div>

      </div>

      <button
        onClick={createProduct}
        className="mt-6 w-full bg-green-500 py-3 rounded text-black font-bold"
      >
        🚀 Create Product
      </button>

    </div>
  )
}