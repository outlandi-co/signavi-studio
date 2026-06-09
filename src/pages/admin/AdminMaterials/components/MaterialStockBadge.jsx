export default function MaterialStockBadge({ stock = 0 }) {
  const label = stock > 0 ? "In Stock" : "No Stock"

  return (
    <span
      className={
        stock > 0
          ? "rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400"
          : "rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400"
      }
    >
      {label}
    </span>
  )
}