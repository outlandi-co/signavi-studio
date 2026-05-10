
import { useEffect, useState } from "react"
import api from "../services/api"
import toast from "react-hot-toast"

function AdminProducts() {

  /* ================= STATE ================= */

  const [products, setProducts] = useState([])

  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({

    name: "",

    description: "",

    basePrice: "",

    stock: "",

    image: "",

    category: "",

    colors: "",

    sizes: ""
  })

  /* ================= LOAD PRODUCTS ================= */

  const loadProducts = async () => {

    try {

      const res =
        await api.get("/products")

      const list =
        Array.isArray(res.data)
          ? res.data
          : res.data?.data || []

      setProducts(list)

    } catch (error) {

      console.error(
        "Failed to load products:",
        error
      )

    } finally {

      setLoading(false)
    }
  }


useEffect(() => {

  const init = async () => {

    await loadProducts()
  }

  init()

}, [])



  /* ================= CHANGE ================= */

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target

    setForm(prev => ({

      ...prev,

      [name]: value
    }))
  }

  /* ================= CREATE PRODUCT ================= */

  const createProduct = async () => {

    try {

      const colorList =

        form.colors
          .split(",")
          .map(c => c.trim())
          .filter(Boolean)

      const sizeList =

        form.sizes
          .split(",")
          .map(s => s.trim())
          .filter(Boolean)

      /* ================= VARIANTS ================= */

      const variants = []

      colorList.forEach(color => {

        sizeList.forEach(size => {

          variants.push({

            color,

            size,

            stock:
              Number(form.stock) || 0,

            price:
              Number(form.basePrice) || 0
          })
        })
      })

      /* ================= COLORS ================= */

      const colors =

        colorList.map(color => ({

          name: color
        }))

      /* ================= API ================= */

      await api.post("/products", {

        name:
          form.name,

        description:
          form.description,

        image:
          form.image,

        category:
          form.category,

        price:
          Number(form.basePrice),

        stock:
          Number(form.stock),

        sizes:
          sizeList,

        colors,

        variants
      })

      toast.success(
        "Product created"
      )

      /* ================= RESET ================= */

      setForm({

        name: "",

        description: "",

        basePrice: "",

        stock: "",

        image: "",

        category: "",

        colors: "",

        sizes: ""
      })

      loadProducts()

    } catch (err) {

      console.error(
        "CREATE PRODUCT ERROR:",
        err
      )

      toast.error(
        "Failed to create product"
      )
    }
  }

  /* ================= DELETE ================= */

  const deleteProduct = async (id) => {

    try {

      await api.delete(
        `/products/${id}`
      )

      toast.success(
        "Product deleted"
      )

      loadProducts()

    } catch (err) {

      console.error(
        "DELETE PRODUCT ERROR:",
        err
      )

      toast.error(
        "Failed to delete product"
      )
    }
  }

  /* ================= LOADING ================= */

  if (loading) {

    return (

      <div style={loadingWrap}>

        <h2>
          Loading Products...
        </h2>

      </div>
    )
  }

  /* ================= RENDER ================= */

  return (

    <div style={page}>

      <h1 style={title}>
        Admin Product Manager
      </h1>

      {/* ================= CREATE FORM ================= */}

      <div style={formCard}>

        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          style={input}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          style={textarea}
        />

        <input
          name="basePrice"
          placeholder="Base Price"
          value={form.basePrice}
          onChange={handleChange}
          style={input}
        />

        <input
          name="stock"
          placeholder="Stock Quantity"
          value={form.stock}
          onChange={handleChange}
          style={input}
        />

       <input
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append("image", file)

      const res = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      setForm(prev => ({
        ...prev,
        image: res.data.url
      }))

      toast.success("Image uploaded")

    } catch (err) {
      console.error("UPLOAD ERROR:", err)
      toast.error("Upload failed")
    }
  }}
  style={input}
/>git add .
git commit -m "frontend: replace image URL with upload button + preview"
git push origin main

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          style={input}
        />

        <input
          name="colors"
          placeholder="Colors (Black, White, Red)"
          value={form.colors}
          onChange={handleChange}
          style={input}
        />

        <input
          name="sizes"
          placeholder="Sizes (S, M, L, XL)"
          value={form.sizes}
          onChange={handleChange}
          style={input}
        />

        {/* ================= IMAGE PREVIEW ================= */}

        {form.image && (

          <img
            src={form.image}
            alt="preview"
            style={preview}
          />
        )}

        <button
          onClick={createProduct}
          style={createButton}
        >
          Add Product
        </button>

      </div>

      {/* ================= PRODUCT GRID ================= */}

      <div style={grid}>

        {products.map(product => (

          <div
            key={product._id}
            style={card}
          >

            <img
              src={
                product.image ||
                "/placeholder.png"
              }

              alt={product.name}

              style={image}
            />

            <div style={content}>

              <h2 style={productName}>
                {product.name}
              </h2>

              <p style={price}>
                {"$" + Number(
                  product.price || 0
                ).toFixed(2)}
              </p>

              <p style={category}>
                {product.category}
              </p>

              <p style={small}>
                Variants:
                {" "}
                {product.variants?.length || 0}
              </p>

              <button
                onClick={() =>
                  deleteProduct(product._id)
                }

                style={deleteButton}
              >
                Delete
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}

export default AdminProducts

/* ================= STYLES ================= */

const page = {

  padding: 30,

  background: "#020617",

  minHeight: "100vh",

  color: "white"
}

const loadingWrap = {

  minHeight: "100vh",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  background: "#020617",

  color: "white"
}

const title = {

  fontSize: 36,

  marginBottom: 30
}

const formCard = {

  background: "#0f172a",

  padding: 24,

  borderRadius: 20,

  marginBottom: 40,

  display: "flex",

  flexDirection: "column",

  gap: 14,

  border:
    "1px solid #1e293b"
}

const input = {

  padding: 14,

  borderRadius: 12,

  border:
    "1px solid #334155",

  background: "#111827",

  color: "white",

  fontSize: 14
}

const textarea = {

  minHeight: 100,

  padding: 14,

  borderRadius: 12,

  border:
    "1px solid #334155",

  background: "#111827",

  color: "white",

  fontSize: 14
}

const preview = {

  width: 220,

  borderRadius: 14,

  border:
    "1px solid #334155"
}

const createButton = {

  padding: "14px 20px",

  borderRadius: 14,

  border: "none",

  background:
    "linear-gradient(to right, #22c55e, #16a34a)",

  color: "white",

  fontWeight: "bold",

  cursor: "pointer"
}

const grid = {

  display: "grid",

  gridTemplateColumns:
    "repeat(auto-fit, minmax(300px, 1fr))",

  gap: 24
}

const card = {

  background: "#0f172a",

  borderRadius: 20,

  overflow: "hidden",

  border:
    "1px solid #1e293b"
}

const image = {

  width: "100%",

  height: 260,

  objectFit: "cover",

  background: "#111827"
}

const content = {

  padding: 20
}

const productName = {

  margin: 0,

  marginBottom: 10
}

const price = {

  color: "#22c55e",

  fontWeight: "bold",

  fontSize: 20
}

const category = {

  opacity: 0.7
}

const small = {

  fontSize: 13,

  opacity: 0.7
}

const deleteButton = {

  marginTop: 16,

  padding: "10px 14px",

  borderRadius: 10,

  border: "none",

  background: "#dc2626",

  color: "white",

  cursor: "pointer"
}

