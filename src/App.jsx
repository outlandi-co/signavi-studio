import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from "react-router-dom"

import { useEffect, useState } from "react"
import api from "./services/api"

/* ================= CONTEXT ================= */

import ToastProvider from "./context/ToastProvider"
import LoadingProvider from "./context/LoadingProvider"
import { CartProvider } from "./context/CartContext"
import { NotificationProvider } from "./context/NotificationContext"
import { ProductProvider } from "./context/ProductContext"

import { useToast } from "./hooks/useToast"

/* ================= COMPONENTS ================= */

import Navbar from "./components/Navbar"
import CartDrawer from "./components/CartDrawer"
import AccountDrawer from "./components/AccountDrawer"

import AdminLayout from "./components/admin/AdminLayout"
import CustomerRoute from "./components/guards/CustomerRoute"
import AdminRoute from "./components/admin/AdminRoute"

/* ================= LAYOUT ================= */

import CustomerLayout from "./layouts/CustomerLayout"

/* ================= PAGES ================= */

import Home from "./pages/Home"
import Store from "./pages/Store"
import ProductDetail from "./pages/ProductDetail"

import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"

import CustomQuote from "./pages/CustomQuote"
import QuoteResponse from "./pages/QuoteResponse"

import Support from "./pages/Support"

import TrackingPage from "./pages/TrackingPage"
import Success from "./pages/Success"

import ClientOrder from "./pages/ClientOrder"
import ClientCheckout from "./pages/ClientCheckout"
import CheckoutRedirect from "./pages/CheckoutRedirect"

import ApproveMockup from "./pages/ApproveMockup"

/* ================= CUSTOMER ================= */

import CustomerLogin from "./pages/customer/CustomerLogin"
import CustomerRegister from "./pages/CustomerRegister"
import CustomerDashboard from "./pages/customer/CustomerDashboard"
import CustomerOrders from "./pages/customer/CustomerOrders"
import OrderDetail from "./pages/customer/OrderDetail"
import Security from "./pages/customer/Security"
import CustomerSupport from "./pages/customer/CustomerSupport"

/* ================= ADMIN ================= */

import Dashboard from "./pages/Dashboard"
import ProductionBoard from "./pages/ProductionBoard"
import Orders from "./pages/admin/Orders"
import AdminOrderDetail from "./pages/admin/AdminOrderDetail"
import AdminCustomers from "./pages/admin/AdminCustomers"
import AdminCustomerDetail from "./pages/admin/AdminCustomerDetail"
import AdminEmails from "./pages/admin/AdminEmails"
import AdminSupport from "./pages/admin/AdminSupport"
import AdminRevenue from "./pages/admin/AdminRevenue"
import AdminProducts from "./pages/admin/AdminProducts"
import CreateCustomOrder from "./pages/admin/CreateCustomOrder"

import CreateProduct from "./pages/admin/CreateProduct"
import EditProduct from "./pages/admin/EditProduct"

import StoreProducts from "./pages/admin/signavi-store/StoreProducts"
import CreateStoreProduct from "./pages/admin/signavi-store/CreateStoreProduct"
import EditStoreProduct from "./pages/admin/signavi-store/EditStoreProduct"

/* ================= APP ================= */

