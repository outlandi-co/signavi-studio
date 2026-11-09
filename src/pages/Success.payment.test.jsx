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
  render,
  screen
} from "@testing-library/react"

import {
  MemoryRouter,
  Route,
  Routes
} from "react-router-dom"

import api from "../services/api"
import Success from "./Success.jsx"

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn()
  }
}))

const ORDER_ID = "507f1f77bcf86cd799439011"
const ATTEMPT_KEY = "123e4567-e89b-42d3-a456-426614174000"
const ATTEMPT_STORAGE_KEY = "signavi:studio:checkout-attempt:v1"

function installCredentials() {
  sessionStorage.setItem(
    `signaviCheckoutToken:${ORDER_ID}`,
    "test-guest-token"
  )

  sessionStorage.setItem(
    ATTEMPT_STORAGE_KEY,
    JSON.stringify({
      attemptKey: ATTEMPT_KEY,
      recoverySecret: "PRIVATE_RECOVERY_SECRET",
      fingerprint: "f".repeat(64)
    })
  )
}

function renderSuccess() {
  return render(
    <MemoryRouter
      initialEntries={[`/success?orderId=${ORDER_ID}`]}
    >
      <Routes>
        <Route path="/success" element={<Success />} />
        <Route
          path="/track/:id"
          element={<div>Order tracking page</div>}
        />
      </Routes>
    </MemoryRouter>
  )
}

function respondWithPaymentStatus(paymentStatus) {
  api.get.mockResolvedValue({
    data: {
      success: true,
      data: {
        orderId: ORDER_ID,
        storefront: "signavi_studio",
        paymentStatus
      }
    }
  })
}

describe("Signavi Studio payment confirmation page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
    installCredentials()
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it("announces success for an order marked paid", async () => {
    respondWithPaymentStatus("paid")

    renderSuccess()

    expect(
      await screen.findByRole("heading", {
        name: "Payment Successful"
      })
    ).toBeTruthy()

    expect(api.get).toHaveBeenCalledWith(
      `/orders/${ORDER_ID}/studio-payment-confirmation`,
      {
        headers: {
          "x-signavi-guest-checkout-token": "test-guest-token",
          "x-signavi-storefront-attempt-key": ATTEMPT_KEY
        }
      }
    )

    expect(JSON.stringify(api.get.mock.calls))
      .not.toContain("PRIVATE_RECOVERY_SECRET")
  })

  it("does not claim an unpaid order was paid", async () => {
    respondWithPaymentStatus("unpaid")

    renderSuccess()

    expect(
      await screen.findByRole("heading", {
        name: "Payment Not Confirmed"
      })
    ).toBeTruthy()

    expect(
      screen.queryByRole("heading", {
        name: "Payment Successful"
      })
    ).toBeNull()
  })

  it("does not claim a refunded order was paid", async () => {
    respondWithPaymentStatus("refunded")

    renderSuccess()

    expect(
      await screen.findByRole("heading", {
        name: "Payment Not Confirmed"
      })
    ).toBeTruthy()
  })

  it("does not claim success when the order API fails", async () => {
    api.get.mockRejectedValue(
      new Error("Simulated order lookup failure")
    )

    renderSuccess()

    expect(
      await screen.findByRole("heading", {
        name: "Payment Not Confirmed"
      })
    ).toBeTruthy()

    expect(
      screen.queryByRole("heading", {
        name: "Payment Successful"
      })
    ).toBeNull()
  })

  it("redirects a paid order to tracking", async () => {
    respondWithPaymentStatus("paid")

    renderSuccess()

    expect(
      await screen.findByRole("heading", {
        name: "Payment Successful"
      })
    ).toBeTruthy()

    expect(
      await screen.findByText(
        "Order tracking page",
        {},
        { timeout: 5000 }
      )
    ).toBeTruthy()
  }, 7000)

  it("does not redirect an unpaid order to tracking", async () => {
    respondWithPaymentStatus("unpaid")

    renderSuccess()

    expect(
      await screen.findByRole("heading", {
        name: "Payment Not Confirmed"
      })
    ).toBeTruthy()

    // Observe the page beyond its 3500ms redirect threshold.
    await new Promise(resolve => setTimeout(resolve, 3700))

    expect(
      screen.getByRole("heading", {
        name: "Payment Not Confirmed"
      })
    ).toBeTruthy()

    expect(
      screen.queryByText("Order tracking page")
    ).toBeNull()
  }, 7000)

  it("does not confirm payment without guest credentials", async () => {
    sessionStorage.removeItem(`signaviCheckoutToken:${ORDER_ID}`)

    renderSuccess()

    expect(
      await screen.findByRole("heading", {
        name: "Payment Not Confirmed"
      })
    ).toBeTruthy()

    expect(api.get).not.toHaveBeenCalled()
  })

  it("rejects paid status from a different order", async () => {
    api.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          orderId: "507f1f77bcf86cd799439012",
          storefront: "signavi_studio",
          paymentStatus: "paid"
        }
      }
    })

    renderSuccess()

    expect(
      await screen.findByRole("heading", {
        name: "Payment Not Confirmed"
      })
    ).toBeTruthy()

    expect(
      screen.queryByRole("heading", {
        name: "Payment Successful"
      })
    ).toBeNull()
  })


  it("retires a verified paid attempt while preserving its refresh key", async () => {
    respondWithPaymentStatus("paid")
    renderSuccess()

    expect(
      await screen.findByRole("heading", {
        name: "Payment Successful"
      })
    ).toBeTruthy()

    expect(
      sessionStorage.getItem("signavi:studio:checkout-attempt:v1")
    ).toBeNull()

    expect(
      sessionStorage.getItem(
        `signavi:studio:paid-confirmation-attempt:${ORDER_ID}`
      )
    ).toBe(ATTEMPT_KEY)

    expect(
      sessionStorage.getItem(`signaviCheckoutToken:${ORDER_ID}`)
    ).toBe("test-guest-token")
  })

  it("keeps an unpaid checkout attempt available for recovery", async () => {
    respondWithPaymentStatus("unpaid")
    renderSuccess()

    expect(
      await screen.findByRole("heading", {
        name: "Payment Not Confirmed"
      })
    ).toBeTruthy()

    expect(
      sessionStorage.getItem("signavi:studio:checkout-attempt:v1")
    ).not.toBeNull()

    expect(
      sessionStorage.getItem(
        `signavi:studio:paid-confirmation-attempt:${ORDER_ID}`
      )
    ).toBeNull()
  })

  it("reconfirms a paid order after its active attempt is retired", async () => {
    respondWithPaymentStatus("paid")
    const first = renderSuccess()

    expect(
      await screen.findByRole("heading", {
        name: "Payment Successful"
      })
    ).toBeTruthy()

    first.unmount()

    renderSuccess()

    expect(
      await screen.findByRole("heading", {
        name: "Payment Successful"
      })
    ).toBeTruthy()

    expect(api.get).toHaveBeenCalledTimes(2)

    const secondHeaders = api.get.mock.calls[1][1].headers

    expect(secondHeaders[
      "x-signavi-storefront-attempt-key"
    ]).toBe(ATTEMPT_KEY)
  })

})