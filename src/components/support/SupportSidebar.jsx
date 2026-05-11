import SupportFilters from "./SupportFilters"
import SupportTicketCard from "./SupportTicketCard"

export default function SupportSidebar({
  tickets,
  selectedTicket,
  activeFilter,
  setActiveFilter,
  onSelectTicket,
  loading
}) {
  const filteredTickets = tickets.filter(ticket => {
    if (activeFilter === "archived") {
      return ticket.archived
    }

    if (activeFilter === "closed") {
      return !ticket.archived && ticket.status === "closed"
    }

    return !ticket.archived && ticket.status !== "closed"
  })

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-r border-slate-200 bg-white md:w-[360px]">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-xl font-extrabold text-slate-900">
          Support Inbox
        </h2>

        <p className="text-sm text-slate-500">
          Manage customer conversations
        </p>
      </div>

      <SupportFilters
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">
            Loading support tickets...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            No {activeFilter} support tickets.
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <SupportTicketCard
              key={ticket._id}
              ticket={ticket}
              selected={selectedTicket?._id === ticket._id}
              onClick={onSelectTicket}
            />
          ))
        )}
      </div>
    </aside>
  )
}