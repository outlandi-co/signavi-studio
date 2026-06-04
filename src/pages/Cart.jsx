import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"
import { useCartContext } from "../hooks/useCartContext"

const TAX_RATE = 0.0825

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const getPrice = (item = {}) => {
  return Number(
    item?.salePrice ??
      item?.finalPrice ??
      item?.unitPrice ??
      item?.price ??
      item?.selectedVariant?.price ??
      item?.variant?.price ??
      item?.basePrice ??
      0
  )
}

const getProductId = (item = {}) => {
  return (
    item.productId ||
    item._id ||
    item.id ||
    item.product?._id ||
    ""
  )
}

const getInitialCustomerInfo = () => {
  let parsedUser = null

  try {
    parsedUser = JSON.parse(localStorage.getItem("customerUser") || "null")
  } catch {
    parsedUser = null
  }

  return {
    customerName:
      parsedUser?.name ||
      parsedUser?.customerName ||
      "",
    email:
      parsedUser?.email ||
      localStorage.getItem("customerEmail") ||
      "",
    phone: parsedUser?.phone || "",
    street: parsedUser?.address?.street || "",
    city: parsedUser?.address?.city || "",
    state: parsedUser?.address?.state || "",
    zip: parsedUser?.address?.zip || "",
    country: parsedUser?.address?.country || "US"
  }
}

const normalizeRate = (rate) => {
  return {
    id: rate.object_id || rate.id || rate.rateId || "",
    provider: rate.provider || rate.carrier || "Carrier",
    servicelevel:
      rate.servicelevel?.name ||
      rate.service ||
      rate.serviceName ||
      rate.name ||
      "Shipping",
    amount: Number(rate.amount || rate.price || rate.rate || 0),
    currency: rate.currency || "USD",
    estimatedDays:
      rate.estimated_days ||
      rate.estimatedDays ||
      rate.delivery_days ||
      null,
    raw: rate
  }
}

