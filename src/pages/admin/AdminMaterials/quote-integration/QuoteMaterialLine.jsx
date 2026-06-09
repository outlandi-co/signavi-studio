import { useEffect, useMemo, useState } from "react"

export default function QuoteMaterialLine({
  materials = [],
  onChange
}) {
  const [selectedMaterialId, setSelectedMaterialId] = useState("")
  const [selectedColorSku, setSelectedColorSku] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [laborCost, setLaborCost] = useState(25)
  const [shippingCost, setShippingCost] = useState(0)
  const [wastePercent, setWastePercent] = useState(10)
  const [markupPercent, setMarkupPercent] = useState(60)

  const selectedMaterial = useMemo(() => {
    return materials.find((material) => material.id === selectedMaterialId)
  }, [materials, selectedMaterialId])

  const selectedColor = useMemo(() => {
    return selectedMaterial?.colors?.find(
      (color) => color.sku === selectedColorSku
    )
  }, [selectedMaterial, selectedColorSku])

  const calculations = useMemo(() => {
    const unitCost = Number(selectedMaterial?.price || 0)
    const usedQuantity = Number(quantity || 0)
    const labor = Number(laborCost || 0)
    const shipping = Number(shippingCost || 0)
    const wasteRate = Number(wastePercent || 0) / 100
    const markupRate = Number(markupPercent || 0) / 100

    const materialCost = unitCost * usedQuantity
    const wasteAmount = materialCost * wasteRate
    const costBasis = materialCost + wasteAmount + labor + shipping
    const markupAmount = costBasis * markupRate
    const customerPrice = costBasis + markupAmount
    const profit = customerPrice - costBasis
    const marginPercent =
      customerPrice > 0 ? (profit / customerPrice) * 100 : 0

    return {
      material: selectedMaterial,
      color: selectedColor,
      unitCost,
      quantity: usedQuantity,
      materialCost,
      wasteAmount,
      laborCost: labor,
      shippingCost: shipping,
      costBasis,
      markupAmount,
      customerPrice,
      profit,
      marginPercent
    }
  }, [
    selectedMaterial,
    selectedColor,
    quantity,
    laborCost,
    shippingCost,
    wastePercent,
    markupPercent
  ])

  useEffect(() => {
    onChange?.(calculations)
  }, [calculations, onChange])

  const handleMaterialChange = (materialId) => {
    setSelectedMaterialId(materialId)
    setSelectedColorSku("")
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-white">
          Quote Material Line
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Select material, color, quantity, labor, waste and markup.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-300">
            Material
          </span>

          <select
            value={selectedMaterialId}
            onChange={(e) => handleMaterialChange(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
          >
            <option value="">Select material</option>

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

        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-300">
            Color
          </span>

          <select
            value={selectedColorSku}
            onChange={(e) => setSelectedColorSku(e.target.value)}
            disabled={!selectedMaterial}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white disabled:opacity-50"
          >
            <option value="">Select color</option>

            {(selectedMaterial?.colors || []).map((color) => (
              <option
                key={color.sku}
                value={color.sku}
              >
                {color.name} — {color.sku}
              </option>
            ))}
          </select>
        </label>

        <NumberField
          label="Quantity Used"
          value={quantity}
          onChange={setQuantity}
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

      {selectedMaterial && (
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-3">
            <p>
              Unit Cost:{" "}
              <span className="font-bold text-white">
                ${calculations.unitCost.toFixed(2)}
              </span>
            </p>

            <p>
              Unit:{" "}
              <span className="font-bold text-white">
                {selectedMaterial.unit || "N/A"}
              </span>
            </p>

            <p>
              Supplier:{" "}
              <span className="font-bold text-white">
                {selectedMaterial.source?.vendor || "N/A"}
              </span>
            </p>
          </div>

          {selectedColor && (
            <div className="mt-4 flex items-center gap-3">
              <span
                className="h-8 w-8 rounded-full border border-slate-700"
                style={{ backgroundColor: selectedColor.hex || "#000" }}
              />

              <div>
                <p className="font-bold text-white">
                  {selectedColor.name}
                </p>

                <p className="text-xs text-slate-400">
                  {selectedColor.sku}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        <MiniStat
          label="Material"
          value={calculations.materialCost}
        />

        <MiniStat
          label="Waste"
          value={calculations.wasteAmount}
        />

        <MiniStat
          label="Cost Basis"
          value={calculations.costBasis}
        />

        <MiniStat
          label="Total"
          value={calculations.customerPrice}
          highlight
        />

        <MiniStat
          label="Profit"
          value={calculations.profit}
          success
        />
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <p className="text-xs uppercase tracking-wider text-slate-500">
          Margin
        </p>

        <p className="mt-1 text-2xl font-black text-emerald-400">
          {calculations.marginPercent.toFixed(2)}%
        </p>
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
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
      />
    </label>
  )
}

function MiniStat({
  label,
  value,
  highlight = false,
  success = false
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs uppercase text-slate-500">
        {label}
      </p>

      <p
        className={
          success
            ? "mt-1 text-xl font-black text-green-400"
            : highlight
              ? "mt-1 text-xl font-black text-cyan-300"
              : "mt-1 text-xl font-black text-white"
        }
      >
        ${Number(value || 0).toFixed(2)}
      </p>
    </div>
  )
}