export default function MaterialInventory({ inventory }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="mb-4 text-lg font-bold text-white">Inventory</h3>

      <div className="space-y-2 text-sm text-slate-300">
        <p>Tracking: {inventory?.trackInventory ? "Enabled" : "Disabled"}</p>
        <p>Quantity On Hand: {inventory?.quantityOnHand ?? 0}</p>
        <p>Reorder Point: {inventory?.reorderPoint ?? 0}</p>
      </div>
    </div>
  )
}