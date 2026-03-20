import { useEffect, useState } from "react"
import api from "../services/api" // 👈 use shared API

function Shop() {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const loadProducts = async () => {

      try {

        const res = await api.get("/products")

        setProducts(res.data)

      } catch (error) {

        console.error("Failed to load products:", error)

      } finally {
        setLoading(false)
      }

    }

    loadProducts()

  }, [])

  return (

    <div style={{ padding: "30px" }}>

      <h1>Shop Products</h1>

      {loading && <p>Loading...</p>}

      {!loading && products.length === 0 && (
        <p>No products found</p>
      )}

      {products.map(product => (

        <div
          key={product._id}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "15px",
            maxWidth: "240px"
          }}
        >

          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              width="200"
            />
          )}

          <h3>{product.name}</h3>

          <p>${product.basePrice}</p>

        </div>

      ))}

    </div>

  )

}

export default Shop