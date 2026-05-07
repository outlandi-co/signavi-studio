import { useState } from "react"
import api from "../services/api"

export default function Support() {

  const [form, setForm] = useState({

    customerName: "",

    email: "",

    subject: "",

    message: "",

    orderNumber: ""
  })

  const [loading, setLoading] =
    useState(false)

  /* ================= CHANGE ================= */

  const handleChange = (e) => {

    setForm(prev => ({

      ...prev,

      [e.target.name]:
        e.target.value
    }))
  }

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      setLoading(true)

      await api.post(
        "/support",
        form
      )

      alert(
        "Support ticket submitted successfully"
      )

      setForm({

        customerName: "",

        email: "",

        subject: "",

        message: "",

        orderNumber: ""
      })

    } catch (err) {

      console.error(
        "❌ SUPPORT ERROR:",
        err
      )

      alert(
        "Failed to submit support ticket"
      )

    } finally {

      setLoading(false)
    }
  }

  return (
    <div style={page}>

      <div style={card}>

        <h1 style={title}>
          🛟 Contact Support
        </h1>

        <p style={subtitle}>
          Need help with an order,
          quote, shipping, or
          production update?
        </p>

        <form onSubmit={handleSubmit}>

          {/* NAME */}

          <input
            type="text"

            name="customerName"

            placeholder="Full Name"

            value={form.customerName}

            onChange={handleChange}

            style={input}

            required
          />

          {/* EMAIL */}

          <input
            type="email"

            name="email"

            placeholder="Email Address"

            value={form.email}

            onChange={handleChange}

            style={input}

            required
          />

          {/* ORDER */}

          <input
            type="text"

            name="orderNumber"

            placeholder="Order Number (optional)"

            value={form.orderNumber}

            onChange={handleChange}

            style={input}
          />

          {/* SUBJECT */}

          <input
            type="text"

            name="subject"

            placeholder="Subject"

            value={form.subject}

            onChange={handleChange}

            style={input}

            required
          />

          {/* MESSAGE */}

          <textarea

            name="message"

            placeholder="How can we help you?"

            value={form.message}

            onChange={handleChange}

            rows={8}

            style={textarea}

            required
          />

          {/* BUTTON */}

          <button
            type="submit"

            disabled={loading}

            style={button}
          >
            {
              loading
                ? "Submitting..."
                : "Submit Ticket"
            }
          </button>

        </form>

      </div>

    </div>
  )
}

/* ================= STYLES ================= */

const page = {

  minHeight: "100vh",

  background: "#020617",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  padding: 20
}

const card = {

  width: "100%",

  maxWidth: 700,

  background: "#0f172a",

  borderRadius: 16,

  padding: 32,

  border:
    "1px solid #1e293b"
}

const title = {

  color: "white",

  marginBottom: 10
}

const subtitle = {

  color: "#94a3b8",

  marginBottom: 24
}

const input = {

  width: "100%",

  padding: 14,

  borderRadius: 10,

  border:
    "1px solid #334155",

  background: "#020617",

  color: "white",

  marginBottom: 16
}

const textarea = {

  width: "100%",

  padding: 14,

  borderRadius: 10,

  border:
    "1px solid #334155",

  background: "#020617",

  color: "white",

  marginBottom: 20,

  resize: "vertical"
}

const button = {

  width: "100%",

  padding: 16,

  borderRadius: 10,

  border: "none",

  background: "#22c55e",

  color: "white",

  fontWeight: "bold",

  cursor: "pointer"
}