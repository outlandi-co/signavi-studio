import dayjs from "dayjs"

export default function Timeline({ timeline = [] }) {

  if (!timeline.length) {
    return (
      <p className="text-xs text-gray-400 mt-2">
        No activity yet
      </p>
    )
  }

  return (
    <div className="mt-3 space-y-3">

      {timeline.map((t, i) => (
        <div key={i} className="flex items-start gap-3">

          {/* DOT + LINE */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>

            {i !== timeline.length - 1 && (
              <div className="w-[2px] h-full bg-gray-300"></div>
            )}
          </div>

          {/* CONTENT */}
          <div className="text-xs">
            <p className="font-medium text-gray-700">
              {t.status}
            </p>

            {t.note && (
              <p className="text-gray-500">
                {t.note}
              </p>
            )}

            <p className="text-gray-400 text-[10px]">
              {dayjs(t.date).format("MMM D, h:mm A")}
            </p>
          </div>

        </div>
      ))}

    </div>
  )
}