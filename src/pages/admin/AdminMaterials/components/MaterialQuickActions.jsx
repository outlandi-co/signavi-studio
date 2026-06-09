export default function MaterialQuickActions({
  material,
  onEdit,
  onView
}) {
  const handleCopySku = async () => {
    try {
      await navigator.clipboard.writeText(
        material?.skuPrefix ||
        material?.id ||
        ""
      )

      alert("SKU copied to clipboard")
    } catch (error) {
      console.error("COPY SKU ERROR:", error)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onView?.(material)}
        className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
      >
        View
      </button>

      <button
        type="button"
        onClick={() => onEdit?.(material)}
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-400"
      >
        Edit
      </button>

      <button
        type="button"
        onClick={handleCopySku}
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-400"
      >
        Copy SKU
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

      <button
        type="button"
        className="rounded-lg border border-emerald-700 bg-emerald-950/30 px-4 py-2 text-sm font-semibold text-emerald-300 hover:border-emerald-500"
      >
        Create PO
      </button>
    </div>
  )
}