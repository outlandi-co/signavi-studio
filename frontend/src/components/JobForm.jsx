import { useState } from "react"
import axios from "axios"

const API_URL = "http://localhost:5050/api"

function JobForm({ refreshJobs }) {

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    productionType: "",
    product: "",
    quantity: "",
    notes: ""
  })

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    })

  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      await axios.post(`${API_URL}/jobs`, {
        ...form,
        status: "pending"
      })

      setForm({
        customerName: "",
        email: "",
        productionType: "",
        product: "",
        quantity: "",
        notes: ""
      })

      refreshJobs()

    } catch (error) {

      console.error("Job creation failed:", error)

    }

  }

  return (

    <form
      onSubmit={handleSubmit}
      style={{
        background: "#f4f4f4",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "20px"
      }}
    >

      <h2>Create Job</h2>

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

      <input
        name="product"
        placeholder="Product"
        value={form.product}
        onChange={handleChange}
        required
      />

      <input
        name="quantity"
        type="number"
        placeholder="Quantity"
        value={form.quantity}
        onChange={handleChange}
        required
      />

      <select
        name="productionType"
        value={form.productionType}
        onChange={handleChange}
        required
      >

        <option value="">Select Production Type</option>
        <option value="screenprint">Screen Print</option>
        <option value="dtf">DTF</option>
        <option value="laser">Laser Engraving</option>
        <option value="vinyl">Vinyl</option>

      </select>

      <textarea
        name="notes"
        placeholder="Notes"
        value={form.notes}
        onChange={handleChange}
      />

      <br />

      <button type="submit">
        Create Job
      </button>

    </form>

  )

}

export default JobForm
