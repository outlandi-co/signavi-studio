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
  const [status, setStatus] = useState("")

  const handleDownloadCSV = () => {
    window.open(
      "https://signavi-backend.onrender.com/api/materials/export",
      "_blank"
    )
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
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