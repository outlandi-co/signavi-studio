import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import api from "../services/api"
import CartDrawer from "../components/CartDrawer"
import SafeImage from "../components/SafeImage"

function Store() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [flash, setFlash] = useState(false)

  const [quantities, setQuantities] = useState({})

  /* 🔥 NEW */
  const [searchParams] = useSearchParams()
  const [discount, setDiscount] = useState(null)

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get("/products")
        const activeProducts = res.data.filter(p => p.active !== false)

        setProducts(activeProducts)

        const initialQty = {}
        activeProducts.forEach(p => {
          initialQty[p._id] = 1
        })
        setQuantities(initialQty)

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  /* ================= LOAD CART ================= */
  useEffect(() => {
    const loadCart = async () => {
      try {
        const email = localStorage.getItem("email")
        if (!email) return

        const res = await api.get(`/cart/${email}`)

        if (res.data?.items) {
          setCart(res.data.items)
        }

      } catch (err) {
        console.error("Cart load error:", err)
      }
    }

    loadCart()
  }, [])

  /* ================= SAVE CART ================= */
  useEffect(() => {
    const saveCart = async () => {
      try {
        const email = localStorage.getItem("email")
        if (!email) return

        await api.post("/cart/save", {
          email,
          items: cart
        })

      } catch (err) {
        console.error("Cart save error:", err)
      }
    }

    if (cart.length > 0) {
      saveCart()
    }

  }, [cart])

  /* ================= 🔥 READ DISCOUNT FROM EMAIL ================= */
const code = searchParams.get("code")
const percent = searchParams.get("discount")

useEffect(() => {
  if (code && percent) {
    setDiscount({
      code,
      percent: Number(percent)
    })
  }
}, [code, percent])

  /* ================= QTY ================= */
  const increaseQty = (id) => {
    setQuantities(prev => ({
      ...prev,
      [id]: (prev[id] || 1) + 1
    }))
  }

  const decreaseQty = (id) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) - 1)
    }))
  }

  /* ================= ADD TO CART ================= */
  const addToCart = (product) => {
    const qty = quantities[product._id] || 1

    setCart(prev => {
      const existing = prev.find(p => p._id === product._id)

      if (existing) {
        return prev.map(p =>
          p._id === product._id
            ? { ...p, quantity: p.quantity + qty }
            : p
        )
      }

      return [
        ...prev,
        {
          _id: product._id,
          productId: product._id,
          name: product.name,
          price: product.listPrice || product.price || 0,
          image: product.image,
          quantity: qty
        }
      ]
    })

    setIsCartOpen(true)
    setFlash(true)
    setTimeout(() => setFlash(false), 800)
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p._id !== id))
  }

  /* ================= 🔥 CHECKOUT WITH DISCOUNT ================= */
  const handleCheckout = async () => {
    try {
      const res = await api.post("/stripe/create-checkout-session", {
        items: cart,
        discountPercent: discount?.percent
      })

      window.location.href = res.data.url

    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Store</h1>

      {/* 🔥 DISCOUNT BANNER */}
      {discount && (
        <div style={{
          background: "#22c55e",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "15px",
          color: "white"
        }}>
          🎯 {discount.percent}% OFF applied!
        </div>
      )}

      {flash && <div style={toast}>Added to cart 🛒</div>}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => setIsCartOpen(true)} style={cartBtn}>
          Cart ({cart.length})
        </button>
      </div>

      {loading && <p>Loading...</p>}

      <div style={grid}>
        {products.map(product => (
          <div key={product._id} style={card}>

            <SafeImage src={product.image} style={image} />

            <h3 style={{ color: "white" }}>{product.name}</h3>

            <p style={{ color: "#06b6d4" }}>
              ${product.listPrice || product.price || 0}
            </p>

            <div style={qtyRow}>
              <button onClick={() => decreaseQty(product._id)}>-</button>
              <span>{quantities[product._id] || 1}</span>
              <button onClick={() => increaseQty(product._id)}>+</button>
            </div>

            <button onClick={() => addToCart(product)}>
              Add to Cart
            </button>

          </div>
        ))}
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
        removeFromCart={removeFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  )
}

/* ================= STYLES ================= */

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

const cartBtn = {
  background: "#06b6d4",
  color: "white",
  padding: "10px",
  borderRadius: "6px"
}

const toast = {
  position: "fixed",
  top: 20,
  right: 20,
  background: "#020617",
  color: "white",
  padding: "10px"
}

const qtyRow = {
  display: "flex",
  gap: "10px",
  justifyContent: "center",
  marginTop: "10px"
}

export default Store