export default function MaterialFilters({ category, setCategory }) {
  const categories = ["All", "HTV", "Adhesive Vinyl", "DTF", "Screen Print", "Laser"]

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((item) => (
        <button
          key={item}
          onClick={() => setCategory(item)}
          className={
            category === item
              ? "rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white"
              : "rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-cyan-400"
          }
        >
          {item}
        </button>
      ))}
    </div>
  )
}