import { useEffect, useState } from "react"

import {
  getMaterials,
  searchMaterials
} from "../services/materialService"

export default function useMaterials() {
  const [materials, setMaterials] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        setLoading(true)
        setError("")

        const data = searchTerm.trim()
          ? await searchMaterials(searchTerm)
          : await getMaterials()

        setMaterials(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("❌ MATERIALS LOAD ERROR:", err)
        setError("Failed to load materials")
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(loadMaterials, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const filteredMaterials =
    category === "All"
      ? materials
      : materials.filter((item) => item.category === category)

  return {
    materials: filteredMaterials,
    searchTerm,
    setSearchTerm,
    category,
    setCategory,
    loading,
    error
  }
}