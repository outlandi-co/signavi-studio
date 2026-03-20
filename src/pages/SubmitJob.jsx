import { useState } from "react"
import api from "../services/api"
import UploadArtwork from "../components/UploadArtwork"

function SubmitJob() {

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    productionType: "dtf",
    product: "",
    quantity: "",
    notes: "",
    artwork: ""
  })

  const setArtwork = (filename) => {
    setForm(prev => ({
      ...prev,
      artwork: filename
    }))
  }

  const handleChange = (e) => {

    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value
    }))

  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    if (!form.customerName || !form.product || !form.quantity) {
      alert("Please fill required fields")
      return
    }

    try {

      await api.post("/jobs", form)

      alert("Job submitted successfully")

      // Reset form
      setForm({
        customerName: "",
        email: "",
        productionType: "dtf",
        product: "",
        quantity: "",
        notes: "",
        artwork: ""
      })

    } catch (error) {

      console.error("Submit job error:", error)
      alert("Failed to submit job")

    }

  }

  return (

    <div style={{ padding: "20px", maxWidth: "500px" }}>

      <h1>Submit Production Job</h1>

      <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"10px" }}>

        <input
          name="customerName"
          placeholder="Customer Name"
          value={form.customerName}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <select
          name="productionType"
          value={form.productionType}
          onChange={handleChange}
        >

          <option value="dtf">DTF</option>
          <option value="screenprint">Screen Print</option>
          <option value="vinyl">Vinyl</option>
          <option value="laser">Laser Engraving</option>

        </select>

        <input
          name="product"
          placeholder="Product (Shirt, Hoodie, Hat...)"
          value={form.product}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          required
        />

        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
        />

        {/* Artwork Upload */}

        <UploadArtwork setArtwork={setArtwork} />

        <button type="submit">
          Submit Job
        </button>

      </form>

    </div>

  )

}

export default SubmitJob