import { useMemo, useState } from "react"
import api from "../../services/api"

const TAX_RATE = 0.0825

const initialForm = {
  customerName: "",
  email: "",
  phone: "",
  itemName: "",
  quantity: 1,
  price: "",
  shipping: "",
  paymentMethod: "square",
  notes: ""
}

export default function CreateCustomOrder() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")

  const totals = useMemo(() => {
    const quantity = Number(form.quantity || 0)
    const price = Number(form.price || 0)
    const shipping = Number(form.shipping || 0)

    const subtotal = quantity * price
    const tax = subtotal * TAX_RATE
    const total = subtotal + tax + shipping

    return { quantity, price, shipping, subtotal, tax, total }
  }, [form.quantity, form.price, form.shipping])

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus("")

    try {
      setLoading(true)

      const payload = {
        customerName: form.customerName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),

        items: [
          {
            name: form.itemName.trim(),
            quantity: totals.quantity,
            price: totals.price
          }
        ],

        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        finalPrice: totals.total,

        paymentMethod: form.paymentMethod,
        notes: form.notes.trim(),

        orderType: "custom",
        source: "admin",
        status:
          form.paymentMethod === "square"
            ? "payment_required"
            : "ready_for_production"
      }

      const res = await api.post("/orders/custom", payload)

      console.log("✅ CUSTOM ORDER CREATED:", res.data)

      setStatus("✅ Custom order created successfully")
      setForm(initialForm)
    } catch (err) {
      console.error("❌ CUSTOM ORDER ERROR:", err)

      setStatus(
        err?.response?.data?.message ||
          "❌ Failed to create custom order"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={container}>
      <section style={card}>
        <div style={header}>
          <div>
            <p style={eyebrow}>Admin Order Entry</p>
            <h1 style={title}>🧾 Create Custom Order</h1>
          </div>

          <div style={badge}>
            8.25% Tax
          </div>
        </div>

        {status && (
          <div style={statusBox}>
            {status}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={grid}>
            <input
              name="customerName"
              placeholder="Customer Name"
              value={form.customerName}
              onChange={handleChange}
              required
              style={input}
            />

            <input
              type="email"
              name="email"
              placeholder="Customer Email"
              value={form.email}
              onChange={handleChange}
              required
              style={input}
            />

            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              style={input}
            />

            <input
              name="itemName"
              placeholder="Service / Product"
              value={form.itemName}
              onChange={handleChange}
              required
              style={input}
            />

            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              required
              style={input}
            />

            <input
              type="number"
              name="price"
              placeholder="Price"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
              style={input}
            />

            <input
              type="number"
              name="shipping"
              placeholder="Shipping"
              min="0"
              step="0.01"
              value={form.shipping}
              onChange={handleChange}
              style={input}
            />

            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              style={input}
            >
              <option value="square">Square</option>
              <option value="cash">Cash</option>
              <option value="venmo">Venmo</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <textarea
            name="notes"
            placeholder="Order notes"
            value={form.notes}
            onChange={handleChange}
            rows={4}
            style={textarea}
          />

          <section style={summary}>
            <div style={summaryRow}>
              <span>Subtotal</span>
              <strong>${totals.subtotal.toFixed(2)}</strong>
            </div>

            <div style={summaryRow}>
              <span>Tax</span>
              <strong>${totals.tax.toFixed(2)}</strong>
            </div>

            <div style={summaryRow}>
              <span>Shipping</span>
              <strong>${totals.shipping.toFixed(2)}</strong>
            </div>

            <div style={totalRow}>
              <span>Total</span>
              <strong>${totals.total.toFixed(2)}</strong>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...button,
              opacity: loading ? 0.65 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Creating Order..." : "Create Custom Order"}
          </button>
        </form>
      </section>
    </main>
  )
}

const container = {
  minHeight: "100vh",
  padding: "32px",
  background:
    "radial-gradient(circle at top left, rgba(37, 99, 235, 0.22), transparent 35%), #020617",
  color: "#fff"
}

const card = {
  maxWidth: "900px",
  margin: "0 auto",
  padding: "28px",
  borderRadius: "22px",
  background: "rgba(15, 23, 42, 0.92)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 24px 80px rgba(0,0,0,0.35)"
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "center",
  marginBottom: "22px"
}

const eyebrow = {
  margin: 0,
  color: "#38bdf8",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  textTransform: "uppercase"
}

const title = {
  margin: "6px 0 0",
  fontSize: "30px"
}

const badge = {
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(34, 197, 94, 0.12)",
  color: "#86efac",
  border: "1px solid rgba(34, 197, 94, 0.35)",
  fontWeight: "800"
}

const statusBox = {
  marginBottom: "18px",
  padding: "12px 14px",
  borderRadius: "14px",
  background: "rgba(2, 6, 23, 0.7)",
  border: "1px solid rgba(148, 163, 184, 0.25)"
}

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px"
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "14px"
}

const input = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "12px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
  outline: "none"
}

const textarea = {
  ...input,
  resize: "vertical",
  minHeight: "110px"
}

const summary = {
  padding: "18px",
  borderRadius: "16px",
  background: "#020617",
  border: "1px solid rgba(148, 163, 184, 0.2)"
}

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  color: "#cbd5e1"
}

const totalRow = {
  display: "flex",
  justifyContent: "space-between",
  paddingTop: "14px",
  marginTop: "10px",
  borderTop: "1px solid rgba(148, 163, 184, 0.25)",
  fontSize: "22px",
  color: "#fff"
}

const button = {
  border: "none",
  padding: "15px 18px",
  borderRadius: "14px",
  background: "linear-gradient(135deg, #22c55e, #06b6d4)",
  color: "#020617",
  fontWeight: "900"
}