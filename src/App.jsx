import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Outlet
} from "react-router-dom"
import { useEffect } from "react"
import api from "./services/api"

import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminLayout from "./components/admin/AdminLayout"
import CustomerRoute from "./components/guards/CustomerRoute"

/* PAGES */
import Home from "./pages/Home"
import Store from "./pages/Store"
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
import CustomerDashboard from "./pages/customer/CustomerDashboard"
import OrderDetail from "./pages/customer/OrderDetail"

/* DASHBOARD */
import Dashboard from "./pages/Dashboard"
import AnalyticsPanel from "./pages/AnalyticsPanel"

/* ADMIN */
import Orders from "./pages/admin/Orders"
import AdminCustomers from "./pages/admin/AdminCustomers"
import AdminPricing from "./pages/admin/AdminPricing"
import AdminInventory from "./pages/admin/AdminInventory"
import AdminMockups from "./pages/admin/AdminMockups"

/* FLOW */
import ApproveMockup from "./pages/ApproveMockup"
import Checkout from "./pages/Checkout"

/* ================= LAYOUT ================= */
function LayoutWrapper({ children }) {
  const location = useLocation()
  const path = location.pathname

  const isAdminPage = path.startsWith("/admin")
  const isProductionPage = path === "/production"

  return (
    <div
      className={
        isAdminPage && !isProductionPage
          ? "w-full min-h-screen p-0 m-0"
          : "max-w-6xl mx-auto p-6"
      }
    >
      {children}
    </div>
  )
}

/* ================= ADMIN ROUTES ================= */
function AdminRoutes() {
  return (
    <ProtectedRoute roleRequired="admin">
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </ProtectedRoute>
  )
}

/* ================= APP CONTENT ================= */
function AppContent() {
  const location = useLocation()
  const path = location.pathname

  const hideNavbarRoutes = [
    "/login",
    "/customer-login",
    "/quote",
    "/success",
    "/checkout",
    "/order"
  ]

  const shouldHideNavbar =
    hideNavbarRoutes.some(route => path.startsWith(route)) &&
    !path.startsWith("/production")

  /* 🔐 AUTH CHECK */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const res = await api.get("/auth/profile")
        localStorage.setItem("user", JSON.stringify(res.data.user))
      } catch {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }

    checkAuth()
  }, [])

  return (
    <>
      {/* 🔥 FIX: NAVBAR NOW SHOWS ON ADMIN */}
      {!shouldHideNavbar && <Navbar />}

      <LayoutWrapper>
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/login" element={<Login />} />
          <Route path="/submit" element={<CustomQuote />} />

          {/* CUSTOMER */}
          <Route path="/customer-login" element={<CustomerLogin />} />

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

          {/* TRACKING */}
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/track/:id" element={<TrackOrder />} />

          {/* CLIENT */}
          <Route path="/client-order/:id" element={<ClientOrder />} />

          {/* QUOTE */}
          <Route path="/quote/:id" element={<QuoteResponse />} />

          {/* CHECKOUT */}
          <Route path="/checkout/:id" element={<Checkout />} />

          {/* SUCCESS */}
          <Route path="/success" element={<Success />} />
          <Route path="/success/:id" element={<Success />} />

          {/* FLOW */}
          <Route path="/approve/:id" element={<ApproveMockup />} />

          {/* ADMIN */}
          <Route path="/admin" element={<AdminRoutes />}>

            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

            <Route path="production" element={<ProductionBoard />} />
            <Route path="quotes" element={<AdminQuotes />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="mockups" element={<AdminMockups />} />
            <Route path="analytics" element={<AnalyticsPanel />} />

          </Route>

          {/* PUBLIC BOARD */}
          <Route path="/production" element={<ProductionBoard />} />

          {/* FALLBACK */}
          <Route path="*" element={<h2>Page not found</h2>} />

        </Routes>
      </LayoutWrapper>
    </>
  )
}

/* ================= ROOT ================= */
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App