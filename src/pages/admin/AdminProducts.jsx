import { useState } from "react"
import api from "../../services/api"
import toast from "react-hot-toast"

const PRODUCT_TYPE_OPTIONS = [
  { value: "physical", label: "Physical Product" },
  { value: "digital", label: "Digital Product" },
  { value: "service", label: "Service" }
]

const LICENSE_OPTIONS = [
  { value: "personal-use", label: "Personal Use" },
  { value: "small-business", label: "Small Business" },
  { value: "commercial", label: "Commercial" },
  { value: "extended-commercial", label: "Extended Commercial" },
  { value: "exclusive", label: "Exclusive" }
]

const CATEGORY_OPTIONS = [
  { value: "", label: "Select Category" },
  { value: "apparel", label: "Apparel" },
  { value: "cutting-board", label: "Cutting Board" },
  { value: "mug", label: "Mug" },
  { value: "hat", label: "Hat" },
  { value: "decal", label: "Decal" },
  { value: "digital-art", label: "Digital Art" },
  { value: "printable", label: "Printable" },
  { value: "service", label: "Service" },
  { value: "custom", label: "Custom" }
]

const CATEGORY_VARIANTS = {
  apparel: ["S", "M", "L", "XL", "XXL", "3XL"],
  "cutting-board": ["12 inch", "18 inch", "24 inch"],
  mug: ["11 oz", "15 oz", "20 oz"],
  hat: ["One Size"],
  decal: ["Small", "Medium", "Large"],
  custom: []
}

const normalizeVariantSize = (size) => {
  const value = String(size || "").trim()

  const map = {
    "3XL": "3XL",
    "3X": "3XL",
    XXXL: "3XL",
    XXL: "XXL",
    XL: "XL",
    L: "L",
    M: "M",
    S: "S",
    SMALL: "Small",
    MEDIUM: "Medium",
    LARGE: "Large",
    "ONE SIZE": "One Size"
  }

  return map[value.toUpperCase()] || value
}

const defaultForm = {
  name: "",
  description: "",
  basePrice: "",
  stock: "",
  category: "",
  productType: "physical",

  customVariant: "",
  colors: "",
  sizes: [],
  sizePrices: {},
  colorImages: {},

  digitalProduct: {
    previewImage: "",
    downloadFile: "",
    licenseType: "personal-use",
    dpi: "300",
    printSize: "",
    fileFormats: "",
    downloadLimit: "3",
    licenseRequired: true
  }
}

