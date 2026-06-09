import { useMemo, useState } from "react"

export default function MaterialCostCalculator({
  materials = []
}) {
  const [selectedMaterialId, setSelectedMaterialId] = useState("")
  const [materialCost, setMaterialCost] = useState(10)
  const [laborCost, setLaborCost] = useState(25)
  const [shippingCost, setShippingCost] = useState(5)
  const [wastePercent, setWastePercent] = useState(10)
  const [markupPercent, setMarkupPercent] = useState(60)

  const selectedMaterial = useMemo(() => {
    return materials.find((material) => material.id === selectedMaterialId)
  }, [materials, selectedMaterialId])

  const handleMaterialChange = (id) => {
    setSelectedMaterialId(id)

    const material = materials.find((item) => item.id === id)

    if (material) {
      setMaterialCost(Number(material.price || 0))
    }
  }

  const calculations = useMemo(() => {
    const wasteAmount =
      materialCost * (wastePercent / 100)

    const costBasis =
      materialCost +
      laborCost +
      shippingCost +
      wasteAmount

    const markupAmount =
      costBasis * (markupPercent / 100)

    const customerPrice =
      costBasis + markupAmount

    const profit =
      customerPrice - costBasis

    return {
      wasteAmount,
      costBasis,
      markupAmount,
      customerPrice,
      profit
    }
  }, [
    materialCost,
    laborCost,
    shippingCost,
    wastePercent,
    markupPercent
  ])

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          Material Cost Calculator
        </h2>

        <p className="mt-2 text-slate-400">
          Select a material or calculate pricing manually.
        </p>
      </div>

      <div className="mb-5">
        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-300">
            Select Material
          </span>

          <select
            value={selectedMaterialId}
            onChange={(e) => handleMaterialChange(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
          >
            <option value="">
              Manual calculation
            </option>

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

        {selectedMaterial && (
          <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
            <p>
              Brand:{" "}
              <span className="font-semibold text-white">
                {selectedMaterial.brand}
              </span>
            </p>

            <p>
              Supplier:{" "}
              <span className="font-semibold text-white">
                {selectedMaterial.source?.vendor || "N/A"}
              </span>
            </p>

            <p>
              Unit:{" "}
              <span className="font-semibold text-white">
                {selectedMaterial.unit}
              </span>
            </p>

            <p>
              Colors:{" "}
              <span className="font-semibold text-white">
                {selectedMaterial.colors?.length || 0}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <NumberField
          label="Material Cost"
          value={materialCost}
          onChange={setMaterialCost}
        />

        <NumberField
          label="Labor Cost"
          value={laborCost}
          onChange={setLaborCost}
        />

        <NumberField
          label="Shipping Cost"
          value={shippingCost}
          onChange={setShippingCost}
        />

        <NumberField
          label="Waste %"
          value={wastePercent}
          onChange={setWastePercent}
        />

        <NumberField
          label="Markup %"
          value={markupPercent}
          onChange={setMarkupPercent}
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-5">
        <StatCard
          title="Waste"
          value={calculations.wasteAmount}
        />

        <StatCard
          title="Cost Basis"
          value={calculations.costBasis}
        />

        <StatCard
          title="Markup"
          value={calculations.markupAmount}
        />

        <StatCard
          title="Customer Price"
          value={calculations.customerPrice}
        />

        <StatCard
          title="Profit"
          value={calculations.profit}
          highlight
        />
      </div>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) =>
          onChange(Number(e.target.value))
        }
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
      />
    </label>
  )
}

function StatCard({
  title,
  value,
  highlight = false
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-xl border border-green-700 bg-green-950/30 p-4"
          : "rounded-xl border border-slate-700 bg-slate-950 p-4"
      }
    >
      <p className="text-xs uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p
        className={
          highlight
            ? "mt-2 text-2xl font-black text-green-400"
            : "mt-2 text-2xl font-black text-white"
        }
      >
        ${value.toFixed(2)}
      </p>
    </div>
  )
}