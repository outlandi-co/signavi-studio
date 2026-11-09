import React from "react"
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest"

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react"

import {
  MemoryRouter,
  Route,
  Routes
} from "react-router-dom"

import api from "../services/api"
import toast from "react-hot-toast"
import Cart from "./Cart.jsx"

const {
  cartFixture,
  clearCartSpy
} = vi.hoisted(() => ({
  cartFixture: {
    cart: []
  },
  clearCartSpy: vi.fn()
}))

vi.mock("../services/api", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  }
}))

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock("../context/useCartContext", () => ({
  useCartContext: () => ({
    cart: cartFixture.cart,
    clearCart: clearCartSpy,
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
    updateCartQuantity: vi.fn()
  })
}))

const orderId = "507f1f77bcf86cd799439011"

const guestToken = "SYNTHETIC_CART_GUEST_TOKEN"

const shippingQuote = "synthetic-signed-shipping-quote"

const shippingRate = {
  id: "synthetic-rate-01",
  provider: "USPS",
  servicelevel: "Priority",
  amount: 12.5,
  shippingQuote,
  estimatedDays: 3
}

function mockApi() {
  api.post.mockImplementation(async path => {
    if (path === "/shipping/get-rates") {
      return {
        status: 200,
        data: {
          rates: [shippingRate]
        }
      }
    }

    if (path === "/orders") {
      return {
        status: 201,
        data: {
          success: true,
          data: { _id: orderId },
          checkoutToken: guestToken
        }
      }
    }

    throw new Error("Unexpected mocked API path: " + path)
  })
}

function orderRequests() {
  return api.post.mock.calls.filter(
    ([path]) => path === "/orders"
  )
}

