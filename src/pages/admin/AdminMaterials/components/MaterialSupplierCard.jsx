import MaterialSourceLink from "./MaterialSourceLink"

export default function MaterialSupplierCard({ source }) {
  const hasPriceWatch = Boolean(source?.lastChecked)

  const lastCheckedDate = source?.lastChecked
    ? new Date(source.lastChecked).toLocaleDateString()
    : "Not checked"

  const supplierHealth = hasPriceWatch
    ? "Verified"
    : "Needs Review"

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            Supplier
          </p>

          <h3 className="mt-1 text-lg font-bold text-white">
            {source?.vendor || "Not Listed"}
          </h3>
        </div>

        <span
          className={
            hasPriceWatch
              ? "rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400"
              : "rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300"
          }
        >
          {supplierHealth}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Info
          label="Vendor"
          value={source?.vendor || "Not Listed"}
        />

        <Info
          label="Supplier ID"
          value={source?.supplierId || "N/A"}
        />

        <Info
          label="Last Checked"
          value={lastCheckedDate}
        />

        <Info
          label="Status"
          value={supplierHealth}
          success={hasPriceWatch}
        />
      </div>

      {source?.url && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Supplier URL
          </p>

          <p className="mt-2 break-all text-sm text-cyan-400">
            {source.url}
          </p>
        </div>
      )}

      <div className="mt-4">
        <MaterialSourceLink
          url={source?.url}
          label="Open Supplier Page"
        />
      </div>
    </div>
  )
}

function Info({
  label,
  value,
  success = false
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p
        className={
          success
            ? "mt-1 font-bold text-green-400"
            : "mt-1 font-bold text-slate-200"
        }
      >
        {value}
      </p>
    </div>
  )
}