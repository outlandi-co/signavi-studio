import { useEffect, useRef, useState } from "react"
import api from "../services/api"
import { useCartContext } from "../context/useCartContext"
import toast from "react-hot-toast"

const safeText = (value, fallback = "") => {
  if (value === null || value === undefined || value === "") return fallback
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  if (typeof value === "boolean") return value ? "Yes" : "No"

  if (typeof value === "object") {
    return value.name || value.title || value.label || value.value || fallback
  }

  return fallback
}

export default function Store() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState({})
  const [imageIndex, setImageIndex] = useState({})
  const [query, setQuery] = useState("")

  const { addToCart } = useCartContext()

  const scrollerRefs = useRef({})
  const dragState = useRef({})

  const BASE_URL =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "https://signavi-backend.onrender.com"

  const resolve = (img) => {
    if (!img || typeof img !== "string") {
      return "/image_placeholder/placeholder.png"
    }

    if (img.startsWith("data:image")) return img
    if (img.startsWith("http")) return img
    if (img.startsWith("/uploads")) return `${BASE_URL}${img}`
    if (img.startsWith("uploads")) return `${BASE_URL}/${img}`

    return img
  }

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const res = await api.get("/products", {
          params: {
            storefrontVisible: true,
            storefront: "signavi"
          }
        })

        const productData = Array.isArray(res.data)
          ? res.data
          : res.data?.data || []

        if (isMounted) {
          setProducts(productData)
        }
      } catch (err) {
        console.error("❌ STORE PRODUCTS ERROR:", err.response?.data || err)

        if (isMounted) {
          setProducts([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredProducts = products.filter(product => {
    const text = query.toLowerCase()

    return (
      safeText(product.name).toLowerCase().includes(text) ||
      safeText(product.category).toLowerCase().includes(text) ||
      safeText(product.description).toLowerCase().includes(text)
    )
  })

  const scroll = (id, dir) => {
    const el = scrollerRefs.current[id]
    if (!el) return

    el.scrollBy({
      left: dir === "left" ? -120 : 120,
      behavior: "smooth"
    })
  }

  const handleMouseDown = (e, id) => {
    const el = scrollerRefs.current[id]
    if (!el) return

    dragState.current[id] = {
      isDown: true,
      startX: e.pageX,
      scrollLeft: el.scrollLeft
    }
  }

  const handleMouseMove = (e, id) => {
    const state = dragState.current[id]
    const el = scrollerRefs.current[id]

    if (!state?.isDown || !el) return

    const walk = (e.pageX - state.startX) * 1.5
    el.scrollLeft = state.scrollLeft - walk
  }

  const handleMouseUp = (id) => {
    if (dragState.current[id]) {
      dragState.current[id].isDown = false
    }
  }

  if (loading) {
    return (
      <section className="store-page">
        <p className="loading-text">Loading products...</p>
      </section>
    )
  }

  return (
    <section className="store-page">
      <div className="store-container">
        <div className="store-hero">
          <p className="store-eyebrow">Shop</p>
          <h1>Signavi Store</h1>
          <p>
            Products, apparel, and creative goods ready for checkout.
          </p>
        </div>

        <input
          className="store-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products..."
        />

        <div className="studio-product-grid">
          {filteredProducts.map(product => {
            const productId = product._id
            const productName = safeText(product.name, "Product")
            const productType = safeText(product.productType, "physical")

            const variants = product.variants || []
            const current = selected[productId] || {}

            const colors = [
              ...new Set(variants.map(v => safeText(v.color, "")))
            ].filter(Boolean)

            const activeColor = current.color || colors[0]

            const colorVariants = variants.filter(
              v => safeText(v.color, "") === activeColor
            )

            const sizes = [
              ...new Set(colorVariants.map(v => safeText(v.size, "")))
            ].filter(Boolean)

            const activeSize = current.size || sizes[0]

            const variant = variants.find(
              v =>
                safeText(v.color, "") === activeColor &&
                safeText(v.size, "") === activeSize
            )

            const images = [
              ...new Set(
                variants
                  .filter(v => safeText(v.color, "") === activeColor)
                  .flatMap(v => v.images || [])
              )
            ]

            if (images.length === 0 && product.image) {
              images.push(product.image)
            }

            if (images.length === 0 && product.imageUrl) {
              images.push(product.imageUrl)
            }

            if (images.length === 0 && product.images?.length) {
              images.push(product.images[0])
            }

            const idx = imageIndex[productId] || 0
            const safeIdx = idx >= images.length ? 0 : idx
            const mainImage = resolve(images[safeIdx] || images[0])

            const price = Number(
              variant?.price ||
              variant?.basePrice ||
              variant?.listPrice ||
              product.price ||
              product.basePrice ||
              product.listPrice ||
              product.finalPrice ||
              0
            )

            return (
              <article key={productId} className="studio-product-card">
                <div className="studio-product-image-box">
                  <img
                    src={mainImage}
                    alt={productName}
                    className="studio-product-image"
                    onError={(e) => {
                      e.currentTarget.src = "/image_placeholder/placeholder.png"
                    }}
                  />
                </div>

                {images.length > 1 && (
                  <div className="studio-carousel-wrap">
                    <button
                      type="button"
                      className="studio-carousel-btn"
                      onClick={() => scroll(productId, "left")}
                    >
                      ◀
                    </button>

                    <div
                      className="studio-thumb-scroller"
                      ref={(el) => {
                        if (el) scrollerRefs.current[productId] = el
                      }}
                      onMouseDown={(e) => handleMouseDown(e, productId)}
                      onMouseMove={(e) => handleMouseMove(e, productId)}
                      onMouseLeave={() => handleMouseUp(productId)}
                      onMouseUp={() => handleMouseUp(productId)}
                    >
                      {images.map((img, i) => (
                        <img
                          key={`${img}-${i}`}
                          src={resolve(img)}
                          alt={`${productName} thumbnail ${i + 1}`}
                          onClick={() =>
                            setImageIndex(prev => ({
                              ...prev,
                              [productId]: i
                            }))
                          }
                          className={i === safeIdx ? "active-thumb" : ""}
                          onError={(e) => {
                            e.currentTarget.src = "/image_placeholder/placeholder.png"
                          }}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      className="studio-carousel-btn"
                      onClick={() => scroll(productId, "right")}
                    >
                      ▶
                    </button>
                  </div>
                )}

                <div className="studio-product-body">
                  <h3>{productName}</h3>

                  <p>
                    {safeText(product.description, "Custom Signavi product")}
                  </p>

                  {colors.length > 0 && (
                    <div className="studio-option-row">
                      {colors.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            const firstSize = variants.find(
                              v => safeText(v.color, "") === color
                            )?.size

                            setSelected(prev => ({
                              ...prev,
                              [productId]: {
                                color,
                                size: safeText(firstSize, "")
                              }
                            }))

                            setImageIndex(prev => ({
                              ...prev,
                              [productId]: 0
                            }))
                          }}
                          className={activeColor === color ? "active" : ""}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  )}

                  {sizes.length > 0 && (
                    <div className="studio-option-row">
                      {sizes.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() =>
                            setSelected(prev => ({
                              ...prev,
                              [productId]: {
                                ...prev[productId],
                                size
                              }
                            }))
                          }
                          className={activeSize === size ? "active" : ""}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="studio-product-footer">
                    <strong>${price.toFixed(2)}</strong>

                    <button
                      type="button"
                      onClick={() => {
                        const added = addToCart({
                          productId,
                          name: productName,
                          image: mainImage,
                          quantity: 1,
                          price,
                          productType,
                          selectedVariant: variant
                            ? {
                                ...variant,
                                price
                              }
                            : null
                        })

                        if (added) {
                          toast.success("Added")
                        } else {
                          toast.error("Could not add item to cart")
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}