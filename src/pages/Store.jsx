import { useEffect, useState } from "react"
import api from "../services/api"
import CartDrawer from "../components/CartDrawer"

function Store() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // 💾 LOAD CART FROM STORAGE
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart")
    return saved ? JSON.parse(saved) : []
  })

  const [isCartOpen, setIsCartOpen] = useState(false)

  // 🔔 ADD TO CART NOTIFICATION
  const [flash, setFlash] = useState(false)

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get("/products")

        const activeProducts = res.data.filter(
          (p) => p.active !== false
        )

        setProducts(activeProducts)
      } catch (error) {
        console.error("Failed to load products:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  /* ================= SAVE CART ================= */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  /* ================= ADD TO CART ================= */
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(p => p._id === product._id)

      if (existing) {
        return prev.map(p =>
          p._id === product._id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      }

      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price: product.listPrice || product.price || 0,
          image: product.image,
          quantity: 1
        }
      ]
    })

    // 🔥 OPEN CART
    setIsCartOpen(true)

    // 🔔 FLASH MESSAGE
    setFlash(true)
    setTimeout(() => setFlash(false), 800)
  }

  /* ================= REMOVE ================= */
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p._id !== id))
  }

  /* ================= CHECKOUT ================= */
  const handleCheckout = async () => {
    try {
      const res = await api.post(
        "/stripe/create-checkout-session",
        { items: cart }
      )

      window.location.href = res.data.url

    } catch (error) {
      console.error("Checkout error:", error)
    }
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Store</h1>

      {/* 🔔 TOAST */}
      {flash && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "black",
            color: "white",
            padding: "10px 15px",
            borderRadius: "5px",
            zIndex: 2000
          }}
        >
          Added to cart 🛒
        </div>
      )}

      {/* 🔥 CART BUTTON */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <button
          onClick={() => setIsCartOpen(true)}
          style={{
            padding: "10px 15px",
            background: "black",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          Cart ({cart.length})
        </button>
      </div>

      {loading && <p>Loading products...</p>}

      {!loading && products.length === 0 && (
        <p>No products available</p>
      )}

      {/* ================= PRODUCTS ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "20px"
        }}
      >
        {products.map((product) => (
          <div
            key={product._id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "8px",
              background: "#fff"
            }}
          >
            <img
              src={
                product.image
                  ? product.image
                  : "https://via.placeholder.com/200"
              }
              alt={product.name}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover"
              }}
            />

            <h3>{product.name}</h3>

            <p style={{ fontWeight: "bold" }}>
              ${product.listPrice || product.price || 0}
            </p>

            <button
              onClick={() => addToCart(product)}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "10px",
                background: "black",
                color: "white",
                border: "none",
                cursor: "pointer"
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* ================= CART DRAWER ================= */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        removeFromCart={removeFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  )
}

export default Store