export default function MaterialSupplier({
  material
}) {
  if (!material) return null

  const source = material.source || {}

  const hasSupplier = Boolean(source.vendor)
  const hasUrl = Boolean(source.url)
  const hasLastChecked = Boolean(source.lastChecked)

  const lastChecked = hasLastChecked
    ? new Date(source.lastChecked).toLocaleDateString()
    : "Not checked"

  const status = hasSupplier
    ? hasLastChecked
      ? "Verified"
      : "Needs Review"
    : "Missing Supplier"

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            Supplier Details
          </p>

          <h3 className="mt-1 text-xl font-bold text-white">
            {source.vendor || "No Supplier Assigned"}
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Supplier reference connected to this material.
          </p>
        </div>

        <span
          className={
            status === "Verified"
              ? "rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400"
              : status === "Needs Review"
                ? "rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300"
                : "rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300"
          }
        >
          {status}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Info
          label="Supplier ID"
          value={source.supplierId || "N/A"}
        />

        <Info
          label="Vendor"
          value={source.vendor || "N/A"}
        />

        <Info
          label="Last Checked"
          value={lastChecked}
        />

        <Info
          label="Material ID"
          value={material.id || "N/A"}
        />

        <Info
          label="Product"
          value={material.fullName || material.productName || "N/A"}
        />

        <Info
          label="Category"
          value={material.category || "N/A"}
        />
      </div>

      {hasUrl && (
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Supplier URL
          </p>

          <p className="mt-2 break-all text-sm text-cyan-400">
            {source.url}
          </p>

          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-500"
          >
            Open Supplier Page
          </a>
        </div>
      )}

      {!hasSupplier && (
        <div className="mt-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm font-semibold text-red-300">
          ⚠ This material does not have a supplier assigned yet.
        </div>
      )}

      {hasSupplier && !hasLastChecked && (
        <div className="mt-5 rounded-xl border border-amber-900 bg-amber-950/40 p-4 text-sm font-semibold text-amber-300">
          ⚠ Supplier exists, but pricing/source has not been checked yet.
        </div>
      )}
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