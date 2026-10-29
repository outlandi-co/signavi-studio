import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"
import { redirectToCheckoutPayment, isApprovedSquareCheckoutUrl } from "../utils/checkoutNavigation"

const money = (value = 0) =>
  Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })

const getPaymentUrl = (payload = {}) =>
  payload?.paymentUrl ||
  payload?.url ||
  payload?.checkoutUrl ||
  payload?.squarePaymentUrl ||
  payload?.data?.paymentUrl ||
  payload?.data?.url ||
  payload?.data?.checkoutUrl ||
  payload?.data?.squarePaymentUrl ||
  ""

const getOrderId = (payload = {}, fallbackId = "") =>
  payload?.orderId ||
  payload?.id ||
  payload?.data?.orderId ||
  payload?.data?._id ||
  payload?.order?._id ||
  fallbackId

const readCheckout = (id) => {
  try {
    const value = sessionStorage.getItem(`signaviCheckoutQuote:${id}`)
    if (!value) return null
    const data = JSON.parse(value)
    if (!data || typeof data !== "object") return null
    return data
  } catch {
    return null
  }
}

const normalizeAddress = (address) => {
  if (!address || typeof address !== "object") return null
  const normalized = {
    name: String(address.name || "").trim(),
    street1: String(address.street1 || address.street || "").trim(),
    city: String(address.city || "").trim(),
    state: String(address.state || "").trim().toUpperCase(),
    zip: String(address.zip || "").trim(),
    country: String(address.country || "US").trim().toUpperCase()
  }
  if (!normalized.street1 || !normalized.city || !normalized.state || !normalized.zip || !normalized.country) {
    return null
  }
  return normalized
}

export default function ClientCheckout({ onChangeAddress }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [checkout] = useState(() => readCheckout(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const address = normalizeAddress(checkout?.shippingAddress)
  const selectedRate = checkout?.shippingRate
  const shippingQuote = checkout?.shippingQuote
  const rate = selectedRate?.raw || selectedRate || {}
  const carrier = selectedRate?.provider || rate.provider || rate.carrier || "Carrier"
  const service =
    (typeof selectedRate?.servicelevel === "string" ? selectedRate.servicelevel : selectedRate?.servicelevel?.name) ||
    rate.servicelevel?.name || rate.service || rate.serviceName || "Shipping"
  const shippingAmount = Number(selectedRate?.amount ?? rate.amount)
  const isValidId = Boolean(id && id !== "null" && id !== "undefined")
  const ready = Boolean(isValidId && address && typeof shippingQuote === "string" && shippingQuote.trim() && selectedRate && Number.isFinite(shippingAmount) && shippingAmount >= 0)

  const handleConfirm = async () => {
    if (!ready) {
      setError("The selected shipping quote is missing. Return to your cart and select shipping again.")
      return
    }

    const checkoutToken = sessionStorage.getItem(`signaviCheckoutToken:${id}`)
    if (!checkoutToken) {
      setError("Checkout session missing or expired. Return to your cart and restart checkout.")
      return
    }

    try {
      setSaving(true)
      setError("")
      // The server verifies the signed quote against this exact destination and
      // the saved order's items. Browser-provided shipping prices are not used.
      const res = await api.patch(
        `/orders/${id}/checkout`,
        {
          shippingAddress: address,
          shippingQuote,
          v3ShippingQuote: shippingQuote
        },
        { headers: { "x-signavi-guest-checkout-token": checkoutToken } }
      )

      if (
        res.data?.code === "V3_PREVIEW_ONLY" ||
        res.data?.code === "V3_SANDBOX_PREPARED_NO_PAYMENT"
      ) {
        throw new Error(
          "Checkout is in preview mode. No payment was created."
        )
      }

      const paymentUrl = getPaymentUrl(res.data)
      if (!isApprovedSquareCheckoutUrl(paymentUrl)) {
        throw new Error("Secure payment URL was not returned. Please contact support if this continues.")
      }

      const orderId = getOrderId(res.data, id)
      localStorage.setItem("lastOrderId", orderId)
      localStorage.setItem("shippingRate", JSON.stringify({
        amount: shippingAmount,
        carrier,
        serviceLevel: service
      }))
      toast.success("Redirecting to secure payment")
      redirectToCheckoutPayment(paymentUrl)
    } catch (err) {
      if (
        err?.response?.data?.code === "V3_PREVIEW_ONLY" ||
        err?.response?.data?.code === "V3_SANDBOX_PREPARED_NO_PAYMENT"
      ) {
        err = new Error(
          "Checkout is in preview mode. No payment was created."
        )
      }
      console.error("Checkout confirmation error:", err.response?.data || err)
      const message = err?.response?.data?.message || err?.message || "Checkout failed. Please try again."
      setError(message)
      toast.error("Could not continue to payment")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => onChangeAddress()}
          className="mb-8 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          â† Back to Cart
        </button>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-black/20">
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">SignaVi Studio</p>
            <h1 className="text-3xl font-extrabold sm:text-4xl">Confirm Shipping Address</h1>
            <p className="mt-3 text-sm text-slate-400">Review the destination and selected shipping before secure payment.</p>
            <p className="mt-2 break-all text-xs text-slate-500">Order ID: {id || "Missing"}</p>
          </div>

          {error && (
            <div role="alert" className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          {!ready ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">
              The original shipping selection is unavailable for this checkout. Return to your cart to select shipping again. You will not be charged on this page.
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-700 bg-[#020617] p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-bold">Delivery address</h2>
                  <button
                    type="button"
                    onClick={() => onChangeAddress()}
                    className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
                  >
                    Change address
                  </button>
                </div>
                {address.name && <p className="font-semibold">{address.name}</p>}
                <p>{address.street1}</p>
                <p>{address.city}, {address.state} {address.zip}</p>
                <p>{address.country}</p>
                <p className="mt-4 text-xs text-slate-400">Changing the delivery address requires a new shipping quote in your cart.</p>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-700 bg-[#020617] p-6">
                <h2 className="text-xl font-bold">Selected shipping</h2>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{carrier}</p>
                    <p className="text-sm text-slate-400">{service}</p>
                  </div>
                  <p className="text-lg font-black text-emerald-300">{money(shippingAmount)}</p>
                </div>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving || !ready}
            className="mt-8 w-full rounded-2xl bg-emerald-500 px-5 py-4 font-black text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Confirming checkout..." : "Confirm Address & Continue to Payment"}
          </button>
          <p className="mt-4 text-center text-sm text-slate-500">Your final shipping charge is verified by the server. Payment is securely processed through Square.</p>
        </div>
      </section>
    </main>
  )
}
