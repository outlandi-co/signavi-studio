export default function MaterialQuickActions({ material, onEdit, onView }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onView?.(material)}
        className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
      >
        View
      </button>

      <button
        onClick={() => onEdit?.(material)}
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-400"
      >
        Edit
      </button>

      {material?.source?.url && (
        <a
          href={material.source.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-400"
        >
          Supplier
        </a>
      )}
    </div>
  )
}