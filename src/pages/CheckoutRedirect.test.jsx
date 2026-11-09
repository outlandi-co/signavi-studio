import React from "react"
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import CheckoutRedirect from "./CheckoutRedirect"

afterEach(() => cleanup())

const renderRoute = (url) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route
          path="/checkout/:id"
          element={<CheckoutRedirect />}
        />
        <Route
          path="/client-checkout/:id"
          element={<p>Protected client checkout destination</p>}
        />
        <Route
          path="/my-orders"
          element={<p>Orders destination</p>}
        />
      </Routes>
    </MemoryRouter>
  )

describe("Legacy checkout safety", () => {
  it("routes a valid order to protected Client Checkout", async () => {
    renderRoute("/checkout/test-order-123")

    expect(
      await screen.findByText("Protected client checkout destination")
    ).toBeTruthy()

    expect(
      screen.queryByText(/Redirecting to secure payment/i)
    ).toBeNull()
  })

  it("rejects an invalid order ID without initiating checkout", () => {
    renderRoute("/checkout/undefined")

    expect(
      screen.getByRole("alert").textContent
    ).toContain("valid order ID")

    expect(
      screen.getByRole("link", { name: /Back to Orders/i })
        .getAttribute("href")
    ).toBe("/my-orders")
  })
})
