import { SIGNAVI_V2_API_ORIGIN } from "../config/v2Api.js";

import { useEffect, useState } from "react"
import {
  Link,
  useParams,
  useSearchParams
} from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"

const API_BASE =
  `${SIGNAVI_V2_API_ORIGIN}/api`

const BACKEND_BASE =
  API_BASE.replace(/\/api\/?$/, "")

const resolveFileUrl = (url = "") => {
  if (!url) return ""

  if (/^https?:\/\//i.test(url)) {
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

const formatDate = (value) => {
  if (!value) return "Not yet approved"

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString()
}

export default function ProofApprovalPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()

  // Matches the approval link issued by invoiceController.js
  const approvalToken =
    searchParams.get("approvalToken") || ""

  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [error, setError] = useState("")

  const [approvalName, setApprovalName] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)

  // =====================================================
  // LOAD CUSTOMER PROOF USING PRIVATE APPROVAL TOKEN
  // =====================================================

  useEffect(() => {
    let mounted = true

    const loadProof = async () => {
      try {
        setLoading(true)
        setError("")
        setInvoice(null)

        if (!approvalToken) {
          throw new Error(
            "This approval link is missing its security token. " +
            "Please use the link in your Signavi Studio email."
          )
        }

        const res = await api.get(
          `/invoices/${id}/proof-access`,
          {
            headers: {
              "x-signavi-invoice-approval-token":
                approvalToken
            }
          }
        )

        if (!mounted) return

        const data =
          res.data?.data ||
          res.data?.invoice ||
          res.data

        setInvoice(data)

        // Require the customer to type their own name.
        setApprovalName("")
        setTermsAccepted(false)
      } catch (err) {
        if (!mounted) return

        console.error(
          "LOAD PROOF ERROR:",
          err?.response?.status || err?.message
        )

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load your final proof."
        )
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadProof()

    return () => {
      mounted = false
    }
  }, [id, approvalToken])

  // =====================================================
  // GET PROOF FILES
  // =====================================================

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
          url: resolveFileUrl(
            invoice.finalProof.imageUrl
          ),
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

  // =====================================================
  // CUSTOMER APPROVES FINAL PROOF
  // =====================================================

  const approveProof = async () => {
    if (approving) return

    const name = approvalName.trim()

    if (name.length < 2 || name.length > 150) {
      toast.error(
        "Please enter your full name."
      )
      return
    }

    if (!termsAccepted) {
      toast.error(
        "You must accept the final proof terms."
      )
      return
    }

    const termsVersion =
      invoice?.agreement?.version

    const termsText =
      invoice?.agreement?.text

    if (!termsVersion || !termsText) {
      toast.error(
        "Approval terms are unavailable. Please contact Signavi Studio."
      )
      return
    }

    if (!approvalToken) {
      toast.error(
        "Your approval link is missing its security token."
      )
      return
    }

    try {
      setApproving(true)
      setError("")

      const res = await api.patch(
        `/invoices/${id}/approve-proof`,
        {
          approvalName: name,
          termsAccepted: true,
          termsVersion
        },
        {
          headers: {
            "x-signavi-invoice-approval-token":
              approvalToken
          }
        }
      )

      const data =
        res.data?.data ||
        res.data?.invoice ||
        res.data

      setInvoice(data)

      toast.success(
        "Final proof approved successfully."
      )

      if (res.data?.paymentWarning) {
        toast.error(
          res.data.paymentWarning
        )
      }
    } catch (err) {
      console.error(
        "APPROVE PROOF ERROR:",
        err?.response?.status || err?.message
      )

      const message =
        err?.response?.data?.message ||
        "Proof could not be approved."

      setError(message)
      toast.error(message)
    } finally {
      setApproving(false)
    }
  }

  // =====================================================
  // LOADING / ERROR
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] p-6 text-white">
        Loading your final proof...
      </main>
    )
  }

  if (error && !invoice) {
    return (
      <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
        <section className="mx-auto max-w-3xl rounded-3xl border border-red-500/40 bg-red-950/30 p-8 text-center">
          <h1 className="text-3xl font-bold text-red-300">
            Approval Link Unavailable
          </h1>

          <p className="mt-4 text-slate-300">
            {error}
          </p>

          <p className="mt-4 text-sm text-slate-400">
            If your approval link has expired,
            please contact Signavi Studio for
            a new one.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-cyan-500 px-6 py-3 font-bold text-black"
          >
            Return Home
          </Link>
        </section>
      </main>
    )
  }

  if (!invoice) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Invoice not found.
      </main>
    )
  }

  const proofFiles = getProofFiles()
  const approved =
    invoice.finalProof?.approved === true

  const agreementText =
    invoice.agreement?.text || ""

  const agreementVersion =
    invoice.agreement?.version || ""

  // =====================================================
  // CUSTOMER APPROVAL PAGE
  // =====================================================

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
            Review your final artwork and order
            specifications before approving
            production.
          </p>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 md:p-8">

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

          <div className="mb-8 rounded-2xl border border-slate-800 bg-[#020617] p-5">
            <h2 className="text-xl font-bold">
              Order Specifications
            </h2>

            <div className="mt-4 space-y-3">
              {(invoice.items || []).map(
                (item, index) => (
                  <div
                    key={index}
                    className="flex justify-between gap-4 border-b border-slate-800 pb-3 text-sm"
                  >
                    <span>
                      {item.name}
                    </span>

                    <span className="text-slate-300">
                      Qty: {item.quantity}
                    </span>
                  </div>
                )
              )}
            </div>

            {invoice.notes && (
              <p className="mt-4 whitespace-pre-wrap text-sm text-slate-300">
                {invoice.notes}
              </p>
            )}

            <p className="mt-5 text-right text-xl font-black text-cyan-300">
              Total: $
              {Number(
                invoice.total || 0
              ).toFixed(2)}
            </p>
          </div>

          <h2 className="mb-5 text-2xl font-bold">
            Final Artwork
          </h2>

          {proofFiles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-[#020617] p-10 text-center text-slate-500">
              No final proof has been uploaded yet.
            </div>
          ) : (
            <div className="grid gap-6">
              {proofFiles.map((proof, index) => {
                const isPdf =
                  proof.mimeType?.includes("pdf") ||
                  proof.url
                    ?.toLowerCase()
                    .endsWith(".pdf")

                return (
                  <div
                    key={proof.url || index}
                    className="rounded-3xl border border-slate-800 bg-[#020617] p-5"
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-xl font-bold">
                        {proof.fileName ||
                          `Proof ${index + 1}`}
                      </h3>

                      <a
                        href={proof.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-slate-700 px-4 py-2 text-sm font-bold text-cyan-300"
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
                        alt={
                          proof.fileName ||
                          `Proof ${index + 1}`
                        }
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
                Final Proof Approved
              </h2>

              <p className="mt-3 text-slate-300">
                Approved by{" "}
                <strong>
                  {invoice.finalProof?.approvalName ||
                    invoice.customerName}
                </strong>
              </p>

              <p className="mt-2 text-sm text-slate-400">
                {formatDate(
                  invoice.finalProof?.approvedAt
                )}
              </p>

              {invoice.finalProof?.termsAccepted && (
                <p className="mt-3 text-sm text-emerald-200">
                  Custom-order terms accepted.
                </p>
              )}

              {invoice.paymentStatus === "paid" ? (
                <p className="mt-6 font-bold text-emerald-300">
                  Payment recorded.
                </p>
              ) : invoice.paymentUrl ? (
                <a
                  href={invoice.paymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex rounded-full bg-emerald-500 px-6 py-3 font-bold text-black"
                >
                  Pay Approved Invoice
                </a>
              ) : (
                <p className="mt-5 text-sm text-slate-300">
                  Approval was recorded.
                  Please contact Signavi Studio
                  if your payment link is unavailable.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6">

              <h2 className="text-2xl font-bold">
                Customer Approval and Agreement
              </h2>

              <p className="mt-3 leading-7 text-slate-300">
                Please examine every proof and
                verify your order details before
                approving.
              </p>

              <div className="mt-6">
                <label
                  htmlFor="approvalName"
                  className="mb-2 block text-sm font-bold"
                >
                  Full Name
                </label>

                <input
                  id="approvalName"
                  type="text"
                  autoComplete="name"
                  maxLength={150}
                  value={approvalName}
                  onChange={(event) =>
                    setApprovalName(
                      event.target.value
                    )
                  }
                  placeholder="Type your full name"
                  className="w-full rounded-xl border border-slate-700 bg-[#020617] p-3 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="mt-6 rounded-2xl border border-slate-700 bg-[#020617] p-5">

                <h3 className="text-lg font-bold">
                  Final Proof and Custom-Order Terms
                </h3>

                <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-300">
                  {agreementText ||
                    "Approval terms are unavailable."}
                </p>

                {agreementVersion && (
                  <p className="mt-4 text-xs text-slate-500">
                    Agreement version:{" "}
                    {agreementVersion}
                  </p>
                )}

                <label className="mt-6 flex cursor-pointer items-start gap-3">

                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) =>
                      setTermsAccepted(
                        event.target.checked
                      )
                    }
                    disabled={!agreementText}
                    className="mt-1 h-5 w-5 accent-cyan-400"
                  />

                  <span className="text-sm leading-6 text-slate-200">
                    I have reviewed the final
                    artwork and order specifications,
                    and I agree to the custom-order
                    terms displayed above.
                  </span>

                </label>
              </div>

              {error && (
                <p className="mt-5 text-sm text-red-300">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={approveProof}
                disabled={
                  approving ||
                  proofFiles.length === 0 ||
                  !termsAccepted ||
                  !approvalName.trim() ||
                  !agreementText ||
                  !agreementVersion
                }
                className="mt-6 rounded-2xl bg-cyan-500 px-8 py-4 font-black text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {approving
                  ? "Approving..."
                  : "Approve Final Proofs"}
              </button>

              <p className="mt-4 text-sm text-slate-400">
                If anything is incorrect,
                do not approve.
                Contact Signavi Studio to
                request a revised proof.
              </p>

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

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#020617] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words font-bold text-white">
        {value}
      </p>
    </div>
  )
}
