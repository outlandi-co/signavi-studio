import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const COLORS = [
  "Black","White","Navy","Red","Green","Gray","Dust","Pink","Blue"
]

const SIZES = ["XS","S","M","L","XL","2XL","3XL","4XL"]

export default function CreateProduct() {

  const navigate = useNavigate()

  const [product, setProduct] = useState({
    name: "",
    category: "tshirt",
    cost: "",
    price: "",
    stock: "",
    colors: [],
    sizes: []
  })

  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  /* ================= TOGGLE ================= */
  const toggleValue = (field, value) => {
    setProduct(prev => {
      const exists = prev[field].includes(value)

      return {
        ...prev,
        [field]: exists
          ? prev[field].filter(v => v !== value)
          : [...prev[field], value]
      }
    })
  }

  /* ================= CREATE ================= */
  const createProduct = async () => {
    try {
      const formData = new FormData()

      formData.append("name", product.name)
      formData.append("category", product.category)
      formData.append("cost", product.cost)
      formData.append("price", product.price)
      formData.append("stock", product.stock)

      formData.append("colors", JSON.stringify(product.colors))
      formData.append("sizes", JSON.stringify(product.sizes))

      if (image) formData.append("image", image)

      await api.post("/products", formData)

      alert("✅ Product Created")
      navigate("/admin/products")

    } catch (err) {
      console.error(err)
      alert("❌ Failed to create product")
    }
  }

  return (
    <div className="p-6 text-white bg-black min-h-screen">

      <h1 className="text-2xl mb-4">➕ Create Product</h1>

      {/* INPUTS */}
      <div className="grid gap-3 mb-6">
        <input className="p-2 bg-gray-800 rounded"
          placeholder="Name"
          onChange={e => setProduct({...product,name:e.target.value})}
        />

        <input className="p-2 bg-gray-800 rounded"
          placeholder="Category"
          onChange={e => setProduct({...product,category:e.target.value})}
        />

        <input className="p-2 bg-gray-800 rounded"
          placeholder="Cost"
          onChange={e => setProduct({...product,cost:e.target.value})}
        />

        <input className="p-2 bg-gray-800 rounded"
          placeholder="Price"
          onChange={e => setProduct({...product,price:e.target.value})}
        />

        <input className="p-2 bg-gray-800 rounded"
          placeholder="Stock"
          onChange={e => setProduct({...product,stock:e.target.value})}
        />
      </div>

      {/* COLORS */}
      <h3 className="mb-2">🎨 Colors</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {COLORS.map(c => (
          <button
            key={c}
            onClick={() => toggleValue("colors", c)}
            className={`px-3 py-1 rounded border ${
              product.colors.includes(c)
                ? "bg-green-500 text-black"
                : "bg-gray-800"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* SIZES */}
      <h3 className="mb-2">📏 Sizes</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {SIZES.map(s => (
          <button
            key={s}
            onClick={() => toggleValue("sizes", s)}
            className={`px-3 py-1 rounded border ${
              product.sizes.includes(s)
                ? "bg-blue-500 text-black"
                : "bg-gray-800"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* IMAGE */}
      <div className="mb-6">
        <input type="file" onChange={e => {
          const file = e.target.files[0]
          if (!file) return

          setImage(file)
          setPreview(URL.createObjectURL(file))
        }} />

        {preview && (
          <img
            src={preview}
            className="mt-3 w-40 rounded"
          />
        )}
      </div>

      {/* SUBMIT */}
      <button
        onClick={createProduct}
        className="w-full bg-green-500 py-3 rounded text-black font-bold"
      >
        🚀 Create Product
      </button>

    </div>
  )
}