export default function AdminProducts() {
  const [form, setForm] = useState(defaultForm)
  const [creating, setCreating] = useState(false)

  const selectedCategory = String(form.category || "").trim().toLowerCase()
  const selectedProductType = String(form.productType || "physical").trim().toLowerCase()
  const variantOptions = CATEGORY_VARIANTS[selectedCategory] || []

  const isPhysical = selectedProductType === "physical"
  const isDigital = selectedProductType === "digital"
  const isService = selectedProductType === "service"

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm(prev => {
      if (name === "category") {
        return {
          ...prev,
          category: value,
          sizes: [],
          sizePrices: {},
          customVariant: ""
        }
      }

      if (name === "productType") {
        return {
          ...prev,
          productType: value,
          category: value === "digital"
            ? "digital-art"
            : value === "service"
              ? "service"
              : prev.category,
          sizes: value === "physical" ? prev.sizes : [],
          sizePrices: value === "physical" ? prev.sizePrices : {},
          customVariant: value === "physical" ? prev.customVariant : "",
          colors: value === "physical" ? prev.colors : "",
          colorImages: value === "physical" ? prev.colorImages : {}
        }
      }

      return {
        ...prev,
        [name]: value
      }
    })
  }

  const handleDigitalChange = (e) => {
    const { name, value, type, checked } = e.target

    setForm(prev => ({
      ...prev,
      digitalProduct: {
        ...prev.digitalProduct,
        [name]: type === "checkbox" ? checked : value
      }
    }))
  }

  const getColorList = () => {
    return form.colors
      .split(",")
      .map(c => c.trim())
      .filter(Boolean)
  }

  const getCleanSizes = () => {
    return form.sizes
      .map(size => normalizeVariantSize(size))
      .filter(Boolean)
  }

  const toggleVariantOption = (size) => {
    const normalizedSize = normalizeVariantSize(size)

    setForm(prev => {
      const active = prev.sizes.includes(normalizedSize)

      const updatedSizes = active
        ? prev.sizes.filter(s => s !== normalizedSize)
        : [...prev.sizes, normalizedSize]

      const updatedSizePrices = { ...prev.sizePrices }

      if (active) {
        delete updatedSizePrices[normalizedSize]
      } else {
        updatedSizePrices[normalizedSize] = prev.basePrice || ""
      }

      return {
        ...prev,
        sizes: updatedSizes,
        sizePrices: updatedSizePrices
      }
    })
  }

  const addCustomVariant = () => {
    const customValue = normalizeVariantSize(form.customVariant)

    if (!customValue) {
      toast.error("Enter a custom option first")
      return
    }

    if (form.sizes.includes(customValue)) {
      toast.error("That option already exists")
      return
    }

    setForm(prev => ({
      ...prev,
      sizes: [...prev.sizes, customValue],
      sizePrices: {
        ...prev.sizePrices,
        [customValue]: prev.basePrice || ""
      },
      customVariant: ""
    }))
  }

  const handleImageUpload = (e, color) => {
    const files = Array.from(e.target.files || [])

    if (!files.length) return

    setForm(prev => ({
      ...prev,
      colorImages: {
        ...prev.colorImages,
        [color]: [
          ...(prev.colorImages[color] || []),
          ...files
        ]
      }
    }))

    e.target.value = ""
    toast.success(`${color} images added`)
  }

  const removeImage = (color, index) => {
    setForm(prev => {
      const arr = [...(prev.colorImages[color] || [])]
      arr.splice(index, 1)

      return {
        ...prev,
        colorImages: {
          ...prev.colorImages,
          [color]: arr
        }
      }
    })
  }

  const buildVariants = () => {
    const variants = []
    const colors = getColorList()
    const cleanSizes = getCleanSizes()

    colors.forEach(color => {
      cleanSizes.forEach(size => {
        const variantPrice = Number(form.sizePrices[size] || form.basePrice) || 0

        variants.push({
          color,
          size,
          stock: Number(form.stock) || 0,
          quantity: Number(form.stock) || 0,
          price: variantPrice,
          basePrice: variantPrice,
          listPrice: variantPrice
        })
      })
    })

    return variants
  }

  const buildDigitalProductPayload = () => {
    const fileFormats = form.digitalProduct.fileFormats
      .split(",")
      .map(format => format.trim())
      .filter(Boolean)

    return {
      previewImage: form.digitalProduct.previewImage,
      downloadFile: form.digitalProduct.downloadFile,
      licenseType: form.digitalProduct.licenseType,
      dpi: Number(form.digitalProduct.dpi) || 300,
      printSize: form.digitalProduct.printSize,
      fileFormats,
      downloadLimit: Number(form.digitalProduct.downloadLimit) || 3,
      licenseRequired: Boolean(form.digitalProduct.licenseRequired)
    }
  }

  const createProduct = async () => {
    const colors = getColorList()
    const cleanSizes = getCleanSizes()
    const variants = buildVariants()

    if (!form.name.trim()) return toast.error("Name required")
    if (!form.category) return toast.error("Select a category")
    if (!form.basePrice) return toast.error("Base price required")

    if (isPhysical) {
      if (!form.stock) return toast.error("Stock required")
      if (!colors.length) return toast.error("Add at least one color")
      if (!cleanSizes.length) return toast.error("Select at least one variant option")

      const missingPrice = cleanSizes.find(size => {
        return !form.sizePrices[size] && !form.basePrice
      })

      if (missingPrice) {
        return toast.error(`Add a price for ${missingPrice}`)
      }
    }

    if (isDigital) {
      if (!form.digitalProduct.licenseType) {
        return toast.error("Select a license type")
      }

      if (!form.digitalProduct.dpi) {
        return toast.error("Add DPI")
      }

      if (!form.digitalProduct.printSize) {
        return toast.error("Add print size")
      }

      if (!form.digitalProduct.fileFormats) {
        return toast.error("Add file formats")
      }
    }

    const price = Number(form.basePrice) || 0
    const stock = isPhysical ? Number(form.stock) || 0 : 999999

    const formData = new FormData()

    formData.append("name", form.name.trim())
    formData.append("description", form.description)
    formData.append("category", selectedCategory)

    formData.append("productType", selectedProductType)
    formData.append("digitalProduct", JSON.stringify(
      isDigital ? buildDigitalProductPayload() : {}
    ))

    formData.append("price", price)
    formData.append("basePrice", price)
    formData.append("listPrice", price)

    formData.append("stock", stock)
    formData.append("quantity", stock)

    formData.append("sizes", JSON.stringify(isPhysical ? cleanSizes : []))
    formData.append(
      "colors",
      JSON.stringify(isPhysical ? colors.map(name => ({ name })) : [])
    )
    formData.append("variants", JSON.stringify(isPhysical ? variants : []))

    if (isPhysical) {
      Object.entries(form.colorImages).forEach(([color, files]) => {
        files.forEach(file => {
          formData.append("images", file)
          formData.append("imageColors", color)
        })
      })
    }

    try {
      setCreating(true)

      await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      toast.success("Product created")
      setForm(defaultForm)
    } catch (err) {
      console.error("❌ PRODUCT ERROR STATUS:", err.response?.status)
      console.error("❌ PRODUCT ERROR DATA:", err.response?.data)
      console.error("❌ PRODUCT ERROR FULL:", err)

      toast.error(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Create failed"
      )
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={page}>
      <h1 style={heading}>Admin Products</h1>

      <div style={card}>
        <h2 style={sectionHeading}>Create Product</h2>

        <label style={label}>Product Type</label>
        <select
          name="productType"
          value={form.productType}
          onChange={handleChange}
          style={input}
        >
          {PRODUCT_TYPE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          name="name"
          value={form.name}
          placeholder="Product Name"
          onChange={handleChange}
          style={input}
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          style={input}
        >
          {CATEGORY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {form.category && (
          <p style={selectedText}>
            Selected Category: <strong>{selectedCategory}</strong>
          </p>
        )}

        <input
          name="basePrice"
          value={form.basePrice}
          placeholder={isDigital ? "Digital Product Price" : isService ? "Service Price" : "Base Price"}
          type="number"
          min="0"
          onChange={handleChange}
          style={input}
        />

        {isPhysical && (
          <input
            name="stock"
            value={form.stock}
            placeholder="Stock"
            type="number"
            min="0"
            onChange={handleChange}
            style={input}
          />
        )}

        {isPhysical && (
          <input
            name="colors"
            value={form.colors}
            placeholder="Colors: Black, White, Red"
            onChange={handleChange}
            style={input}
          />
        )}

        <textarea
          name="description"
          value={form.description}
          placeholder="Description"
          onChange={handleChange}
          style={textarea}
        />

        {isDigital && (
          <div style={digitalBox}>
            <h3 style={sectionTitle}>Digital Product Details</h3>

            <select
              name="licenseType"
              value={form.digitalProduct.licenseType}
              onChange={handleDigitalChange}
              style={input}
            >
              {LICENSE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <input
              name="dpi"
              value={form.digitalProduct.dpi}
              placeholder="DPI, example: 300"
              type="number"
              min="72"
              onChange={handleDigitalChange}
              style={input}
            />

            <input
              name="printSize"
              value={form.digitalProduct.printSize}
              placeholder='Print Size, example: 12"x18" or 8"x10"'
              onChange={handleDigitalChange}
              style={input}
            />

            <input
              name="fileFormats"
              value={form.digitalProduct.fileFormats}
              placeholder="File Formats, example: PNG, PDF, SVG"
              onChange={handleDigitalChange}
              style={input}
            />

            <input
              name="downloadLimit"
              value={form.digitalProduct.downloadLimit}
              placeholder="Download Limit"
              type="number"
              min="1"
              onChange={handleDigitalChange}
              style={input}
            />

            <input
              name="previewImage"
              value={form.digitalProduct.previewImage}
              placeholder="Preview Image URL/path, optional"
              onChange={handleDigitalChange}
              style={input}
            />

            <input
              name="downloadFile"
              value={form.digitalProduct.downloadFile}
              placeholder="High-res Download File path, add later"
              onChange={handleDigitalChange}
              style={input}
            />

            <label style={checkboxRow}>
              <input
                name="licenseRequired"
                type="checkbox"
                checked={form.digitalProduct.licenseRequired}
                onChange={handleDigitalChange}
              />
              License agreement required before download
            </label>

            <p style={helperText}>
              Store preview should be low-res or watermarked. The download file should be the high-res 300 DPI+ version after payment.
            </p>
          </div>
        )}

        {isPhysical && (
          <>
            <h3 style={sectionTitle}>Variant Options</h3>

            {!selectedCategory ? (
              <p style={helperText}>Choose a category to show variant options.</p>
            ) : (
              <>
                {variantOptions.length > 0 ? (
                  <div style={variantButtonWrap}>
                    {variantOptions.map(size => {
                      const normalizedSize = normalizeVariantSize(size)
                      const active = form.sizes.includes(normalizedSize)

                      return (
                        <button
                          key={normalizedSize}
                          type="button"
                          onClick={() => toggleVariantOption(normalizedSize)}
                          style={{
                            ...variantBtn,
                            background: active ? "#22c55e" : "#1e293b",
                            color: active ? "#020617" : "#fff"
                          }}
                        >
                          {normalizedSize}
                        </button>
                      )
                    })}
                  </div>
                ) : selectedCategory !== "custom" ? (
                  <p style={helperText}>
                    No preset variants found for this category.
                  </p>
                ) : null}

                {selectedCategory === "custom" && (
                  <div style={customWrap}>
                    <input
                      name="customVariant"
                      value={form.customVariant}
                      placeholder="Add custom option, example: 30 inch, Jumbo, Bundle"
                      onChange={handleChange}
                      style={input}
                    />

                    <button
                      type="button"
                      onClick={addCustomVariant}
                      style={secondaryBtn}
                    >
                      Add Custom Option
                    </button>
                  </div>
                )}
              </>
            )}

            {form.sizes.length > 0 && (
              <div style={variantPriceBox}>
                <h3 style={sectionTitle}>Variant Prices</h3>

                {form.sizes.map(size => (
                  <div key={size} style={variantPriceRow}>
                    <span style={variantSizeLabel}>{size}</span>

                    <input
                      type="number"
                      min="0"
                      placeholder={`Price for ${size}`}
                      value={form.sizePrices[size] || ""}
                      onChange={(e) => {
                        const { value } = e.target

                        setForm(prev => ({
                          ...prev,
                          sizePrices: {
                            ...prev.sizePrices,
                            [size]: value
                          }
                        }))
                      }}
                      style={variantPriceInput}
                    />
                  </div>
                ))}
              </div>
            )}

            {getColorList().map(color => (
              <div key={color} style={uploadBox}>
                <h4 style={colorTitle}>{color} Images</h4>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, color)}
                  style={fileInput}
                />

                <div style={previewWrap}>
                  {(form.colorImages[color] || []).map((file, i) => (
                    <div key={`${color}-${i}`} style={previewItem}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`${color} preview ${i + 1}`}
                        style={previewImage}
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(color, i)}
                        style={removeBtn}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {isService && (
          <div style={digitalBox}>
            <h3 style={sectionTitle}>Service Product</h3>
            <p style={helperText}>
              This product is saved as a service. Later, we can connect this to quote requests, project scheduling, and custom agreements.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={createProduct}
          disabled={creating}
          style={{
            ...btn,
            opacity: creating ? 0.7 : 1,
            cursor: creating ? "not-allowed" : "pointer"
          }}
        >
          {creating ? "Creating Product..." : "Add Product"}
        </button>
      </div>
    </div>
  )
}

const page = {
  padding: 20,
  color: "white",
  background: "#020617",
  minHeight: "100vh"
}

const heading = {
  marginTop: 0,
  marginBottom: 20
}

const card = {
  background: "#0f172a",
  padding: 20,
  borderRadius: 14,
  border: "1px solid #1e293b",
  maxWidth: 900
}

const sectionHeading = {
  marginTop: 0,
  marginBottom: 16
}

const label = {
  display: "block",
  marginBottom: 6,
  color: "#cbd5e1",
  fontWeight: 700
}

const input = {
  display: "block",
  marginBottom: 10,
  padding: 12,
  width: "100%",
  borderRadius: 8,
  border: "none",
  boxSizing: "border-box",
  background: "#fff",
  color: "#000"
}

const textarea = {
  display: "block",
  marginBottom: 10,
  padding: 12,
  width: "100%",
  minHeight: 90,
  borderRadius: 8,
  border: "none",
  boxSizing: "border-box",
  background: "#fff",
  color: "#000",
  resize: "vertical"
}

const selectedText = {
  marginTop: -4,
  marginBottom: 12,
  color: "#38bdf8"
}

const sectionTitle = {
  marginTop: 18,
  marginBottom: 10
}

const helperText = {
  color: "#94a3b8",
  marginTop: 0
}

const digitalBox = {
  background: "#020617",
  padding: 14,
  borderRadius: 12,
  marginTop: 16,
  marginBottom: 18,
  border: "1px solid #1e293b"
}

const checkboxRow = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  marginTop: 8,
  marginBottom: 12,
  color: "#e5e7eb"
}

const variantButtonWrap = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 16
}

const variantBtn = {
  padding: "8px 14px",
  border: "none",
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer"
}

const customWrap = {
  display: "grid",
  gridTemplateColumns: "1fr 180px",
  gap: 10,
  alignItems: "start",
  marginBottom: 16
}

const secondaryBtn = {
  padding: 12,
  background: "#38bdf8",
  color: "#020617",
  border: "none",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer"
}

const variantPriceBox = {
  background: "#020617",
  padding: 14,
  borderRadius: 12,
  marginBottom: 18,
  border: "1px solid #1e293b"
}

const variantPriceRow = {
  display: "grid",
  gridTemplateColumns: "120px 1fr",
  gap: 10,
  alignItems: "center",
  marginBottom: 10
}

const variantSizeLabel = {
  fontWeight: 700,
  color: "#e5e7eb"
}

const variantPriceInput = {
  padding: 10,
  width: "100%",
  background: "#fff",
  color: "#000",
  border: "none",
  borderRadius: 8,
  boxSizing: "border-box"
}

const uploadBox = {
  marginTop: 20,
  padding: 12,
  background: "#020617",
  borderRadius: 12,
  border: "1px solid #1e293b"
}

const colorTitle = {
  marginTop: 0
}

const fileInput = {
  ...input,
  background: "#fff",
  color: "#000"
}

const previewWrap = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap"
}

const previewItem = {
  position: "relative"
}

const previewImage = {
  width: 80,
  height: 80,
  objectFit: "cover",
  borderRadius: 8,
  border: "1px solid #334155"
}

const removeBtn = {
  display: "block",
  marginTop: 4,
  width: "100%",
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: 4,
  cursor: "pointer"
}

const btn = {
  padding: 14,
  marginTop: 20,
  background: "#22c55e",
  color: "#020617",
  border: "none",
  borderRadius: 10,
  width: "100%",
  fontWeight: 800,
  fontSize: 16
}