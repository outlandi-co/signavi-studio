import { useMemo, useState } from "react"

const JOB_TYPES = [
  { value: "htv", label: "HTV / Vinyl Cutting" },
  { value: "dtf", label: "DTF Transfer" },
  { value: "screenprint", label: "Screen Print" },
  { value: "manual", label: "Manual Cost" }
]

export default function MaterialCostCalculator({
  materials = []
}) {
  const [jobType, setJobType] = useState("htv")
  const [selectedMaterialId, setSelectedMaterialId] = useState("")

  const [designWidth, setDesignWidth] = useState(10)
  const [designHeight, setDesignHeight] = useState(12)
  const [layers, setLayers] = useState(1)
  const [quantity, setQuantity] = useState(1)

  const [manualMaterialCost, setManualMaterialCost] = useState(10)
  const [dtfRatePerSqIn, setDtfRatePerSqIn] = useState(0.04)
  const [screenSetupCost, setScreenSetupCost] = useState(25)
  const [screenCount, setScreenCount] = useState(1)
  const [screenInkCostPerPrint, setScreenInkCostPerPrint] = useState(0.15)

  const [laborMinutes, setLaborMinutes] = useState(30)
  const [hourlyRate, setHourlyRate] = useState(35)
  const [shippingCost, setShippingCost] = useState(5)
  const [wastePercent, setWastePercent] = useState(15)
  const [markupPercent, setMarkupPercent] = useState(60)

  const selectedMaterial = useMemo(() => {
    return materials.find((material) => material.id === selectedMaterialId)
  }, [materials, selectedMaterialId])

  const materialUnitPrice = Number(selectedMaterial?.price || manualMaterialCost || 0)

  const rollActualWidth = useMemo(() => {
    const actualWidth =
      selectedMaterial?.dimensions?.actualWidth ||
      selectedMaterial?.dimensions?.listedWidth ||
      ""

    const parsed = Number(String(actualWidth).replace(/[^0-9.]/g, ""))

    return parsed || 20
  }, [selectedMaterial])

  const handleMaterialChange = (id) => {
    setSelectedMaterialId(id)

    const material = materials.find((item) => item.id === id)

    if (material) {
      setManualMaterialCost(Number(material.price || 0))
    }
  }

  const calculations = useMemo(() => {
    const safeQuantity = Math.max(Number(quantity) || 1, 1)
    const safeWidth = Math.max(Number(designWidth) || 0, 0)
    const safeHeight = Math.max(Number(designHeight) || 0, 0)
    const safeLayers = Math.max(Number(layers) || 1, 1)

    const designSqIn = safeWidth * safeHeight
    const totalSqIn = designSqIn * safeLayers * safeQuantity

    const wasteMultiplier = 1 + (Number(wastePercent) || 0) / 100
    const totalSqInWithWaste = totalSqIn * wasteMultiplier

    const yardsUsed =
      rollActualWidth > 0
        ? totalSqInWithWaste / (rollActualWidth * 36)
        : 0

    let materialCost = Number(manualMaterialCost) || 0
    let setupCost = 0

    if (jobType === "htv") {
      materialCost = yardsUsed * materialUnitPrice
    }

    if (jobType === "dtf") {
      materialCost = totalSqInWithWaste * (Number(dtfRatePerSqIn) || 0)
    }

    if (jobType === "screenprint") {
      setupCost =
        (Number(screenSetupCost) || 0) *
        Math.max(Number(screenCount) || 1, 1)

      materialCost =
        safeQuantity *
        Math.max(Number(screenCount) || 1, 1) *
        (Number(screenInkCostPerPrint) || 0)
    }

    if (jobType === "manual") {
      materialCost = Number(manualMaterialCost) || 0
    }

    const laborCost =
      ((Number(laborMinutes) || 0) / 60) *
      (Number(hourlyRate) || 0)

    const costBasis =
      materialCost +
      laborCost +
      setupCost +
      (Number(shippingCost) || 0)

    const markupAmount =
      costBasis * ((Number(markupPercent) || 0) / 100)

    const customerPrice =
      costBasis + markupAmount

    const profit =
      customerPrice - costBasis

    const pricePerItem =
      safeQuantity > 0
        ? customerPrice / safeQuantity
        : customerPrice

    const costPerItem =
      safeQuantity > 0
        ? costBasis / safeQuantity
        : costBasis

    return {
      designSqIn,
      totalSqIn,
      totalSqInWithWaste,
      yardsUsed,
      materialCost,
      laborCost,
      setupCost,
      costBasis,
      markupAmount,
      customerPrice,
      profit,
      pricePerItem,
      costPerItem
    }
  }, [
    jobType,
    designWidth,
    designHeight,
    layers,
    quantity,
    manualMaterialCost,
    materialUnitPrice,
    rollActualWidth,
    dtfRatePerSqIn,
    screenSetupCost,
    screenCount,
    screenInkCostPerPrint,
    laborMinutes,
    hourlyRate,
    shippingCost,
    wastePercent,
    markupPercent
  ])

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          Production Cost Calculator
        </h2>

        <p className="mt-2 text-slate-400">
          Calculate vinyl usage, DTF cost, screen print setup, labor, waste,
          markup, profit, and suggested customer pricing.
        </p>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-300">
            Job Type
          </span>

          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
          >
            {JOB_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

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
              Manual / No material selected
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
      </div>

      {selectedMaterial && (
        <div className="mb-5 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
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
            Unit Price:{" "}
            <span className="font-semibold text-white">
              ${Number(selectedMaterial.price || 0).toFixed(2)} / {selectedMaterial.unit || "unit"}
            </span>
          </p>

          <p>
            Roll Width Used:{" "}
            <span className="font-semibold text-white">
              {rollActualWidth}" 
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <NumberField
          label="Design Width (in)"
          value={designWidth}
          onChange={setDesignWidth}
        />

        <NumberField
          label="Design Height (in)"
          value={designHeight}
          onChange={setDesignHeight}
        />

        <NumberField
          label="Quantity"
          value={quantity}
          onChange={setQuantity}
        />

        <NumberField
          label="Layers / Colors"
          value={layers}
          onChange={setLayers}
        />

        {jobType === "manual" && (
          <NumberField
            label="Manual Material Cost"
            value={manualMaterialCost}
            onChange={setManualMaterialCost}
          />
        )}

        {jobType === "dtf" && (
          <NumberField
            label="DTF Rate Per Sq In"
            value={dtfRatePerSqIn}
            onChange={setDtfRatePerSqIn}
          />
        )}

        {jobType === "screenprint" && (
          <>
            <NumberField
              label="Screen Setup Cost Each"
              value={screenSetupCost}
              onChange={setScreenSetupCost}
            />

            <NumberField
              label="Number of Screens"
              value={screenCount}
              onChange={setScreenCount}
            />

            <NumberField
              label="Ink Cost Per Print"
              value={screenInkCostPerPrint}
              onChange={setScreenInkCostPerPrint}
            />
          </>
        )}

        {jobType === "htv" && (
          <NumberField
            label="Material Price Per Yard"
            value={manualMaterialCost}
            onChange={setManualMaterialCost}
          />
        )}

        <NumberField
          label="Labor Minutes"
          value={laborMinutes}
          onChange={setLaborMinutes}
        />

        <NumberField
          label="Hourly Labor Rate"
          value={hourlyRate}
          onChange={setHourlyRate}
        />

        <NumberField
          label="Shipping / Supply Cost"
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

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Design Sq In"
          value={calculations.designSqIn}
          suffix=" sq in"
          money={false}
        />

        <StatCard
          title="Total Sq In + Waste"
          value={calculations.totalSqInWithWaste}
          suffix=" sq in"
          money={false}
        />

        <StatCard
          title="Yards Used"
          value={calculations.yardsUsed}
          suffix=" yd"
          money={false}
        />

        <StatCard
          title="Material Cost"
          value={calculations.materialCost}
        />

        <StatCard
          title="Labor Cost"
          value={calculations.laborCost}
        />

        <StatCard
          title="Setup Cost"
          value={calculations.setupCost}
        />

        <StatCard
          title="Cost Basis"
          value={calculations.costBasis}
        />

        <StatCard
          title="Suggested Price"
          value={calculations.customerPrice}
          highlight
        />

        <StatCard
          title="Cost Per Item"
          value={calculations.costPerItem}
        />

        <StatCard
          title="Price Per Item"
          value={calculations.pricePerItem}
          highlight
        />

        <StatCard
          title="Profit"
          value={calculations.profit}
          highlight
        />

        <StatCard
          title="Markup Amount"
          value={calculations.markupAmount}
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
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
      />
    </label>
  )
}

function StatCard({
  title,
  value,
  suffix = "",
  money = true,
  highlight = false
}) {
  const formattedValue = money
    ? `$${Number(value || 0).toFixed(2)}`
    : `${Number(value || 0).toFixed(2)}${suffix}`

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
        {formattedValue}
      </p>
    </div>
  )
}