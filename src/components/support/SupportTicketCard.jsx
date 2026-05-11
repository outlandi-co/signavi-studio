const formatTime = date => {
  if (!date) return ""

  const value = new Date(date)
  const now = new Date()
  const diffMs = now - value
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMinutes / 60)

  if (diffMinutes < 1) return "Now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`

  return value.toLocaleDateString()
}

const statusLabel = ticket => {
  if (ticket.archived) return "Archived"
  if (ticket.status === "closed") return "Closed"
  if (ticket.status === "resolved") return "Resolved"
  if (ticket.status === "pending") return "Pending"
  return "Open"
}

export default function SupportTicketCard({
  ticket,
  selected,
  onClick
}) {
  const unreadCount = Number(ticket.unreadAdminCount || 0)
  const hasUnread = unreadCount > 0

  return (
    <button
      onClick={() => onClick(ticket)}
      className={`w-full border-b px-4 py-4 text-left transition ${
        selected
          ? "bg-blue-50 border-l-4 border-l-blue-600"
          : hasUnread
            ? "bg-red-50 border-l-4 border-l-red-500"
            : "bg-white hover:bg-slate-50"
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={`truncate text-sm ${
              hasUnread ? "font-extrabold text-slate-950" : "font-bold text-slate-800"
            }`}
          >
            {ticket.customerName || "Customer"}
          </h3>

          <p className="truncate text-xs text-slate-500">
            {ticket.email || "No email"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          {hasUnread && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}

          <span className="text-[11px] text-slate-400">
            {formatTime(ticket.lastMessageAt || ticket.updatedAt)}
          </span>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold text-slate-700">
          {ticket.subject || "Support Ticket"}
        </p>

        <span
          className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
            ticket.archived
              ? "bg-slate-200 text-slate-600"
              : ticket.status === "closed"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-blue-100 text-blue-700"
          }`}
        >
          {statusLabel(ticket)}
        </span>
      </div>

      <p
        className={`line-clamp-2 text-sm ${
          hasUnread ? "font-semibold text-slate-900" : "text-slate-500"
        }`}
      >
        {ticket.lastMessage || ticket.message || "No message yet"}
      </p>
    </button>
  )
}