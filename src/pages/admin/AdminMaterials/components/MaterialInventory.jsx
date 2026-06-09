export default function MaterialInventory({ inventory }) {
  const quantity = inventory?.quantityOnHand ?? 0
  const reorderPoint = inventory?.reorderPoint ?? 0

  const lowStock = quantity <= reorderPoint

  const stockStatus =
    quantity === 0
      ? "Out of Stock"
      : lowStock
        ? "Low Stock"
        : "In Stock"

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-bold text-white">
          Inventory
        </h3>

        <span
          className={
            quantity === 0
              ? "rounded-full bg-red-950 px-3 py-1 text-xs font-bold text-red-300"
              : lowStock
                ? "rounded-full bg-amber-950 px-3 py-1 text-xs font-bold text-amber-300"
                : "rounded-full bg-green-950 px-3 py-1 text-xs font-bold text-green-300"
          }
        >
          {stockStatus}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card
          label="Quantity"
          value={quantity}
        />

        <Card
          label="Reorder Point"
          value={reorderPoint}
        />

        <Card
          label="Tracking"
          value={
            inventory?.trackInventory
              ? "Enabled"
              : "Disabled"
          }
        />
      </div>

      {lowStock && (
        <div className="mt-4 rounded-xl border border-red-900 bg-red-950/30 p-3 text-sm font-semibold text-red-300">
          ⚠ Inventory has reached reorder level.
        </div>
      )}
    </div>
  )
}

function Card({
  label,
  value
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-black text-white">
        {value}
      </p>
    </div>
  )
}