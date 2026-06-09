export default function MaterialSelector({
  materials = [],
  selectedMaterialId,
  setSelectedMaterialId
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        Select Material
      </span>

      <select
        value={selectedMaterialId}
        onChange={(e) => setSelectedMaterialId(e.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
      >
        <option value="">Manual calculation</option>

        {materials.map((material) => (
          <option
            key={material._id || material.id}
            value={material.id}
          >
            {material.fullName || material.productName} — ${material.price}
          </option>
        ))}
      </select>
    </label>
  )
}