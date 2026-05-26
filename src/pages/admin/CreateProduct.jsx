import { useState } from "react"
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

export default function CreateProduct() {
  const navigate = useNavigate()

  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "apparel",
    cost: "",
    price: "",
    stock: "",
    colors: [],
    sizes: []
  })

  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)

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

  const createProduct = async () => {
    if (!product.name.trim()) {
      alert("Product name is required")
      return
    }

    if (!product.price) {
      alert("Product price is required")
      return
    }

    try {
      setSaving(true)

      const formData = new FormData()

      formData.append("name", product.name.trim())
      formData.append("description", product.description)
      formData.append("category", product.category)
      formData.append("cost", Number(product.cost || 0))
      formData.append("price", Number(product.price || 0))
      formData.append("basePrice", Number(product.price || 0))
      formData.append("listPrice", Number(product.price || 0))
      formData.append("stock", Number(product.stock || 0))
      formData.append("quantity", Number(product.stock || 0))

      formData.append("productType", "physical")

      formData.append(
        "colors",
        JSON.stringify(product.colors.map((name) => ({ name })))
      )

      formData.append(
        "sizes",
        JSON.stringify(product.sizes)
      )

      const variants = []

      product.colors.forEach((color) => {
        product.sizes.forEach((size) => {
          variants.push({
            color,
            size,
            stock: Number(product.stock || 0),
            quantity: Number(product.stock || 0),
            price: Number(product.price || 0),
            basePrice: Number(product.price || 0),
            listPrice: Number(product.price || 0),
            images: []
          })
        })
      })

      formData.append(
        "variants",
        JSON.stringify(variants)
      )

      if (image) {
        formData.append("image", image)
      }

      await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      alert("✅ Product Created")

      navigate("/admin/products")
    } catch (err) {
      console.error(
        "❌ CREATE PRODUCT ERROR:",
        err.response?.data || err
      )

      alert(
        err.response?.data?.message ||
          "Failed to create product"
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
            Add a new product to your catalog.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">

          <div className="grid gap-4">

            <input
              value={product.name}
              placeholder="Product Name"
              onChange={(e) =>
                setProduct({
                  ...product,
                  name: e.target.value
                })
              }
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            />

            <textarea
              value={product.description}
              placeholder="Description"
              onChange={(e) =>
                setProduct({
                  ...product,
                  description: e.target.value
                })
              }
              className="min-h-[120px] rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            />

            <input
              value={product.category}
              placeholder="Category"
              onChange={(e) =>
                setProduct({
                  ...product,
                  category: e.target.value
                })
              }
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            />

            <div className="grid gap-4 md:grid-cols-3">

              <input
                value={product.cost}
                type="number"
                placeholder="Cost"
                onChange={(e) =>
                  setProduct({
                    ...product,
                    cost: e.target.value
                  })
                }
                className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
              />

              <input
                value={product.price}
                type="number"
                placeholder="Price"
                onChange={(e) =>
                  setProduct({
                    ...product,
                    price: e.target.value
                  })
                }
                className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
              />

              <input
                value={product.stock}
                type="number"
                placeholder="Stock"
                onChange={(e) =>
                  setProduct({
                    ...product,
                    stock: e.target.value
                  })
                }
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

          <div className="mt-8">
            <h3 className="mb-3 text-xl font-bold">
              Product Image
            </h3>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]

                if (!file) return

                setImage(file)
                setPreview(URL.createObjectURL(file))
              }}
              className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white"
            />

            {preview && (
              <img
                src={preview}
                alt="Product preview"
                className="mt-4 h-48 w-48 rounded-2xl object-cover"
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