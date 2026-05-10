import { useEffect, useState } from "react"
import api from "../services/api"
import { ProductContext } from "./ProductContextCore"

export const ProductProvider = ({ children }) => {

  const [products, setProducts] = useState([])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const res = await api.get("/products")
        if (!mounted) return
        setProducts(res.data)
      } catch (err) {
        console.error(err)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <ProductContext.Provider value={{ products, setProducts }}>
      {children}
    </ProductContext.Provider>
  )
}