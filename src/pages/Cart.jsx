import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { useCartContext } from "../hooks/useCartContext"
import api from "../services/api"

const TAX_RATE = 0.0825

const SHIPPING_OPTIONS = [
  {
    id: "standard",
    label: "Standard Shipping",
    description: "3–7 business days",
    price: 9.99
  },
  {
    id: "express",
    label: "Express Shipping",
    description: "1–3 business days",
    price: 18.99
  },
  {
    id: "pickup",
    label: "Local Pickup",
    description: "No shipping charge",
    price: 0
  }
]

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const getCustomerEmail = () => {
  let email = ""

  try {
    const customerUser = JSON.parse(
      localStorage.getItem("customerUser") || "null"
    )

    email =
      customerUser?.email ||
      customerUser?.user?.email ||
      customerUser?.data?.email ||
      ""
  } catch {
    console.warn("⚠️ Failed to parse customerUser")
  }

  if (!email) {
    email = localStorage.getItem("customerEmail") || ""
  }

  return String(email || "guest@signavi.com")
    .trim()
    .toLowerCase()
}

const getCustomerName = () => {
  try {
    const customerUser = JSON.parse(
      localStorage.getItem("customerUser") || "null"
    )

    return (
      customerUser?.name ||
      customerUser?.user?.name ||
      customerUser?.data?.name ||
      "Guest Customer"
    )
  } catch {
    return "Guest Customer"
  }
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

export default function Cart() {
  const navigate = useNavigate()

  const {
    cart,
    removeFromCart,
    clearCart
  } = useCartContext()

  const [loading, setLoading] = useState(false)
  const [shippingMethod, setShippingMethod] = useState("standard")

  const [shippingAddress, setShippingAddress] = useState({
    fullName: getCustomerName(),
    email: getCustomerEmail(),
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "US"
  })

  const selectedShipping =
    SHIPPING_OPTIONS.find((option) => option.id === shippingMethod) ||
    SHIPPING_OPTIONS[0]

  const requiresAddress = shippingMethod !== "pickup"

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      return sum + getPrice(item) * Number(item.quantity || 1)
    }, 0)

    const tax = subtotal * TAX_RATE
    const shipping = Number(selectedShipping.price || 0)
    const finalPrice = subtotal + tax + shipping

    return {
      subtotal,
      tax,
      shipping,
      finalPrice
    }
  }, [cart, selectedShipping])

  const handleAddressChange = (event) => {
    const { name, value } = event.target

    setShippingAddress((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const validateShipping = () => {
    if (!requiresAddress) return true

    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "address1",
      "city",
      "state",
      "zip"
    ]

    const missing = requiredFields.find(
      (field) => !String(shippingAddress[field] || "").trim()
    )

    if (missing) {
      toast.error("Please complete the shipping address")
      return false
    }

    return true
  }

  const handleCheckout = async () => {
    if (!cart.length) {
      toast.error("Cart is empty")
      return
    }

    if (!validateShipping()) return

    try {
      setLoading(true)

      const email = getCustomerEmail()

      const items = cart.map((item) => {
        const price = getPrice(item)

        return {
          productId: getProductId(item),
          name: item.name || "Product",
          quantity: Number(item.quantity || 1),

          price,
          unitPrice: price,
          salePrice: price,
          finalPrice: price,

          originalPrice:
            Number(
              item.originalPrice ||
                item.regularPrice ||
                item.compareAtPrice ||
                price
            ),

          discountActive: Boolean(item.discountActive),
          discountType: item.discountType || "",
          discountValue: Number(item.discountValue || 0),
          discountLabel: item.discountLabel || "",

          variant:
            item.selectedVariant ||
            item.variant ||
            null,

          image:
            item.image ||
            item.imageUrl ||
            item.selectedVariant?.image ||
            ""
        }
      })

      const payload = {
        email,
        customerName: getCustomerName(),
        items,

        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        shippingCost: totals.shipping,
        shippingMethod: selectedShipping.label,
        shippingMethodId: selectedShipping.id,
        shippingAddress: requiresAddress ? shippingAddress : null,

        finalPrice: totals.finalPrice,
        source: "store",
        status: "payment_required"
      }

      console.log("🧾 CART ORDER PAYLOAD:", payload)

      const res = await api.post("/orders", payload)

      const order =
        res.data?.data ||
        res.data?.order ||
        res.data

      const orderId = order?._id

      if (!orderId) {
        throw new Error("Order ID not returned")
      }

      toast.success("Order created")
      navigate(`/client-checkout/${orderId}`)
    } catch (err) {
      console.error("❌ CART CHECKOUT ERROR:", err.response?.data || err)

      toast.error(
        err.response?.data?.message ||
          "Checkout failed"
      )
    } finally {
      setLoading(false)
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
            Review your items, choose shipping, then continue to secure payment.
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
                        <DetailBox
                          label="Price"
                          value={money(price)}
                        />

                        <DetailBox
                          label="Qty"
                          value={quantity}
                        />

                        <DetailBox
                          label="Line Total"
                          value={money(lineTotal)}
                        />
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

            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
              <h2 className="mb-4 text-2xl font-bold">
                Shipping
              </h2>

              <div className="grid gap-3 md:grid-cols-3">
                {SHIPPING_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setShippingMethod(option.id)}
                    className={
                      shippingMethod === option.id
                        ? "rounded-2xl border border-cyan-400 bg-cyan-500/10 p-4 text-left"
                        : "rounded-2xl border border-slate-800 bg-[#020617] p-4 text-left transition hover:border-cyan-400"
                    }
                  >
                    <p className="font-bold text-white">
                      {option.label}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {option.description}
                    </p>

                    <p className="mt-3 font-extrabold text-cyan-300">
                      {money(option.price)}
                    </p>
                  </button>
                ))}
              </div>

              {requiresAddress && (
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <Input
                    name="fullName"
                    label="Full Name"
                    value={shippingAddress.fullName}
                    onChange={handleAddressChange}
                  />

                  <Input
                    name="email"
                    label="Email"
                    value={shippingAddress.email}
                    onChange={handleAddressChange}
                  />

                  <Input
                    name="phone"
                    label="Phone"
                    value={shippingAddress.phone}
                    onChange={handleAddressChange}
                  />

                  <Input
                    name="address1"
                    label="Address"
                    value={shippingAddress.address1}
                    onChange={handleAddressChange}
                  />

                  <Input
                    name="address2"
                    label="Apt / Suite"
                    value={shippingAddress.address2}
                    onChange={handleAddressChange}
                    required={false}
                  />

                  <Input
                    name="city"
                    label="City"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                  />

                  <Input
                    name="state"
                    label="State"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                  />

                  <Input
                    name="zip"
                    label="ZIP Code"
                    value={shippingAddress.zip}
                    onChange={handleAddressChange}
                  />
                </div>
              )}
            </section>
          </section>

          <aside className="h-fit rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
            <h2 className="mb-5 text-2xl font-bold">
              Order Summary
            </h2>

            <SummaryRow
              label="Subtotal"
              value={money(totals.subtotal)}
            />

            <SummaryRow
              label="Tax"
              value={money(totals.tax)}
            />

            <SummaryRow
              label={selectedShipping.label}
              value={money(totals.shipping)}
            />

            <SummaryRow
              label="Total"
              value={money(totals.finalPrice)}
              strong
            />

            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-cyan-500 px-5 py-4 font-black text-black transition hover:bg-cyan-400 disabled:opacity-60"
            >
              {loading
                ? "Creating Order..."
                : "Checkout"}
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
              Shipping is collected here. Square will only collect payment.
            </p>
          </aside>
        </div>
      </section>
    </main>
  )
}

function Input({
  name,
  label,
  value,
  onChange,
  required = true
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}{required ? " *" : ""}
      </span>

      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
      />
    </label>
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