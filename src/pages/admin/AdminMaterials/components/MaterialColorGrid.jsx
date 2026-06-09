export default function MaterialColorGrid({ colors = [], compact = false }) {
  return (
    <div className={compact ? "flex flex-wrap gap-2" : "grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6"}>
      {colors.map((color) => (
        <div key={color.sku} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
          <div
            className="mx-auto mb-2 h-10 w-10 rounded-full border border-slate-600"
            style={{ backgroundColor: color.hex }}
          />

          {!compact && (
            <>
              <p className="text-xs font-semibold text-white">{color.name}</p>
              <p className="text-[11px] text-slate-500">{color.sku}</p>
            </>
          )}
        </div>
      ))}
    </div>
  )
}