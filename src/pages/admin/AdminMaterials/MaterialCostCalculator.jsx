import { useMemo, useState } from "react"

const JOB_TYPES = [
  { value: "htv", label: "HTV / Vinyl Cutting" },
  { value: "dtf", label: "DTF Transfer" },
  { value: "screenprint", label: "Screen Print" },
  { value: "laser", label: "Laser Engraving" },
  { value: "manual", label: "Manual Cost" }
]

const PRODUCT_PRESETS = [
  { value: "custom", label: "Custom Product" },
  { value: "shirt", label: "Blank Shirt" },
  { value: "leather-keychain", label: "Leather Keychain" },
  { value: "dog-tag", label: "Dog Tag" },
  { value: "glass", label: "Glass / Cup" },
  { value: "tumbler", label: "Tumbler" },
  { value: "wood", label: "Wood Item" },
  { value: "acrylic", label: "Acrylic Item" }
]

export default function MaterialCostCalculator({ materials = [] }) {
  const [jobType, setJobType] = useState("htv")
  const [productPreset, setProductPreset] = useState("custom")
  const [selectedMaterialId, setSelectedMaterialId] = useState("")

  const [quantity, setQuantity] = useState(1)

  const [substrateCostEach, setSubstrateCostEach] = useState(2.5)
  const [hardwareCostEach, setHardwareCostEach] = useState(0)
  const [packagingCostEach, setPackagingCostEach] = useState(0.25)

  const [designWidth, setDesignWidth] = useState(10)
  const [designHeight, setDesignHeight] = useState(12)
  const [layers, setLayers] = useState(1)

  const [manualMaterialCost, setManualMaterialCost] = useState(10)

  const [dtfRatePerSqIn, setDtfRatePerSqIn] = useState(0.04)

  const [screenSetupCost, setScreenSetupCost] = useState(25)
  const [screenCount, setScreenCount] = useState(1)
  const [screenInkCostPerPrint, setScreenInkCostPerPrint] = useState(0.15)

  const [laserMinutesEach, setLaserMinutesEach] = useState(2)
  const [laserSetupMinutes, setLaserSetupMinutes] = useState(10)
  const [machineRatePerMinute, setMachineRatePerMinute] = useState(0.1)
  const [maskingCostEach, setMaskingCostEach] = useState(0)

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

  const handlePresetChange = (preset) => {
    setProductPreset(preset)

    if (preset === "shirt") {
      setSubstrateCostEach(4)
      setHardwareCostEach(0)
      setPackagingCostEach(0.25)
      setDesignWidth(10)
      setDesignHeight(12)
      setLaborMinutes(30)
    }

    if (preset === "leather-keychain") {
      setJobType("laser")
      setSubstrateCostEach(0.75)
      setHardwareCostEach(0.15)
      setPackagingCostEach(0.2)
      setLaserMinutesEach(2)
      setLaserSetupMinutes(10)
      setLaborMinutes(25)
      setDesignWidth(2)
      setDesignHeight(3)
    }

    if (preset === "dog-tag") {
      setJobType("laser")
      setSubstrateCostEach(0.45)
      setHardwareCostEach(0.2)
      setPackagingCostEach(0.15)
      setLaserMinutesEach(0.75)
      setLaserSetupMinutes(8)
      setLaborMinutes(20)
      setDesignWidth(1.2)
      setDesignHeight(2)
    }

    if (preset === "glass") {
      setJobType("laser")
      setSubstrateCostEach(3.5)
      setHardwareCostEach(0)
      setPackagingCostEach(0.5)
      setMaskingCostEach(0.25)
      setLaserMinutesEach(8)
      setLaserSetupMinutes(12)
      setLaborMinutes(35)
      setDesignWidth(3)
      setDesignHeight(3)
    }

    if (preset === "tumbler") {
      setJobType("laser")
      setSubstrateCostEach(6.25)
      setHardwareCostEach(0)
      setPackagingCostEach(0.75)
      setMaskingCostEach(0.35)
      setLaserMinutesEach(12)
      setLaserSetupMinutes(15)
      setLaborMinutes(40)
      setDesignWidth(4)
      setDesignHeight(4)
    }

    if (preset === "wood") {
      setJobType("laser")
      setSubstrateCostEach(2.5)
      setHardwareCostEach(0)
      setPackagingCostEach(0.35)
      setMaskingCostEach(0.1)
      setLaserMinutesEach(6)
      setLaserSetupMinutes(10)
      setLaborMinutes(30)
    }

    if (preset === "acrylic") {
      setJobType("laser")
      setSubstrateCostEach(3)
      setHardwareCostEach(0)
      setPackagingCostEach(0.35)
      setMaskingCostEach(0.15)
      setLaserMinutesEach(5)
      setLaserSetupMinutes(10)
      setLaborMinutes(30)
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

    const substrateCost =
      safeQuantity * (Number(substrateCostEach) || 0)

    const hardwareCost =
      safeQuantity * (Number(hardwareCostEach) || 0)

    const packagingCost =
      safeQuantity * (Number(packagingCostEach) || 0)

    const maskingCost =
      safeQuantity * (Number(maskingCostEach) || 0)

    let decorationMaterialCost = Number(manualMaterialCost) || 0
    let setupCost = 0
    let machineCost = 0

    if (jobType === "htv") {
      decorationMaterialCost = yardsUsed * materialUnitPrice
    }

    if (jobType === "dtf") {
      decorationMaterialCost = totalSqInWithWaste * (Number(dtfRatePerSqIn) || 0)
    }

    if (jobType === "screenprint") {
      setupCost =
        (Number(screenSetupCost) || 0) *
        Math.max(Number(screenCount) || 1, 1)

      decorationMaterialCost =
        safeQuantity *
        Math.max(Number(screenCount) || 1, 1) *
        (Number(screenInkCostPerPrint) || 0)
    }

    if (jobType === "laser") {
      const totalLaserMinutes =
        (Number(laserMinutesEach) || 0) * safeQuantity +
        (Number(laserSetupMinutes) || 0)

      machineCost =
        totalLaserMinutes * (Number(machineRatePerMinute) || 0)

      decorationMaterialCost = maskingCost
    }

    if (jobType === "manual") {
      decorationMaterialCost = Number(manualMaterialCost) || 0
    }

    const laborCost =
      ((Number(laborMinutes) || 0) / 60) *
      (Number(hourlyRate) || 0)

    const costBeforeWaste =
      substrateCost +
      hardwareCost +
      packagingCost +
      decorationMaterialCost +
      machineCost +
      laborCost +
      setupCost +
      (Number(shippingCost) || 0)

    const wasteCost =
      costBeforeWaste * ((Number(wastePercent) || 0) / 100)

    const costBasis =
      costBeforeWaste + wasteCost

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
      substrateCost,
      hardwareCost,
      packagingCost,
      maskingCost,
      decorationMaterialCost,
      machineCost,
      laborCost,
      setupCost,
      wasteCost,
      costBeforeWaste,
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
    substrateCostEach,
    hardwareCostEach,
    packagingCostEach,
    maskingCostEach,
    manualMaterialCost,
    materialUnitPrice,
    rollActualWidth,
    dtfRatePerSqIn,
    screenSetupCost,
    screenCount,
    screenInkCostPerPrint,
    laserMinutesEach,
    laserSetupMinutes,
    machineRatePerMinute,
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
          Price the full finished product: substrate, decoration, machine time,
          labor, packaging, waste, markup, profit, and customer price.
        </p>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SelectField
          label="Product / Substrate Preset"
          value={productPreset}
          onChange={handlePresetChange}
          options={PRODUCT_PRESETS}
        />

        <SelectField
          label="Job Type"
          value={jobType}
          onChange={setJobType}
          options={JOB_TYPES}
        />

        <NumberField
          label="Quantity"
          value={quantity}
          onChange={setQuantity}
        />
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <NumberField
          label="Substrate Cost Each"
          value={substrateCostEach}
          onChange={setSubstrateCostEach}
        />

        <NumberField
          label="Hardware / Add-On Cost Each"
          value={hardwareCostEach}
          onChange={setHardwareCostEach}
        />

        <NumberField
          label="Packaging Cost Each"
          value={packagingCostEach}
          onChange={setPackagingCostEach}
        />

        <NumberField
          label="Shipping / Extra Supplies"
          value={shippingCost}
          onChange={setShippingCost}
        />
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-300">
            Select Decoration Material
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

        <NumberField
          label="Manual Material Price / Cost"
          value={manualMaterialCost}
          onChange={setManualMaterialCost}
        />
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
          label="Layers / Colors"
          value={layers}
          onChange={setLayers}
        />

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

        {jobType === "laser" && (
          <>
            <NumberField
              label="Laser Minutes Each"
              value={laserMinutesEach}
              onChange={setLaserMinutesEach}
            />

            <NumberField
              label="Laser Setup Minutes"
              value={laserSetupMinutes}
              onChange={setLaserSetupMinutes}
            />

            <NumberField
              label="Machine Cost Per Minute"
              value={machineRatePerMinute}
              onChange={setMachineRatePerMinute}
            />

            <NumberField
              label="Masking / Prep Cost Each"
              value={maskingCostEach}
              onChange={setMaskingCostEach}
            />
          </>
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
          title="Substrate Cost"
          value={calculations.substrateCost}
        />

        <StatCard
          title="Hardware Cost"
          value={calculations.hardwareCost}
        />

        <StatCard
          title="Packaging Cost"
          value={calculations.packagingCost}
        />

        <StatCard
          title="Decoration Cost"
          value={calculations.decorationMaterialCost}
        />

        <StatCard
          title="Machine Cost"
          value={calculations.machineCost}
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
          title="Waste Cost"
          value={calculations.wasteCost}
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
      </div>
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
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