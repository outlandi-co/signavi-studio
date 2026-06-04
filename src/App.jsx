import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom"

import { useEffect, useState } from "react"
import api from "./services/api"

import ToastProvider from "./context/ToastProvider"
import LoadingProvider from "./context/LoadingProvider"
import { CartProvider } from "./context/CartContext"
import { NotificationProvider } from "./context/NotificationContext"
import { ProductProvider } from "./context/ProductContext"

import { useToast } from "./hooks/useToast"

import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import CartDrawer from "./components/CartDrawer"
import AccountDrawer from "./components/AccountDrawer"

import AdminLayout from "./components/admin/AdminLayout"
import CustomerRoute from "./components/guards/CustomerRoute"
import AdminRoute from "./components/admin/AdminRoute"

import CustomerLayout from "./layouts/CustomerLayout"

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
import InvoicePage from "./pages/InvoicePage"
import ProofApprovalPage from "./pages/ProofApprovalPage"

import Gallery from "./pages/Gallery"
import Services from "./pages/Services"
import Account from "./pages/Account"

import CustomerLogin from "./pages/customer/CustomerLogin"
import CustomerRegister from "./pages/CustomerRegister"
import CustomerDashboard from "./pages/customer/CustomerDashboard"
import CustomerOrders from "./pages/customer/CustomerOrders"
import OrderDetail from "./pages/customer/OrderDetail"
import Security from "./pages/customer/Security"
import CustomerSupport from "./pages/customer/CustomerSupport"
import ArtworkLibrary from "./pages/customer/ArtworkLibrary"
import CustomerInvoices from "./pages/customer/CustomerInvoices"

import ProductionBoard from "./pages/ProductionBoard"
import Orders from "./pages/admin/Orders"
import AdminOrderDetail from "./pages/admin/AdminOrderDetail"
import AdminCustomers from "./pages/admin/AdminCustomers"
import AdminCustomerDetail from "./pages/admin/AdminCustomerDetail"
import AdminEmails from "./pages/admin/AdminEmails"
import AdminInbox from "./components/admin/AdminInbox"
import AdminSupport from "./pages/admin/AdminSupport"
import AdminRevenue from "./pages/admin/AdminRevenue"
import AdminInvoices from "./components/admin/AdminInvoices"
import CreateCustomOrder from "./pages/admin/CreateCustomOrder"
import MarketingHub from "./pages/admin/MarketingHub"

import StoreProducts from "./pages/admin/signavi-store/StoreProducts"
import CreateStoreProduct from "./pages/admin/signavi-store/CreateStoreProduct"
import EditStoreProduct from "./pages/admin/signavi-store/EditStoreProduct"
import Discounts from "./pages/admin/signavi-store/Discounts"

