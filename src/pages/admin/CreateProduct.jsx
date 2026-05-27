import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const COLORS = [
  "Black",
  "White",
  "Navy",
  "Red",
  "Green",
  "Gray",
  "Dust",
  "Pink",
  "Blue"
]

const SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL"
]

const initialProduct = {
  name: "",
  description: "",
  category: "apparel",
  cost: "",
  price: "",
  stock: "",
  colors: [],
  sizes: []
}

export default function CreateProduct() {
  const navigate = useNavigate()

  const [product, setProduct] = useState(initialProduct)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState("")
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const variants = useMemo(() => {
    if (!product.colors.length || !product.sizes.length) return []

    return product.colors.flatMap((color) =>
      product.sizes.map((size) => ({
        color,
        size,
        stock: Number(product.stock || 0),
        quantity: Number(product.stock || 0),
        price: Number(product.price || 0),
        basePrice: Number(product.price || 0),
        listPrice: Number(product.price || 0),
        images: []
      }))
    )
  }, [product.colors, product.sizes, product.stock, product.price])

  const toggleValue = (field, value) => {
    setProduct((prev) => {
      const exists = prev[field].includes(value)

      return {
        ...prev,
        [field]: exists
          ? prev[field].filter((item) => item !== value)
          : [...prev[field], value]
      }
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setProduct((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (preview) URL.revokeObjectURL(preview)

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const createProduct = async () => {
    setStatus("")

    if (!product.name.trim()) {
      setStatus("❌ Product name is required")
      return
    }

    if (!product.price || Number(product.price) <= 0) {
      setStatus("❌ Product price must be greater than 0")
      return
    }

    try {
      setSaving(true)

      const price = Number(product.price || 0)
      const cost = Number(product.cost || 0)
      const stock = Number(product.stock || 0)

      const formData = new FormData()

      formData.append("name", product.name.trim())
      formData.append("description", product.description.trim())
      formData.append("category", product.category.trim() || "apparel")

      formData.append("cost", cost)
      formData.append("price", price)
      formData.append("basePrice", price)
      formData.append("listPrice", price)

      formData.append("stock", stock)
      formData.append("quantity", stock)

      formData.append("productType", "physical")
      formData.append("storefrontVisible", true)
      formData.append("salesChannel", "signavi_store")

      formData.append(
        "colors",
        JSON.stringify(product.colors.map((name) => ({ name })))
      )

      formData.append("sizes", JSON.stringify(product.sizes))
      formData.append("variants", JSON.stringify(variants))

      if (image) {
        formData.append("image", image)
      }

      await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      setStatus("✅ Product created successfully")
      navigate("/admin/products")
    } catch (err) {
      console.error("❌ CREATE PRODUCT ERROR:", err.response?.data || err)

      setStatus(
        err.response?.data?.message ||
          "❌ Failed to create product"
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="mx-auto max-w-5xl p-6">
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
            Create Product
          </h1>

          <p className="mt-3 text-slate-400">
            Add a storefront product with colors, sizes, inventory, and image.
          </p>
        </div>

        {status && (
          <div className="mb-5 rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 text-sm font-semibold text-slate-200">
            {status}
          </div>
        )}

        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
          <div className="grid gap-4">
            <input
              name="name"
              value={product.name}
              placeholder="Product Name"
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            />

            <textarea
              name="description"
              value={product.description}
              placeholder="Description"
              onChange={handleChange}
              className="min-h-[120px] rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            />

            <input
              name="category"
              value={product.category}
              placeholder="Category"
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            />

            <div className="grid gap-4 md:grid-cols-3">
              <input
                name="cost"
                value={product.cost}
                type="number"
                min="0"
                step="0.01"
                placeholder="Cost"
                onChange={handleChange}
                className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
              />

              <input
                name="price"
                value={product.price}
                type="number"
                min="0"
                step="0.01"
                placeholder="Price"
                onChange={handleChange}
                className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
              />

              <input
                name="stock"
                value={product.stock}
                type="number"
                min="0"
                placeholder="Stock"
                onChange={handleChange}
                className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-3 text-xl font-bold">
              Colors
            </h3>

            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleValue("colors", color)}
                  className={
                    product.colors.includes(color)
                      ? "rounded-full bg-emerald-400 px-4 py-2 font-bold text-black"
                      : "rounded-full border border-slate-700 px-4 py-2 font-bold text-white hover:border-cyan-400"
                  }
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-3 text-xl font-bold">
              Sizes
            </h3>

            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleValue("sizes", size)}
                  className={
                    product.sizes.includes(size)
                      ? "rounded-full bg-cyan-400 px-4 py-2 font-bold text-black"
                      : "rounded-full border border-slate-700 px-4 py-2 font-bold text-white hover:border-cyan-400"
                  }
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-[#020617] p-5">
            <p className="text-sm text-slate-400">
              Variants Generated
            </p>

            <p className="mt-1 text-3xl font-black text-cyan-300">
              {variants.length}
            </p>
          </div>

          <div className="mt-8">
            <h3 className="mb-3 text-xl font-bold">
              Product Image
            </h3>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
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
            type="button"
            onClick={createProduct}
            disabled={saving}
            className="mt-8 w-full rounded-2xl bg-cyan-500 px-6 py-4 text-lg font-bold text-black transition hover:bg-cyan-400 disabled:opacity-60"
          >
            {saving ? "Creating Product..." : "Create Product"}
          </button>
        </div>
      </section>
    </main>
  )
}