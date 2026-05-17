import { useEffect, useState } from "react"
import api from "../../services/api"

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    itemName: "",
    quantity: 1,
    price: "",
    shipping: "",
    notes: ""
  })

  const loadInvoices = async () => {
    try {
      const res = await api.get("/invoices")
      setInvoices(res.data.data || [])
    } catch (error) {
      console.error("LOAD INVOICES ERROR:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false

    const fetchInvoices = async () => {
      try {
        const res = await api.get("/invoices")

        if (!ignore) {
          setInvoices(res.data.data || [])
        }
      } catch (error) {
        console.error("LOAD INVOICES ERROR:", error)
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchInvoices()

    return () => {
      ignore = true
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

const createInvoice = async (e) => {
  e.preventDefault()

  try {
    const payload = {
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      shipping: Number(form.shipping || 0),
      notes: form.notes,

      items: [
        {
          name: form.itemName,
          quantity: Number(form.quantity || 1),
          price: Number(form.price || 0)
        }
      ]
    }

    console.log("📦 CREATE INVOICE PAYLOAD:", payload)

    const res = await api.post("/invoices", payload)

    const invoiceId = res.data?.data?._id

    if (!invoiceId) {
      throw new Error("Invoice ID missing")
    }

    /* ================= CREATE PAYMENT LINK ================= */

    await api.post(
      `/invoices/${invoiceId}/create-payment-link`
    )

    /* ================= SEND EMAIL ================= */

    await api.post(
      `/invoices/${invoiceId}/send`
    )

    setForm({
      customerName: "",
      customerEmail: "",
      itemName: "",
      quantity: 1,
      price: "",
      shipping: "",
      notes: ""
    })

    await loadInvoices()

    alert(
      "Invoice created and emailed successfully."
    )

  } catch (error) {
    console.error("CREATE INVOICE ERROR:", error)

    alert(
      error?.response?.data?.message ||
      "Invoice could not be created."
    )
  }
}

  const markPaid = async (id) => {
    try {
      await api.patch(`/invoices/${id}/mark-paid`)
      loadInvoices()
    } catch (error) {
      console.error("MARK PAID ERROR:", error)
    }
  }

  const startProduction = async (id) => {
    try {
      await api.patch(`/invoices/${id}/start-production`)
      loadInvoices()
    } catch (error) {
      alert(
        error?.response?.data?.message ||
        "Invoice must be paid and proof approved first."
      )
    }
  }

  return (
    <div style={page}>
      <h1 style={heading}>Invoices</h1>

      <p style={subheading}>
        Create invoices with automatic tax calculation.
      </p>

      <form onSubmit={createInvoice} style={card}>
        <h2 style={sectionTitle}>Create Invoice</h2>

        <div style={grid}>

          <input
            name="customerName"
            placeholder="Customer Name"
            value={form.customerName}
            onChange={handleChange}
            style={input}
            required
          />

          <input
            name="customerEmail"
            type="email"
            placeholder="Customer Email"
            value={form.customerEmail}
            onChange={handleChange}
            style={input}
            required
          />

          <input
            name="itemName"
            placeholder="Item / Service"
            value={form.itemName}
            onChange={handleChange}
            style={input}
            required
          />

          <input
            name="quantity"
            type="number"
            min="1"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            style={input}
          />

          <input
            name="price"
            type="number"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            style={input}
          />

          <input
            name="shipping"
            type="number"
            step="0.01"
            placeholder="Shipping"
            value={form.shipping}
            onChange={handleChange}
            style={input}
          />

        </div>

        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          style={textarea}
        />

        <button type="submit" style={primaryButton}>
          Create Invoice
        </button>
      </form>

      <div style={list}>
        <h2 style={sectionTitle}>Invoice List</h2>

        {loading ? (
          <p>Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p>No invoices yet.</p>
        ) : (
          invoices.map((invoice) => (
            <div key={invoice._id} style={invoiceCard}>

              <div>
                <h3 style={invoiceTitle}>
                  {invoice.invoiceNumber || "Invoice"}
                </h3>

                <p>{invoice.customerName}</p>
                <p>{invoice.customerEmail}</p>

                <p>
                  Status: {invoice.status}
                </p>

                <p>
                  Payment: {invoice.paymentStatus}
                </p>

                <p>
                  Subtotal: $
                  {Number(invoice.subtotal || 0).toFixed(2)}
                </p>

                <p>
                  Tax: $
                  {Number(invoice.tax || 0).toFixed(2)}
                </p>

                <p>
                  Shipping: $
                  {Number(invoice.shipping || 0).toFixed(2)}
                </p>

                <p>
                  Total: $
                  {Number(invoice.total || 0).toFixed(2)}
                </p>
              </div>

              <div style={actions}>

                {invoice.paymentStatus !== "paid" && (
                  <button
                    type="button"
                    onClick={() => markPaid(invoice._id)}
                    style={paidButton}
                  >
                    Mark Paid
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => startProduction(invoice._id)}
                  style={productionButton}
                >
                  Start Production
                </button>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const page = {
  color: "#e5e7eb"
}

const heading = {
  fontSize: 36,
  fontWeight: 900,
  margin: 0
}

const subheading = {
  color: "#94a3b8",
  marginBottom: 28
}

const card = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 20,
  padding: 24,
  marginBottom: 28
}

const sectionTitle = {
  marginTop: 0,
  fontSize: 22,
  fontWeight: 900
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14
}

const input = {
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#fff",
  fontWeight: 700
}

const textarea = {
  ...input,
  width: "100%",
  minHeight: 100,
  marginTop: 14,
  boxSizing: "border-box"
}

const primaryButton = {
  marginTop: 16,
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  padding: "14px 18px",
  borderRadius: 14,
  fontWeight: 900,
  cursor: "pointer"
}

const list = {
  display: "grid",
  gap: 14
}

const invoiceCard = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 20,
  padding: 20,
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  alignItems: "center"
}

const invoiceTitle = {
  margin: 0,
  fontSize: 20,
  fontWeight: 900
}

const actions = {
  display: "grid",
  gap: 10
}

const paidButton = {
  background: "#22c55e",
  color: "#020617",
  border: "none",
  padding: "12px 14px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer"
}

const productionButton = {
  background: "#38bdf8",
  color: "#020617",
  border: "none",
  padding: "12px 14px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer"
}