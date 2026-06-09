export default function MaterialStockBadge({
  inventory
}) {
  const quantity =
    inventory?.quantityOnHand ?? 0

  const reorderPoint =
    inventory?.reorderPoint ?? 0

  if (quantity === 0) {
    return (
      <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
        Out of Stock
      </span>
    )
  }

  if (quantity <= reorderPoint) {
    return (
      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
        Low Stock
      </span>
    )
  }

  return (
    <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
      In Stock
    </span>
  )
}