import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"

const initialForm = {
  name: "",
  street1: "",
  city: "",
  state: "",
  zip: "",
  country: "US"
}

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const getPaymentUrl = (payload = {}) => {
  return (
    payload?.paymentUrl ||
    payload?.url ||
    payload?.checkoutUrl ||
    payload?.squarePaymentUrl ||
    payload?.data?.paymentUrl ||
    payload?.data?.url ||
    payload?.data?.checkoutUrl ||
    payload?.data?.squarePaymentUrl ||
    ""
  )
}

const getOrderId = (payload = {}, fallbackId = "") => {
  return (
    payload?.orderId ||
    payload?.id ||
    payload?.data?.orderId ||
    payload?.data?._id ||
    payload?.order?._id ||
    fallbackId
  )
}

export default function ClientCheckout() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [rates, setRates] = useState([])
  const [selectedRate, setSelectedRate] = useState(null)
  const [loadingRates, setLoadingRates] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const canContinue = useMemo(() => {
    return Boolean(selectedRate && rates.length && id)
  }, [selectedRate, rates.length, id])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "state"
          ? value.toUpperCase().slice(0, 2)
          : name === "country"
            ? value.toUpperCase().slice(0, 2)
            : value
    }))
  }

  const validateForm = () => {
    const required = [
      "name",
      "street1",
      "city",
      "state",
      "zip",
      "country"
    ]

    for (const field of required) {
      if (!String(form[field] || "").trim()) {
        setError(`Missing ${field}`)
        toast.error(`Missing ${field}`)
        return false
      }
    }

    if (form.state.length !== 2) {
      setError("State must be 2 letters, like CA")
      toast.error("State must be 2 letters")
      return false
    }

    if (form.country.length !== 2) {
      setError("Country must be 2 letters, like US")
      toast.error("Country must be 2 letters")
      return false
    }

    setError("")
    return true
  }

  const getRates = async () => {
    try {
      if (!validateForm()) return

      setLoadingRates(true)
      setSelectedRate(null)
      setRates([])
      setError("")

      const res = await api.post("/shipping/get-rates", {
        address_to: {
          name: form.name.trim(),
          street1: form.street1.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zip: form.zip.trim(),
          country: form.country.trim()
        }
      })

      const incomingRates =
        res.data?.rates ||
        res.data?.data?.rates ||
        res.data?.data ||
        []

      if (!Array.isArray(incomingRates) || !incomingRates.length) {
        setRates([])
        setError("No shipping rates found")
        toast.error("No shipping rates found")
        return
      }

      setRates(incomingRates)
      toast.success("Shipping rates loaded")
    } catch (err) {
      console.error("❌ RATE ERROR:", err.response?.data || err.message)

      setError(
        err.response?.data?.message ||
          "Failed to get shipping rates"
      )

      toast.error("Failed to get shipping rates")
    } finally {
      setLoadingRates(false)
    }
  }

  const handleSubmit = async () => {
    if (!id || id === "null" || id === "undefined") {
      setError("Invalid order ID")
      toast.error("Invalid order ID")
      return
    }

    if (!selectedRate) {
      setError("Select a shipping option")
      toast.error("Select a shipping option")
      return
    }

    try {
      setSaving(true)
      setError("")

      const shippingCost = Number(selectedRate.amount || 0)

      const payload = {
        shippingAddress: {
          name: form.name.trim(),
          street1: form.street1.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zip: form.zip.trim(),
          country: form.country.trim()
        },
        address: {
          street: form.street1.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zip: form.zip.trim(),
          country: form.country.trim()
        },
        shippingCost,
        shipping: shippingCost,
        shippingRateId:
          selectedRate.object_id ||
          selectedRate.objectId ||
          selectedRate.id,
        carrier:
          selectedRate.provider ||
          selectedRate.carrier ||
          "Carrier",
        serviceLevel:
          selectedRate.servicelevel?.name ||
          selectedRate.serviceLevel?.name ||
          selectedRate.service ||
          "Shipping"
      }

      const res = await api.patch(
        `/orders/${id}/checkout`,
        payload
      )

      console.log("🧾 CHECKOUT RESPONSE:", res.data)

      const paymentUrl = getPaymentUrl(res.data)
      const orderId = getOrderId(res.data, id)

      if (!paymentUrl) {
        throw new Error("Payment URL not returned")
      }

      if (!orderId) {
        throw new Error("Order ID missing from checkout response")
      }

      localStorage.setItem("lastOrderId", orderId)

      localStorage.setItem(
        "shippingRate",
        JSON.stringify({
          amount: shippingCost,
          carrier: payload.carrier,
          serviceLevel: payload.serviceLevel
        })
      )

      toast.success("Redirecting to secure payment")
      window.location.href = paymentUrl
    } catch (err) {
      console.error("❌ CHECKOUT SAVE ERROR:", err.response?.data || err)

      setError(
        err.response?.data?.message ||
          err.message ||
          "Checkout failed. Please try again."
      )

      toast.error("Checkout failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="mb-8 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back to Cart
        </button>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-black/20">
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              SignaVi Studio
            </p>

            <h1 className="text-4xl font-extrabold">
              📦 Shipping Info
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              Enter your shipping address, choose a rate, then continue to secure payment.
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Order ID: {id || "Missing"}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <input
              name="street1"
              placeholder="Street Address"
              value={form.street1}
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <div className="grid gap-4 md:grid-cols-3">
              <input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
                className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
              />

              <input
                name="state"
                placeholder="State"
                value={form.state}
                onChange={handleChange}
                className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
              />

              <input
                name="zip"
                placeholder="ZIP"
                value={form.zip}
                onChange={handleChange}
                className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <input
              name="country"
              placeholder="Country"
              value={form.country}
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <button
            type="button"
            onClick={getRates}
            disabled={loadingRates}
            className="mt-6 w-full rounded-2xl bg-cyan-500 px-5 py-4 font-black text-black transition hover:bg-cyan-400 disabled:opacity-60"
          >
            {loadingRates ? "Getting Rates..." : "📦 Get Shipping Rates"}
          </button>

          {rates.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-2xl font-bold">
                Select Shipping
              </h2>

              <div className="space-y-3">
                {rates.map((rate) => {
                  const rateId =
                    rate.object_id ||
                    rate.objectId ||
                    rate.id

                  const selected =
                    selectedRate &&
                    (
                      selectedRate.object_id ||
                      selectedRate.objectId ||
                      selectedRate.id
                    ) === rateId

                  return (
                    <button
                      key={rateId}
                      type="button"
                      onClick={() => setSelectedRate(rate)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-cyan-400 bg-cyan-500/10"
                          : "border-slate-800 bg-[#020617] hover:border-slate-600"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-bold">
                            {rate.provider ||
                              rate.carrier ||
                              "Carrier"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {rate.servicelevel?.name ||
                              rate.serviceLevel?.name ||
                              rate.service ||
                              "Shipping"}
                          </p>
                        </div>

                        <span className="text-lg font-black text-emerald-300">
                          {money(rate.amount)}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !canContinue}
            className="mt-8 w-full rounded-2xl bg-emerald-500 px-5 py-4 font-black text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Continue to Payment"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-500">
            Payment will be securely processed through Square.
          </p>
        </div>
      </section>
    </main>
  )
}