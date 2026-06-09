import { useMemo, useState } from "react"

import api from "../../../services/api"

export default function PurchaseOrders({
  materials = []
}) {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [status, setStatus] = useState("")

  const savedMaterialIds = useMemo(() => {
    return new Set(
      orders
        .map((order) => order.materialId)
        .filter(Boolean)
    )
  }, [orders])

  const suggestedOrders = useMemo(() => {
    return materials
      .filter((material) => {
        const quantity = material.inventory?.quantityOnHand ?? 0
        const reorderPoint = material.inventory?.reorderPoint ?? 0

        return quantity <= reorderPoint && !savedMaterialIds.has(material.id)
      })
      .map((material, index) => {
        const quantityToOrder = Math.max(
          (material.inventory?.reorderPoint || 5) * 2,
          10
        )

        return {
          poNumber: `PO-SUGGESTED-${1000 + index}`,
          materialId: material.id,
          materialName: material.fullName || material.productName,
          supplierName: material.source?.vendor || "Unknown Supplier",
          quantity: quantityToOrder,
          unitCost: Number(material.price || 0),
          totalCost: Number(material.price || 0) * quantityToOrder,
          status: "draft",
          expectedArrival: "",
          notes: "Auto-suggested from low inventory.",
          suggested: true
        }
      })
  }, [materials, savedMaterialIds])

  const allOrders = hasLoaded
    ? [...orders, ...suggestedOrders]
    : suggestedOrders

  const filteredOrders =
    statusFilter === "all"
      ? allOrders
      : allOrders.filter((order) => order.status === statusFilter)

  const totalCost = filteredOrders.reduce(
    (sum, order) => sum + Number(order.totalCost || 0),
    0
  )

  const loadOrders = async () => {
    try {
      setLoading(true)
      setStatus("")

      const res = await api.get("/purchase-orders")

      setOrders(res.data || [])
      setHasLoaded(true)
    } catch (error) {
      console.error("LOAD PURCHASE ORDERS ERROR:", error)

      setStatus(
        error?.response?.data?.message ||
          "❌ Failed to load purchase orders"
      )
    } finally {
      setLoading(false)
    }
  }

  const createSuggestedOrder = async (order) => {
    try {
      setStatus("")

      const payload = {
        poNumber: order.poNumber.replace("PO-SUGGESTED", "PO"),
        materialId: order.materialId,
        materialName: order.materialName,
        supplierName: order.supplierName,
        quantity: Number(order.quantity || 0),
        unitCost: Number(order.unitCost || 0),
        totalCost: Number(order.totalCost || 0),
        status: "draft",
        expectedArrival: order.expectedArrival || "",
        notes: order.notes || ""
      }

      await api.post("/purchase-orders", payload)

      setStatus("✅ Purchase order created")
      await loadOrders()
    } catch (error) {
      console.error("CREATE PURCHASE ORDER ERROR:", error)

      setStatus(
        error?.response?.data?.message ||
          "❌ Failed to create purchase order"
      )
    }
  }

  const markReceived = async (order) => {
    if (!order?._id) return

    try {
      setStatus("")

      await api.put(`/purchase-orders/${order._id}/receive`)

      setStatus("✅ Purchase order received")
      await loadOrders()
    } catch (error) {
      console.error("RECEIVE PURCHASE ORDER ERROR:", error)

      setStatus(
        error?.response?.data?.message ||
          "❌ Failed to receive purchase order"
      )
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            Purchasing
          </p>

          <h2 className="mt-1 text-2xl font-bold text-white">
            Purchase Orders
          </h2>

          <p className="mt-2 text-slate-400">
            Load saved purchase orders or create suggested orders from low stock materials.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading..." : "Load Orders"}
          </button>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
          >
            <option value="all">All Orders</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="ordered">Ordered</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {status && (
        <div className="mb-5 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm font-semibold text-slate-200">
          {status}
        </div>
      )}

      {!hasLoaded && (
        <div className="mb-5 rounded-xl border border-cyan-900 bg-cyan-950/30 p-4 text-sm text-cyan-200">
          Showing suggested purchase orders from low inventory. Click Load Orders to pull saved orders from MongoDB.
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard
          title="Orders"
          value={filteredOrders.length}
        />

        <StatCard
          title="Estimated Spend"
          value={`$${totalCost.toFixed(2)}`}
        />

        <StatCard
          title="Suppliers"
          value={
            new Set(
              filteredOrders.map(
                (order) =>
                  order.supplierName ||
                  order.supplier ||
                  "Unknown Supplier"
              )
            ).size
          }
        />
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-green-800 bg-green-950/30 p-5 text-green-300">
          ✅ No purchase orders found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3">PO</th>
                <th className="py-3">Material</th>
                <th className="py-3">Supplier</th>
                <th className="py-3">Qty</th>
                <th className="py-3">Cost</th>
                <th className="py-3">Status</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order, index) => {
                const isSuggested = Boolean(order.suggested || !order._id)

                const orderId =
                  order._id ||
                  order.poNumber ||
                  order.id ||
                  `purchase-order-${index}`

                return (
                  <tr
                    key={orderId}
                    className="border-b border-slate-800"
                  >
                    <td className="py-3 font-semibold text-cyan-400">
                      {order.poNumber || order.id || "PO"}
                    </td>

                    <td className="py-3 text-white">
                      {order.materialName}
                    </td>

                    <td className="py-3 text-slate-300">
                      {order.supplierName || order.supplier || "Unknown Supplier"}
                    </td>

                    <td className="py-3 text-slate-300">
                      {order.quantity || order.quantityToOrder || 0}
                    </td>

                    <td className="py-3 text-green-400">
                      ${Number(order.totalCost || 0).toFixed(2)}
                    </td>

                    <td className="py-3">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="py-3">
                      {isSuggested ? (
                        <button
                          type="button"
                          onClick={() => createSuggestedOrder(order)}
                          className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-500"
                        >
                          Create PO
                        </button>
                      ) : order.status !== "received" ? (
                        <button
                          type="button"
                          onClick={() => markReceived(order)}
                          className="rounded-lg bg-green-700 px-3 py-2 text-xs font-bold text-white hover:bg-green-600"
                        >
                          Receive
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-green-400">
                          Received
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatusBadge({
  status
}) {
  const style =
    status === "received"
      ? "bg-green-500/10 text-green-400"
      : status === "ordered"
        ? "bg-cyan-500/10 text-cyan-300"
        : status === "cancelled"
          ? "bg-red-500/10 text-red-300"
          : status === "submitted"
            ? "bg-purple-500/10 text-purple-300"
            : "bg-amber-500/10 text-amber-300"

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${style}`}>
      {status || "draft"}
    </span>
  )
}

function StatCard({
  title,
  value
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-black text-white">
        {value}
      </p>
    </div>
  )
}