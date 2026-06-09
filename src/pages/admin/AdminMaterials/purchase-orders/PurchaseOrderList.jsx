import { useMemo, useState } from "react"

import PurchaseOrderCard from "./PurchaseOrderCard"

export default function PurchaseOrderList({
  orders = [],
  onView,
  onEdit,
  onReceive,
  onDelete
}) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOrders = useMemo(() => {
    const query = searchTerm.toLowerCase()

    return orders.filter((order) => {
      return (
        order?.poNumber?.toLowerCase().includes(query) ||
        order?.materialName?.toLowerCase().includes(query) ||
        order?.supplierName?.toLowerCase().includes(query) ||
        order?.status?.toLowerCase().includes(query)
      )
    })
  }, [orders, searchTerm])

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-green-800 bg-green-950/30 p-6">
        <p className="font-bold text-green-300">
          ✅ No purchase orders required.
        </p>

        <p className="mt-2 text-sm text-green-400">
          All inventory levels are above reorder points.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            Purchase Orders
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {filteredOrders.length} of {orders.length} orders shown.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search orders..."
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />

          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
            {orders.length} Orders
          </span>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-amber-800 bg-amber-950/30 p-6">
          <p className="font-bold text-amber-300">
            No purchase orders match your search.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order, index) => (
            <PurchaseOrderCard
              key={
                order._id ||
                order.id ||
                order.poNumber ||
                `purchase-order-${index}`
              }
              order={order}
              onView={onView}
              onEdit={onEdit}
              onReceive={onReceive}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}