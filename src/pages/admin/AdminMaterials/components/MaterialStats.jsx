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

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-4">
      <StatCard label="Materials" value={totalMaterials} icon="📦" />
      <StatCard label="Colors" value={totalColors} icon="🎨" />
      <StatCard label="Suppliers" value={suppliers.size} icon="🏢" />
      <StatCard label="Low Stock" value={lowStock} icon="⚠️" danger={lowStock > 0} />
    </div>
  )
}

function StatCard({ label, value, icon, danger = false }) {
  return (
    <div
      className={
        danger
          ? "rounded-2xl border border-red-800 bg-red-950/30 p-5"
          : "rounded-2xl border border-slate-800 bg-slate-900 p-5"
      }
    >
      <p className="text-2xl">{icon}</p>

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