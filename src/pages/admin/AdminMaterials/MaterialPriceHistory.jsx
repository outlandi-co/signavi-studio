export default function MaterialPriceHistory({
  material
}) {
  if (!material) return null

  const currentPrice =
    Number(material.priceWatch?.currentPrice ?? material.price ?? 0)

  const previousPrice =
    Number(material.priceWatch?.previousPrice ?? material.regularPrice ?? 0)

  const difference =
    currentPrice - previousPrice

  const percentChange =
    previousPrice > 0
      ? (difference / previousPrice) * 100
      : 0

  const increased = difference > 0
  const decreased = difference < 0

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
          Price Watch
        </p>

        <h3 className="mt-1 text-xl font-bold text-white">
          Material Price History
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Track supplier pricing changes for this material.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          label="Current Price"
          value={`$${currentPrice.toFixed(2)}`}
        />

        <Stat
          label="Previous Price"
          value={`$${previousPrice.toFixed(2)}`}
        />

        <Stat
          label="Difference"
          value={`${increased ? "+" : ""}$${difference.toFixed(2)}`}
          danger={increased}
          success={decreased}
        />

        <Stat
          label="Change"
          value={`${increased ? "+" : ""}${percentChange.toFixed(2)}%`}
          danger={increased}
          success={decreased}
        />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Info
          label="Price Watch Enabled"
          value={material.priceWatch?.enabled ? "Yes" : "No"}
        />

        <Info
          label="Alert On Change"
          value={material.priceWatch?.alertOnChange ? "Yes" : "No"}
        />

        <Info
          label="Last Checked"
          value={
            material.priceWatch?.lastChecked
              ? new Date(material.priceWatch.lastChecked).toLocaleDateString()
              : "Not checked yet"
          }
        />
      </div>

      {increased && (
        <div className="mt-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm font-semibold text-red-300">
          ⚠ Supplier price increased. Consider updating quote pricing.
        </div>
      )}

      {decreased && (
        <div className="mt-5 rounded-xl border border-green-900 bg-green-950/40 p-4 text-sm font-semibold text-green-300">
          ✅ Supplier price decreased. You may have more margin available.
        </div>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  danger = false,
  success = false
}) {
  return (
    <div
      className={
        danger
          ? "rounded-xl border border-red-900 bg-red-950/30 p-4"
          : success
            ? "rounded-xl border border-green-900 bg-green-950/30 p-4"
            : "rounded-xl border border-slate-800 bg-slate-950 p-4"
      }
    >
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p
        className={
          danger
            ? "mt-2 text-2xl font-black text-red-300"
            : success
              ? "mt-2 text-2xl font-black text-green-300"
              : "mt-2 text-2xl font-black text-white"
        }
      >
        {value}
      </p>
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