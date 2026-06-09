import { useState } from "react"

import api from "../../../../services/api"

export default function useSuppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)
  const [supplierError, setSupplierError] = useState("")

  const loadSuppliers = async () => {
    try {
      setLoadingSuppliers(true)
      setSupplierError("")

      const res = await api.get("/suppliers")
      setSuppliers(res.data || [])
    } catch (error) {
      console.error("LOAD SUPPLIERS ERROR:", error)
      setSupplierError("Failed to load suppliers")
    } finally {
      setLoadingSuppliers(false)
    }
  }

  return {
    suppliers,
    setSuppliers,
    loadingSuppliers,
    supplierError,
    loadSuppliers
  }
}