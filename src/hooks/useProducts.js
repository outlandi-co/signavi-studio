import { useContext } from "react"
import { ProductContext } from "../context/ProductContextCore"

export default function useProducts() {
  return useContext(ProductContext)
}