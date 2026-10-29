import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import api from "./services/api"
import { redirectToCheckoutPayment } from "./utils/checkoutNavigation"
import App from "./App"

const { toastSpy } = vi.hoisted(() => ({
  toastSpy: vi.fn()
}))

vi.mock("./services/api", () => ({
  default: {
    post: vi.fn(),
    patch: vi.fn(),
    get: vi.fn()
  }
}))

vi.mock("./hooks/useToast", () => ({
  useToast: () => ({ addToast: toastSpy })
}))

vi.mock("./components/CartDrawer", () => ({
  default: ({ onCheckout }) => (
    <button
      type="button"
      onClick={() =>
        onCheckout(
          [{ productId: "synthetic-product", quantity: 1 }],
          {
            customerName: "Test Customer",
            email: "test@example.invalid",
            phone: "5550000000",
            address: {
              street: "123 Test Street",
              city: "Merced",
              state: "CA",
              zip: "95340",
              country: "US"
            },
            shippingQuote: "synthetic-quote",
            shippingRate: { amount: 10 },
            shippingCost: 10,
            subtotal: 20,
            tax: 0,
            total: 30
          }
        )
      }
    >
      Simulate cart checkout
    </button>
  )
}))
vi.mock("./context/ToastProvider", () => ({ default: ({ children }) => children }))
vi.mock("./context/LoadingProvider", () => ({ default: ({ children }) => children }))
vi.mock("./components/Navbar", () => ({ default: () => null }))
vi.mock("./components/Footer", () => ({ default: () => null }))
vi.mock("./components/AccountDrawer", () => ({ default: () => null }))
vi.mock("./components/admin/AdminLayout", () => ({ default: () => null }))
vi.mock("./components/guards/CustomerRoute", () => ({ default: () => null }))
vi.mock("./components/admin/AdminRoute", () => ({ default: () => null }))
vi.mock("./layouts/CustomerLayout", () => ({ default: () => null }))
vi.mock("./pages/Home", () => ({ default: () => null }))
vi.mock("./pages/Store", () => ({ default: () => null }))
vi.mock("./pages/ProductDetail", () => ({ default: () => null }))
vi.mock("./pages/Login", () => ({ default: () => null }))
vi.mock("./pages/ForgotPassword", () => ({ default: () => null }))
vi.mock("./pages/ResetPassword", () => ({ default: () => null }))
vi.mock("./pages/CustomQuote", () => ({ default: () => null }))
vi.mock("./pages/QuoteResponse", () => ({ default: () => null }))
vi.mock("./pages/Support", () => ({ default: () => null }))
vi.mock("./pages/TrackingPage", () => ({ default: () => null }))
vi.mock("./pages/Success", () => ({ default: () => null }))
vi.mock("./pages/ClientOrder", () => ({ default: () => null }))
vi.mock("./pages/ClientCheckout", () => ({ default: () => null }))
vi.mock("./pages/CheckoutRedirect", () => ({ default: () => null }))
vi.mock("./pages/ApproveMockup", () => ({ default: () => null }))
vi.mock("./pages/InvoicePage", () => ({ default: () => null }))
vi.mock("./pages/ProofApprovalPage", () => ({ default: () => null }))
vi.mock("./pages/Gallery", () => ({ default: () => null }))
vi.mock("./pages/Services", () => ({ default: () => null }))
vi.mock("./pages/Account", () => ({ default: () => null }))
vi.mock("./pages/Terms", () => ({ default: () => null }))
vi.mock("./pages/Privacy", () => ({ default: () => null }))
vi.mock("./pages/customer/CustomerLogin", () => ({ default: () => null }))
vi.mock("./pages/CustomerRegister", () => ({ default: () => null }))
vi.mock("./pages/customer/CustomerDashboard", () => ({ default: () => null }))
vi.mock("./pages/customer/CustomerOrders", () => ({ default: () => null }))
vi.mock("./pages/customer/OrderDetail", () => ({ default: () => null }))
vi.mock("./pages/customer/Security", () => ({ default: () => null }))
vi.mock("./pages/customer/CustomerSupport", () => ({ default: () => null }))
vi.mock("./pages/customer/ArtworkLibrary", () => ({ default: () => null }))
vi.mock("./pages/customer/CustomerInvoices", () => ({ default: () => null }))
vi.mock("./pages/ProductionBoard", () => ({ default: () => null }))
vi.mock("./pages/admin/Orders", () => ({ default: () => null }))
vi.mock("./pages/admin/AdminOrderDetail", () => ({ default: () => null }))
vi.mock("./pages/admin/AdminCustomers", () => ({ default: () => null }))
vi.mock("./pages/admin/AdminCustomerDetail", () => ({ default: () => null }))
vi.mock("./components/admin/AdminInbox", () => ({ default: () => null }))
vi.mock("./pages/admin/AdminSupport", () => ({ default: () => null }))
vi.mock("./pages/admin/AdminRevenue", () => ({ default: () => null }))
vi.mock("./components/admin/AdminInvoices", () => ({ default: () => null }))
vi.mock("./pages/admin/CreateCustomOrder", () => ({ default: () => null }))
vi.mock("./pages/admin/MarketingHub", () => ({ default: () => null }))
vi.mock("./pages/admin/AdminInstagram", () => ({ default: () => null }))
vi.mock("./pages/admin/AdminMaterials/AdminMaterials", () => ({ default: () => null }))
vi.mock("./pages/admin/signavi-store/StoreProducts", () => ({ default: () => null }))
vi.mock("./pages/admin/signavi-store/CreateStoreProduct", () => ({ default: () => null }))
vi.mock("./pages/admin/signavi-store/EditStoreProduct", () => ({ default: () => null }))
vi.mock("./pages/admin/signavi-store/Discounts", () => ({ default: () => null }))
vi.mock("./pages/admin/signavi-store/ShippingCalculator", () => ({ default: () => null }))
vi.mock("./pages/admin/AdminShipping", () => ({ default: () => null }))

