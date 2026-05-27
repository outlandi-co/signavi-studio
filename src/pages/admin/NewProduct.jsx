import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../../services/api"

const initialForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: ""
}

export default function NewProduct() {
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState("")
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error("Product name is required")
      return
    }

    if (!form.price || Number(form.price) <= 0) {
      toast.error("Price must be greater than 0")
      return
    }

    try {
      setSaving(true)

      const price = Number(form.price || 0)
      const stock = Number(form.stock || 0)

      const formData = new FormData()

      formData.append("name", form.name.trim())
      formData.append("description", form.description.trim())
      formData.append("category", form.category.trim() || "apparel")

      formData.append("price", price)
      formData.append("basePrice", price)
      formData.append("listPrice", price)

      formData.append("stock", stock)
      formData.append("quantity", stock)

      formData.append("productType", "physical")
      formData.append("storefrontVisible", true)
      formData.append("salesChannel", "signavi_store")

      if (image) {
        formData.append("image", image)
      }

      await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      toast.success("Product created 🔥")
      navigate("/admin/products")
    } catch (err) {
      console.error("❌ CREATE PRODUCT ERROR:", err.response?.data || err)

      toast.error(
        err.response?.data?.message ||
          "Create failed"
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="mx-auto max-w-3xl p-6">
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="mb-8 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
        >
          ← Back to Products
        </button>

        <div className="mb-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold">
            New Product
          </h1>

          <p className="mt-3 text-slate-400">
            Add a new product to the SignaVi storefront.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20"
        >
          <div className="grid gap-4">
            <input
              name="name"
              placeholder="Product Name"
              value={form.name}
              onChange={handleChange}
              required
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            />

            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              required
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            />

            <input
              name="stock"
              type="number"
              min="0"
              placeholder="Stock"
              value={form.stock}
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            />

            <input
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            />

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="min-h-[120px] rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white"
            />

            {preview && (
              <img
                src={preview}
                alt="Product preview"
                className="h-48 w-48 rounded-2xl border border-slate-700 object-cover"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-8 w-full rounded-2xl bg-cyan-500 px-6 py-4 text-lg font-bold text-black transition hover:bg-cyan-400 disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Product"}
          </button>
        </form>
      </section>
    </main>
  )
}