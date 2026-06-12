import { useRef, useState } from "react"

import api from "../../../services/api"

import useMaterials from "./hooks/useMaterials"
import useSuppliers from "./hooks/useSuppliers"
import usePurchaseOrders from "./hooks/usePurchaseOrders"

import MaterialsSearch from "./components/MaterialsSearch"
import MaterialFilters from "./components/MaterialFilters"
import MaterialCard from "./components/MaterialCard"
import MaterialStats from "./components/MaterialStats"
import MaterialDetails from "./MaterialDetails"
import MaterialEditor from "./MaterialEditor"
import MaterialCostCalculator from "./MaterialCostCalculator"
import MaterialQuotePreview from "./MaterialQuotePreview"
import MaterialAnalytics from "./MaterialAnalytics"
import PurchaseOrders from "./PurchaseOrders"
import SupplierManager from "./SupplierManager"

const initialGeneratorForm = {
  productName: "",
  skuPrefix: "",
  price: "",
  regularPrice: "",
  listedWidth: "",
  actualWidth: "",
  thickness: "",
  colorText: "",
  specsJson: ""
}

export default function AdminMaterials() {
  const {
    materials,
    searchTerm,
    setSearchTerm,
    category,
    setCategory,
    loading,
    error
  } = useMaterials()

  const {
    suppliers,
    loadingSuppliers,
    supplierError,
    loadSuppliers
  } = useSuppliers()

  const {
    purchaseOrders,
    loadingPurchaseOrders,
    purchaseOrderError,
    loadPurchaseOrders
  } = usePurchaseOrders()

  const fileInputRef = useRef(null)

  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [status, setStatus] = useState("")
  const [generatorForm, setGeneratorForm] = useState(initialGeneratorForm)

  const handleDownloadCSV = () => {
    window.open(
      "https://signavi-backend.onrender.com/api/materials/export",
      "_blank"
    )
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleGeneratorChange = (event) => {
    const { name, value } = event.target

    setGeneratorForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGenerateMaterial = async (event) => {
    event.preventDefault()

    try {
      setGenerating(true)
      setStatus("")

      let parsedSpecsJson = {}

      if (generatorForm.specsJson.trim()) {
        try {
          parsedSpecsJson = JSON.parse(generatorForm.specsJson)
        } catch (jsonError) {
          console.error("❌ SPECS JSON PARSE ERROR:", jsonError)

          setStatus(
            "❌ Specs JSON Override is not valid JSON. Check commas, quotes, and brackets."
          )

          setGenerating(false)
          return
        }
      }

      const payload = {
        productName: generatorForm.productName.trim(),
        skuPrefix: generatorForm.skuPrefix.trim().toUpperCase(),
        price: Number(generatorForm.price),
        regularPrice: generatorForm.regularPrice
          ? Number(generatorForm.regularPrice)
          : undefined,
        listedWidth: generatorForm.listedWidth.trim(),
        actualWidth: generatorForm.actualWidth.trim(),
        thickness: generatorForm.thickness.trim(),
        colorText: generatorForm.colorText.trim(),
        ...parsedSpecsJson
      }

      const { data } = await api.post("/materials/generate", payload)

      setStatus(
        data?.updatedExisting
          ? "✅ Material updated successfully."
          : "✅ Material generated successfully."
      )

      setGeneratorForm(initialGeneratorForm)

      setTimeout(() => {
        window.location.reload()
      }, 900)
    } catch (err) {
      console.error("❌ MATERIAL GENERATE ERROR:", err)

      setStatus(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "❌ Failed to generate material"
      )
    } finally {
      setGenerating(false)
    }
  }

  const handleUploadCSV = async (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    try {
      setUploading(true)
      setStatus("")

      const formData = new FormData()
      formData.append("file", file)

      await api.post("/materials/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      setStatus("✅ Materials CSV uploaded successfully. Refreshing page...")

      setTimeout(() => {
        window.location.reload()
      }, 800)
    } catch (err) {
      console.error("❌ MATERIAL CSV UPLOAD ERROR:", err)

      setStatus(
        err?.response?.data?.message ||
          "❌ Failed to upload materials CSV"
      )
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  const handleLoadDashboardData = async () => {
    setStatus("")

    await Promise.all([
      loadSuppliers(),
      loadPurchaseOrders()
    ])

    setStatus("✅ Dashboard data loaded")
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              SignaVi Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Material Catalog
            </h1>

            <p className="mt-2 max-w-3xl text-slate-400">
              Search and manage vinyl, HTV, DTF supplies, screen print materials,
              laser materials, supplier links, pricing, care instructions, and
              inventory references.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowGenerator((prev) => !prev)}
              className="rounded-xl border border-emerald-700 bg-emerald-950/40 px-4 py-3 text-sm font-bold text-emerald-200 hover:border-emerald-400"
            >
              {showGenerator ? "Hide Generator" : "⚡ Generate Material"}
            </button>

            <button
              type="button"
              onClick={handleLoadDashboardData}
              disabled={loadingSuppliers || loadingPurchaseOrders}
              className="rounded-xl border border-cyan-700 bg-cyan-950/40 px-4 py-3 text-sm font-bold text-cyan-200 hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingSuppliers || loadingPurchaseOrders
                ? "Loading Data..."
                : "Load Dashboard Data"}
            </button>

            <button
              type="button"
              onClick={handleDownloadCSV}
              className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200 hover:border-cyan-400 hover:text-cyan-300"
            >
              ⬇ Download CSV
            </button>

            <button
              type="button"
              onClick={handleUploadClick}
              disabled={uploading}
              className="rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "⬆ Upload CSV"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleUploadCSV}
              className="hidden"
            />
          </div>
        </div>

        {status && (
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-200">
            {status}
          </div>
        )}

        {showGenerator && (
          <form
            onSubmit={handleGenerateMaterial}
            className="mb-8 rounded-2xl border border-emerald-900 bg-slate-900/80 p-5 shadow-lg shadow-emerald-950/20"
          >
            <div className="mb-5">
              <h2 className="text-xl font-bold text-emerald-300">
                Generate Material
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Paste product details, color names, and optional specs JSON.
                SignaVi will auto-create SKUs, hex colors, inventory values,
                and the MongoDB material record.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400">
                  Product Name
                </span>
                <input
                  name="productName"
                  value={generatorForm.productName}
                  onChange={handleGeneratorChange}
                  required
                  placeholder={'Glitter Heat Transfer Vinyl 20" - By the Yard'}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400">
                  SKU Prefix
                </span>
                <input
                  name="skuPrefix"
                  value={generatorForm.skuPrefix}
                  onChange={handleGeneratorChange}
                  required
                  placeholder="GL20"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm uppercase outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400">
                  Price
                </span>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={generatorForm.price}
                  onChange={handleGeneratorChange}
                  required
                  placeholder="11.69"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400">
                  Regular Price
                </span>
                <input
                  name="regularPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={generatorForm.regularPrice}
                  onChange={handleGeneratorChange}
                  placeholder="12.99"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400">
                  Listed Width
                </span>
                <input
                  name="listedWidth"
                  value={generatorForm.listedWidth}
                  onChange={handleGeneratorChange}
                  placeholder={'20"'}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400">
                  Actual Width
                </span>
                <input
                  name="actualWidth"
                  value={generatorForm.actualWidth}
                  onChange={handleGeneratorChange}
                  placeholder={'19.66"'}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase text-slate-400">
                  Thickness
                </span>
                <input
                  name="thickness"
                  value={generatorForm.thickness}
                  onChange={handleGeneratorChange}
                  placeholder="325 microns / 12.8 mils"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-emerald-400"
                />
              </label>
            </div>

            <label className="mt-4 block space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400">
                Colors — one per line
              </span>
              <textarea
                name="colorText"
                value={generatorForm.colorText}
                onChange={handleGeneratorChange}
                required
                rows={10}
                placeholder={"Glitter White\nGlitter Black\nGlitter Royal\nGlitter Red\nGlitter Gold"}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-emerald-400"
              />
            </label>

            <label className="mt-4 block space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400">
                Specs JSON Override
              </span>

              <textarea
                name="specsJson"
                value={generatorForm.specsJson}
                onChange={handleGeneratorChange}
                rows={14}
                placeholder={`{
  "specs": {
    "composition": "Water-Based Polyurethane",
    "backing": "Pressure Sensitive",
    "finish": "Matte",
    "blade": "45° or 60°",
    "certification": "CPSIA Certified"
  },
  "adheresTo": [
    "100% Cotton",
    "Poly / Cotton Blends"
  ],
  "applicationInstructions": [
    "Cut in reverse"
  ],
  "careInstructions": [
    "Wait 24 hours before first wash"
  ],
  "recommendedAccessories": [
    "Siser Hook Tool"
  ]
}`}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 font-mono text-sm outline-none focus:border-emerald-400"
              />
            </label>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={generating}
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? "Generating..." : "Create / Update Material"}
              </button>

              <button
                type="button"
                onClick={() => setGeneratorForm(initialGeneratorForm)}
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 hover:border-slate-400"
              >
                Clear
              </button>
            </div>
          </form>
        )}

        {(supplierError || purchaseOrderError) && (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
            {supplierError || purchaseOrderError}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6">
              <MaterialAnalytics
                materials={materials}
                suppliers={suppliers}
                purchaseOrders={purchaseOrders}
              />
            </div>

            <MaterialStats materials={materials} />

            <div className="mb-6">
              <MaterialCostCalculator materials={materials} />
            </div>

            <div className="mb-6">
              <MaterialQuotePreview materials={materials} />
            </div>

            <div className="mb-6">
              <PurchaseOrders materials={materials} />
            </div>

            <div className="mb-6">
              <SupplierManager />
            </div>
          </>
        )}

        <div className="mb-6 space-y-4">
          <MaterialsSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          <MaterialFilters
            category={category}
            setCategory={setCategory}
          />
        </div>

        {loading && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
            Loading material catalog...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950/40 p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && materials.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
            No materials found.
          </div>
        )}

        {!loading && !error && materials.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {materials.map((material) => (
              <MaterialCard
                key={material._id || material.id}
                material={material}
                onView={setSelectedMaterial}
                onEdit={setEditingMaterial}
              />
            ))}
          </div>
        )}

        {selectedMaterial && (
          <MaterialDetails
            material={selectedMaterial}
            onClose={() => setSelectedMaterial(null)}
          />
        )}

        {editingMaterial && (
          <MaterialEditor
            material={editingMaterial}
            onClose={() => setEditingMaterial(null)}
            onSaved={() => {
              setEditingMaterial(null)
              window.location.reload()
            }}
          />
        )}
      </div>
    </div>
  )
}