import React from "react"
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import api from "../services/api"
import { redirectToCheckoutPayment } from "../utils/checkoutNavigation"
import toast from "react-hot-toast"
import ClientCheckout from "./ClientCheckout"

vi.mock("../services/api", () => ({
  default: {
    patch: vi.fn()
  }
}))

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "test-order-123" }),
  useNavigate: () => vi.fn()
}))


vi.mock("../utils/checkoutNavigation", async (importOriginal) => ({
  ...(await importOriginal()),
  redirectToCheckoutPayment: vi.fn()
}))

const orderId = "test-order-123"

const previewMessage =
  "Checkout is in preview mode. No payment was created."

const prepareCheckout = () => {
  sessionStorage.setItem(
    `signaviCheckoutQuote:${orderId}`,
    JSON.stringify({
      shippingAddress: {
        name: "Test Customer",
        street1: "123 Test Street",
        city: "Merced",
        state: "CA",
        zip: "95340",
        country: "US"
      },
      shippingRate: {
        amount: 10,
        provider: "Mock Carrier",
        servicelevel: "Ground"
      },
      shippingQuote: "synthetic-test-quote"
    })
  )

  sessionStorage.setItem(
    `signaviCheckoutToken:${orderId}`,
    "synthetic-test-token"
  )
}

const confirmCheckout = () => {
  render(
    <ClientCheckout onChangeAddress={() => {}} />
  )

  fireEvent.click(
    screen.getByRole("button", {
      name: /Confirm Address & Continue to Payment/i
    })
  )
}

describe("ClientCheckout V3 no-payment responses", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    localStorage.clear()
    prepareCheckout()
  })

  afterEach(() => {
    cleanup()
  })

  it("shows a safe message for HTTP 501 preview response", async () => {
    api.patch.mockRejectedValueOnce({
      response: {
        status: 501,
        data: {
          code: "V3_PREVIEW_ONLY",
          message: "Preview only"
        }
      }
    })

    confirmCheckout()

    const alert = await screen.findByRole("alert")

    expect(alert.textContent).toContain(previewMessage)
    expect(api.patch).toHaveBeenCalledTimes(1)
    expect(toast.success).not.toHaveBeenCalled()
  })

  it("shows a safe message for HTTP 202 no-payment response", async () => {
    api.patch.mockResolvedValueOnce({
      status: 202,
      data: {
        code: "V3_SANDBOX_PREPARED_NO_PAYMENT",
        success: true,
        paymentCreated: false,
        squareRequestAuthorized: false
      }
    })

    confirmCheckout()

    const alert = await screen.findByRole("alert")

    expect(alert.textContent).toContain(previewMessage)
    expect(api.patch).toHaveBeenCalledTimes(1)
    expect(toast.success).not.toHaveBeenCalled()
  })

  it("rejects a successful response without a payment URL", async () => {
    api.patch.mockResolvedValueOnce({
      status: 200,
      data: {
        success: true
      }
    })

    confirmCheckout()

    const alert = await screen.findByRole("alert")

    expect(alert.textContent).toContain(
      "Secure payment URL was not returned"
    )

    expect(api.patch).toHaveBeenCalledTimes(1)
    expect(toast.success).not.toHaveBeenCalled()
  })

  it("sends both V2 and V3 signed shipping quote fields", async () => {
    api.patch.mockResolvedValueOnce({
      status: 202,
      data: {
        code: "V3_SANDBOX_PREPARED_NO_PAYMENT"
      }
    })

    confirmCheckout()

    await screen.findByRole("alert")

    expect(api.patch).toHaveBeenCalledWith(
      `/orders/${orderId}/checkout`,
      expect.objectContaining({
        shippingQuote: "synthetic-test-quote",
        v3ShippingQuote: "synthetic-test-quote"
      }),
      expect.objectContaining({
        headers: {
          "x-signavi-guest-checkout-token":
            "synthetic-test-token"
        }
      })
    )
  })

  it("blocks checkout when the guest token is missing", async () => {
    sessionStorage.removeItem(
      `signaviCheckoutToken:${orderId}`
    )

    confirmCheckout()

    const alert = await screen.findByRole("alert")

    expect(alert.textContent).toContain(
      "Checkout session missing or expired"
    )
    expect(api.patch).not.toHaveBeenCalled()
    expect(toast.success).not.toHaveBeenCalled()
  })

  it("disables checkout when the signed shipping quote is missing", () => {
    sessionStorage.removeItem(
      `signaviCheckoutQuote:${orderId}`
    )

    render(
      <ClientCheckout onChangeAddress={() => {}} />
    )

    const button = screen.getByRole("button", {
      name: /Confirm Address & Continue to Payment/i
    })

    expect(button.disabled).toBe(true)
    expect(api.patch).not.toHaveBeenCalled()
  })

  it("rejects an HTTP payment URL", async () => {
    api.patch.mockResolvedValueOnce({
      status: 200,
      data: {
        success: true,
        paymentUrl: "http://example.invalid/payment"
      }
    })

    confirmCheckout()

    const alert = await screen.findByRole("alert")

    expect(alert.textContent).toContain(
      "Secure payment URL was not returned"
    )
    expect(api.patch).toHaveBeenCalledTimes(1)
    expect(toast.success).not.toHaveBeenCalled()
  })

  // STEP251_DIRECT_REDIRECT_ASSERTIONS
  it("never requests navigation for a V3 preview response", async () => {
    api.patch.mockResolvedValueOnce({
      status: 202,
      data: {
        code: "V3_SANDBOX_PREPARED_NO_PAYMENT",
        paymentUrl: "https://example.invalid/blocked"
      }
    })

    confirmCheckout()

    const alert = await screen.findByRole("alert")

    expect(alert.textContent).toContain(
      "Checkout is in preview mode. No payment was created."
    )
    expect(redirectToCheckoutPayment).not.toHaveBeenCalled()
  })

  it("calls the navigation boundary for an HTTPS checkout response", async () => {
    api.patch.mockResolvedValueOnce({
      status: 200,
      data: {
        paymentUrl: "https://square.link/u/synthetic-payment"
      }
    })

    confirmCheckout()

    await vi.waitFor(() => {
      expect(redirectToCheckoutPayment).toHaveBeenCalledWith(
        "https://square.link/u/synthetic-payment"
      )
    })

    expect(redirectToCheckoutPayment).toHaveBeenCalledTimes(1)
  })

  // STEP255_SUCCESS_MESSAGE_SAFETY
  it("does not report redirect success for an unapproved HTTPS host", async () => {
    api.patch.mockResolvedValueOnce({
      status: 200,
      data: {
        paymentUrl: "https://example.invalid/unapproved"
      }
    })

    confirmCheckout()

    const alert = await screen.findByRole("alert")

    expect(alert.textContent).toContain(
      "Secure payment URL was not returned"
    )

    expect(toast.success).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalled()
    expect(redirectToCheckoutPayment).not.toHaveBeenCalled()
    expect(localStorage.getItem("lastOrderId")).toBeNull()
  })
})