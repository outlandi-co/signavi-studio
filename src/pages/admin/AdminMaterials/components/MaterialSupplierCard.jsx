import MaterialSourceLink from "./MaterialSourceLink"

export default function MaterialSupplierCard({ source }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="mb-4 text-lg font-bold text-white">Supplier</h3>

      <div className="space-y-2 text-sm text-slate-300">
        <p>Vendor: {source?.vendor || "Not listed"}</p>
        <p>Supplier ID: {source?.supplierId || "N/A"}</p>
        <p>Last Checked: {source?.lastChecked || "Not checked"}</p>
      </div>

      <div className="mt-4">
        <MaterialSourceLink url={source?.url} label="Open Supplier Page" />
      </div>
    </div>
  )
}