import MaterialApplication from "./components/MaterialApplication"
import MaterialCare from "./components/MaterialCare"
import MaterialColorGrid from "./components/MaterialColorGrid"
import MaterialInventory from "./components/MaterialInventory"
import MaterialPriceTable from "./components/MaterialPriceTable"
import MaterialPricing from "./components/MaterialPricing"
import MaterialSpecs from "./components/MaterialSpecs"
import MaterialSupplierCard from "./components/MaterialSupplierCard"
import MaterialPriceHistory from "./MaterialPriceHistory"
import MaterialSupplier from "./MaterialSupplier"

export default function MaterialDetails({
  material,
  onClose
}) {
  if (!material) return null

  return (
    <div className="mt-8 rounded-2xl border border-cyan-800 bg-slate-950 p-6 text-white shadow-xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            Material Details
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {material.fullName || material.productName}
          </h2>

          <p className="mt-1 text-slate-400">
            {material.brand} • {material.category} • {material.materialType}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-cyan-400 hover:text-cyan-300"
        >
          Close
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <InfoCard
          label="Current Price"
          value={`$${material.price}`}
        />

        <InfoCard
          label="Regular Price"
          value={`$${material.regularPrice}`}
        />

        <InfoCard
          label="Unit"
          value={material.unit}
        />

        <InfoCard
          label="Colors"
          value={material.colors?.length || 0}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <MaterialPriceTable material={material} />

        <MaterialPricing material={material} />

        <MaterialSpecs material={material} />

        <MaterialInventory
          inventory={material.inventory}
        />

        <MaterialSupplierCard
          source={material.source}
        />
      </div>

      <div className="mt-5">
        <MaterialPriceHistory
          material={material}
        />
      </div>

      <div className="mt-5">
        <MaterialSupplier
          material={material}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <MaterialApplication
          applicationInstructions={
            material.applicationInstructions
          }
        />

        <MaterialCare
          careInstructions={
            material.careInstructions
          }
        />
      </div>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="mb-4 text-lg font-bold text-white">
          Colors & SKUs
        </h3>

        <MaterialColorGrid
          colors={material.colors || []}
        />
      </div>
    </div>
  )
}

function InfoCard({
  label,
  value
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold text-white">
        {value || "N/A"}
      </p>
    </div>
  )
}