// STEP247_PROVIDER_ISOLATION
// These providers must not initialize sockets,
// product requests, or other app services in tests.

vi.mock("./context/NotificationContext", () => ({
  NotificationProvider: ({ children }) => children,
  default: ({ children }) => children
}))

vi.mock("./context/CartContext", () => ({
  CartProvider: ({ children }) => children,
  default: ({ children }) => children
}))

vi.mock("./context/ProductContext", () => ({
  ProductProvider: ({ children }) => children,
  default: ({ children }) => children
}))

vi.mock("./utils/checkoutNavigation", () => ({
  redirectToCheckoutPayment: vi.fn()
}))

const orderId = "synthetic-order-123"
const guestToken = "synthetic-guest-token"

const orderResponse = (token = guestToken) => ({
  data: {
    data: { _id: orderId },
    ...(token ? { checkoutToken: token } : {})
  }
})

const startCheckout = () => {
  render(<App />)
  fireEvent.click(
    screen.getByRole("button", {
      name: "Simulate cart checkout"
    })
  )
}

describe("App checkout with mocked API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    localStorage.clear()
    window.history.replaceState({}, "", "/")
  })

  afterEach(() => {
    cleanup()
  })

  it("blocks checkout without a guest token", async () => {
    api.post.mockResolvedValueOnce(orderResponse(null))

    startCheckout()

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        "Guest checkout token was not returned.",
        "error"
      )
    })

    expect(api.post).toHaveBeenCalledTimes(1)
    expect(api.patch).not.toHaveBeenCalled()
  })

  it("blocks an HTTP 501 V3 preview response", async () => {
    api.post.mockResolvedValueOnce(orderResponse())
    api.patch.mockRejectedValueOnce({
      response: {
        status: 501,
        data: {
          code: "V3_PREVIEW_ONLY"
        }
      }
    })

    startCheckout()

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        "Checkout is in preview mode. No payment was created.",
        "error"
      )
    })

    expect(api.patch).toHaveBeenCalledTimes(1)
  })

  it("blocks an HTTP 202 V3 sandbox no-payment response", async () => {
    api.post.mockResolvedValueOnce(orderResponse())
    api.patch.mockResolvedValueOnce({
      status: 202,
      data: {
        code: "V3_SANDBOX_PREPARED_NO_PAYMENT",
        paymentCreated: false
      }
    })

    startCheckout()

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        "Checkout is in preview mode. No payment was created.",
        "error"
      )
    })

    expect(api.patch).toHaveBeenCalledWith(
      `/orders/${orderId}/checkout`,
      expect.objectContaining({
        shippingQuote: "synthetic-quote",
        v3ShippingQuote: "synthetic-quote"
      }),
      expect.objectContaining({
        headers: {
          "x-signavi-guest-checkout-token": guestToken
        }
      })
    )
  })

  it("rejects a response without a secure payment URL", async () => {
    api.post.mockResolvedValueOnce(orderResponse())
    api.patch.mockResolvedValueOnce({
      status: 200,
      data: { success: true }
    })

    startCheckout()

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        "Secure Square payment URL was not returned.",
        "error"
      )
    })

    expect(api.patch).toHaveBeenCalledTimes(1)
  })

  // STEP248_REDIRECT_TESTS
  it("blocks a V3 preview response even when a payment URL is present", async () => {
    api.post.mockResolvedValueOnce(orderResponse())
    api.patch.mockResolvedValueOnce({
      status: 202,
      data: {
        code: "V3_SANDBOX_PREPARED_NO_PAYMENT",
        paymentUrl: "https://example.invalid/synthetic-checkout"
      }
    })

    startCheckout()

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        "Checkout is in preview mode. No payment was created.",
        "error"
      )
    })

    expect(api.patch).toHaveBeenCalledTimes(1)
    expect(window.location.pathname).toBe("/")
  })

  it("rejects an insecure HTTP payment URL in the main App", async () => {
    api.post.mockResolvedValueOnce(orderResponse())
    api.patch.mockResolvedValueOnce({
      status: 200,
      data: {
        success: true,
        paymentUrl: "http://example.invalid/synthetic-checkout"
      }
    })

    startCheckout()

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        "Secure Square payment URL was not returned.",
        "error"
      )
    })

    expect(api.patch).toHaveBeenCalledTimes(1)
    expect(window.location.pathname).toBe("/")
  })

  // STEP251_DIRECT_REDIRECT_ASSERTIONS
  it("never requests navigation for V3 preview mode", async () => {
    api.post.mockResolvedValueOnce(orderResponse())
    api.patch.mockResolvedValueOnce({
      status: 202,
      data: {
        code: "V3_SANDBOX_PREPARED_NO_PAYMENT",
        paymentUrl: "https://example.invalid/blocked"
      }
    })

    startCheckout()

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        "Checkout is in preview mode. No payment was created.",
        "error"
      )
    })

    expect(redirectToCheckoutPayment).not.toHaveBeenCalled()
  })

  it("calls the navigation boundary for an HTTPS checkout response", async () => {
    api.post.mockResolvedValueOnce(orderResponse())
    api.patch.mockResolvedValueOnce({
      status: 200,
      data: {
        paymentUrl: "https://square.link/u/synthetic-payment"
      }
    })

    startCheckout()

    await waitFor(() => {
      expect(redirectToCheckoutPayment).toHaveBeenCalledWith(
        "https://square.link/u/synthetic-payment"
      )
    })

    expect(redirectToCheckoutPayment).toHaveBeenCalledTimes(1)
  })
})