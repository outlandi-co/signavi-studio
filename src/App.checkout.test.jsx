import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import api from "./services/api"
import { redirectToCheckoutPayment } from "./utils/checkoutNavigation"
import App from "./App"

const { toastSpy, checkoutFixture } = vi.hoisted(() => ({
  toastSpy: vi.fn(),
  checkoutFixture: {
    cart: []
  }
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
          checkoutFixture.cart,
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

vi.mock("./utils/checkoutNavigation", async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    redirectToCheckoutPayment: vi.fn()
  }
})

const orderId = "507f1f77bcf86cd799439011"
const guestToken = "synthetic-guest-token"

const orderResponse = (token = guestToken) => ({
  status: 201,
  data: {
    success: true,
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
    checkoutFixture.cart = [{
      productId: "synthetic-product",
      quantity: 1,
      storefront: "signavi_studio"
    }]

    vi.clearAllMocks()
    sessionStorage.clear()
    localStorage.clear()
    window.history.replaceState({}, "", "/")
  })

  afterEach(() => {
    cleanup()
  })

  it("blocks an untagged legacy cart before creating an order", async () => {
    checkoutFixture.cart = [{
      productId: "synthetic-product",
      quantity: 1
    }]

    startCheckout()

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        expect.stringContaining("legacy or non-Studio"),
        "error"
      )
    })

    expect(api.post).not.toHaveBeenCalled()
    expect(redirectToCheckoutPayment).not.toHaveBeenCalled()
  })

  it("blocks checkout without a guest token", async () => {
    api.post.mockResolvedValueOnce(orderResponse(null))

    startCheckout()

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        "We could not confirm whether your order was created. Do not submit checkout again. Contact support.",
        "error"
      )
    })

    expect(api.post).toHaveBeenCalledTimes(1)
    expect(api.patch).not.toHaveBeenCalled()
  })

  it("stores guest checkout credentials without requesting payment", async () => {
    api.post.mockResolvedValueOnce(orderResponse())

    startCheckout()

    await waitFor(() => {
      expect(sessionStorage.getItem(
        `signaviCheckoutToken:${orderId}`
      )).toBe(guestToken)
    })

    expect(localStorage.getItem("lastOrderId")).toBe(orderId)

    const quote = JSON.parse(
      sessionStorage.getItem(`signaviCheckoutQuote:${orderId}`)
    )

    expect(quote.shippingQuote).toBe("synthetic-quote")
    expect(quote.shippingRate).toEqual({ amount: 10 })
    expect(quote.shippingAddress).toEqual(
      expect.objectContaining({
        city: "Merced",
        zip: "95340"
      })
    )

    expect(api.post).toHaveBeenCalledWith(
      "/orders",
      expect.objectContaining({
        storefront: "signavi_studio",
        source: "cart_drawer",
        status: "payment_required",
        shippingQuote: "synthetic-quote"
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-signavi-storefront-attempt-key":
            expect.stringMatching(
              /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            ),
          "x-signavi-storefront-recovery-secret":
            expect.stringMatching(/^[A-Za-z0-9_-]{43}$/)
        })
      })
    )

    await waitFor(() => {
      expect(window.location.pathname).toBe(
        `/client-checkout/${orderId}`
      )
    })
    expect(api.patch).not.toHaveBeenCalled()
    expect(redirectToCheckoutPayment).not.toHaveBeenCalled()
  })

  it("rejects an order response without an order ID", async () => {
    api.post.mockResolvedValueOnce({
      data: { checkoutToken: guestToken }
    })

    startCheckout()

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        "We could not confirm whether your order was created. Do not submit checkout again. Contact support.",
        "error"
      )
    })

    expect(api.patch).not.toHaveBeenCalled()
    expect(redirectToCheckoutPayment).not.toHaveBeenCalled()
  })

  it("does not request payment when order creation fails", async () => {
    api.post.mockRejectedValueOnce(
      new Error("Synthetic order creation failure")
    )

    startCheckout()

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        "We could not confirm whether your order was created. Do not submit checkout again. Contact support.",
        "error"
      )
    })

    expect(api.patch).not.toHaveBeenCalled()
    expect(redirectToCheckoutPayment).not.toHaveBeenCalled()
  })

  it("blocks repeat submission after an uncertain network failure", async () => {
    api.post.mockRejectedValueOnce(
      new Error("Simulated network disconnect")
    )

    startCheckout()

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        expect.stringContaining("Do not submit checkout again"),
        "error"
      )
    })

    const raw = sessionStorage.getItem(
      "signavi:studio:checkout-attempt:v1"
    )
    expect(raw).not.toBeNull()

    const attemptKey = JSON.parse(raw).attemptKey

    expect(sessionStorage.getItem(
      `signavi:studio:order-submission:v1:${attemptKey}`
    )).toBe("submitted")

    fireEvent.click(screen.getByRole("button", {
      name: "Simulate cart checkout"
    }))

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        expect.stringContaining("already submitted"),
        "error"
      )
    })

    expect(api.post).toHaveBeenCalledTimes(1)
    expect(sessionStorage.getItem(
      "signavi:studio:checkout-attempt:v1"
    )).toBe(raw)
  })

  it("does not resubmit an order after HTTP 409", async () => {
    api.post.mockRejectedValueOnce({
      response: { status: 409 }
    })

    startCheckout()

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        expect.stringContaining("Do not submit checkout again"),
        "error"
      )
    })

    fireEvent.click(screen.getByRole("button", {
      name: "Simulate cart checkout"
    }))

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        expect.stringContaining("already submitted"),
        "error"
      )
    })

    expect(api.post).toHaveBeenCalledTimes(1)
    expect(sessionStorage.getItem(
      "signavi:studio:checkout-attempt:v1"
    )).not.toBeNull()
  })

})
