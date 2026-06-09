export default function QuoteCostSummary({
  materialCost = 0,
  laborCost = 0,
  shippingCost = 0,
  wasteAmount = 0,
  costBasis,
  markupAmount = 0,
  customerPrice = 0,
  profit = 0,
  marginPercent
}) {
  const calculatedCostBasis =
    costBasis ??
    Number(materialCost) +
      Number(laborCost) +
      Number(shippingCost) +
      Number(wasteAmount)

  const calculatedMargin =
    marginPercent ??
    (Number(customerPrice) > 0
      ? (Number(profit) / Number(customerPrice)) * 100
      : 0)

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="mb-4 text-lg font-bold text-white">
        Quote Cost Summary
      </h3>

      <div className="space-y-3 text-sm text-slate-300">
        <Row label="Material Cost" value={materialCost} />
        <Row label="Labor Cost" value={laborCost} />
        <Row label="Shipping Cost" value={shippingCost} />
        <Row label="Waste" value={wasteAmount} />
        <Row label="Cost Basis" value={calculatedCostBasis} />
        <Row label="Markup" value={markupAmount} />

        <div className="border-t border-slate-800 pt-3">
          <Row
            label="Customer Price"
            value={customerPrice}
            highlight
          />

          <Row
            label="Estimated Profit"
            value={profit}
            success
          />

          <PercentRow
            label="Margin"
            value={calculatedMargin}
            success
          />
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  highlight = false,
  success = false
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-400">
        {label}
      </span>

      <span
        className={
          success
            ? "font-black text-green-400"
            : highlight
              ? "font-black text-cyan-300"
              : "font-semibold text-white"
        }
      >
        ${Number(value || 0).toFixed(2)}
      </span>
    </div>
  )
}

function PercentRow({
  label,
  value,
  success = false
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-400">
        {label}
      </span>

      <span
        className={
          success
            ? "font-black text-green-400"
            : "font-semibold text-white"
        }
      >
        {Number(value || 0).toFixed(2)}%
      </span>
    </div>
  )
}