export default function Cart() {
  const navigate = useNavigate()

  const {
    cart,
    removeFromCart,
    clearCart
  } = useCartContext()

  const [customerInfo, setCustomerInfo] = useState(getInitialCustomerInfo)
  const [shippingRates, setShippingRates] = useState([])
  const [selectedRate, setSelectedRate] = useState(null)
  const [loadingRates, setLoadingRates] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      return sum + getPrice(item) * Number(item.quantity || 1)
    }, 0)

    const tax = subtotal * TAX_RATE
    const shipping = Number(selectedRate?.amount || 0)
    const finalPrice = subtotal + tax + shipping

    return {
      subtotal,
      tax,
      shipping,
      finalPrice
    }
  }, [cart, selectedRate])

  const handleChange = (field, value) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value
    }))

    if (["street", "city", "state", "zip", "country"].includes(field)) {
      setShippingRates([])
      setSelectedRate(null)
    }
  }

  const validateCustomerInfo = () => {
    if (!customerInfo.customerName.trim()) return "Customer name is required"
    if (!customerInfo.email.trim()) return "Email is required"
    if (!customerInfo.street.trim()) return "Street address is required"
    if (!customerInfo.city.trim()) return "City is required"
    if (!customerInfo.state.trim()) return "State is required"
    if (!customerInfo.zip.trim()) return "ZIP is required"

    return ""
  }

  const getShippingRates = async () => {
    const error = validateCustomerInfo()

    if (error) {
      toast.error(error)
      return
    }

    try {
      setLoadingRates(true)
      setShippingRates([])
      setSelectedRate(null)

      const res = await api.post("/shipping/get-rates", {
        address_to: {
          name: customerInfo.customerName.trim() || "Customer",
          street1: customerInfo.street.trim(),
          city: customerInfo.city.trim(),
          state: customerInfo.state.trim(),
          zip: customerInfo.zip.trim(),
          country: customerInfo.country.trim() || "US"
        }
      })

      const rawRates =
        res.data?.rates ||
        res.data?.data?.rates ||
        res.data?.data ||
        []

      const normalizedRates = Array.isArray(rawRates)
        ? rawRates.map(normalizeRate).filter((rate) => rate.amount > 0)
        : []

      if (!normalizedRates.length) {
        toast.error("No shipping rates found")
        return
      }

      setShippingRates(normalizedRates)
      setSelectedRate(normalizedRates[0])
      toast.success("Shipping rates loaded")
    } catch (err) {
      console.error("❌ SHIPPING RATE ERROR:", err.response?.data || err)
      toast.error(
        err.response?.data?.message ||
          "Failed to get shipping rates"
      )
    } finally {
      setLoadingRates(false)
    }
  }

  const handleCheckout = async () => {
    if (!cart.length) {
      toast.error("Cart is empty")
      return
    }

    const error = validateCustomerInfo()

    if (error) {
      toast.error(error)
      return
    }

    if (!selectedRate) {
      toast.error("Please get and select a shipping rate first")
      return
    }

    try {
      setCheckingOut(true)

      const customerName = customerInfo.customerName.trim()
      const email = customerInfo.email.trim().toLowerCase()
      const phone = customerInfo.phone.trim()

      localStorage.setItem("customerEmail", email)

      const orderRes = await api.post("/orders", {
        customerName,
        email,
        phone,
        address: {
          street: customerInfo.street.trim(),
          city: customerInfo.city.trim(),
          state: customerInfo.state.trim(),
          zip: customerInfo.zip.trim(),
          country: customerInfo.country.trim() || "US"
        },
        items: cart,
        shipping: totals.shipping,
        shippingCost: totals.shipping,
        shippingRate: selectedRate,
        shippingProvider: selectedRate.provider,
        shippingService: selectedRate.servicelevel,
        subtotal: totals.subtotal,
        tax: totals.tax,
        finalPrice: totals.finalPrice,
        source: "cart_page",
        status: "payment_required"
      })

      const orderId =
        orderRes.data?.data?._id ||
        orderRes.data?.order?._id ||
        orderRes.data?._id

      if (!orderId) {
        throw new Error("Missing order ID")
      }

      localStorage.setItem("lastOrderId", orderId)

      const squareRes = await api.post(`/square/create-payment/${orderId}`)

      const paymentUrl =
        squareRes.data?.paymentUrl ||
        squareRes.data?.url ||
        squareRes.data?.checkoutUrl ||
        squareRes.data?.squarePaymentUrl ||
        squareRes.data?.data?.paymentUrl ||
        squareRes.data?.data?.url ||
        squareRes.data?.data?.checkoutUrl ||
        squareRes.data?.data?.squarePaymentUrl

      if (!paymentUrl) {
        throw new Error("Missing Square payment URL")
      }

      window.location.assign(paymentUrl)
    } catch (err) {
      console.error("❌ CHECKOUT ERROR:", err.response?.data || err)
      toast.error(
        err.response?.data?.message ||
          "Checkout failed"
      )
      setCheckingOut(false)
    }
  }

  if (!cart.length) {
    return (
      <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
        <section className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-center shadow-xl shadow-black/20">
          <h1 className="mb-3 text-4xl font-extrabold">
            🛒 Cart is empty
          </h1>

          <p className="mb-6 text-slate-400">
            Add products to your cart before checking out.
          </p>

          <button
            type="button"
            onClick={() => navigate("/store")}
            className="rounded-full bg-cyan-500 px-6 py-3 font-bold text-black transition hover:bg-cyan-400"
          >
            Continue Shopping
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/store")}
          className="mb-8 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          ← Continue Shopping
        </button>

        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            🛒 Cart
          </h1>

          <p className="mt-3 text-slate-400">
            Review your items, choose a live shipping rate, then continue to secure payment.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
          <section className="space-y-4">
            {cart.map((item, index) => {
              const price = getPrice(item)
              const quantity = Number(item.quantity || 1)
              const lineTotal = price * quantity

              return (
                <article
                  key={`${getProductId(item)}-${index}`}
                  className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/20"
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <img
                      src={
                        item.image ||
                        item.imageUrl ||
                        item.selectedVariant?.image ||
                        "/image_placeholder/placeholder.png"
                      }
                      alt={item.name || "Cart item"}
                      className="h-28 w-28 rounded-2xl object-cover"
                      onError={(event) => {
                        event.currentTarget.src =
                          "/image_placeholder/placeholder.png"
                      }}
                    />

                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-bold">
                            {item.name || "Product"}
                          </h2>

                          <p className="mt-1 text-sm text-slate-500">
                            {item.selectedVariant?.color ||
                              item.variant?.color ||
                              "No color"}{" "}
                            /{" "}
                            {item.selectedVariant?.size ||
                              item.variant?.size ||
                              "No size"}
                          </p>
                        </div>

                        <p className="text-lg font-bold text-cyan-300">
                          {money(lineTotal)}
                        </p>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <DetailBox label="Price" value={money(price)} />
                        <DetailBox label="Qty" value={quantity} />
                        <DetailBox label="Line Total" value={money(lineTotal)} />
                      </div>

                      {removeFromCart && (
                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              item.productId ||
                                item._id ||
                                item.id
                            )
                          }
                          className="mt-4 rounded-full border border-red-500/40 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500 hover:text-white"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </section>

          <aside className="h-fit rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
            <h2 className="mb-5 text-2xl font-bold">
              Order Summary
            </h2>

            <div className="mb-6 rounded-2xl border border-slate-800 bg-[#020617] p-4">
              <h3 className="mb-4 text-lg font-bold">
                Customer & Shipping
              </h3>

              <Input
                value={customerInfo.customerName}
                onChange={(value) => handleChange("customerName", value)}
                placeholder="Full Name *"
              />

              <Input
                value={customerInfo.email}
                onChange={(value) => handleChange("email", value)}
                placeholder="Email *"
                type="email"
              />

              <Input
                value={customerInfo.phone}
                onChange={(value) => handleChange("phone", value)}
                placeholder="Phone"
                type="tel"
              />

              <Input
                value={customerInfo.street}
                onChange={(value) => handleChange("street", value)}
                placeholder="Street Address *"
              />

              <Input
                value={customerInfo.city}
                onChange={(value) => handleChange("city", value)}
                placeholder="City *"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={customerInfo.state}
                  onChange={(value) => handleChange("state", value)}
                  placeholder="State *"
                />

                <Input
                  value={customerInfo.zip}
                  onChange={(value) => handleChange("zip", value)}
                  placeholder="ZIP *"
                />
              </div>

              <button
                type="button"
                onClick={getShippingRates}
                disabled={loadingRates}
                className="mt-3 w-full rounded-2xl bg-cyan-500 px-5 py-3 font-black text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-600"
              >
                {loadingRates ? "Getting Rates..." : "Get Shipping Rates"}
              </button>

              {shippingRates.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="font-bold">
                    Select Shipping
                  </h4>

                  {shippingRates.map((rate) => (
                    <button
                      type="button"
                      key={`${rate.id}-${rate.provider}-${rate.servicelevel}-${rate.amount}`}
                      onClick={() => setSelectedRate(rate)}
                      className={
                        selectedRate?.id === rate.id
                          ? "w-full rounded-2xl border border-cyan-400 bg-cyan-500/10 p-3 text-left"
                          : "w-full rounded-2xl border border-slate-700 bg-slate-900 p-3 text-left hover:border-cyan-400"
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold">
                            {rate.provider}
                          </p>

                          <p className="text-sm text-slate-400">
                            {rate.servicelevel}
                            {rate.estimatedDays
                              ? ` • ${rate.estimatedDays} day(s)`
                              : ""}
                          </p>
                        </div>

                        <strong className="text-cyan-300">
                          {money(rate.amount)}
                        </strong>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <SummaryRow label="Subtotal" value={money(totals.subtotal)} />
            <SummaryRow label="Estimated Tax" value={money(totals.tax)} />
            <SummaryRow
              label="Shipping"
              value={
                selectedRate
                  ? money(totals.shipping)
                  : "Select rate"
              }
            />
            <SummaryRow
              label="Total"
              value={money(totals.finalPrice)}
              strong
            />

            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkingOut}
              className="mt-6 w-full rounded-2xl bg-emerald-500 px-5 py-4 font-black text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {checkingOut ? "Redirecting..." : "Continue to Secure Payment"}
            </button>

            {clearCart && (
              <button
                type="button"
                onClick={clearCart}
                className="mt-3 w-full rounded-2xl border border-slate-700 px-5 py-3 font-bold text-slate-300 transition hover:border-red-500 hover:text-red-300"
              >
                Clear Cart
              </button>
            )}

            <p className="mt-4 text-center text-sm text-slate-500">
              Live shipping rates are calculated before Square payment.
            </p>
          </aside>
        </div>
      </section>
    </main>
  )
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text"
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type={type}
      className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
    />
  )
}

function DetailBox({
  label,
  value
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#020617] p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-white">
        {value}
      </p>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  strong = false
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 py-3 last:border-b-0">
      <span className="text-slate-400">
        {label}
      </span>

      <span
        className={
          strong
            ? "text-xl font-extrabold text-cyan-300"
            : "font-bold text-white"
        }
      >
        {value}
      </span>
    </div>
  )
}