import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const BACKEND_BASE =
  API_BASE.replace(/\/api\/?$/, "")

const resolveFileUrl = (url = "") => {
  if (!url) return ""

  if (url.startsWith("http")) {
    return url
  }

  if (url.startsWith("/uploads")) {
    return `${BACKEND_BASE}${url}`
  }

  if (url.startsWith("uploads")) {
    return `${BACKEND_BASE}/${url}`
  }

  return `${BACKEND_BASE}/uploads/proofs/${url}`
}

export default function ProofApprovalPage() {
  const { id } = useParams()

  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError("")

        const res = await api.get(`/invoices/${id}`)

        if (mounted) {
          setInvoice(res.data?.data || res.data?.invoice || res.data)
        }
      } catch (err) {
        console.error("LOAD PROOF ERROR:", err.response?.data || err)

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              "Failed to load proof"
          )
        }
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

  const getProofFiles = () => {
    const files = invoice?.finalProof?.files || []

    if (files.length) {
      return files.map((file) => ({
        ...file,
        url: resolveFileUrl(file.url)
      }))
    }

    if (invoice?.finalProof?.imageUrl) {
      return [
        {
          url: resolveFileUrl(invoice.finalProof.imageUrl),
          fileName:
            invoice.finalProof.fileName ||
            "Final Proof",
          mimeType:
            invoice.finalProof.imageUrl
              .toLowerCase()
              .endsWith(".pdf")
              ? "application/pdf"
              : "image"
        }
      ]
    }

    return []
  }

  const approveProof = async () => {
    if (approving) return

    if (!invoice?.customerName || !invoice?.customerEmail) {
      toast.error("Customer information is missing from this invoice.")
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

      setInvoice(res.data?.data || res.data?.invoice || res.data)

      toast.success("Proof approved successfully")
    } catch (err) {
      console.error("APPROVE PROOF ERROR:", err.response?.data || err)

      toast.error(
        err?.response?.data?.message ||
          "Proof could not be approved."
      )
    } finally {
      setApproving(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading proof...
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
        <section className="mx-auto max-w-3xl rounded-3xl border border-red-500/40 bg-red-950/40 p-8 text-center text-red-300">
          <h1 className="mb-3 text-3xl font-bold">
            ⚠️ Error
          </h1>

          <p>{error}</p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-cyan-500 px-6 py-3 font-bold text-black transition hover:bg-cyan-400"
          >
            Return Home
          </Link>
        </section>
      </main>
    )
  }

  if (!invoice) {
    return (
      <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
        <section className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-950/80 p-8 text-center">
          Invoice not found.
        </section>
      </main>
    )
  }

  const proofFiles = getProofFiles()
  const approved = Boolean(invoice.finalProof?.approved)

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            Final Design Proof
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Review your final design proof carefully before approving production.
          </p>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20 md:p-8">
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <InfoBox
              label="Invoice"
              value={invoice.invoiceNumber || id}
            />

            <InfoBox
              label="Customer"
              value={invoice.customerName || "Customer"}
            />

            <InfoBox
              label="Status"
              value={invoice.status || "Pending"}
            />
          </div>

          {proofFiles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-[#020617] p-10 text-center text-slate-500">
              No proof has been uploaded yet.
            </div>
          ) : (
            <div className="grid gap-6">
              {proofFiles.map((proof, index) => {
                const isPdf =
                  proof.mimeType?.includes("pdf") ||
                  proof.url?.toLowerCase().endsWith(".pdf")

                return (
                  <div
                    key={proof.url || index}
                    className="rounded-3xl border border-slate-800 bg-[#020617] p-5"
                  >
                    <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Proof {index + 1}
                        </p>

                        <h2 className="text-xl font-bold">
                          {proof.fileName || "Final Proof"}
                        </h2>
                      </div>

                      <a
                        href={proof.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-slate-700 px-4 py-2 text-sm font-bold text-cyan-300 transition hover:border-cyan-400"
                      >
                        Open in New Tab
                      </a>
                    </div>

                    {isPdf ? (
                      <iframe
                        src={proof.url}
                        title={`Proof ${index + 1}`}
                        className="h-[650px] w-full rounded-2xl border border-slate-800 bg-white"
                      />
                    ) : (
                      <img
                        src={proof.url}
                        alt={proof.fileName || `Proof ${index + 1}`}
                        className="max-h-[700px] w-full rounded-2xl border border-slate-800 bg-white object-contain"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {approved ? (
            <div className="mt-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
              <h2 className="text-2xl font-bold text-emerald-300">
                ✅ Proof Approved
              </h2>

              <p className="mt-3 text-slate-300">
                Approved by{" "}
                <strong>
                  {invoice.finalProof?.approvalName ||
                    invoice.customerName ||
                    "Customer"}
                </strong>
              </p>

              {invoice.paymentUrl && (
                <a
                  href={invoice.paymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex rounded-full bg-emerald-500 px-6 py-3 font-bold text-black transition hover:bg-emerald-400"
                >
                  💳 Pay Invoice
                </a>
              )}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6 text-center">
              <h2 className="text-2xl font-bold">
                Approve Final Proofs
              </h2>

              <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-300">
                By clicking approve, you confirm these final proofs are approved
                for production under the customer name and email on this invoice.
              </p>

              <button
                type="button"
                onClick={approveProof}
                disabled={approving || proofFiles.length === 0}
                className="mt-6 rounded-2xl bg-cyan-500 px-8 py-4 font-black text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {approving ? "Approving..." : "Approve Final Proofs"}
              </button>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="rounded-full border border-slate-700 px-6 py-3 font-bold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              Return Home
            </Link>
          </div>
        </section>
      </section>
    </main>
  )
}

function InfoBox({
  label,
  value
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#020617] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-white">
        {value}
      </p>
    </div>
  )
}