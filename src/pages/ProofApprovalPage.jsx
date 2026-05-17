import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import api from "../services/api"

export default function ProofApprovalPage() {
  const { id } = useParams()

  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)

  useEffect(() => {
    let mounted = true

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/invoices/${id}`)

        if (mounted) {
          setInvoice(res.data.data)
        }
      } catch (error) {
        console.error("LOAD PROOF ERROR:", error)
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
  }, [id])

  const approveProof = async () => {
    if (!invoice?.customerName || !invoice?.customerEmail) {
      alert("Customer information is missing from this invoice.")
      return
    }

    try {
      setApproving(true)

      const res = await api.patch(
        `/invoices/${id}/approve-proof`,
        {
          approvalName: invoice.customerName,
          approvalEmail: invoice.customerEmail
        }
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

  const getProofFiles = () => {
    const files = invoice?.finalProof?.files || []

    if (files.length) return files

    if (invoice?.finalProof?.imageUrl) {
      return [
        {
          url: invoice.finalProof.imageUrl,
          fileName: invoice.finalProof.fileName || "Final Proof",
          mimeType: invoice.finalProof.imageUrl.toLowerCase().endsWith(".pdf")
            ? "application/pdf"
            : "image"
        }
      ]
    }

    return []
  }

  if (loading) {
    return <main style={page}>Loading proof...</main>
  }

  if (!invoice) {
    return <main style={page}>Invoice not found.</main>
  }

  const proofFiles = getProofFiles()

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

        {proofFiles.length === 0 ? (
          <p>No proof has been uploaded yet.</p>
        ) : (
          <div style={proofGrid}>
            {proofFiles.map((proof, index) => {
              const isPdf =
                proof.mimeType?.includes("pdf") ||
                proof.url?.toLowerCase().endsWith(".pdf")

              return (
                <div key={proof.url || index} style={proofCard}>
                  <p style={proofTitle}>
                    Proof {index + 1}
                  </p>

                  {isPdf ? (
                    <a
                      href={proof.url}
                      target="_blank"
                      rel="noreferrer"
                      style={buttonLink}
                    >
                      Open PDF Proof
                    </a>
                  ) : (
                    <img
                      src={proof.url}
                      alt={proof.fileName || `Proof ${index + 1}`}
                      style={proofImage}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {invoice.finalProof?.approved ? (
          <div style={approvedBox}>
            <h2>Proof Approved</h2>

            <p>
              Approved by:{" "}
              {invoice.finalProof.approvalName ||
                invoice.customerName ||
                "Customer"}
            </p>
          </div>
        ) : (
          <div style={approvalBox}>
            <h2>Approve Final Proofs</h2>

            <p style={approvalText}>
              By clicking approve, you confirm these final proofs are approved
              for production under the customer name and email on this invoice.
            </p>

            <button
              type="button"
              onClick={approveProof}
              disabled={approving || proofFiles.length === 0}
              style={{
                ...button,
                opacity:
                  approving || proofFiles.length === 0
                    ? 0.6
                    : 1
              }}
            >
              {approving ? "Approving..." : "Approve Final Proofs"}
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
  maxWidth: 980,
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

const proofGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 18,
  marginTop: 24
}

const proofCard = {
  border: "1px solid #ddd",
  borderRadius: 14,
  padding: 14,
  background: "#fafafa"
}

const proofTitle = {
  fontWeight: 800
}

const proofImage = {
  width: "100%",
  maxHeight: 500,
  objectFit: "contain",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff"
}

const approvalBox = {
  marginTop: 24
}

const approvalText = {
  maxWidth: 620,
  margin: "0 auto 18px",
  color: "#555",
  lineHeight: 1.6
}

const approvedBox = {
  marginTop: 24,
  background: "#dcfce7",
  border: "1px solid #22c55e",
  borderRadius: 14,
  padding: 18
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