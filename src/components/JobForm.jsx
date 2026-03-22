import { useState } from "react"
import api from "../services/api"
import Button from "../components/UI/Button"

function JobForm({ refreshJobs }) {

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    productionType: "",
    product: "",
    quantity: "",
    notes: ""
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (loading) return

    setLoading(true)
    setSuccess("")
    setError("")

    try {
      await api.post("/jobs", {
        ...form,
        quantity: Number(form.quantity),
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

      setSuccess("✅ Job created successfully!")

      refreshJobs && refreshJobs()

    } catch (err) {
      console.error("❌ Job creation failed:", err)
      setError("❌ Failed to create job")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#1e293b",
        padding: "24px",
        borderRadius: "12px",
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        color: "#fff",
        maxWidth: "500px"
      }}
    >

      <h2 style={{ marginBottom: "10px" }}>Create Job</h2>

      {/* STATUS FEEDBACK */}
      {success && <p style={{ color: "#22c55e" }}>{success}</p>}
      {error && <p style={{ color: "#ef4444" }}>{error}</p>}

      {/* INPUTS */}
      <label>
        Customer Name
        <input
          name="customerName"
          value={form.customerName}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </label>

      <label>
        Email
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          style={inputStyle}
        />
      </label>

      <label>
        Product
        <input
          name="product"
          value={form.product}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </label>

      <label>
        Quantity
        <input
          name="quantity"
          type="number"
          value={form.quantity}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </label>

      <label>
        Production Type
        <select
          name="productionType"
          value={form.productionType}
          onChange={handleChange}
          required
          style={inputStyle}
        >
          <option value="">Select Production Type</option>
          <option value="screenprint">Screen Print</option>
          <option value="dtf">DTF</option>
          <option value="laser">Laser Engraving</option>
          <option value="vinyl">Vinyl</option>
        </select>
      </label>

      <label>
        Notes
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          style={inputStyle}
        />
      </label>

      {/* 🔥 BUTTON */}
      <Button type="submit" loading={loading}>
        ➕ Create Job
      </Button>

    </form>
  )
}

/* 🔥 INPUT STYLE */
const inputStyle = {
  width: "100%",
  marginTop: "4px",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #334155",
  background: "#020617",
  color: "#fff"
}

export default JobForm