import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import api from "../services/api"

export default function ProofApprovalPage() {
  const { id } = useParams()

  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)

  const [form, setForm] = useState({
    approvalName: "",
    approvalEmail: ""
  })

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const res = await api.get(`/invoices/${id}`)
        setInvoice(res.data.data)
      } catch (error) {
        console.error("LOAD PROOF ERROR:", error)
      } finally {
        setLoading(false)
      }
    }

    loadInvoice()
  }, [id])

  const approveProof = async () => {
    if (!form.approvalName || !form.approvalEmail) {
      alert("Please enter your name and email to approve.")
      return
    }

    try {
      setApproving(true)

      const res = await api.patch(
        `/invoices/${id}/approve-proof`,
        form
      )

      setInvoice(res.data.data)

      alert("Proof approved successfully.")
    } catch (error) {
      console.error("APPROVE PROOF ERROR:", error)

      alert(
        error?.response?.data?.message ||
          "Proof could not be approved."
      )
    } finally {
      setApproving(false)
    }
  }

  if (loading) {
    return <main style={page}>Loading proof...</main>
  }

  if (!invoice) {
    return <main style={page}>Invoice not found.</main>
  }

  const proofUrl = invoice.finalProof?.imageUrl || ""
  const isPdf = proofUrl.toLowerCase().endsWith(".pdf")

  return (
    <main style={page}>
      <section style={card}>
        <h1 style={heading}>Final Design Proof</h1>

        <p style={muted}>
          Invoice: {invoice.invoiceNumber}
        </p>

        <p style={muted}>
          Customer: {invoice.customerName}
        </p>

        {!proofUrl ? (
          <p>No proof has been uploaded yet.</p>
        ) : isPdf ? (
          <a
            href={proofUrl}
            target="_blank"
            rel="noreferrer"
            style={buttonLink}
          >
            Open PDF Proof
          </a>
        ) : (
          <img
            src={proofUrl}
            alt="Final proof"
            style={proofImage}
          />
        )}

        {invoice.finalProof?.approved ? (
          <div style={approvedBox}>
            <h2>Proof Approved</h2>

            <p>
              Approved by:{" "}
              {invoice.finalProof.approvalName || "Customer"}
            </p>
          </div>
        ) : (
          <div style={approvalBox}>
            <h2>Approve Final Proof</h2>

            <input
              placeholder="Your Name"
              value={form.approvalName}
              onChange={(e) =>
                setForm({
                  ...form,
                  approvalName: e.target.value
                })
              }
              style={input}
            />

            <input
              placeholder="Your Email"
              type="email"
              value={form.approvalEmail}
              onChange={(e) =>
                setForm({
                  ...form,
                  approvalEmail: e.target.value
                })
              }
              style={input}
            />

            <button
              type="button"
              onClick={approveProof}
              disabled={approving}
              style={button}
            >
              {approving ? "Approving..." : "Approve Final Proof"}
            </button>
          </div>
        )}

        <Link to="/" style={homeLink}>
          Return Home
        </Link>
      </section>
    </main>
  )
}

const page = {
  minHeight: "100vh",
  padding: "2rem",
  background: "#f5f5f5",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "#111"
}

const card = {
  background: "#fff",
  borderRadius: 18,
  padding: 30,
  maxWidth: 780,
  width: "100%",
  textAlign: "center",
  boxShadow: "0 12px 35px rgba(0,0,0,0.08)"
}

const heading = {
  marginTop: 0,
  fontSize: 32
}

const muted = {
  color: "#555"
}

const proofImage = {
  width: "100%",
  maxHeight: 560,
  objectFit: "contain",
  margin: "20px 0",
  borderRadius: 12,
  border: "1px solid #ddd"
}

const approvalBox = {
  marginTop: 24
}

const approvedBox = {
  marginTop: 24,
  background: "#dcfce7",
  border: "1px solid #22c55e",
  borderRadius: 14,
  padding: 18
}

const input = {
  display: "block",
  width: "100%",
  padding: 14,
  marginBottom: 12,
  borderRadius: 10,
  border: "1px solid #ccc",
  boxSizing: "border-box"
}

const button = {
  background: "#111",
  color: "#fff",
  padding: "14px 18px",
  borderRadius: 10,
  border: "none",
  fontWeight: 800,
  cursor: "pointer"
}

const buttonLink = {
  display: "inline-block",
  background: "#111",
  color: "#fff",
  padding: "14px 18px",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 800,
  margin: "20px 0"
}

const homeLink = {
  display: "block",
  marginTop: 24,
  color: "#111"
}