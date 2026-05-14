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
        const res = await api.get("/products")

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

  const formatLicense = (licenseType = "") => {
    return String(safeText(licenseType, ""))
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>
  }

  return (
    <div style={grid}>
      {products.map(product => {
        const productId = product._id
        const productName = safeText(product.name, "Product")
        const productType = safeText(product.productType, "physical")

        const isPhysical = productType === "physical"
        const isDigital = productType === "digital"
        const isService = productType === "service"

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

        if (images.length === 0 && product.digitalProduct?.previewImage) {
          images.push(product.digitalProduct.previewImage)
        }

        if (images.length === 0 && product.image) {
          images.push(product.image)
        }

        if (images.length === 0 && product.images?.length) {
          images.push(product.images[0])
        }

        const idx = imageIndex[productId] || 0
        const safeIdx = idx >= images.length ? 0 : idx
        const mainImage = resolve(images[safeIdx] || images[0])

        const price = Number(
          isPhysical
            ? (
                variant?.price ||
                variant?.basePrice ||
                variant?.listPrice ||
                product.price ||
                product.basePrice ||
                product.listPrice ||
                0
              )
            : (
                product.price ||
                product.basePrice ||
                product.listPrice ||
                0
              )
        )

        return (
          <div key={productId} className="card">
            <div className="productImageBox">
              <img
                src={mainImage}
                alt={productName}
                className="productImage"
                onError={(e) => {
                  e.currentTarget.src = "/image_placeholder/placeholder.png"
                }}
              />
            </div>

            {images.length > 1 && (
              <div className="carouselWrap">
                <button
                  type="button"
                  className="carouselBtn"
                  onClick={() => scroll(productId, "left")}
                >
                  ◀
                </button>

                <div
                  className="thumbScroller"
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
                      className={i === safeIdx ? "activeThumb" : ""}
                      onError={(e) => {
                        e.currentTarget.src = "/image_placeholder/placeholder.png"
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="carouselBtn"
                  onClick={() => scroll(productId, "right")}
                >
                  ▶
                </button>
              </div>
            )}

            <h3>{productName}</h3>

            <p className="priceText">
              ${price.toFixed(2)}
            </p>

            {isDigital && (
              <div className="digitalInfo">
                <p className="digitalBadge">
                  Digital Download • {product.digitalProduct?.dpi || 300} DPI
                </p>

                {product.digitalProduct?.printSize && (
                  <p className="licenseText">
                    Print Size: {safeText(product.digitalProduct.printSize)}
                  </p>
                )}

                {product.digitalProduct?.licenseType && (
                  <p className="licenseText">
                    License: {formatLicense(product.digitalProduct.licenseType)}
                  </p>
                )}

                {product.digitalProduct?.fileFormats?.length > 0 && (
                  <p className="licenseText">
                    Files: {product.digitalProduct.fileFormats.map(format => safeText(format)).join(", ")}
                  </p>
                )}
              </div>
            )}

            {isService && (
              <p className="serviceBadge">
                Service Product
              </p>
            )}

            {isPhysical && (
              <div className="row">
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

            {isPhysical && (
              <div className="row">
                {sizes.map(size => {
                  const v = variants.find(
                    variantItem =>
                      safeText(variantItem.color, "") === activeColor &&
                      safeText(variantItem.size, "") === size
                  )

                  const out = Number(v?.stock || 0) === 0

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={out}
                      onClick={() =>
                        setSelected(prev => ({
                          ...prev,
                          [productId]: {
                            ...prev[productId],
                            size
                          }
                        }))
                      }
                      className={`${activeSize === size ? "active" : ""} ${out ? "disabled" : ""}`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            )}

            <button
              type="button"
              className="add"
              onClick={() => {
                if (isPhysical && !variant) {
                  return toast.error("Select options")
                }

                const added = addToCart({
                  productId,
                  name: productName,
                  image: mainImage,
                  quantity: 1,
                  price,
                  productType,
                  selectedVariant: isPhysical
                    ? {
                        ...variant,
                        price
                      }
                    : null,
                  digitalProduct: isDigital
                    ? product.digitalProduct
                    : null
                })

                if (added) {
                  toast.success("Added")
                } else {
                  toast.error("Could not add item to cart")
                }
              }}
            >
              Add to Cart
            </button>
          </div>
        )
      })}

      <style>{`
        .card {
          width: 240px;
          background: #0f172a;
          padding: 12px;
          border-radius: 12px;
          color: white;
        }

        .productImageBox {
          width: 100%;
          height: 170px;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #1e293b;
          margin-bottom: 10px;
        }

        .productImage {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
          padding: 6px;
          box-sizing: border-box;
        }

        .carouselWrap {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        }

        .carouselBtn {
          background: #1e293b;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          padding: 4px 6px;
        }

        .thumbScroller {
          display: flex;
          overflow-x: auto;
          gap: 6px;
          cursor: grab;
          max-width: 170px;
        }

        .thumbScroller img {
          width: 40px;
          height: 40px;
          border-radius: 6px;
          cursor: pointer;
          object-fit: contain;
          background: #ffffff;
          padding: 2px;
          box-sizing: border-box;
        }

        .activeThumb {
          border: 2px solid #22c55e;
        }

        .priceText {
          margin: 6px 0;
          color: #22c55e;
          font-weight: 800;
        }

        .digitalInfo {
          background: #020617;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 8px;
          margin-top: 8px;
          margin-bottom: 8px;
        }

        .digitalBadge {
          margin: 0 0 4px;
          color: #38bdf8;
          font-size: 13px;
          font-weight: 800;
        }

        .serviceBadge {
          margin: 6px 0;
          color: #facc15;
          font-size: 13px;
          font-weight: 800;
        }

        .licenseText {
          margin: 3px 0;
          color: #cbd5e1;
          font-size: 12px;
        }

        .row {
          display: flex;
          gap: 6px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        button {
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        button.active {
          background: #22c55e;
        }

        button.disabled {
          opacity: 0.3;
          pointer-events: none;
        }

        .add {
          margin-top: 10px;
          width: 100%;
          background: #22c55e;
          padding: 8px;
          color: white;
          font-weight: 700;
        }
      `}</style>
    </div>
  )
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 240px))",
  justifyContent: "center",
  gap: 20
}