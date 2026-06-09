export default function SupplierCard({
  supplier,
  onEdit,
  onDelete
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Supplier
          </p>

          <h3 className="mt-1 text-xl font-bold text-white">
            {supplier.name}
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Lead Time: {supplier.leadTime || "N/A"}
          </p>
        </div>

        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
          Active
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Info label="Email" value={supplier.email || "N/A"} />
        <Info label="Phone" value={supplier.phone || "N/A"} />
        <Info label="Supplier ID" value={supplier.id || "N/A"} />
        <Info label="Lead Time" value={supplier.leadTime || "N/A"} />
      </div>

      {supplier.website && (
        <div className="mt-4">
          <a
            href={supplier.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-500"
          >
            Visit Website
          </a>
        </div>
      )}

      {supplier.shippingNotes && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Shipping Notes
          </p>

          <p className="mt-2 text-sm text-slate-300">
            {supplier.shippingNotes}
          </p>
        </div>
      )}

      {supplier.notes && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Notes
          </p>

          <p className="mt-2 text-sm text-slate-300">
            {supplier.notes}
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => onEdit?.(supplier)}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-500"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete?.(supplier.id)}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-600"
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
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-slate-200">
        {value}
      </p>
    </div>
  )
}