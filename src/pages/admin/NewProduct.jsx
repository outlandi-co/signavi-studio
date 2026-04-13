import { useState } from "react"
import api from "../../services/api"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export default function NewProduct() {

  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: ""
  })

  const [image, setImage] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const formData = new FormData()

      Object.keys(form).forEach(key => {
        formData.append(key, form[key])
      })

      if (image) formData.append("image", image)

      await api.post("/products", formData)

      toast.success("Product created 🔥")
      navigate("/admin/products")

    } catch (err) {
      console.error(err)
      toast.error("Create failed")
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>New Product</h2>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="price" placeholder="Price" onChange={handleChange} />
        <input name="stock" placeholder="Stock" onChange={handleChange} />
        <input name="category" placeholder="Category" onChange={handleChange} />
        <textarea name="description" placeholder="Description" onChange={handleChange} />

        <input type="file" onChange={(e) => setImage(e.target.files[0])} />

        <button type="submit">Create</button>
      </form>
    </div>
  )
}