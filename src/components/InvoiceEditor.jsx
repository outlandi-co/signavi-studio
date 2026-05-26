import {
  useMemo,
  useState
} from "react"

import api from "../services/api"

const COMPANY = {
  name: "SignaVi Studio",
  website: "www.signavistudio.store",
  email: "support@signavistudio.store"
}

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const buildInitialState = (order = {}) => ({
  items:
    Array.isArray(order.items) && order.items.length
      ? order.items
      : [
          {
            name: "",
            quantity: 1,
            price: 0
          }
        ],

  shipping:
    order.shipping ||
    order.shippingCost ||
    0,

  taxRate:
    order.taxRate ||
    0.0825
})

export default function InvoiceEditor({
  order = {},
  onSave
}) {
  const orderKey =
    order?._id ||
    "new-invoice"

  return (
    <InvoiceEditorForm
      key={orderKey}
      order={order}
      onSave={onSave}
    />
  )
}

function InvoiceEditorForm({
  order = {},
  onSave
}) {
  const initialState = useMemo(
    () => buildInitialState(order),
    [order]
  )

  const [items, setItems] = useState(initialState.items)
  const [shipping, setShipping] = useState(initialState.shipping)
  const [taxRate, setTaxRate] = useState(initialState.taxRate)
  const [loading, setLoading] = useState(false)

  const isLocked =
    order.status === "paid"

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item

        return {
          ...item,
          [field]:
            field === "name"
              ? value
              : Number(value) || 0
        }
      })
    )
  }

  const addItem = () => {
    if (isLocked) return

    setItems((prev) => [
      ...prev,
      {
        name: "",
        quantity: 1,
        price: 0
      }
    ])
  }

  const removeItem = (index) => {
    if (isLocked) return

    setItems((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index)
    )
  }

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      return (
        sum +
        Number(item.price || 0) *
          Number(item.quantity || 0)
      )
    }, 0)
  }, [items])

  const tax = useMemo(() => {
    return subtotal * Number(taxRate || 0)
  }, [
    subtotal,
    taxRate
  ])

  const total = useMemo(() => {
    return (
      subtotal +
      tax +
      Number(shipping || 0)
    )
  }, [
    subtotal,
    tax,
    shipping
  ])

  const handleSave = async () => {
    if (isLocked) {
      alert("Invoice is locked after payment")
      return
    }

    const cleanItems = items
      .map((item) => ({
        name: String(item.name || "").trim(),
        quantity: Number(item.quantity || 0),
        price: Number(item.price || 0)
      }))
      .filter((item) => item.name && item.quantity > 0)

    if (!cleanItems.length) {
      alert("Add at least one valid item")
      return
    }

    try {
      setLoading(true)

      const payload = {
        items: cleanItems,
        subtotal,
        tax,
        taxRate: Number(taxRate || 0),
        shipping: Number(shipping || 0),
        shippingCost: Number(shipping || 0),
        total,
        finalPrice: total
      }

      const res = await api.patch(
        `/orders/${order._id}/invoice`,
        payload
      )

      alert("✅ Invoice saved")

      onSave?.(
        res.data?.data ||
          res.data?.order ||
          {
            ...payload,
            _id: order._id
          }
      )
    } catch (err) {
      console.error(
        "❌ SAVE INVOICE ERROR:",
        err.response?.data || err
      )

      alert(
        err.response?.data?.message ||
          "Failed to save invoice"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-white shadow-xl shadow-black/20">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-start">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            {COMPANY.name}
          </p>

          <h1 className="text-3xl font-extrabold">
            Invoice Editor
          </h1>

          <p className="mt-2 text-slate-400">
            {COMPANY.website}
          </p>

          <p className="text-slate-400">
            {COMPANY.email}
          </p>
        </div>

        <div className="text-left md:text-right">
          <h2 className="text-2xl font-extrabold">
            INVOICE
          </h2>

          {order?._id && (
            <p className="mt-2 font-mono text-cyan-300">
              #{order._id.slice(-6).toUpperCase()}
            </p>
          )}

          {order?.createdAt && (
            <p className="text-slate-400">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {isLocked && (
        <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 font-bold text-red-300">
          🔒 Invoice locked after payment
        </div>
      )}

      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <h3 className="text-2xl font-bold">
          🧾 Line Items
        </h3>

        <button
          type="button"
          onClick={addItem}
          disabled={isLocked}
          className="rounded-full bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add Item
        </button>
      </div>

      <div className="grid gap-3">
        {items.map((item, index) => (
          <div
            key={`${item.name || "item"}-${index}`}
            className="grid gap-3 rounded-2xl border border-slate-800 bg-[#020617] p-4 md:grid-cols-[1fr_120px_140px_48px]"
          >
            <input
              value={item.name || ""}
              placeholder="Item name"
              disabled={isLocked}
              onChange={(event) =>
                updateItem(index, "name", event.target.value)
              }
              className={inputClass}
            />

            <input
              type="number"
              min="1"
              value={item.quantity || 1}
              disabled={isLocked}
              onChange={(event) =>
                updateItem(index, "quantity", event.target.value)
              }
              className={inputClass}
            />

            <input
              type="number"
              min="0"
              step="0.01"
              value={item.price || 0}
              disabled={isLocked}
              onChange={(event) =>
                updateItem(index, "price", event.target.value)
              }
              className={inputClass}
            />

            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={isLocked}
              className="rounded-xl bg-red-500 px-3 py-2 font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-300">
            Shipping
          </span>

          <input
            type="number"
            min="0"
            step="0.01"
            value={shipping}
            disabled={isLocked}
            onChange={(event) =>
              setShipping(Number(event.target.value) || 0)
            }
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-300">
            Tax Rate
          </span>

          <input
            type="number"
            step="0.0001"
            value={taxRate}
            disabled={isLocked}
            onChange={(event) =>
              setTaxRate(Number(event.target.value) || 0)
            }
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-800 bg-[#020617] p-5">
        <Row label="Subtotal" value={money(subtotal)} />
        <Row label="Tax" value={money(tax)} />
        <Row label="Shipping" value={money(shipping)} />

        <div className="mt-4 flex justify-between border-t border-slate-700 pt-4 text-2xl font-extrabold">
          <span>Total</span>
          <span className="text-emerald-300">
            {money(total)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isLocked || loading}
        className="mt-6 w-full rounded-2xl bg-emerald-500 px-5 py-4 font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : "Save Invoice Changes"}
      </button>
    </section>
  )
}

function Row({
  label,
  value
}) {
  return (
    <div className="mb-3 flex justify-between text-slate-300">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"