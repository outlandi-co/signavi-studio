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

/* PAGES */
import Home from "./pages/Home"
import Store from "./pages/Store"
import ProductDetail from "./pages/ProductDetail"
import Cart from "./pages/Cart"
import ProductionBoard from "./pages/ProductionBoard"
import CustomQuote from "./pages/CustomQuote"
import Login from "./pages/Login"
import QuoteResponse from "./pages/QuoteResponse"
import Success from "./pages/Success"
import AdminQuotes from "./pages/AdminQuotes"
import TrackOrder from "./pages/TrackOrder"
import ClientOrder from "./pages/ClientOrder"

/* CUSTOMER */
import CustomerLogin from "./pages/customer/CustomerLogin"
import CustomerRegister from "./pages/CustomerRegister"
import CustomerDashboard from "./pages/customer/CustomerDashboard"
import OrderDetail from "./pages/customer/OrderDetail"

/* ADMIN */
import Dashboard from "./pages/Dashboard"
import AnalyticsPanel from "./pages/AnalyticsPanel"
import AdminRevenue from "./pages/admin/AdminRevenue"
import Orders from "./pages/admin/Orders"
import AdminCustomers from "./pages/admin/AdminCustomers"
import AdminPricing from "./pages/admin/AdminPricing"
import AdminInventory from "./pages/admin/AdminInventory"
import AdminMockups from "./pages/admin/AdminMockups"
import CustomerDetail from "./components/admin/CustomerDetail"

/* FLOW */
import ApproveMockup from "./pages/ApproveMockup"
import Checkout from "./pages/Checkout"

/* ================= LAYOUT ================= */
function LayoutWrapper({ children }) {
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith("/admin")

  return (
    <div className={isAdminPage
      ? "w-full min-h-screen p-0 m-0"
      : "max-w-6xl mx-auto p-6"
    }>
      {children}
    </div>
  )
}

/* ================= APP CONTENT ================= */
function AppContent() {
  const location = useLocation()
  const path = location.pathname

  const [cartOpen, setCartOpen] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  /* ================= ✅ CENTRALIZED CHECKOUT ================= */
  const handleCheckout = async (cart) => {
    if (isRedirecting) {
      console.warn("⚠️ Already redirecting")
      return
    }

    try {
      setIsRedirecting(true)

      console.log("🛒 Checkout triggered from App.jsx")
      console.log("📦 Cart:", cart)

      const res = await api.post("/stripe/create-cart-session", {
        items: cart
      })

      if (!res?.data?.url) {
        throw new Error("No checkout URL returned")
      }

      console.log("🚀 Redirecting to Stripe:", res.data.url)

      // 🔥 SAFE REDIRECT (no throttling)
      window.location.assign(res.data.url)

    } catch (err) {
      console.error("❌ CHECKOUT ERROR:", err)
      alert("Checkout failed. Please try again.")

      // allow retry
      setIsRedirecting(false)
    }
  }

  /* ================= NAVBAR CONTROL ================= */
  const hideNavbarRoutes = [
    "/login",
    "/customer-login",
    "/customer-register",
    "/quote",
    "/success",
    "/checkout",
    "/order"
  ]

  const shouldHideNavbar =
    hideNavbarRoutes.some(route => path.startsWith(route))

  /* ================= AUTO AUTH ================= */
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
      {!shouldHideNavbar && (
        <Navbar setCartOpen={setCartOpen} />
      )}

      {/* 🔥 CART DRAWER CONNECTED TO APP CHECKOUT */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      <LayoutWrapper>
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store setCartOpen={setCartOpen} />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />

          {/* CUSTOMER */}
          <Route path="/customer-login" element={<CustomerLogin />} />
          <Route path="/customer-register" element={<CustomerRegister />} />
          <Route path="/submit" element={<CustomQuote />} />

          <Route
            path="/dashboard"
            element={
              <CustomerRoute>
                <CustomerDashboard />
              </CustomerRoute>
            }
          />

          <Route
            path="/order/:id"
            element={
              <CustomerRoute>
                <OrderDetail />
              </CustomerRoute>
            }
          />

          {/* TRACK */}
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/track/:id" element={<TrackOrder />} />

          {/* CLIENT */}
          <Route path="/client-order/:id" element={<ClientOrder />} />
          <Route path="/quote/:id" element={<QuoteResponse />} />

          {/* CHECKOUT PAGE (optional flow) */}
          <Route path="/checkout/:id" element={<Checkout />} />

          {/* SUCCESS */}
          <Route path="/success" element={<Success />} />
          <Route path="/success/:id" element={<Success />} />

          {/* APPROVAL */}
          <Route path="/approve/:id" element={<ApproveMockup />} />

          {/* ADMIN */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>

              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="production" element={<ProductionBoard />} />
              <Route path="quotes" element={<AdminQuotes />} />
              <Route path="orders" element={<Orders />} />

              <Route path="customers">
                <Route index element={<AdminCustomers />} />
                <Route path=":id" element={<CustomerDetail />} />
              </Route>

              <Route path="pricing" element={<AdminPricing />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="mockups" element={<AdminMockups />} />
              <Route path="analytics" element={<AnalyticsPanel />} />
              <Route path="revenue" element={<AdminRevenue />} />

            </Route>
          </Route>

          <Route path="*" element={<h2>Page not found</h2>} />

        </Routes>
      </LayoutWrapper>
    </>
  )
}

/* ================= ROOT ================= */
function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </CartProvider>
  )
}

export default App