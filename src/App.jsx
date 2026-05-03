import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from "react-router-dom"
import { useEffect, useState } from "react"
import api from "./services/api"

/* 🔥 NEW */
import ToastProvider from "./context/ToastProvider"
import { useToast } from "./hooks/useToast"

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
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
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
import AdminCustomerDetail from "./pages/admin/AdminCustomerDetail"

/* PRODUCTS */
import Products from "./pages/admin/Products"
import CreateProduct from "./pages/admin/CreateProduct"
import EditProduct from "./pages/admin/EditProduct"

/* FLOW */
import ApproveMockup from "./pages/ApproveMockup"
import CheckoutRedirect from "./pages/CheckoutRedirect"
import ClientCheckout from "./pages/ClientCheckout"

function AppContent() {
  const location = useLocation()
  const path = location.pathname

  const { addToast } = useToast()

  const [cartOpen, setCartOpen] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  /* ================= CHECKOUT ================= */
  const handleCheckout = async (cart) => {
    if (isRedirecting) return

    try {
      setIsRedirecting(true)

      let email = null

      const storedUser = localStorage.getItem("customerUser")

      // 🔥 ONLY CHANGE IS THIS BLOCK
if (storedUser) {
  try {
    email = JSON.parse(storedUser)?.email
  } catch (err) {
    console.warn("⚠️ Failed to parse customerUser:", err)
  }
}

      if (!email) {
        email = localStorage.getItem("customerEmail")
      }

      if (!email) {
        email = prompt("Enter your email to continue checkout:")
        if (!email) {
          addToast("Email required to continue", "error")
          setIsRedirecting(false)
          return
        }
        localStorage.setItem("customerEmail", email)
      }

      const res = await api.post("/orders", {
        email,
        items: cart
      })

      const orderId = res.data?.data?._id
      if (!orderId) throw new Error("Missing order ID")

      window.location.assign(`/client-checkout/${orderId}`)

    } catch (err) {
      console.error("❌ CHECKOUT ERROR:", err)
      addToast("Checkout failed", "error")
      setIsRedirecting(false)
    }
  }

  /* ================= NAVBAR CONTROL ================= */
  const hideNavbarRoutes = [
    "/login",
    "/customer-login",
    "/customer-register",
    "/success",
    "/forgot-password",
    "/reset-password"
  ]

  const shouldHideNavbar = hideNavbarRoutes.some(r =>
    path.startsWith(r)
  )

  /* ================= ADMIN AUTH ================= */
  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) return

    api.get("/auth/profile")
      .then(res => {
        localStorage.setItem("adminUser", JSON.stringify(res.data.user))
      })
      .catch(() => {
        localStorage.removeItem("adminToken")
        localStorage.removeItem("adminUser")
      })
  }, [])

  return (
    <>
      {!shouldHideNavbar && <Navbar setCartOpen={setCartOpen} />}

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/store" element={<Store setCartOpen={setCartOpen} />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />

        {/* PASSWORD */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* QUOTE */}
        <Route path="/quote" element={<CustomQuote />} />
        <Route path="/quote/:id" element={<QuoteResponse />} />

        {/* TRACK */}
        <Route path="/track/:id" element={<TrackOrder />} />

        {/* CUSTOMER AUTH */}
        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/customer-register" element={<CustomerRegister />} />

        {/* CUSTOMER AREA */}
        <Route element={<CustomerRoute />}>
          <Route element={<CustomerLayout />}>
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/my-orders" element={<CustomerOrders />} />
            <Route path="/order/:id" element={<OrderDetail />} />
            <Route path="/security" element={<Security />} />
          </Route>
        </Route>

        {/* CHECKOUT */}
        <Route path="/client-checkout/:id" element={<ClientCheckout />} />
        <Route path="/checkout/:id" element={<CheckoutRedirect />} />

        {/* ORDER */}
        <Route path="/client-order/:id" element={<ClientOrder />} />
        <Route path="/success/:id" element={<Success />} />
        <Route path="/approve/:id" element={<ApproveMockup />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="production" element={<ProductionBoard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<AdminCustomers />} />

            {/* 🔥 NEW CUSTOMER DETAIL ROUTE */}
            <Route path="customers/:id" element={<AdminCustomerDetail />} />

            <Route path="revenue" element={<AdminRevenue />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<CreateProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
          </Route>
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<h2>Page not found</h2>} />

      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </ToastProvider>
  )
}