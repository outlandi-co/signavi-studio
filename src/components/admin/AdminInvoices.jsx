import { useEffect, useState } from "react"
import api from "../../services/api"

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [proofUploadingId, setProofUploadingId] = useState("")

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
  let mounted = true

  const timer = setTimeout(async () => {
    if (!mounted) return

    try {
      const res = await api.get("/invoices")

      if (mounted) {
        setInvoices(res.data.data || [])
      }
    } catch (error) {
      console.error("LOAD INVOICES ERROR:", error)
    } finally {
      if (mounted) {
        setLoading(false)
      }
    }
  }, 0)

  return () => {
    mounted = false
    clearTimeout(timer)
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

      const res = await api.post("/invoices", payload)
      const invoiceId = res.data?.data?._id

      if (!invoiceId) {
        throw new Error("Invoice ID missing")
      }

      await api.post(`/invoices/${invoiceId}/create-payment-link`)
      await api.post(`/invoices/${invoiceId}/send`)

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

      alert("Invoice created and emailed successfully.")
    } catch (error) {
      console.error("CREATE INVOICE ERROR:", error)

      alert(
        error?.response?.data?.message ||
          "Invoice could not be created."
      )
    }
  }

  const uploadProof = async (invoiceId, file) => {
    if (!file) return

    try {
      setProofUploadingId(invoiceId)

      const formData = new FormData()
      formData.append("proof", file)

      await api.patch(
        `/invoices/${invoiceId}/final-proof`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      )

      await loadInvoices()

      alert("Final proof uploaded successfully.")
    } catch (error) {
      console.error("UPLOAD PROOF ERROR:", error)

      alert(
        error?.response?.data?.message ||
          "Final proof could not be uploaded."
      )
    } finally {
      setProofUploadingId("")
    }
  }

  const copyProofLink = async (invoiceId) => {
    const url = `${window.location.origin}/proof/${invoiceId}`
    await navigator.clipboard.writeText(url)
    alert("Proof approval link copied.")
  }

  const sendPaymentEmail = async (invoiceId) => {
    try {
      await api.post(`/invoices/${invoiceId}/create-payment-link`)
      await api.post(`/invoices/${invoiceId}/send`)
      await loadInvoices()
      alert("Payment email sent successfully.")
    } catch (error) {
      console.error("SEND PAYMENT EMAIL ERROR:", error)

      alert(
        error?.response?.data?.message ||
          "Payment email could not be sent."
      )
    }
  }

  const markPaid = async (id) => {
    try {
      await api.patch(`/invoices/${id}/mark-paid`)
      await loadInvoices()
    } catch (error) {
      console.error("MARK PAID ERROR:", error)
    }
  }

  const startProduction = async (id) => {
    try {
      await api.patch(`/invoices/${id}/start-production`)
      await loadInvoices()
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Invoice must be paid before production starts."
      )
    }
  }

  return (
    <div style={page}>
      <h1 style={heading}>Invoices</h1>

      <p style={subheading}>
        Create invoices, upload final proofs, send approvals, and manage payments.
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
              <div style={invoiceInfo}>
                <h3 style={invoiceTitle}>
                  {invoice.invoiceNumber || "Invoice"}
                </h3>

                <p>{invoice.customerName}</p>
                <p>{invoice.customerEmail}</p>

                <p>Status: {invoice.status}</p>
                <p>Payment: {invoice.paymentStatus}</p>

                <p>
                  Total: ${Number(invoice.total || 0).toFixed(2)}
                </p>

                {invoice.finalProof?.imageUrl && (
                  <div style={proofBox}>
                    <p style={proofLabel}>Final Proof Uploaded</p>

                    {invoice.finalProof.imageUrl
                      .toLowerCase()
                      .endsWith(".pdf") ? (
                      <a
                        href={invoice.finalProof.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={proofLink}
                      >
                        View PDF Proof
                      </a>
                    ) : (
                      <img
                        src={invoice.finalProof.imageUrl}
                        alt="Final proof"
                        style={proofPreview}
                      />
                    )}

                    <p>
                      Approved:{" "}
                      {invoice.finalProof.approved ? "Yes" : "No"}
                    </p>
                  </div>
                )}
              </div>

              <div style={actions}>
                <label style={fileLabel}>
                  Upload Final Proof
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      uploadProof(invoice._id, e.target.files?.[0])
                    }
                    style={{ display: "none" }}
                  />
                </label>

                {proofUploadingId === invoice._id && (
                  <p>Uploading...</p>
                )}

                <button
                  type="button"
                  onClick={() => copyProofLink(invoice._id)}
                  style={secondaryButton}
                >
                  Copy Proof Link
                </button>

                <button
                  type="button"
                  onClick={() => sendPaymentEmail(invoice._id)}
                  style={primaryButtonSmall}
                >
                  Send Payment Email
                </button>

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
  alignItems: "flex-start"
}

const invoiceInfo = {
  flex: 1
}

const invoiceTitle = {
  margin: 0,
  fontSize: 20,
  fontWeight: 900
}

const actions = {
  display: "grid",
  gap: 10,
  minWidth: 200
}

const fileLabel = {
  background: "#f97316",
  color: "#020617",
  border: "none",
  padding: "12px 14px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer",
  textAlign: "center"
}

const secondaryButton = {
  background: "#a78bfa",
  color: "#020617",
  border: "none",
  padding: "12px 14px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer"
}

const primaryButtonSmall = {
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  padding: "12px 14px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer"
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

const proofBox = {
  marginTop: 16,
  padding: 12,
  background: "#0f172a",
  borderRadius: 14,
  border: "1px solid #334155"
}

const proofLabel = {
  fontWeight: 900,
  color: "#22d3ee"
}

const proofPreview = {
  width: 180,
  maxHeight: 180,
  objectFit: "contain",
  borderRadius: 10,
  border: "1px solid #334155"
}

const proofLink = {
  color: "#22d3ee",
  fontWeight: 900
}