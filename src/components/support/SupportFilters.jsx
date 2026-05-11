export default function SupportFilters({ activeFilter, setActiveFilter }) {
  const filters = [
    {
      label: "Open",
      value: "open"
    },
    {
      label: "Closed",
      value: "closed"
    },
    {
      label: "Archived",
      value: "archived"
    }
  ]

  return (
    <div className="flex gap-2 border-b border-slate-200 bg-white p-3">
      {filters.map(filter => {
        const active = activeFilter === filter.value

        return (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}