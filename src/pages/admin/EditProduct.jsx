import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../services/api"

const BASE_URL =
  (import.meta.env.VITE_API_URL || "https://signavi-backend.onrender.com/api")
    .replace("/api", "")

export default function EditProduct() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({})
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    const load = async () => {
      const res = await api.get("/products")
      const product = res.data.find(p => p._id === id)

      setForm(product)

      if (product?.image) {
        setPreview(
          product.image.startsWith("/uploads")
            ? `${BASE_URL}${product.image}`
            : product.image
        )
      }
    }

    load()
  }, [id])

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData()

    Object.keys(form).forEach(key => {
      data.append(key, form[key])
    })

    if (image) data.append("image", image)

    await api.put(`/products/${id}`, data)

    navigate("/admin/products")
  }

  return (
    <div className="p-6 text-white">

      <h1 className="text-2xl mb-4">✏️ Edit Product</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">

        <input name="name" value={form.name || ""} onChange={handleChange} className="p-2 bg-gray-800 rounded" />
        <input name="description" value={form.description || ""} onChange={handleChange} className="p-2 bg-gray-800 rounded" />
        <input name="category" value={form.category || ""} onChange={handleChange} className="p-2 bg-gray-800 rounded" />
        <input name="price" value={form.price || ""} onChange={handleChange} className="p-2 bg-gray-800 rounded" />
        <input name="stock" value={form.stock || ""} onChange={handleChange} className="p-2 bg-gray-800 rounded" />

        {/* IMAGE */}
        <input type="file" onChange={handleImage} />

        {preview && (
          <img src={preview} className="h-40 object-cover rounded" />
        )}

        <button className="bg-blue-500 p-2 rounded text-black font-bold">
          Update Product
        </button>

      </form>

    </div>
  )
}