import { useEffect, useState } from "react"
import api from "../services/api"

function AdminProducts() {

  const [products, setProducts] = useState([])

  const [form, setForm] = useState({
    name: "",
    basePrice: "",
    image: "",
    category: "",
    colors: "",
    sizes: ""
  })

useEffect(() => {

  const fetchProducts = async () => {

    try {

      const res = await api.get("/products")

      setProducts(res.data)

    } catch (error) {

      console.error("Failed to load products:", error)

    }

  }

  fetchProducts()

}, [])

const handleChange = (e) => {

    const { name, value } = e.target

    setForm({
      ...form,
      [name]: value
    })

  }

  const createProduct = async () => {

    await api.post("/products", {

      name: form.name,
      basePrice: Number(form.basePrice),
      image: form.image,
      category: form.category,
      colors: form.colors.split(","),
      sizes: form.sizes.split(",")

    })

    setForm({
      name: "",
      basePrice: "",
      image: "",
      category: "",
      colors: "",
      sizes: ""
    })


    setProducts()

  }

  const deleteProduct = async (id) => {

    await api.delete(`/products/${id}`)

    setProducts()

  }

  return (

    <div style={{ padding: "40px" }}>

      <h1>Admin Product Manager</h1>

      {/* CREATE PRODUCT */}

      <div style={{ marginBottom: "30px", maxWidth: "400px" }}>

        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="basePrice"
          placeholder="Base Price"
          value={form.basePrice}
          onChange={handleChange}
        />

        <input
          name="image"
          placeholder="Image URL"
          value={form.image}
          onChange={handleChange}
        />

        <input
          name="category"
          placeholder="Category (Apparel, Headwear, Laser)"
          value={form.category}
          onChange={handleChange}
        />

        <input
          name="colors"
          placeholder="Colors (comma separated)"
          value={form.colors}
          onChange={handleChange}
        />

        <input
          name="sizes"
          placeholder="Sizes (comma separated)"
          value={form.sizes}
          onChange={handleChange}
        />

        <button onClick={createProduct}>
          Add Product
        </button>

      </div>

      {/* PRODUCT LIST */}

      <div>

        {products.map(product => (

          <div
            key={product._id}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              marginBottom: "10px"
            }}
          >

            <strong>{product.name}</strong>

            <p>
              ${product.basePrice} | {product.category}
            </p>

            <button onClick={() => deleteProduct(product._id)}>
              Delete
            </button>

          </div>

        ))}

      </div>

    </div>

  )

}

export default AdminProducts