function AppContent() {
  const location = useLocation()
  const path = location.pathname
  const { addToast } = useToast()

  const [cartOpen, setCartOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleCheckout = async (cart, customerInfo) => {
    if (isRedirecting) return

    try {
      setIsRedirecting(true)

      if (!cart || cart.length === 0) {
        addToast("Cart is empty", "error")
        setIsRedirecting(false)
        return
      }

      const customerName = String(customerInfo?.customerName || "").trim()
      const email = String(customerInfo?.email || "").trim().toLowerCase()
      const phone = String(customerInfo?.phone || "").trim()

      if (!customerName) {
        addToast("Customer name required", "error")
        setIsRedirecting(false)
        return
      }

      if (!email) {
        addToast("Email required", "error")
        setIsRedirecting(false)
        return
      }

      localStorage.setItem("customerEmail", email)

      const orderRes = await api.post("/orders", {
        customerName,
        email,
        phone,
        address: {
          street: customerInfo?.address?.street || "",
          city: customerInfo?.address?.city || "",
          state: customerInfo?.address?.state || "",
          zip: customerInfo?.address?.zip || "",
          country: customerInfo?.address?.country || "US"
        },
        items: cart,
        shipping: Number(customerInfo?.shippingCost || 0),
        shippingRate: customerInfo?.shippingRate || null,
        shippingProvider: customerInfo?.shippingProvider || "",
        shippingService: customerInfo?.shippingService || "",
        subtotal: Number(customerInfo?.subtotal || 0),
        tax: Number(customerInfo?.tax || 0),
        finalPrice: Number(customerInfo?.total || 0),
        source: "cart_drawer",
        status: "payment_required"
      })

      const orderId =
        orderRes.data?.data?._id ||
        orderRes.data?.order?._id ||
        orderRes.data?._id

      if (!orderId) {
        throw new Error("Missing order ID")
      }

      localStorage.setItem("lastOrderId", orderId)

      const squareRes = await api.post(`/square/create-payment/${orderId}`)

      const paymentUrl =
        squareRes.data?.paymentUrl ||
        squareRes.data?.url ||
        squareRes.data?.checkoutUrl ||
        squareRes.data?.squarePaymentUrl ||
        squareRes.data?.data?.paymentUrl ||
        squareRes.data?.data?.url ||
        squareRes.data?.data?.checkoutUrl ||
        squareRes.data?.data?.squarePaymentUrl

      if (!paymentUrl) {
        throw new Error("Missing Square payment URL")
      }

      window.location.assign(paymentUrl)
    } catch (err) {
      console.error("❌ CHECKOUT ERROR:", err)

      addToast(
        err?.response?.data?.message || "Checkout failed",
        "error"
      )

      setIsRedirecting(false)
    }
  }

  const hideNavbarRoutes = [
    "/login",
    "/customer-login",
    "/customer-register",
    "/success",
    "/forgot-password",
    "/reset-password"
  ]

  const shouldHideNavbar = hideNavbarRoutes.some((route) =>
    path.startsWith(route)
  )

  const shouldHideFooter =
    shouldHideNavbar ||
    path.startsWith("/admin") ||
    path.startsWith("/client-checkout") ||
    path.startsWith("/checkout") ||
    path.startsWith("/success")

  useEffect(() => {
    const token = localStorage.getItem("adminToken")

    if (!token) return

    api.get("/auth/profile")
      .then((res) => {
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
        <Route path="/" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/services" element={<Services />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/quote" element={<CustomQuote />} />
        <Route path="/custom-quote" element={<CustomQuote />} />
        <Route path="/quote/:id" element={<QuoteResponse />} />

        <Route path="/support" element={<Support />} />
        <Route path="/track" element={<TrackingPage />} />
        <Route path="/track/:id" element={<TrackingPage />} />

        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/customer-register" element={<CustomerRegister />} />

        <Route element={<CustomerRoute />}>
          <Route element={<CustomerLayout />}>
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/account" element={<Account />} />
            <Route path="/dashboard/account" element={<Account />} />

            <Route path="/my-orders" element={<CustomerOrders />} />
            <Route path="/dashboard/orders" element={<CustomerOrders />} />
            <Route path="/order/:id" element={<OrderDetail />} />

            <Route path="/security" element={<Security />} />
            <Route path="/dashboard/security" element={<Security />} />

            <Route path="/my-support" element={<CustomerSupport />} />
            <Route path="/dashboard/support" element={<CustomerSupport />} />
            <Route path="/support/:id" element={<CustomerSupport />} />

            <Route path="/artwork-library" element={<ArtworkLibrary />} />
            <Route path="/customer/invoices" element={<CustomerInvoices />} />
          </Route>
        </Route>

        <Route path="/client-checkout/:id" element={<ClientCheckout />} />
        <Route path="/checkout/:id" element={<CheckoutRedirect />} />
        <Route path="/client-order/:id" element={<ClientOrder />} />
        <Route path="/success/:id" element={<Success />} />

        <Route path="/approve/:id" element={<ApproveMockup />} />
        <Route path="/invoice/:id" element={<InvoicePage />} />
        <Route path="/proof/:id" element={<ProofApprovalPage />} />

        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<ProductionBoard />} />
            <Route path="production" element={<ProductionBoard />} />

            <Route path="orders" element={<Orders />} />
            <Route path="order/:id" element={<AdminOrderDetail />} />

            <Route path="invoices" element={<AdminInvoices />} />
            <Route path="custom-order/new" element={<CreateCustomOrder />} />

            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers/:id" element={<AdminCustomerDetail />} />

            <Route path="emails" element={<AdminEmails />} />
            <Route path="inbox" element={<AdminInbox />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="revenue" element={<AdminRevenue />} />
            <Route path="marketing" element={<MarketingHub />} />

            <Route
              path="products"
              element={
                <Navigate
                  to="/admin/signavi-store/products"
                  replace
                />
              }
            />

            <Route
              path="products/new"
              element={
                <Navigate
                  to="/admin/signavi-store/create"
                  replace
                />
              }
            />

            <Route
              path="products/edit/:id"
              element={
                <Navigate
                  to="/admin/signavi-store/products"
                  replace
                />
              }
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

            <Route
              path="signavi-store/discounts"
              element={<Discounts />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <main className="min-h-screen bg-[#020617] p-10 text-white">
              <h2 className="text-3xl font-bold">
                Page not found
              </h2>
            </main>
          }
        />
      </Routes>

      {!shouldHideFooter && <Footer />}
    </>
  )
}

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