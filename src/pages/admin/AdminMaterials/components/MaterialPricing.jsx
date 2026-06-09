export default function MaterialPricing({ material }) {
  const priceWatch = material?.priceWatch || {}

  const currentPrice = Number(
    priceWatch.currentPrice ?? material?.price ?? 0
  )

  const previousPrice = Number(
    priceWatch.previousPrice ?? material?.regularPrice ?? 0
  )

  const difference = currentPrice - previousPrice

  const percentChange =
    previousPrice > 0
      ? (difference / previousPrice) * 100
      : 0

  const inventoryValue =
    currentPrice *
    Number(material?.inventory?.quantityOnHand || 0)

  const increased = difference > 0
  const decreased = difference < 0

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            Pricing Analytics
          </p>

          <h3 className="mt-1 text-lg font-bold text-white">
            Price Watch
          </h3>
        </div>

        <span
          className={
            priceWatch.enabled
              ? "rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400"
              : "rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-slate-300"
          }
        >
          {priceWatch.enabled ? "Watching" : "Not Watching"}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card
          label="Current Price"
          value={`$${currentPrice.toFixed(2)}`}
          success
        />

        <Card
          label="Previous Price"
          value={`$${previousPrice.toFixed(2)}`}
        />

        <Card
          label="Difference"
          value={`${increased ? "+" : ""}$${difference.toFixed(2)}`}
          danger={increased}
          success={decreased}
        />

        <Card
          label="Change"
          value={`${increased ? "+" : ""}${percentChange.toFixed(2)}%`}
          danger={increased}
          success={decreased}
        />

        <Card
          label="Inventory Value"
          value={`$${inventoryValue.toFixed(2)}`}
        />

        <Card
          label="Alert On Change"
          value={priceWatch.alertOnChange ? "Yes" : "No"}
        />
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <p className="text-xs uppercase tracking-wider text-slate-500">
          Last Checked
        </p>

        <p className="mt-2 font-bold text-slate-200">
          {priceWatch.lastChecked
            ? new Date(priceWatch.lastChecked).toLocaleDateString()
            : "Not checked yet"}
        </p>
      </div>

      {increased && (
        <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm font-semibold text-red-300">
          ⚠ Price increased. Review quote pricing and margins.
        </div>
      )}

      {decreased && (
        <div className="mt-4 rounded-xl border border-green-900 bg-green-950/40 p-3 text-sm font-semibold text-green-300">
          ✅ Price decreased. You may have extra margin available.
        </div>
      )}
    </div>
  )
}

function Card({
  label,
  value,
  success = false,
  danger = false
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
            ? "mt-2 text-xl font-black text-red-300"
            : success
              ? "mt-2 text-xl font-black text-green-300"
              : "mt-2 text-xl font-black text-white"
        }
      >
        {value}
      </p>
    </div>
  )
}