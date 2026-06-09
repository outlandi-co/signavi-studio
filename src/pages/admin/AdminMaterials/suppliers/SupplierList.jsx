import { useMemo, useState } from "react"

import SupplierCard from "./SupplierCard"

export default function SupplierList({
  suppliers = [],
  onEdit,
  onDelete
}) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSuppliers = useMemo(() => {
    return suppliers
      .filter((supplier) => {
        const query = searchTerm.toLowerCase()

        return (
          supplier.name?.toLowerCase().includes(query) ||
          supplier.email?.toLowerCase().includes(query) ||
          supplier.phone?.toLowerCase().includes(query) ||
          supplier.website?.toLowerCase().includes(query) ||
          supplier.supplierId?.toLowerCase().includes(query)
        )
      })
      .sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      )
  }, [suppliers, searchTerm])

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">
            Supplier List
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            {filteredSuppliers.length} of {suppliers.length} suppliers shown.
          </p>
        </div>

        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search suppliers..."
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 md:max-w-xs"
        />
      </div>

      {suppliers.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-slate-400">
          No suppliers added yet.
        </div>
      )}

      {suppliers.length > 0 && filteredSuppliers.length === 0 && (
        <div className="rounded-xl border border-amber-800 bg-amber-950/30 p-5 text-amber-300">
          No suppliers match your search.
        </div>
      )}

      {filteredSuppliers.length > 0 && (
        <div className="grid gap-4">
          {filteredSuppliers.map((supplier, index) => (
            <SupplierCard
              key={
                supplier._id ||
                supplier.id ||
                supplier.supplierId ||
                `supplier-${index}`
              }
              supplier={supplier}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}