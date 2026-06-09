import { useState } from "react"

import api from "../../../services/api"

import SupplierForm from "./suppliers/SupplierForm"
import SupplierList from "./suppliers/SupplierList"

const normalizeSupplierPayload = (supplier) => ({
  supplierId: supplier.supplierId || supplier.id,
  name: supplier.name,
  website: supplier.website || "",
  email: supplier.email || "",
  phone: supplier.phone || "",
  leadTime: supplier.leadTime || "",
  shippingNotes: supplier.shippingNotes || "",
  notes: supplier.notes || "",
  status: supplier.status || "active"
})

export default function SupplierManager() {
  const [suppliers, setSuppliers] = useState([])
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [status, setStatus] = useState("")

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      setStatus("")

      const res = await api.get("/suppliers")

      setSuppliers(res.data || [])
      setHasLoaded(true)
    } catch (error) {
      console.error("LOAD SUPPLIERS ERROR:", error)
      setStatus("❌ Failed to load suppliers")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (supplier) => {
    try {
      setStatus("")

      const payload = normalizeSupplierPayload(supplier)

      if (supplier._id) {
        await api.put(`/suppliers/${supplier._id}`, payload)
        setStatus("✅ Supplier updated")
      } else {
        await api.post("/suppliers", payload)
        setStatus("✅ Supplier created")
      }

      setEditingSupplier(null)
      await loadSuppliers()
    } catch (error) {
      console.error("SAVE SUPPLIER ERROR:", error)

      setStatus(
        error?.response?.data?.message ||
          "❌ Failed to save supplier"
      )
    }
  }

  const handleDelete = async (supplierId) => {
    try {
      setStatus("")

      await api.delete(`/suppliers/${supplierId}`)

      setStatus("✅ Supplier deleted")
      await loadSuppliers()
    } catch (error) {
      console.error("DELETE SUPPLIER ERROR:", error)

      setStatus(
        error?.response?.data?.message ||
          "❌ Failed to delete supplier"
      )
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            Supplier Management
          </p>

          <h2 className="mt-1 text-2xl font-bold text-white">
            Material Suppliers
          </h2>

          <p className="mt-2 text-slate-400">
            Track vendor websites, contacts, lead times, and supplier notes.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSuppliers}
          disabled={loading}
          className="rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Loading..." : "Load Suppliers"}
        </button>
      </div>

      {status && (
        <div className="mb-5 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm font-semibold text-slate-200">
          {status}
        </div>
      )}

      {!hasLoaded && (
        <div className="mb-5 rounded-xl border border-cyan-900 bg-cyan-950/30 p-4 text-sm text-cyan-200">
          Click Load Suppliers to pull saved suppliers from MongoDB.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
        <SupplierForm
          editingSupplier={editingSupplier}
          onSave={handleSave}
          onCancel={() => setEditingSupplier(null)}
        />

        <SupplierList
          suppliers={suppliers}
          onEdit={setEditingSupplier}
          onDelete={(supplier) =>
            handleDelete(supplier._id || supplier.id)
          }
        />
      </div>
    </div>
  )
}