import MaterialColorGrid from "./MaterialColorGrid"
import MaterialSourceLink from "./MaterialSourceLink"
import LowStockBadge from "./LowStockBadge"

export default function MaterialCard({
  material,
  onView,
  onEdit
}) {
  const quantity = material.inventory?.quantityOnHand ?? 0
  const reorderPoint = material.inventory?.reorderPoint ?? 0

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
      {material.image?.url ? (
        <img
          src={material.image.url}
          alt={material.image.alt || material.fullName || material.productName}
          className="mb-4 h-48 w-full rounded-xl border border-slate-800 object-cover"
        />
      ) : (
        <div className="mb-4 flex h-48 w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-sm font-semibold text-slate-500">
          No Image
        </div>
      )}

      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-cyan-400">
            {material.category}
          </p>

          <h3 className="text-lg font-bold text-white">
            {material.fullName || material.productName}
          </h3>

          <p className="text-sm text-slate-400">
            {material.brand}
          </p>
        </div>

        <LowStockBadge inventory={material.inventory} />
      </div>

      <div className="grid gap-2 text-sm text-slate-300">
        <p>
          Price:{" "}
          <span className="font-semibold text-green-400">
            ${material.price}
          </span>
        </p>

        <p>Unit: {material.unit}</p>
        <p>SKU Prefix: {material.skuPrefix}</p>
        <p>Colors: {material.colors?.length || 0}</p>
        <p>Supplier: {material.source?.vendor}</p>

        <p>
          Stock:{" "}
          <span
            className={
              quantity <= reorderPoint
                ? "font-semibold text-red-400"
                : "font-semibold text-green-400"
            }
          >
            {quantity}
          </span>
        </p>

        <p>Reorder Point: {reorderPoint}</p>

        {quantity <= reorderPoint && (
          <div className="mt-2 rounded-lg border border-red-900 bg-red-950/40 p-2 text-xs font-bold text-red-300">
            ⚠ Inventory is below reorder level
          </div>
        )}
      </div>

      <div className="mt-4">
        <MaterialColorGrid
          colors={(material.colors || []).slice(0, 8)}
          compact
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onView?.(material)}
          className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
        >
          View Details
        </button>

        <button
          type="button"
          onClick={() => onEdit?.(material)}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500"
        >
          Edit
        </button>

        <MaterialSourceLink url={material.source?.url} />
      </div>
    </div>
  )
}