import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import ProductCustomizer from "./ProductCustomizer"
import api from "../services/api"
import { useCartContext } from "../context/useCartContext"
import toast from "react-hot-toast"

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

vi.mock("../context/useCartContext", () => ({
  useCartContext: vi.fn()
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ id: "507f1f77bcf86cd799439011" }),
  useNavigate: () => vi.fn()
}))

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock("../components/UploadArtwork", () => ({
  default: ({ setArtwork }) => (
    <button
      type="button"
      onClick={() => setArtwork("https://example.com/artwork.png")}
    >
      Use test artwork
    </button>
  )
}))

vi.mock("../components/ProductMockup", () => ({
  default: () => <div>Mock product preview</div>
}))

const product = {
  _id: "507f1f77bcf86cd799439011",
  name: "Custom T-Shirt",
  price: 20,
  productType: "physical",
  storefront: "signavi_studio",
  stock: 10,
  variants: [],
  image: "https://example.com/shirt.png"
}

let addToCart
let openCart

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()

  addToCart = vi.fn().mockReturnValue(true)
  openCart = vi.fn()

  vi.mocked(useCartContext).mockReturnValue({ addToCart })

  vi.mocked(api.get).mockResolvedValue({
    data: { data: { ...product } }
  })
})

afterEach(() => {
  cleanup()
})

async function loadCustomizer() {
  const result = render(
    <ProductCustomizer onOpenCart={openCart} />
  )

  await screen.findByPlaceholderText("Your Name")

  fireEvent.change(screen.getByPlaceholderText("Your Name"), {
    target: { value: "Test Customer" }
  })

  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "customer@example.com" }
  })

  return result
}

describe("Product Customizer Cart handoff", () => {
  it("preserves artwork and production options in Cart", async () => {
    const { container } = await loadCustomizer()

    fireEvent.click(screen.getByText("Use test artwork"))

    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "2" }
    })

    fireEvent.change(container.querySelector(
      'select[name="productionType"]'
    ), {
      target: { value: "dtf" }
    })

    const selects = container.querySelectorAll("select")
    fireEvent.change(selects[1], {
      target: { value: "back" }
    })

    fireEvent.submit(container.querySelector("form"))

    await waitFor(() => {
      expect(addToCart).toHaveBeenCalledTimes(1)
    })

    const item = addToCart.mock.calls[0][0]

    expect(item.productId).toBe(product._id)
    expect(item.quantity).toBe(2)
    expect(item.stock).toBe(10)
    expect(item.customization).toEqual({
      artwork: "https://example.com/artwork.png",
      productionType: "dtf",
      printLocation: "back",
      design: { x: 150, y: 150, size: 120 }
    })

    expect(openCart).toHaveBeenCalledTimes(1)
    expect(api.post).not.toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalled()
  })

  it("blocks products without verified stock", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        data: { ...product, stock: undefined }
      }
    })

    const { container } = await loadCustomizer()

    fireEvent.submit(container.querySelector("form"))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })

    expect(addToCart).not.toHaveBeenCalled()
    expect(openCart).not.toHaveBeenCalled()
    expect(api.post).not.toHaveBeenCalled()
  })

  it("blocks products outside the approved catalog", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        data: { ...product, storefront: "other_store" }
      }
    })

    const { container } = await loadCustomizer()

    fireEvent.submit(container.querySelector("form"))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })

    expect(addToCart).not.toHaveBeenCalled()
    expect(openCart).not.toHaveBeenCalled()
    expect(api.post).not.toHaveBeenCalled()
  })

  it("blocks products requiring variant selection", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        data: {
          ...product,
          variants: [
            { color: "black", size: "M", stock: 10 }
          ]
        }
      }
    })

    const { container } = await loadCustomizer()

    fireEvent.submit(container.querySelector("form"))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })

    expect(addToCart).not.toHaveBeenCalled()
    expect(openCart).not.toHaveBeenCalled()
    expect(api.post).not.toHaveBeenCalled()
  })
})