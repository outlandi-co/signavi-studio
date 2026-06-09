import { ExternalLink } from "lucide-react"

export default function MaterialSourceLink({ url, label = "Source" }) {
  if (!url) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-400 hover:text-cyan-300"
    >
      {label}
      <ExternalLink size={14} />
    </a>
  )
}