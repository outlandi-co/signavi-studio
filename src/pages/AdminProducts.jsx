import { useState } from "react"
import api from "../services/api"
import toast from "react-hot-toast"

const defaultForm = {
  name: "",
  description: "",
  basePrice: "",
  stock: "",
  category: "",
  colors: "",
  sizes: "",
  colorImages: {}
}

export default function AdminProducts() {
  const [form, setForm] = useState(defaultForm)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const getColorList = () =>
    form.colors.split(",").map(c => c.trim()).filter(Boolean)

  const getSizeList = () =>
    form.sizes.split(",").map(s => s.trim().toUpperCase()).filter(Boolean)

  /* ================= IMAGE UPLOAD ================= */
  const handleImageUpload = (e, color) => {
    const files = Array.from(e.target.files || [])

    if (!files.length) return

    setForm(prev => ({
      ...prev,
      colorImages: {
        ...prev.colorImages,
        [color]: [
          ...(prev.colorImages[color] || []),
          ...files // ✅ STORE FILE OBJECTS
        ]
      }
    }))

    e.target.value = ""
    toast.success(`${color} images added`)
  }

  const removeImage = (color, index) => {
    setForm(prev => {
      const arr = [...(prev.colorImages[color] || [])]
      arr.splice(index, 1)

      return {
        ...prev,
        colorImages: {
          ...prev.colorImages,
          [color]: arr
        }
      }
    })
  }

  /* ================= BUILD VARIANTS ================= */
  const buildVariants = () => {
    const variants = []

    getColorList().forEach(color => {
      getSizeList().forEach(size => {
        variants.push({
          color,
          size,
          stock: Number(form.stock) || 0,
          price: Number(form.basePrice) || 0
        })
      })
    })

    return variants
  }

  /* ================= CREATE PRODUCT ================= */
  const createProduct = async () => {
    if (!form.name) return toast.error("Name required")

    const variants = buildVariants()

    const formData = new FormData()

    formData.append("name", form.name)
    formData.append("description", form.description)
    formData.append("category", form.category)
    formData.append("price", Number(form.basePrice))
    formData.append("stock", Number(form.stock))

    formData.append("sizes", JSON.stringify(getSizeList()))
    formData.append(
      "colors",
      JSON.stringify(getColorList().map(name => ({ name })))
    )
    formData.append("variants", JSON.stringify(variants))

    /* 🔥 SEND FILES (NO JSON) */
    Object.entries(form.colorImages).forEach(([color, files]) => {
      files.forEach(file => {
        formData.append("images", file)
        formData.append("imageColors", color)
      })
    })

    try {
      await api.post("/products", formData)
      toast.success("Product created")
      setForm(defaultForm)
    } catch (err) {
      console.error(err)
      toast.error("Create failed")
    }
  }

  return (
    <div style={{ padding: 20, color: "white", background: "#020617" }}>
      <h1>Admin Products</h1>

      <input name="name" placeholder="Name" onChange={handleChange} style={input} />
      <input name="category" placeholder="Category" onChange={handleChange} style={input} />
      <input name="basePrice" placeholder="Price" onChange={handleChange} style={input} />
      <input name="stock" placeholder="Stock" onChange={handleChange} style={input} />
      <input name="colors" placeholder="Black, White" onChange={handleChange} style={input} />
      <input name="sizes" placeholder="S, M, L" onChange={handleChange} style={input} />

      <textarea name="description" placeholder="Description" onChange={handleChange} style={input} />

      {getColorList().map(color => (
        <div key={color} style={{ marginTop: 20 }}>
          <h4>{color} Images</h4>

          <input
            type="file"
            multiple
            onChange={(e) => handleImageUpload(e, color)}
            style={{ ...input, background: "#fff" }}
          />

          <div style={{ display: "flex", gap: 10 }}>
            {(form.colorImages[color] || []).map((file, i) => (
              <div key={i}>
                <img
                  src={URL.createObjectURL(file)}
                  style={{ width: 80, height: 80, objectFit: "cover" }}
                />
                <button onClick={() => removeImage(color, i)}>X</button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={createProduct} style={btn}>
        Add Product
      </button>
    </div>
  )
}

const input = { display: "block", marginBottom: 10, padding: 10, width: "100%" }
const btn = { padding: 12, marginTop: 20, background: "#22c55e", width: "100%" }