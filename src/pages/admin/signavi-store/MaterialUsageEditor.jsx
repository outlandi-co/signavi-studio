import { useEffect, useState } from "react"
import api from "../../../services/api"

const newLink = () => ({ material: "", colorSku: "", quantityPerUnit: "1" })
const materialTitle = (material) => material.fullName || [material.brand, material.productName].filter(Boolean).join(" ") || material.skuPrefix || String(material._id)
export const serializeMaterialUsage = (links = []) => (Array.isArray(links) ? links : []).map((link) => ({ material: String(link.material || "").trim(), colorSku: String(link.colorSku || "").trim(), quantityPerUnit: Number(link.quantityPerUnit) }))
export function useMaterialsCatalog() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    let active = true
    api.get("/materials")
      .then((res) => {
        if (!active) return
        const body = res.data
        const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : Array.isArray(body?.materials) ? body.materials : null
        if (!list) throw new Error("Unexpected Materials Catalog response")
        setMaterials(list.filter((material) => material?._id))
        setError("")
      })
      .catch((err) => { if (active) setError(err?.response?.data?.message || err.message || "Could not load materials") })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  return { materials, loading, error }
}
const inputClass = "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
export default function MaterialUsageEditor({ title = "Materials Used", value = [], onChange, materials = [], loading = false, error = "" }) {
  const links = Array.isArray(value) ? value : []
  const updateLink = (index, changes) => onChange(links.map((link, i) => i === index ? { ...link, ...changes } : link))
  return (
    <div className="rounded-2xl border border-cyan-500/25 bg-slate-900/80 p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="font-bold text-cyan-300">{title}</h3><p className="mt-1 text-sm text-slate-400">Select catalog materials, an optional color SKU, and the quantity used per item.</p></div>
        <button type="button" disabled={loading || Boolean(error) || materials.length === 0} onClick={() => onChange([...links, newLink()])} className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">+ Add Material</button>
      </div>
      {loading && <p className="text-sm text-slate-400">Loading Materials Catalog...</p>}
      {error && <p className="mb-3 text-sm text-amber-300" role="alert">Materials Catalog unavailable: {error}. Existing links are retained.</p>}
      {!loading && !error && materials.length === 0 && <p className="text-sm text-slate-400">No materials found in the V2 catalog. Add materials under Admin â†’ Materials first.</p>}
      {!loading && links.length === 0 && materials.length > 0 && <p className="text-sm text-slate-400">No materials linked yet. This is optional.</p>}
      <div className="space-y-4">
        {links.map((link, index) => {
          const selected = materials.find((material) => String(material._id) === String(link.material))
          const colors = Array.isArray(selected?.colors) ? selected.colors.filter((color) => color?.sku) : []
          const knownSku = colors.some((color) => String(color.sku) === String(link.colorSku))
          return (
            <div key={index} className="grid gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 lg:grid-cols-[2fr_1.5fr_1fr_auto] lg:items-end">
              <label className="grid gap-2 text-sm text-slate-300">Material
                <select required className={inputClass} value={link.material || ""} disabled={loading || Boolean(error)} onChange={(event) => updateLink(index, { material: event.target.value, colorSku: "" })}>
                  <option value="">Select a material</option>
                  {!selected && link.material && <option value={link.material}>Previously linked material (unavailable)</option>}
                  {materials.map((material) => <option key={material._id} value={material._id}>{materialTitle(material)}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-slate-300">Color / SKU (optional)
                <select className={inputClass} value={link.colorSku || ""} disabled={!selected || loading || Boolean(error)} onChange={(event) => updateLink(index, { colorSku: event.target.value })}>
                  <option value="">Any color / no specific SKU</option>
                  {!knownSku && link.colorSku && <option value={link.colorSku}>Previously linked SKU: {link.colorSku}</option>}
                  {colors.map((color) => <option key={color.sku} value={color.sku}>{color.name || color.sku} ({color.sku})</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-slate-300">Quantity / {selected?.unit || "unit"}
                <input required type="number" min="0.000001" step="any" className={inputClass} value={link.quantityPerUnit ?? ""} onChange={(event) => updateLink(index, { quantityPerUnit: event.target.value })} />
              </label>
              <button type="button" onClick={() => onChange(links.filter((_, i) => i !== index))} className="rounded-xl border border-red-500/50 px-3 py-2 font-semibold text-red-300 hover:bg-red-500/10">Remove</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
