import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from "react-router-dom"
import { useEffect, useState } from "react"
import api from "./services/api"

/* CONTEXT */
import { CartProvider } from "./context/CartProvider"

/* COMPONENTS */
import Navbar from "./components/Navbar"
import CartDrawer from "./components/CartDrawer"
import AdminLayout from "./components/admin/AdminLayout"
import CustomerRoute from "./components/guards/CustomerRoute"
import AdminRoute from "./components/admin/AdminRoute"

/* LAYOUT */
import CustomerLayout from "./layouts/CustomerLayout"

/* PAGES */
import Home from "./pages/Home"
import Store from "./pages/Store"
import ProductDetail from "./pages/ProductDetail"
import ProductionBoard from "./pages/ProductionBoard"
import CustomQuote from "./pages/CustomQuote"
import Login from "./pages/Login"
import QuoteResponse from "./pages/QuoteResponse"
import Success from "./pages/Success"
import TrackOrder from "./pages/TrackOrder"
import ClientOrder from "./pages/ClientOrder"

/* CUSTOMER */
import CustomerLogin from "./pages/customer/CustomerLogin"
import CustomerRegister from "./pages/CustomerRegister"
import CustomerDashboard from "./pages/customer/CustomerDashboard"
import CustomerOrders from "./pages/customer/CustomerOrders"
import OrderDetail from "./pages/customer/OrderDetail"
import Security from "./pages/customer/Security"

/* ADMIN */
import Dashboard from "./pages/Dashboard"
import AdminRevenue from "./pages/admin/AdminRevenue"
import Orders from "./pages/admin/Orders"
import AdminCustomers from "./pages/admin/AdminCustomers"

/* PRODUCTS */
import Products from "./pages/admin/Products"
import CreateProduct from "./pages/admin/CreateProduct"
import EditProduct from "./pages/admin/EditProduct"

/* FLOW */
import ApproveMockup from "./pages/ApproveMockup"
import Checkout from "./pages/Checkout"
import ClientCheckout from "./pages/ClientCheckout" // 🔥 ADD

function LayoutWrapper({ children }) {
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith("/admin")

  return (
    <div className={isAdminPage ? "w-full min-h-screen" : "max-w-6xl mx-auto p-6"}>
      {children}
    </div>
  )
}

function AppContent() {
  const location = useLocation()
  const path = location.pathname

  const [cartOpen, setCartOpen] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  /* 🔥 NEW CHECKOUT FLOW */
  const handleCheckout = async (cart) => {
    if (isRedirecting) return

    try {
      setIsRedirecting(true)

      console.log("🛒 Creating order from cart drawer...")

      const email = localStorage.getItem("customerEmail")
      if (!email) {
        alert("Please login first")
        setIsRedirecting(false)
        return
      }

      const res = await api.post("/orders", {
        email,
        items: cart
      })

      const orderId = res.data?.data?._id
      if (!orderId) throw new Error("Missing order ID")

      console.log("✅ ORDER CREATED:", orderId)

      // 🔥 GO TO ADDRESS + SHIPPING PAGE
      window.location.href = `/client-checkout/${orderId}`

    } catch (err) {
      console.error("❌ CHECKOUT ERROR:", err)
      alert("Checkout failed")
      setIsRedirecting(false)
    }
  }

  const hideNavbarRoutes = ["/login","/customer-login","/customer-register","/success"]
  const shouldHideNavbar = hideNavbarRoutes.some(r => path.startsWith(r))

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("adminToken")
      if (!token) return
      try {
        const res = await api.get("/auth/profile")
        localStorage.setItem("adminUser", JSON.stringify(res.data.user))
      } catch {
        localStorage.removeItem("adminToken")
        localStorage.removeItem("adminUser")
      }
    }
    checkAuth()
  }, [])

  return (
    <>
      {!shouldHideNavbar && <Navbar setCartOpen={setCartOpen} />}

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      <LayoutWrapper>
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store setCartOpen={setCartOpen} />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          <Route path="/login" element={<Login />} />

          <Route path="/customer-login" element={<CustomerLogin />} />
          <Route path="/customer-register" element={<CustomerRegister />} />

          <Route element={<CustomerRoute />}>
            <Route element={<CustomerLayout />}>
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/my-orders" element={<CustomerOrders />} />
              <Route path="/order/:id" element={<OrderDetail />} />
              <Route path="/security" element={<Security />} />
            </Route>
          </Route>

          {/* 🔥 THIS IS THE MISSING STEP */}
          <Route path="/client-checkout/:id" element={<ClientCheckout />} />

          <Route path="/checkout/:id" element={<Checkout />} />

          <Route path="/track/:id" element={<TrackOrder />} />
          <Route path="/client-order/:id" element={<ClientOrder />} />
          <Route path="/quote/:id" element={<QuoteResponse />} />
          <Route path="/success/:id" element={<Success />} />
          <Route path="/approve/:id" element={<ApproveMockup />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="revenue" element={<AdminRevenue />} />
              <Route path="products" element={<Products />} />
              <Route path="products/new" element={<CreateProduct />} />
              <Route path="products/edit/:id" element={<EditProduct />} />
            </Route>
          </Route>

          <Route path="*" element={<h2>Page not found</h2>} />

        </Routes>
      </LayoutWrapper>
    </>
  )
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </CartProvider>
  )
}