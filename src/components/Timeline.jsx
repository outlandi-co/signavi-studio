import dayjs from "dayjs"

const statusColors = {
  quotes: "bg-yellow-500",
  approved: "bg-green-500",
  denied: "bg-red-500",
  payment_required: "bg-orange-500",
  paid: "bg-emerald-500",
  ready_for_production: "bg-cyan-500",
  production: "bg-blue-500",
  shipping: "bg-purple-500",
  shipped: "bg-indigo-500",
  delivered: "bg-green-600",
  archive: "bg-slate-500",
}

export default function Timeline({ timeline = [] }) {
  if (!Array.isArray(timeline) || timeline.length === 0) {
    return (
      <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-400">
          No activity yet
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
      <h3 className="mb-4 text-sm font-semibold text-white">
        Order Timeline
      </h3>

      <div className="space-y-4">
        {timeline.map((item, index) => {
          const color =
            statusColors[item?.status] || "bg-cyan-500"

          return (
            <div
              key={`${item?.date || ""}-${index}`}
              className="flex gap-4"
            >
              {/* TIMELINE COLUMN */}
              <div className="flex flex-col items-center">
                <div
                  className={`h-3 w-3 rounded-full ${color}`}
                />

                {index !== timeline.length - 1 && (
                  <div className="mt-1 h-full w-[2px] bg-slate-700" />
                )}
              </div>

              {/* CONTENT */}
              <div className="flex-1 pb-4">
                <p className="font-medium capitalize text-white">
                  {item?.status
                    ?.replaceAll("_", " ")
                    || "Status Updated"}
                </p>

                {item?.note && (
                  <p className="mt-1 text-sm text-slate-300">
                    {item.note}
                  </p>
                )}

                <p className="mt-1 text-xs text-slate-500">
                  {item?.date
                    ? dayjs(item.date).format(
                        "MMM D, YYYY • h:mm A"
                      )
                    : "Unknown date"}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}