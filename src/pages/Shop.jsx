import { useEffect, useState } from "react"
import api from "../services/api"

function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      try {
        const res = await api.get("/products")

        const productData = Array.isArray(res.data)
          ? res.data
          : res.data?.data || []

        if (isMounted) {
          setProducts(productData)
        }
      } catch (error) {
        console.error("Failed to load products:", error.response?.data || error)

        if (isMounted) {
          setProducts([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  const getProductImage = (product) => {
    const variantImage = product.variants?.[0]?.images?.[0]
    const productImage = product.images?.[0]
    const image = variantImage || productImage || product.image

    if (!image) return "/image_placeholder/placeholder.png"

    if (image.startsWith("http")) return image

    return `https://signavi-backend.onrender.com${image}`
  }

  const getStartingPrice = (product) => {
    const variantPrices = product.variants
      ?.map(variant =>
        Number(variant.price || variant.basePrice || variant.listPrice || 0)
      )
      .filter(price => price > 0)

    if (variantPrices?.length) {
      return Math.min(...variantPrices)
    }

    return Number(product.price || product.basePrice || product.listPrice || 0)
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Shop Products</h1>

      {loading && <p>Loading...</p>}

      {!loading && products.length === 0 && (
        <p>No products found</p>
      )}

      {!loading && Array.isArray(products) && products.map(product => (
        <div
          key={product._id}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "15px",
            maxWidth: "240px"
          }}
        >
          <img
            src={getProductImage(product)}
            alt={product.name || "Product"}
            width="200"
            style={{
              height: "180px",
              objectFit: "cover",
              display: "block",
              marginBottom: "10px"
            }}
          />

          <h3>{product.name}</h3>

          <p>
            Starting at ${getStartingPrice(product).toFixed(2)}
          </p>

          {product.category && (
            <p>
              Category: {product.category}
            </p>
          )}

          {product.variants?.length > 0 && (
            <p>
              {product.variants.length} variants available
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

export default Shop