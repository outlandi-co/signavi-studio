export default function MaterialHistoryTable({
  material
}) {
  const history = [
    {
      title: "Price Update",
      description: `Current material price is $${material?.price ?? 0}`,
      date:
        material?.priceWatch?.lastChecked ||
        material?.updatedAt,
      status: "info"
    },
    {
      title: "Inventory Check",
      description: `Quantity on hand: ${
        material?.inventory?.quantityOnHand ?? 0
      }`,
      date: material?.updatedAt,
      status:
        (material?.inventory?.quantityOnHand ?? 0) <=
        (material?.inventory?.reorderPoint ?? 0)
          ? "warning"
          : "success"
    },
    {
      title: "Supplier Verification",
      description:
        material?.source?.vendor ||
        "No supplier assigned",
      date:
        material?.source?.lastChecked ||
        material?.updatedAt,
      status: "info"
    }
  ]

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
          History
        </p>

        <h3 className="mt-1 text-lg font-bold text-white">
          Material Activity
        </h3>
      </div>

      <div className="space-y-3">
        {history.map((item, index) => (
          <HistoryRow
            key={index}
            item={item}
          />
        ))}
      </div>
    </div>
  )
}

function HistoryRow({
  item
}) {
  const badgeClass =
    item.status === "warning"
      ? "bg-amber-950 text-amber-300"
      : item.status === "success"
        ? "bg-green-950 text-green-400"
        : "bg-cyan-950 text-cyan-300"

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-white">
            {item.title}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {item.description}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClass}`}
        >
          {item.status}
        </span>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {item.date
          ? new Date(item.date).toLocaleString()
          : "No timestamp"}
      </p>
    </div>
  )
}