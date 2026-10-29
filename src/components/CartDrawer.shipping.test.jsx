import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react"

import api from "../services/api"
import CartDrawer from "./CartDrawer"

const { cartStore } = vi.hoisted(() => ({
  cartStore: { current: null }
}))

vi.mock("../services/api", () => ({
  default: {
    post: vi.fn()
  }
}))

vi.mock("../context/useCartContext", () => ({
  useCartContext: () => cartStore.current
}))

const physicalItem = (quantity = 1) => ({
  productId: "synthetic-product",
  productType: "physical",
  name: "Test Shirt",
  price: 20,
  quantity,
  selectedVariant: {
    _id: "synthetic-variant",
    color: "Black",
    size: "M",
    stock: 20
  }
})

const shippingResponse = () => ({
  data: {
    rates: [
      {
        object_id: "synthetic-rate",
        provider: "Test Carrier",
        servicelevel: { name: "Ground" },
        amount: "12.50",
        currency: "USD",
        shippingQuote: "synthetic-signed-shipping-quote"
      }
    ]
  }
})

const deferred = () => {
  let resolve
  let reject

  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

const openDrawer = (onCheckout = vi.fn()) =>
  render(
    <CartDrawer
      isOpen={true}
      onClose={vi.fn()}
      onCheckout={onCheckout}
    />
  )

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()

  localStorage.setItem(
    "customerUser",
    JSON.stringify({
      name: "Test Customer",
      email: "customer@example.invalid",
      address: {
        street: "123 Test Street",
        city: "Merced",
        state: "CA",
        zip: "95340",
        country: "US"
      }
    })
  )

  cartStore.current = {
    cart: [physicalItem()],
    subtotal: 20,
    tax: 0,
    updateQuantity: vi.fn(),
    removeFromCart: vi.fn()
  }
})

afterEach(() => {
  cleanup()
})

describe("CartDrawer shipping protection", () => {
  it("selects a signed rate and continues without another rate request", async () => {
    api.post.mockResolvedValue(shippingResponse())

    const onCheckout = vi.fn()
    openDrawer(onCheckout)

    fireEvent.click(
      screen.getByRole("button", { name: "Get Shipping Rates" })
    )

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Refresh Shipping Rates" })
      ).toBeTruthy()
    })

    expect(api.post).toHaveBeenCalledTimes(1)
    expect(api.post).toHaveBeenCalledWith(
      "/shipping/get-rates",
      expect.objectContaining({
        items: [
          {
            productId: "synthetic-product",
            quantity: 1
          }
        ]
      })
    )

    fireEvent.click(
      screen.getByRole("button", { name: "Checkout" })
    )

    expect(onCheckout).toHaveBeenCalledTimes(1)
    expect(onCheckout.mock.calls[0][1]).toMatchObject({
      shippingQuote: "synthetic-signed-shipping-quote",
      shippingCost: 12.5,
      shippingProvider: "Test Carrier"
    })

    expect(api.post).toHaveBeenCalledTimes(1)
  })

  it("keeps a selected rate when cart contents are unchanged", async () => {
    api.post.mockResolvedValue(shippingResponse())

    const onCheckout = vi.fn()
    const view = openDrawer(onCheckout)

    fireEvent.click(
      screen.getByRole("button", { name: "Get Shipping Rates" })
    )

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Refresh Shipping Rates" })
      ).toBeTruthy()
    })

    view.rerender(
      <CartDrawer
        isOpen={true}
        onClose={vi.fn()}
        onCheckout={onCheckout}
      />
    )

    expect(
      screen.getByRole("button", { name: "Refresh Shipping Rates" })
    ).toBeTruthy()

    expect(api.post).toHaveBeenCalledTimes(1)
  })

  it("ignores a pending rate response after the ZIP changes", async () => {
    const pending = deferred()
    api.post.mockReturnValue(pending.promise)

    openDrawer()

    fireEvent.click(
      screen.getByRole("button", { name: "Get Shipping Rates" })
    )

    expect(api.post).toHaveBeenCalledTimes(1)

    fireEvent.change(
      screen.getByPlaceholderText("ZIP *"),
      { target: { value: "95341" } }
    )

    await act(async () => {
      pending.resolve(shippingResponse())
      await pending.promise
    })

    expect(
      screen.getByRole("button", { name: "Get Shipping Rates" })
    ).toBeTruthy()

    expect(
      screen.queryByRole("button", { name: "Refresh Shipping Rates" })
    ).toBeNull()
  })

  it("invalidates pending rates when physical cart quantity changes", async () => {
    const pending = deferred()
    api.post.mockReturnValue(pending.promise)

    const view = openDrawer()

    fireEvent.click(
      screen.getByRole("button", { name: "Get Shipping Rates" })
    )

    expect(api.post).toHaveBeenCalledTimes(1)

    cartStore.current = {
      ...cartStore.current,
      cart: [physicalItem(2)],
      subtotal: 40
    }

    view.rerender(
      <CartDrawer
        isOpen={true}
        onClose={vi.fn()}
        onCheckout={vi.fn()}
      />
    )

    await act(async () => {
      pending.resolve(shippingResponse())
      await pending.promise
    })

    expect(
      screen.getByRole("button", { name: "Get Shipping Rates" })
    ).toBeTruthy()

    expect(
      screen.queryByRole("button", { name: "Refresh Shipping Rates" })
    ).toBeNull()
  })
})