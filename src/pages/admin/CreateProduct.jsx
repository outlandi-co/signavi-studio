import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const COLORS = [
  "Black", "White", "Navy", "Red", "Green",
  "Gray", "Dust", "Pink", "Blue"
]

/* 🔥 ONLY UP TO 3XL */
const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"]

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
  const [loading, setLoading] = useState(false)

  /* ================= INPUT ================= */
  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value
    })
  }

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

  /* ================= IMAGE ================= */
  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  /* ================= SUBMIT ================= */
  const createProduct = async () => {
    try {
      setLoading(true)

      const formData = new FormData()

      Object.entries(product).forEach(([k, v]) => {
        formData.append(k, JSON.stringify(v))
      })

      if (image) formData.append("image", image)

      await api.post("/products", formData)

      navigate("/admin/products")

    } catch (err) {
      console.error("❌ CREATE ERROR:", err)
      alert("Failed to create product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-black text-white min-h-screen">

      <h1 className="text-3xl mb-6">➕ Create Product</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT SIDE */}
        <div className="flex flex-col gap-4">

          <input
            name="name"
            placeholder="Product Name"
            onChange={handleChange}
            className="bg-gray-800 p-3 rounded"
          />

          <input
            name="category"
            placeholder="Category"
            onChange={handleChange}
            className="bg-gray-800 p-3 rounded"
          />

          <input
            name="cost"
            placeholder="Cost"
            onChange={handleChange}
            className="bg-gray-800 p-3 rounded"
          />

          <input
            name="stock"
            placeholder="Stock"
            onChange={handleChange}
            className="bg-gray-800 p-3 rounded"
          />

          {/* 🎨 COLORS */}
          <div>
            <h3 className="mb-2">Colors</h3>
            <div className="flex flex-wrap gap-2">
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
          </div>

          {/* 📏 SIZES */}
          <div>
            <h3 className="mb-2">Sizes (up to 3XL)</h3>
            <div className="flex flex-wrap gap-2">
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
          </div>

        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="flex flex-col items-center justify-center border border-gray-700 rounded p-4">

          {preview ? (
            <img
              src={preview}
              className="h-48 object-cover rounded mb-3"
            />
          ) : (
            <p className="text-gray-500">No Image</p>
          )}

          <input type="file" onChange={handleImage} />

        </div>

      </div>

      <button
        onClick={createProduct}
        disabled={loading}
        className="mt-6 w-full bg-green-500 py-3 rounded text-black font-bold"
      >
        {loading ? "Creating..." : "🚀 Create Product"}
      </button>

    </div>
  )
}