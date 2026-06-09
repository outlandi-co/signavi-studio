import { Search } from "lucide-react"

export default function MaterialsSearch({ searchTerm, setSearchTerm }) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search materials, colors, SKUs, suppliers..."
        className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none focus:border-cyan-400"
      />
    </div>
  )
}