function renderCart() {
  return render(
    <MemoryRouter initialEntries={["/cart"]}>
      <Routes>
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/client-checkout/:id"
          element={
            <div data-testid="cart-checkout-destination">
              Checkout destination
            </div>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

function enterCustomerDetails() {
  const fields = [
    ["Full Name *", "Test Customer"],
    ["Email *", "test@example.invalid"],
    ["Phone", "5550000000"],
    ["Street Address *", "123 Test Street"],
    ["City *", "Merced"],
    ["State *", "CA"],
    ["ZIP *", "95340"]
  ]

  for (const [placeholder, value] of fields) {
    fireEvent.change(
      screen.getByPlaceholderText(placeholder),
      { target: { value } }
    )
  }
}

async function loadShipping() {
  enterCustomerDetails()

  fireEvent.click(
    screen.getByRole("button", {
      name: "Get Shipping Rates"
    })
  )

  await waitFor(() => {
    expect(toast.success).toHaveBeenCalledWith(
      "Shipping rates loaded"
    )
  })
}

function pressCheckout() {
  fireEvent.click(
    screen.getByRole("button", {
      name: "Continue to Secure Payment"
    })
  )
}

function activeAttempt() {
  const raw = sessionStorage.getItem(
    "signavi:studio:checkout-attempt:v1"
  )

  return raw ? JSON.parse(raw) : null
}

describe("Cart page protected Studio checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    localStorage.clear()

    cartFixture.cart = [{
      productId: "synthetic-product",
      storefront: "signavi_studio",
      name: "Synthetic Studio Item",
      quantity: 1,
      price: 20
    }]

    mockApi()
  })

  afterEach(() => {
    cleanup()
  })

  it("requires shipping selection before creating an order", async () => {
    renderCart()
    enterCustomerDetails()
    pressCheckout()

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Please get and select a shipping rate first"
      )
    })

    expect(orderRequests()).toHaveLength(0)
  })

  it("stores verified checkout credentials and navigates", async () => {
    renderCart()
    await loadShipping()
    pressCheckout()

    await waitFor(() => {
      expect(
        screen.getByTestId("cart-checkout-destination")
      ).toBeTruthy()
    })

    expect(orderRequests()).toHaveLength(1)

    expect(orderRequests()[0][1]).toEqual(
      expect.objectContaining({
        storefront: "signavi_studio",
        source: "cart_page",
        shippingQuote
      })
    )

    expect(orderRequests()[0][2].headers).toEqual({
      "x-signavi-storefront-attempt-key":
        expect.stringMatching(
          /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i
        ),
      "x-signavi-storefront-recovery-secret":
        expect.stringMatching(/^[A-Za-z0-9_-]{43}$/)
    })

    expect(sessionStorage.getItem(
      `signaviCheckoutToken:${orderId}`
    )).toBe(guestToken)

    expect(localStorage.getItem("lastOrderId"))
      .toBe(orderId)

    const quote = JSON.parse(
      sessionStorage.getItem(
        `signaviCheckoutQuote:${orderId}`
      )
    )

    expect(quote.shippingQuote).toBe(shippingQuote)
    expect(quote.shippingRate).toEqual(
      expect.objectContaining({
        provider: "USPS"
      })
    )
  })

  it("preserves the attempt after a network failure", async () => {
    api.post.mockImplementation(async path => {
      if (path === "/shipping/get-rates") {
        return { data: { rates: [shippingRate] } }
      }

      if (path === "/orders") {
        throw new Error("Simulated network failure")
      }

      throw new Error("Unexpected request")
    })

    renderCart()
    await loadShipping()
    pressCheckout()

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining(
          "Do not submit checkout again"
        )
      )
    })

    const attempt = activeAttempt()

    expect(attempt).not.toBeNull()

    expect(sessionStorage.getItem(
      `signavi:studio:order-submission:v1:${attempt.attemptKey}`
    )).toBe("submitted")

    expect(orderRequests()).toHaveLength(1)

    pressCheckout()

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("already submitted")
      )
    })

    expect(orderRequests()).toHaveLength(1)
    expect(activeAttempt()).toEqual(attempt)
  })

  it("blocks duplicate submissions after HTTP 409", async () => {
    api.post.mockImplementation(async path => {
      if (path === "/shipping/get-rates") {
        return { data: { rates: [shippingRate] } }
      }

      if (path === "/orders") {
        throw {
          response: { status: 409 }
        }
      }

      throw new Error("Unexpected request")
    })

    renderCart()
    await loadShipping()
    pressCheckout()

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining(
          "Do not submit checkout again"
        )
      )
    })

    const firstAttempt = activeAttempt()

    pressCheckout()

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("already submitted")
      )
    })

    expect(orderRequests()).toHaveLength(1)
    expect(activeAttempt()).toEqual(firstAttempt)
  })

  it("disables checkout while the order request is pending", async () => {
    let resolveOrder

    const pendingOrder = new Promise(resolve => {
      resolveOrder = resolve
    })

    api.post.mockImplementation(async path => {
      if (path === "/shipping/get-rates") {
        return { data: { rates: [shippingRate] } }
      }

      if (path === "/orders") {
        return pendingOrder
      }

      throw new Error("Unexpected request")
    })

    renderCart()
    await loadShipping()
    pressCheckout()

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Redirecting..."
        }).disabled
      ).toBe(true)
    })

    expect(orderRequests()).toHaveLength(1)

    resolveOrder({
      status: 201,
      data: {
        success: true,
        data: { _id: orderId },
        checkoutToken: guestToken
      }
    })

    await waitFor(() => {
      expect(
        screen.getByTestId("cart-checkout-destination")
      ).toBeTruthy()
    })
  })

  it("never requests payment or recovery during order creation", async () => {
    renderCart()
    await loadShipping()
    pressCheckout()

    await waitFor(() => {
      expect(orderRequests()).toHaveLength(1)
    })

    const paths = api.post.mock.calls.map(([path]) => path)

    expect(paths).not.toContain(
      "/orders/storefront/recover"
    )

    expect(paths).not.toContain(
      "/orders/checkout"
    )

    expect(paths).toEqual([
      "/shipping/get-rates",
      "/orders"
    ])
  })
})