import { useEffect, useState } from "react"
import api from "../services/api"
import SafeImage from "../components/SafeImage"

function Store() {

  const [products, setProducts] = useState([])
  const [pricingMap, setPricingMap] = useState({})

  /* ================= LOAD EVERYTHING ================= */
  const loadAll = async () => {
    try {
      const res = await api.get("/products")

      const normalized = res.data.map(p => ({
        ...p,
        category: (p.category || "tshirt").toLowerCase().trim(),
        baseCost: Number(p.baseCost) || 5
      }))

      setProducts(normalized)

      const map = {}

      const requests = normalized.map(product =>
        api.post("/pricing/calculate", {
          baseCost: product.baseCost,
          quantity: 1,
          category: product.category
        })
      )

      const results = await Promise.all(requests)

      normalized.forEach((product, i) => {
        map[product._id] = results[i].data
      })

      setPricingMap(map)

    } catch (err) {
      console.error("❌ STORE LOAD ERROR:", err)
    }
  }

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const init = async () => {
      await loadAll()
    }

    init()
  }, [])

  /* ================= AUTO REFRESH ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      loadAll()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ padding: 20 }}>

      <h1 style={{ color: "white" }}>Store</h1>

      <div style={grid}>
        {products.map(product => {

          const pricing = pricingMap[product._id] || { unit: 0 }

          return (
            <div key={product._id} style={card}>

              <SafeImage src={product.image} style={image} />

              <h3 style={{ color: "white" }}>{product.name}</h3>

              <p style={price}>
                ${Number(pricing.unit || 0).toFixed(2)}
              </p>

              <small style={{ color: "#64748b" }}>
                {product.category}
              </small>

            </div>
          )
        })}
      </div>
    </div>
  )
}

const grid = {
  display: "grid",
  gap: "20px",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))"
}

const card = {
  background: "#0f172a",
  padding: "15px",
  borderRadius: "12px"
}

const image = {
  width: "100%",
  height: "200px",
  objectFit: "cover"
}

const price = {
  color: "#06b6d4",
  fontWeight: "bold"
}

export default Store