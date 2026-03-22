import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from "react-router-dom"
import { useEffect } from "react"
import api from "./services/api"

import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"

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
import ClientOrder from "./pages/ClientOrder" // 🔥 NEW

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
      {(!isAdminPage || isProductionPage) &&
        path !== "/login" &&
        !isQuotePage &&
        !isSuccessPage && <Navbar />}

      <LayoutWrapper>
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/login" element={<Login />} />
          <Route path="/submit" element={<CustomQuote />} />

          <Route path="/track" element={<TrackOrder />} />
          <Route path="/client-order/:id" element={<ClientOrder />} /> {/* 🔥 */}

          <Route path="/quote/:id" element={<QuoteResponse />} />

          <Route path="/success" element={<Success />} />
          <Route path="/success/:id" element={<Success />} />

          <Route
            path="/admin/production"
            element={
              <ProtectedRoute roleRequired="admin">
                <ProductionBoard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/quotes"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminQuotes />
              </ProtectedRoute>
            }
          />

          <Route path="/production" element={<ProductionBoard />} />

          <Route path="*" element={<h2>Page not found</h2>} />

        </Routes>
      </LayoutWrapper>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App