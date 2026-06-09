import { useState } from "react"

import api from "../../../../services/api"

export default function usePurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [loadingPurchaseOrders, setLoadingPurchaseOrders] = useState(false)
  const [purchaseOrderError, setPurchaseOrderError] = useState("")

  const loadPurchaseOrders = async () => {
    try {
      setLoadingPurchaseOrders(true)
      setPurchaseOrderError("")

      const res = await api.get("/purchase-orders")
      setPurchaseOrders(res.data || [])
    } catch (error) {
      console.error("LOAD PURCHASE ORDERS ERROR:", error)
      setPurchaseOrderError("Failed to load purchase orders")
    } finally {
      setLoadingPurchaseOrders(false)
    }
  }

  return {
    purchaseOrders,
    setPurchaseOrders,
    loadingPurchaseOrders,
    purchaseOrderError,
    loadPurchaseOrders
  }
}