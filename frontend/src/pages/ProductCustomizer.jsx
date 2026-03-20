import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"

import UploadArtwork from "../components/UploadArtwork"
import ProductMockup from "../components/ProductMockup"

function ProductCustomizer() {

  const { id } = useParams()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  const [printLocation, setPrintLocation] = useState("front")

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    quantity: 1,
    productionType: "screenprint",
    artwork: ""
  })

  /* 🔥 CENTERED DEFAULT DESIGN */
  const [design, setDesign] = useState({
    x: 150,
    y: 150,
    size: 120
  })

  /* ---------------- LOAD PRODUCT ---------------- */
  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`)
        setProduct(res.data)
      } catch (err) {
        console.error("❌ Product load failed:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  /* ---------------- HANDLE INPUT ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: name === "quantity" ? Math.max(1, Number(value)) : value
    }))
  }

  /* ---------------- SET ARTWORK ---------------- */
  const setArtwork = (url) => {
    setForm(prev => ({
      ...prev,
      artwork: url
    }))
  }

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!product?._id) {
      alert("Product not loaded yet")
      return
    }

    try {
      const payload = {
        productId: product._id,
        customerName: form.customerName,
        email: form.email,
        quantity: Number(form.quantity),
        productionType: form.productionType,
        artwork: form.artwork,
        design,
        printLocation
      }

      console.log("🚀 ORDER PAYLOAD:", payload)

      const res = await api.post("/orders", payload)

      console.log("✅ RESPONSE:", res.data)
      alert("Order submitted successfully!")

      /* RESET */
      setForm({
        customerName: "",
        email: "",
        quantity: 1,
        productionType: "screenprint",
        artwork: ""
      })

    } catch (err) {
      console.error("❌ Submit error:", err.response?.data || err.message)
      alert("Something went wrong.")
    }
  }

  /* ---------------- STATES ---------------- */
  if (loading) return <p className="text-center mt-10">Loading...</p>
  if (!product) return <p className="text-center mt-10">Product not found</p>

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">

      <h1 className="text-3xl font-bold mb-8">
        Customize: {product.name}
      </h1>

      <div className="grid lg:grid-cols-2 gap-10">

        {/* ================= MOCKUP ================= */}
        <div className="bg-white p-6 rounded-xl shadow">

          <ProductMockup
            image={product.image}
            artwork={form.artwork}
            design={design}
            setDesign={setDesign}
            printLocation={printLocation}
          />

        </div>

        {/* ================= FORM ================= */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow space-y-4"
        >

          <h2 className="text-lg font-semibold">
            Order Details
          </h2>

          {/* NAME */}
          <input
            type="text"
            name="customerName"
            placeholder="Your Name"
            value={form.customerName}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          {/* QUANTITY */}
          <input
            type="number"
            name="quantity"
            min="1"
            value={form.quantity}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* PRODUCTION TYPE */}
          <select
            name="productionType"
            value={form.productionType}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="screenprint">Screen Print</option>
            <option value="dtf">DTF Transfer</option>
            <option value="vinyl">Vinyl</option>
          </select>

          {/* PRINT LOCATION */}
          <select
            value={printLocation}
            onChange={(e) => setPrintLocation(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="front">Front</option>
            <option value="back">Back</option>
            <option value="left">Left Chest</option>
            <option value="right">Right Chest</option>
          </select>

          {/* ARTWORK */}
          <UploadArtwork setArtwork={setArtwork} />

          {/* SIZE */}
          <div>
            <label className="text-sm">Design Size</label>
            <input
              type="range"
              min="50"
              max="300"
              value={design.size}
              onChange={(e) =>
                setDesign(prev => ({
                  ...prev,
                  size: Number(e.target.value)
                }))
              }
              className="w-full"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:opacity-80"
          >
            Submit Order
          </button>

        </form>

      </div>
    </div>
  )
}

export default ProductCustomizer