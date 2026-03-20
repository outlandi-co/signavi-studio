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

/* ================= LAYOUT ================= */
function LayoutWrapper({ children }) {
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith("/admin")

  return (
    <div
      className={
        isAdminPage
          ? "w-full min-h-screen p-0 m-0"
          : "max-w-6xl mx-auto p-6"
      }
    >
      {children}
    </div>
  )
}

/* ================= MAIN CONTENT ================= */
function AppContent() {
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith("/admin")

  /* 🔥 AUTO LOGIN CHECK */
  useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem("token")

    if (!token) return

    try {
      const res = await api.get("/auth/profile")

      localStorage.setItem("user", JSON.stringify(res.data.user))

    } catch {
  console.log("Auth expired")

  localStorage.removeItem("token")
  localStorage.removeItem("user")
}
  }

  checkAuth()
}, [])
  return (
    <>
      {/* Hide navbar on admin + login */}
      {!isAdminPage && location.pathname !== "/login" && <Navbar />}

      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/login" element={<Login />} />
          <Route path="/submit" element={<CustomQuote />} />

          {/* 🔒 ADMIN */}
          <Route
            path="/admin/production"
            element={
              <ProtectedRoute roleRequired="admin">
                <ProductionBoard />
              </ProtectedRoute>
            }
          />

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