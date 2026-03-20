import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from "react-router-dom"

import Navbar from "./components/Navbar"

import Home from "./pages/Home"
import Store from "./pages/Store"
import ProductionBoard from "./pages/ProductionBoard"
import CustomQuote from "./pages/CustomQuote" // ✅ ADD THIS

/* LAYOUT */
function LayoutWrapper({ children }) {
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith("/admin")

  return (
    <div className={
      isAdminPage
        ? "w-full min-h-screen p-0 m-0"
        : "max-w-6xl mx-auto p-6"
    }>
      {children}
    </div>
  )
}

function AppContent() {
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith("/admin")

  return (
    <>
      {!isAdminPage && <Navbar />}

      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />

          {/* ✅ ADD THIS */}
          <Route path="/submit" element={<CustomQuote />} />

          {/* ADMIN */}
          <Route path="/admin/production" element={<ProductionBoard />} />

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