import { useMemo, useState } from "react"
import api from "../../services/api"

const buildInitialForm = (order) => ({
  shippingCost: order?.shippingCost || "",
  carrier: order?.carrier || "USPS",
  trackingNumber: order?.trackingNumber || "",
  trackingLink: order?.trackingLink || "",
  serviceLevel: order?.serviceLevel || ""
})

export default function ShippingEditor({
  order,
  onUpdate
}) {
  const orderKey = order?._id || "empty"

  return (
    <ShippingEditorForm
      key={orderKey}
      order={order}
      onUpdate={onUpdate}
    />
  )
}

function ShippingEditorForm({
  order,
  onUpdate
}) {
  const initialForm = useMemo(
    () => buildInitialForm(order),
    [order]
  )

  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const buildTrackingLink = () => {
    if (!form.trackingNumber) return ""

    switch (form.carrier) {
      case "UPS":
        return `https://www.ups.com/track?tracknum=${form.trackingNumber}`

      case "FedEx":
        return `https://www.fedex.com/fedextrack/?trknbr=${form.trackingNumber}`

      case "USPS":
      default:
        return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${form.trackingNumber}`
    }
  }

  const handleSave = async () => {
    if (!order?._id) return

    try {
      setLoading(true)

      const finalTrackingLink =
        form.trackingLink ||
        buildTrackingLink()

      const res = await api.patch(
        `/orders/${order._id}/shipping`,
        {
          shippingCost:
            Number(form.shippingCost) || 0,

          carrier:
            form.carrier,

          trackingNumber:
            form.trackingNumber,

          trackingLink:
            finalTrackingLink,

          serviceLevel:
            form.serviceLevel
        }
      )

      alert("✅ Shipping updated")

      onUpdate?.(
        res.data?.data ||
        res.data
      )
    } catch (err) {
      console.error(
        "❌ SHIPPING UPDATE ERROR:",
        err.response?.data || err
      )

      alert(
        err.response?.data?.message ||
        "Failed to update shipping"
      )
    } finally {
      setLoading(false)
    }
  }

  if (!order) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-slate-400">
        Select an order to edit shipping.
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-white shadow-xl shadow-black/20">
      <div className="mb-6">
        <h3 className="text-2xl font-bold">
          🚚 Shipping Editor
        </h3>

        <p className="mt-2 text-slate-400">
          Update carrier information, shipping costs, and tracking.
        </p>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-300">
            Shipping Cost
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={form.shippingCost}
            onChange={(event) =>
              updateField("shippingCost", event.target.value)
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-300">
            Carrier
          </label>

          <select
            value={form.carrier}
            onChange={(event) =>
              updateField("carrier", event.target.value)
            }
            className={inputClass}
          >
            <option value="USPS">USPS</option>
            <option value="UPS">UPS</option>
            <option value="FedEx">FedEx</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-300">
            Service Level
          </label>

          <input
            value={form.serviceLevel}
            onChange={(event) =>
              updateField("serviceLevel", event.target.value)
            }
            placeholder="Priority Mail, Ground, Overnight..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-300">
            Tracking Number
          </label>

          <input
            value={form.trackingNumber}
            onChange={(event) =>
              updateField("trackingNumber", event.target.value)
            }
            placeholder="Tracking Number"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-300">
            Tracking Link
          </label>

          <input
            value={form.trackingLink}
            onChange={(event) =>
              updateField("trackingLink", event.target.value)
            }
            placeholder="Leave blank to auto-generate"
            className={inputClass}
          />
        </div>

        {form.trackingNumber && (
          <a
            href={
              form.trackingLink ||
              buildTrackingLink()
            }
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:text-cyan-300"
          >
            🔗 Preview Tracking Link
          </a>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={handleSave}
          className="mt-3 rounded-2xl bg-emerald-500 px-5 py-4 font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Shipping"}
        </button>
      </div>
    </div>
  )
}

const inputClass =
  "w-full rounded-2xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-400"