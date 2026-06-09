export default function LowStockBadge({ inventory }) {
  const quantity = inventory?.quantityOnHand ?? 0
  const reorderPoint = inventory?.reorderPoint ?? 0

  if (quantity > reorderPoint) {
    return (
      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
        In Stock
      </span>
    )
  }

  return (
    <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
      Reorder Needed
    </span>
  )
}