function AppContent() {
  const location = useLocation()
  const path = location.pathname
  const { addToast } = useToast()

  const [cartOpen, setCartOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  /* ================= CHECKOUT ================= */

  const handleCheckout = async (
    cart,
    customerInfo
  ) => {
    if (isRedirecting) return

    try {
      setIsRedirecting(true)

      console.log("🛒 CART:", cart)
      console.log("👤 CUSTOMER INFO:", customerInfo)

      if (!cart || cart.length === 0) {
        addToast(
          "Cart is empty",
          "error"
        )

        setIsRedirecting(false)

        return
      }

      const customerName = String(
        customerInfo?.customerName || ""
      ).trim()

      const email = String(
        customerInfo?.email || ""
      ).trim().toLowerCase()

      const phone = String(
        customerInfo?.phone || ""
      ).trim()

      if (!customerName) {
        addToast(
          "Customer name required",
          "error"
        )

        setIsRedirecting(false)

        return
      }

      if (!email) {
        addToast(
          "Email required",
          "error"
        )

        setIsRedirecting(false)

        return
      }

      localStorage.setItem(
        "customerEmail",
        email
      )

      const res = await api.post(
        "/orders",
        {
          customerName,
          email,
          phone,

          address: {
            street:
              customerInfo?.address?.street || "",

            city:
              customerInfo?.address?.city || "",

            state:
              customerInfo?.address?.state || "",

            zip:
              customerInfo?.address?.zip || "",

            country:
              customerInfo?.address?.country || "US"
          },

          items: cart
        }
      )

      console.log(
        "✅ ORDER RESPONSE:",
        res.data
      )

      const orderId =
        res.data?.data?._id

      console.log(
        "🆔 ORDER ID:",
        orderId
      )

      if (!orderId) {
        throw new Error(
          "Missing order ID"
        )
      }

      window.location.assign(
        `/client-checkout/${orderId}`
      )

    } catch (err) {
      console.error(
        "❌ CHECKOUT ERROR:",
        err
      )

      addToast(
        err?.response?.data?.message ||
        "Checkout failed",
        "error"
      )

      setIsRedirecting(false)
    }
  }

  /* ================= NAVBAR ================= */

  const hideNavbarRoutes = [
    "/login",
    "/customer-login",
    "/customer-register",
    "/success",
    "/forgot-password",
    "/reset-password"
  ]

  const shouldHideNavbar =
    hideNavbarRoutes.some(route =>
      path.startsWith(route)
    )

  /* ================= ADMIN AUTH ================= */

  useEffect(() => {
    const token =
      localStorage.getItem("adminToken")

    if (!token) return

    api.get("/auth/profile")
      .then(res => {
        localStorage.setItem(
          "adminUser",
          JSON.stringify(res.data.user)
        )
      })

      .catch(() => {
        localStorage.removeItem("adminToken")
        localStorage.removeItem("adminUser")
      })

  }, [])

  return (
    <>
      {!shouldHideNavbar && (
        <Navbar
          setCartOpen={setCartOpen}
          setAccountOpen={setAccountOpen}
        />
      )}

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      <AccountDrawer
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
      />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/store"
          element={<Store />}
        />

        <Route
          path="/product/:id"
          element={<ProductDetail />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        <Route
          path="/quote"
          element={<CustomQuote />}
        />

        <Route
          path="/support"
          element={<Support />}
        />

        <Route
          path="/quote/:id"
          element={<QuoteResponse />}
        />

        <Route
          path="/track"
          element={<TrackingPage />}
        />

        <Route
          path="/track/:id"
          element={<TrackingPage />}
        />

        <Route
          path="/customer-login"
          element={<CustomerLogin />}
        />

        <Route
          path="/customer-register"
          element={<CustomerRegister />}
        />

        <Route element={<CustomerRoute />}>
          <Route element={<CustomerLayout />}>
            <Route
              path="/dashboard"
              element={<CustomerDashboard />}
            />

            <Route
              path="/my-orders"
              element={<CustomerOrders />}
            />

            <Route
              path="/order/:id"
              element={<OrderDetail />}
            />

            <Route
              path="/security"
              element={<Security />}
            />

            <Route
              path="/my-support"
              element={<CustomerSupport />}
            />
          </Route>
        </Route>

        <Route
          path="/client-checkout/:id"
          element={<ClientCheckout />}
        />

        <Route
          path="/checkout/:id"
          element={<CheckoutRedirect />}
        />

        <Route
          path="/client-order/:id"
          element={<ClientOrder />}
        />

        <Route
          path="/success/:id"
          element={<Success />}
        />

        <Route
          path="/approve/:id"
          element={<ApproveMockup />}
        />

        <Route
          path="/admin"
          element={<AdminRoute />}
        >
          <Route element={<AdminLayout />}>
            <Route
              index
              element={<ProductionBoard />}
            />

            <Route
              path="production"
              element={<ProductionBoard />}
            />

            <Route
              path="orders"
              element={<Orders />}
            />

            <Route
              path="custom-order/new"
              element={<CreateCustomOrder />}
            />

            <Route
              path="order/:id"
              element={<AdminOrderDetail />}
            />

            <Route
              path="customers"
              element={<AdminCustomers />}
            />

            <Route
              path="customers/:id"
              element={<AdminCustomerDetail />}
            />

            <Route
              path="emails"
              element={<AdminEmails />}
            />

            <Route
              path="support"
              element={<AdminSupport />}
            />

            <Route
              path="revenue"
              element={<AdminRevenue />}
            />

            <Route
              path="products"
              element={<AdminProducts />}
            />

            <Route
              path="products/new"
              element={<CreateProduct />}
            />

            <Route
              path="products/edit/:id"
              element={<EditProduct />}
            />

            <Route
              path="signavi-store/products"
              element={<StoreProducts />}
            />

            <Route
              path="signavi-store/create"
              element={<CreateStoreProduct />}
            />

            <Route
              path="signavi-store/edit/:id"
              element={<EditStoreProduct />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={<h2>Page not found</h2>}
        />
      </Routes>
    </>
  )
}

/* ================= FINAL WRAPPER ================= */

export default function App() {
  return (
    <ToastProvider>
      <LoadingProvider>
        <NotificationProvider>
          <CartProvider>
            <ProductProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </ProductProvider>
          </CartProvider>
        </NotificationProvider>
      </LoadingProvider>
    </ToastProvider>
  )
}