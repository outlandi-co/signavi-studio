import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../../services/api"

export default function StoreProducts() {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadProducts = async () => {
    try {
      setLoading(true)

      const res = await api.get("/products", {
        params: {
          storefrontVisible: true,
          storefront: "signavi"
        }
      })

      setProducts(res.data?.data || [])
    } catch (err) {
      console.error("❌ STORE PRODUCTS ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

 useEffect(() => {
  let ignore = false

  const load = async () => {
    try {
      setLoading(true)

      const res = await api.get("/products", {
        params: {
          storefrontVisible: true,
          storefront: "signavi"
        }
      })

      if (!ignore) {
        setProducts(res.data?.data || [])
      }

    } catch (err) {
      console.error("❌ STORE PRODUCTS ERROR:", err)
    } finally {
      if (!ignore) {
        setLoading(false)
      }
    }
  }

  load()

  return () => {
    ignore = true
  }
}, [])

  const hideProduct = async (id) => {
    const confirmHide = window.confirm(
      "Hide this product from signavi.store?"
    )

    if (!confirmHide) return

    try {
      await api.patch(`/products/${id}`, {
        storefrontVisible: false
      })

      loadProducts()
    } catch (err) {
      console.error("❌ HIDE PRODUCT ERROR:", err)
      alert("Failed to hide product")
    }
  }

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h1 style={title}>🛍 Store Products</h1>
          <p style={subtitle}>
            Products currently shown on signavi.store
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/signavi-store/create")}
          style={createButton}
        >
          ➕ Create Store Product
        </button>
      </div>

      {loading ? (
        <p style={subtitle}>Loading products...</p>
      ) : products.length === 0 ? (
        <div style={emptyBox}>
          <h2>No storefront products yet</h2>
          <p>Create your first signavi.store product.</p>
        </div>
      ) : (
        <div style={grid}>
          {products.map(product => {
            const image =
              product.image ||
              product.imageUrl ||
              product.images?.[0] ||
              product.variants?.[0]?.images?.[0] ||
              ""

            return (
              <div key={product._id} style={card}>
                {image ? (
                  <img
                    src={image}
                    alt={product.name}
                    style={imageStyle}
                  />
                ) : (
                  <div style={placeholder}>
                    No Image
                  </div>
                )}

                <div style={cardBody}>
                  <h2 style={productTitle}>
                    {product.name}
                  </h2>

                  <p style={description}>
                    {product.category || "No category"}
                  </p>

                  <p style={price}>
                    ${Number(product.listPrice || product.price || 0).toFixed(2)}
                  </p>

                  <div style={badgeRow}>
                    <span style={badge}>
                      {product.storefront || "signavi"}
                    </span>

                    <span style={badge}>
                      {product.productType || "physical"}
                    </span>
                  </div>

                  <div style={actions}>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/admin/signavi-store/edit/${product._id}`)
                      }
                      style={editButton}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => hideProduct(product._id)}
                      style={hideButton}
                    >
                      Hide
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const page = {
  color: "white",
  padding: 30
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 30
}

const title = {
  fontSize: 32,
  margin: 0
}

const subtitle = {
  color: "#94a3b8",
  marginTop: 8
}

const createButton = {
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  padding: "12px 16px",
  borderRadius: 12,
  fontWeight: "bold",
  cursor: "pointer"
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 20
}

const card = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 18,
  overflow: "hidden"
}

const imageStyle = {
  width: "100%",
  height: 190,
  objectFit: "cover",
  background: "#020617"
}

const placeholder = {
  height: 190,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748b",
  background: "#020617"
}

const cardBody = {
  padding: 18
}

const productTitle = {
  fontSize: 20,
  margin: 0
}

const description = {
  color: "#94a3b8",
  marginTop: 8
}

const price = {
  fontSize: 22,
  fontWeight: "bold",
  marginTop: 12
}

const badgeRow = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 12
}

const badge = {
  background: "#1e293b",
  color: "#cbd5e1",
  padding: "5px 9px",
  borderRadius: 999,
  fontSize: 12
}

const actions = {
  display: "flex",
  gap: 10,
  marginTop: 18
}

const editButton = {
  flex: 1,
  background: "#38bdf8",
  color: "#020617",
  border: "none",
  padding: "10px",
  borderRadius: 10,
  fontWeight: "bold",
  cursor: "pointer"
}

const hideButton = {
  flex: 1,
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: 10,
  fontWeight: "bold",
  cursor: "pointer"
}

const emptyBox = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 18,
  padding: 30,
  color: "#cbd5e1"
}