export default function MaterialStats({ materials = [] }) {
  const totalMaterials = materials.length

  const totalColors = materials.reduce(
    (total, material) => total + (material.colors?.length || 0),
    0
  )

  const suppliers = new Set(
    materials
      .map((material) => material.source?.vendor)
      .filter(Boolean)
  )

  const lowStock = materials.filter((material) => {
    const quantity = material.inventory?.quantityOnHand ?? 0
    const reorderPoint = material.inventory?.reorderPoint ?? 0

    return quantity <= reorderPoint
  }).length

  const trackedInventory = materials.filter(
    (material) => material.inventory?.trackInventory
  ).length

  const inventoryValue = materials.reduce((total, material) => {
    const quantity = material.inventory?.quantityOnHand ?? 0
    const price = Number(material.price || 0)

    return total + quantity * price
  }, 0)

  const averageCost =
    totalMaterials > 0
      ? materials.reduce(
          (total, material) => total + Number(material.price || 0),
          0
        ) / totalMaterials
      : 0

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <StatCard label="Materials" value={totalMaterials} icon="📦" />
      <StatCard label="Colors" value={totalColors} icon="🎨" />
      <StatCard label="Suppliers" value={suppliers.size} icon="🏢" />
      <StatCard label="Tracked" value={trackedInventory} icon="📊" />
      <StatCard label="Avg Cost" value={`$${averageCost.toFixed(2)}`} icon="💵" />
      <StatCard
        label="Low Stock"
        value={lowStock}
        icon="⚠️"
        danger={lowStock > 0}
      />

      <div className="rounded-2xl border border-emerald-800 bg-emerald-950/20 p-5 md:col-span-2 xl:col-span-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
          Estimated Inventory Value
        </p>

        <p className="mt-2 text-3xl font-black text-white">
          ${inventoryValue.toFixed(2)}
        </p>

        <p className="mt-1 text-sm text-slate-400">
          Based on quantity on hand × material price.
        </p>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  danger = false
}) {
  return (
    <div
      className={
        danger
          ? "rounded-2xl border border-red-800 bg-red-950/30 p-5"
          : "rounded-2xl border border-slate-800 bg-slate-900 p-5"
      }
    >
      <p className="text-2xl">
        {icon}
      </p>

      <p className="mt-3 text-3xl font-black text-white">
        {value}
      </p>

      <p
        className={
          danger
            ? "text-sm font-semibold text-red-300"
            : "text-sm font-semibold text-slate-400"
        }
      >
        {label}
      </p>
    </div>
  )
}