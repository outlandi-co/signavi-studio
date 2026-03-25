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

/* 🔥 NEW ANALYTICS PAGE */
import AnalyticsPanel from "./pages/AnalyticsPanel"

/* ADMIN */
import AdminOrders from "./pages/admin/AdminOrders"
import AdminCustomers from "./pages/admin/AdminCustomers"
import AdminPricing from "./pages/admin/AdminPricing"
import AdminInventory from "./pages/admin/AdminInventory"
import AdminMockups from "./pages/admin/AdminMockups"

/* 🔥 APPROVAL FLOW */
import ApproveMockup from "./pages/ApproveMockup"
import Checkout from "./pages/Checkout"

/* ================= LAYOUT WRAPPER ================= */
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

  const isAdminPage = path.startsWith("/admin")
  const isQuotePage = path.startsWith("/quote")
  const isSuccessPage = path.startsWith("/success")
  const isProductionPage = path === "/production"

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
      {/* NAVBAR CONTROL */}
      {(!isAdminPage || isProductionPage) &&
        path !== "/login" &&
        !isQuotePage &&
        !isSuccessPage && <Navbar />}

      <LayoutWrapper>
        <Routes>

          {/* ================= PUBLIC ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/login" element={<Login />} />
          <Route path="/submit" element={<CustomQuote />} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/client-order/:id" element={<ClientOrder />} />
          <Route path="/quote/:id" element={<QuoteResponse />} />
          <Route path="/success" element={<Success />} />
          <Route path="/success/:id" element={<Success />} />

          {/* 🔥 APPROVAL FLOW */}
          <Route path="/approve/:id" element={<ApproveMockup />} />
          <Route path="/checkout/:id" element={<Checkout />} />

          {/* ================= ADMIN ================= */}
          <Route path="/admin" element={<AdminRoutes />}>

            <Route path="production" element={<ProductionBoard />} />
            <Route path="quotes" element={<AdminQuotes />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="mockups" element={<AdminMockups />} />
            <Route path="mockups/:id" element={<AdminMockups />} />

            {/* 🔥 NEW ANALYTICS ROUTE */}
            <Route path="analytics" element={<AnalyticsPanel />} />

          </Route>

          {/* OPTIONAL PUBLIC ACCESS */}
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