import { useEffect, useMemo, useState } from "react"
import api from "../services/api"
import { ProductContext } from "./ProductContextCore"

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadProducts = async () => {
      try {
        const res = await api.get("/products")

        if (!mounted) return

        setProducts(
          Array.isArray(res.data)
            ? res.data
            : []
        )
      } catch (err) {
        console.error(
          "❌ PRODUCT LOAD ERROR:",
          err
        )

        if (mounted) {
          setProducts([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const timeout = setTimeout(() => {
      loadProducts()
    }, 0)

    return () => {
      mounted = false
      clearTimeout(timeout)
    }
  }, [])

  const value = useMemo(
    () => ({
      products,
      setProducts,
      loading,
    }),
    [products, loading]
  )

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}

export default ProductProvider