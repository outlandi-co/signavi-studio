export default function MaterialAnalytics({
  materials = [],
  suppliers = [],
  purchaseOrders = []
}) {
  const totalInventoryValue = materials.reduce(
    (sum, material) => {
      const quantity =
        material.inventory?.quantityOnHand || 0

      const price =
        Number(material.price || 0)

      return sum + quantity * price
    },
    0
  )

  const lowStockCount = materials.filter(
    (material) => {
      const quantity =
        material.inventory?.quantityOnHand || 0

      const reorderPoint =
        material.inventory?.reorderPoint || 0

      return quantity <= reorderPoint
    }
  ).length

  const openOrders = purchaseOrders.filter(
    (order) =>
      order.status !== "received" &&
      order.status !== "cancelled"
  ).length

  const monthlyPurchasing = purchaseOrders.reduce(
    (sum, order) =>
      sum + Number(order.totalCost || 0),
    0
  )

  const totalColors = materials.reduce(
    (sum, material) =>
      sum + (material.colors?.length || 0),
    0
  )

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
          Material Analytics
        </p>

        <h2 className="mt-1 text-2xl font-bold text-white">
          Inventory Dashboard
        </h2>

        <p className="mt-2 text-slate-400">
          Overview of inventory, purchasing, suppliers, and material costs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnalyticsCard
          title="Inventory Value"
          value={`$${totalInventoryValue.toFixed(2)}`}
          icon="📦"
        />

        <AnalyticsCard
          title="Low Stock Materials"
          value={lowStockCount}
          icon="⚠️"
          danger={lowStockCount > 0}
        />

        <AnalyticsCard
          title="Suppliers"
          value={suppliers.length}
          icon="🏢"
        />

        <AnalyticsCard
          title="Open Purchase Orders"
          value={openOrders}
          icon="📋"
        />

        <AnalyticsCard
          title="Purchasing Total"
          value={`$${monthlyPurchasing.toFixed(2)}`}
          icon="💰"
        />

        <AnalyticsCard
          title="Material Colors"
          value={totalColors}
          icon="🎨"
        />
      </div>
    </div>
  )
}

function AnalyticsCard({
  title,
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
      <div className="flex items-center justify-between">
        <span className="text-3xl">
          {icon}
        </span>

        <span
          className={
            danger
              ? "text-xs font-bold text-red-300"
              : "text-xs font-bold text-cyan-400"
          }
        >
          LIVE
        </span>
      </div>

      <p className="mt-4 text-3xl font-black text-white">
        {value}
      </p>

      <p
        className={
          danger
            ? "mt-2 text-sm font-semibold text-red-300"
            : "mt-2 text-sm font-semibold text-slate-400"
        }
      >
        {title}
      </p>
    </div>
  )
}