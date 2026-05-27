import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../services/api"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const BASE_URL = API_URL.replace(/\/api\/?$/, "")

const initialForm = {
  name: "",
  description: "",
  category: "",
  cost: "",
  price: "",
  stock: ""
}

const resolveImageUrl = (value = "") => {
  if (!value) return ""

  if (value.startsWith("http")) return value

  if (value.startsWith("/uploads")) {
    return `${BASE_URL}${value}`
  }

  if (value.startsWith("uploads")) {
    return `${BASE_URL}/${value}`
  }

  return `${BASE_URL}/uploads/${value}`
}

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        setStatus("")

        const res = await api.get(`/products/${id}`)
        const product = res.data

        setForm({
          name: product?.name || "",
          description: product?.description || "",
          category: product?.category || "",
          cost: product?.cost ?? "",
          price: product?.price ?? "",
          stock: product?.stock ?? product?.quantity ?? ""
        })

        setPreview(resolveImageUrl(product?.image || ""))
      } catch (err) {
        console.error("❌ LOAD PRODUCT ERROR:", err)
        setStatus("❌ Failed to load product")
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview)
    }

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus("")

    if (!form.name.trim()) {
      setStatus("❌ Product name is required")
      return
    }

    if (!form.price || Number(form.price) <= 0) {
      setStatus("❌ Product price must be greater than 0")
      return
    }

    try {
      setSaving(true)

      const price = Number(form.price || 0)
      const cost = Number(form.cost || 0)
      const stock = Number(form.stock || 0)

      const data = new FormData()

      data.append("name", form.name.trim())
      data.append("description", form.description.trim())
      data.append("category", form.category.trim())

      data.append("cost", cost)
      data.append("price", price)
      data.append("basePrice", price)
      data.append("listPrice", price)

      data.append("stock", stock)
      data.append("quantity", stock)

      if (image) {
        data.append("image", image)
      }

      await api.put(`/products/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      setStatus("✅ Product updated successfully")
      navigate("/admin/products")
    } catch (err) {
      console.error("❌ UPDATE PRODUCT ERROR:", err.response?.data || err)

      setStatus(
        err.response?.data?.message ||
          "❌ Failed to update product"
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        <p className="text-slate-300">Loading product...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="mx-auto max-w-4xl p-6">
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
            ✏️ Edit Product
          </h1>

          <p className="mt-3 text-slate-400">
            Update product details, pricing, inventory, and image.
          </p>
        </div>

        {status && (
          <div className="mb-5 rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 text-sm font-semibold text-slate-200">
            {status}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20"
        >
          <div className="grid gap-4">
            <input
              name="name"
              value={form.name}
              placeholder="Product Name"
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            />

            <textarea
              name="description"
              value={form.description}
              placeholder="Description"
              onChange={handleChange}
              className="min-h-[120px] rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            />

            <input
              name="category"
              value={form.category}
              placeholder="Category"
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            />

            <div className="grid gap-4 md:grid-cols-3">
              <input
                name="cost"
                type="number"
                min="0"
                step="0.01"
                value={form.cost}
                placeholder="Cost"
                onChange={handleChange}
                className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
              />

              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                placeholder="Price"
                onChange={handleChange}
                className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
              />

              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                placeholder="Stock"
                onChange={handleChange}
                className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-3 text-xl font-bold">
              Product Image
            </h3>

            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white"
            />

            {preview && (
              <img
                src={preview}
                alt="Product preview"
                className="mt-4 h-48 w-48 rounded-2xl border border-slate-700 object-cover"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-8 w-full rounded-2xl bg-cyan-500 px-6 py-4 text-lg font-bold text-black transition hover:bg-cyan-400 disabled:opacity-60"
          >
            {saving ? "Updating Product..." : "Update Product"}
          </button>
        </form>
      </section>
    </main>
  )
}