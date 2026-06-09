import MaterialStockBadge from "./MaterialStockBadge"

export default function MaterialColorCard({ color }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div
        className="mb-3 h-14 w-14 rounded-full border border-slate-600"
        style={{ backgroundColor: color.hex }}
      />

      <h4 className="font-semibold text-white">{color.name}</h4>
      <p className="mb-3 text-xs text-slate-500">{color.sku}</p>

      <MaterialStockBadge stock={color.stock} />
    </div>
  )
}