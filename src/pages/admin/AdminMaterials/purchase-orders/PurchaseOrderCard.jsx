export default function PurchaseOrderCard({
  order,
  onReceive,
  onDelete
}) {
  const statusStyles = {
    draft:
      "bg-amber-500/10 text-amber-300 border-amber-500/20",
    submitted:
      "bg-purple-500/10 text-purple-300 border-purple-500/20",
    ordered:
      "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    received:
      "bg-green-500/10 text-green-300 border-green-500/20",
    cancelled:
      "bg-red-500/10 text-red-300 border-red-500/20"
  }

  const statusClass =
    statusStyles[order?.status] ||
    statusStyles.draft

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-cyan-400">
            Purchase Order
          </p>

          <h3 className="mt-1 text-xl font-bold text-white">
            {order?.poNumber || "PO"}
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            {order?.materialName}
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}
        >
          {order?.status || "draft"}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Info
          label="Supplier"
          value={
            order?.supplierName ||
            "Unknown Supplier"
          }
        />

        <Info
          label="Quantity"
          value={order?.quantity || 0}
        />

        <Info
          label="Unit Cost"
          value={`$${Number(
            order?.unitCost || 0
          ).toFixed(2)}`}
        />

        <Info
          label="Total Cost"
          value={`$${Number(
            order?.totalCost || 0
          ).toFixed(2)}`}
        />

        <Info
          label="Expected Arrival"
          value={
            order?.expectedArrival ||
            "Not Scheduled"
          }
        />
      </div>

      {order?.notes && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Notes
          </p>

          <p className="mt-2 text-sm text-slate-300">
            {order.notes}
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {order?.status !== "received" && (
          <button
            type="button"
            onClick={() => onReceive?.(order)}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-500"
          >
            Mark Received
          </button>
        )}

        <button
          type="button"
          onClick={() => onDelete?.(order)}
          className="rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function Info({
  label,
  value
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-slate-200">
        {value}
      </p>
    </div>
  )
}