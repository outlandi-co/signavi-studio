import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"

import api from "../services/api"
import { useCartContext } from "../context/useCartContext"

import UploadArtwork from "../components/UploadArtwork"
import ProductMockup from "../components/ProductMockup"

const TAX_RATE = 0.0825

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const normalizeProduct = (payload) => {
  return (
    payload?.data ||
    payload?.product ||
    payload ||
    null
  )
}

const getProductPrice = (product = {}) => {
  return Number(
    product.price ||
      product.listPrice ||
      product.basePrice ||
      product.selectedVariant?.price ||
      product.variants?.[0]?.price ||
      0
  )
}

const getProductImage = (product = {}) => {
  return (
    product.image ||
    product.imageUrl ||
    product.images?.[0] ||
    product.colors?.[0]?.image ||
    "/image_placeholder/placeholder.png"
  )
}

const getCustomerUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("customerUser") || "null"
    )
  } catch {
    return null
  }
}

export default function ProductCustomizer({ onOpenCart }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCartContext()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [printLocation, setPrintLocation] = useState("front")

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    quantity: 1,
    productionType: "screenprint",
    artwork: ""
  })

  const [design, setDesign] = useState({
    x: 150,
    y: 150,
    size: 120
  })

  useEffect(() => {
  const timer = setTimeout(() => {
    const user = getCustomerUser()

    if (!user) return

    setForm((prev) => ({
      ...prev,
      customerName:
        user?.name ||
        user?.customerName ||
        prev.customerName,
      email:
        user?.email ||
        prev.email
    }))
  }, 0)

  return () => clearTimeout(timer)
}, [])

  useEffect(() => {
    let mounted = true

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError("")

        if (!id || id === "null" || id === "undefined") {
          throw new Error("Invalid product ID")
        }

        const res = await api.get(`/products/${id}`, { params: { storefront: "signavi_studio" } })

        if (!mounted) return

        setProduct(normalizeProduct(res.data))
      } catch (err) {
        if (!mounted) return

        console.error(
          "❌ PRODUCT LOAD FAILED:",
          err.response?.data || err
        )

        setProduct(null)
        setError(
          err.response?.data?.message ||
            err.message ||
            "Product not found"
        )
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

  const totals = useMemo(() => {
    const quantity = Math.max(
      Number(form.quantity || 1),
      1
    )

    const unitPrice = getProductPrice(product || {})
    const subtotal = unitPrice * quantity
    const tax = subtotal * TAX_RATE
    const finalPrice = subtotal + tax

    return {
      quantity,
      unitPrice,
      subtotal,
      tax,
      finalPrice
    }
  }, [form.quantity, product])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "quantity"
          ? Math.max(1, Number(value || 1))
          : value
    }))
  }

  const setArtwork = (url) => {
    setForm((prev) => ({
      ...prev,
      artwork: url
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!product?._id) {
      toast.error("Product not loaded yet")
      return
    }

    if (!form.customerName.trim() || !form.email.trim()) {
      toast.error("Please enter your name and email")
      return
    }

    try {
      setSubmitting(true)

      // The backend's storefront order route uses this catalog.
      if (product.storefront !== "signavi_studio") {
        throw new Error(
          "This product is not eligible for the current checkout catalog."
        )
      }

      const productType = String(
        product.productType || product.type || "physical"
      ).toLowerCase()

      if (productType !== "physical") {
        throw new Error("Only physical custom products are supported here.")
      }

      if (Array.isArray(product.variants) && product.variants.length) {
        throw new Error(
          "This product requires color and size selection, which is not yet supported in this customizer."
        )
      }

      const stock = Number(product.stock ?? product.availableStock)

      if (
        !Number.isInteger(stock) ||
        stock < 1 ||
        !Number.isInteger(totals.quantity) ||
        totals.quantity < 1 ||
        totals.quantity > stock
      ) {
        throw new Error("Verified inventory is unavailable or insufficient.")
      }

      if (
        !Number.isFinite(totals.unitPrice) ||
        totals.unitPrice <= 0
      ) {
        throw new Error("Product price is unavailable.")
      }

      const artwork = String(form.artwork || "").trim()

      if (artwork) {
        let artworkUrl
        try {
          artworkUrl = new URL(artwork)
        } catch {
          throw new Error("Artwork must have a valid HTTPS URL.")
        }
        if (
          artworkUrl.protocol !== "https:" ||
          artworkUrl.username ||
          artworkUrl.password
        ) {
          throw new Error("Artwork must have a valid HTTPS URL.")
        }
      }

      const coordinates = {
        x: Number(design.x),
        y: Number(design.y),
        size: Number(design.size)
      }

      if (
        Object.values(coordinates).some(
          (value) => !Number.isFinite(value) ||
            value < -10000 || value > 10000
        ) ||
        coordinates.size <= 0
      ) {
        throw new Error("Invalid custom design coordinates.")
      }

      const customization = {
        artwork,
        productionType: String(form.productionType || "").trim(),
        printLocation: String(printLocation || "").trim(),
        design: coordinates
      }

      if (
        !customization.productionType ||
        !customization.printLocation
      ) {
        throw new Error("Choose valid production and print options.")
      }

      const added = addToCart({
        productId: product._id,
        name: product.name || "Custom Product",
        image: getProductImage(product),
        productType,
        storefront: product.storefront,
        stock,
        quantity: totals.quantity,
        price: totals.unitPrice,
        unitPrice: totals.unitPrice,
        customization
      })

      if (!added) {
        throw new Error("Unable to add custom product to cart.")
      }

      localStorage.setItem(
        "customerEmail",
        form.email.trim().toLowerCase()
      )

      onOpenCart?.()
      toast.success("Custom design added. Review shipping in your cart.")
    } catch (err) {
      console.error(
        "❌ SUBMIT ERROR:",
        err.response?.data || err.message
      )

      toast.error(
        err.response?.data?.message ||
          "Something went wrong."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading product customizer...
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
        <section className="mx-auto max-w-3xl rounded-3xl border border-red-500/40 bg-red-950/40 p-8 text-center text-red-300">
          <h1 className="mb-3 text-3xl font-bold">
            Product Not Found
          </h1>

          <p>{error || "This product could not be loaded."}</p>

          <button
            type="button"
            onClick={() => navigate("/store")}
            className="mt-6 rounded-full bg-cyan-500 px-6 py-3 font-bold text-black transition hover:bg-cyan-400"
          >
            Back to Store
          </button>
        </section>
      </main>
    )
  }

  const productImage = getProductImage(product)

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate("/store")}
          className="mb-8 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back to Store
        </button>

        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            Customize: {product.name}
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Upload your artwork, position your design, choose production
            details, and submit your custom order.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
            <h2 className="mb-5 text-2xl font-bold">
              Product Mockup
            </h2>

            <ProductMockup
              image={productImage}
              artwork={form.artwork}
              design={design}
              setDesign={setDesign}
              printLocation={printLocation}
            />

            <div className="mt-5 rounded-2xl border border-slate-800 bg-[#020617] p-4">
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Design Size
              </label>

              <input
                type="range"
                min="50"
                max="300"
                value={design.size}
                onChange={(event) =>
                  setDesign((prev) => ({
                    ...prev,
                    size: Number(event.target.value)
                  }))
                }
                className="w-full"
              />

              <p className="mt-2 text-sm text-slate-500">
                Size: {design.size}px
              </p>
            </div>
          </section>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20"
          >
            <h2 className="mb-5 text-2xl font-bold">
              Order Details
            </h2>

            <div className="grid gap-4">
              <input
                type="text"
                name="customerName"
                placeholder="Your Name"
                value={form.customerName}
                onChange={handleChange}
                required
                className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
              />

              <input
                type="number"
                name="quantity"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
              />

              <select
                name="productionType"
                value={form.productionType}
                onChange={handleChange}
                className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
              >
                <option value="screenprint">
                  Screen Print
                </option>
                <option value="dtf">
                  DTF Transfer
                </option>
                <option value="vinyl">
                  Vinyl
                </option>
              </select>

              <select
                value={printLocation}
                onChange={(event) =>
                  setPrintLocation(event.target.value)
                }
                className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
              >
                <option value="front">
                  Front
                </option>
                <option value="back">
                  Back
                </option>
                <option value="left">
                  Left Chest
                </option>
                <option value="right">
                  Right Chest
                </option>
              </select>

              <div className="rounded-2xl border border-slate-800 bg-[#020617] p-5">
                <h3 className="mb-4 text-lg font-bold">
                  Upload Artwork
                </h3>

                <UploadArtwork setArtwork={setArtwork} />

                {form.artwork && (
                  <img
                    src={form.artwork}
                    alt="Artwork Preview"
                    className="mt-4 max-h-56 w-full rounded-xl border border-slate-800 object-contain"
                    onError={(event) => {
                      event.currentTarget.style.display = "none"
                    }}
                  />
                )}
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#020617] p-5">
                <h3 className="mb-4 text-lg font-bold">
                  Order Summary
                </h3>

                <SummaryRow
                  label="Product"
                  value={product.name || "Product"}
                />

                <SummaryRow
                  label="Unit Price"
                  value={money(totals.unitPrice)}
                />

                <SummaryRow
                  label="Quantity"
                  value={totals.quantity}
                />

                <SummaryRow
                  label="Subtotal"
                  value={money(totals.subtotal)}
                />

                <SummaryRow
                  label="Tax"
                  value={money(totals.tax)}
                />

                <SummaryRow
                  label="Estimated Total"
                  value={money(totals.finalPrice)}
                  strong
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-cyan-500 px-5 py-4 font-black text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Order"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
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