import { useEffect, useState } from "react"
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
  { value: "photography", label: "Photography" },
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

const API_IMAGE_BASE =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://signavi-backend.onrender.com"

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
  existingVariantImages: {},

  digitalProduct: {
    previewImage: "",
    previewFiles: [],
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

  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)

  const selectedCategory = String(form.category || "").trim().toLowerCase()
  const selectedProductType = String(form.productType || "physical").trim().toLowerCase()
  const variantOptions = CATEGORY_VARIANTS[selectedCategory] || []

  const isPhysical = selectedProductType === "physical"
  const isDigital = selectedProductType === "digital"
  const isService = selectedProductType === "service"

  function loadProducts(showLoader = true) {
    if (showLoader) {
      setLoadingProducts(true)
    }

    api.get("/products")
      .then(res => {
        const productData = Array.isArray(res.data)
          ? res.data
          : res.data?.data || []

        setProducts(productData)
      })
      .catch(err => {
        console.error("❌ LOAD PRODUCTS ERROR:", err.response?.data || err)
        toast.error("Failed to load products")
      })
      .finally(() => {
        setLoadingProducts(false)
      })
  }

  useEffect(() => {
    let active = true

    api.get("/products")
      .then(res => {
        if (!active) return

        const productData = Array.isArray(res.data)
          ? res.data
          : res.data?.data || []

        setProducts(productData)
      })
      .catch(err => {
        if (!active) return

        console.error("❌ LOAD PRODUCTS ERROR:", err.response?.data || err)
        toast.error("Failed to load products")
      })
      .finally(() => {
        if (!active) return

        setLoadingProducts(false)
      })

    return () => {
      active = false
    }
  }, [])

  const resetForm = () => {
    setForm(defaultForm)
    setEditingProduct(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm(prev => {
      if (name === "category") {
        return {
          ...prev,
          category: value,
          sizes: [],
          sizePrices: {},
          customVariant: "",
          existingVariantImages: {}
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
          colorImages: value === "physical" ? prev.colorImages : {},
          existingVariantImages: value === "physical" ? prev.existingVariantImages : {}
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

  const handleDigitalPreviewUpload = (e) => {
    const files = Array.from(e.target.files || [])

    if (!files.length) return

    setForm(prev => ({
      ...prev,
      digitalProduct: {
        ...prev.digitalProduct,
        previewFiles: files
      }
    }))

    e.target.value = ""
    toast.success("Digital artwork preview added")
  }

  const removeDigitalPreview = () => {
    setForm(prev => ({
      ...prev,
      digitalProduct: {
        ...prev.digitalProduct,
        previewFiles: []
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

  const getVariantImageKey = (color, size) => {
    return `${color}__${size}`
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
        const existingImages =
          form.existingVariantImages[getVariantImageKey(color, size)] || []

        variants.push({
          color,
          size,
          stock: Number(form.stock) || 0,
          quantity: Number(form.stock) || 0,
          price: variantPrice,
          basePrice: variantPrice,
          listPrice: variantPrice,
          images: existingImages
        })
      })
    })

    return variants
  }

  const buildDigitalProductPayload = () => {
    const fileFormats = String(form.digitalProduct.fileFormats || "")
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

  const validateForm = () => {
    const colors = getColorList()
    const cleanSizes = getCleanSizes()

    if (!form.name.trim()) {
      toast.error("Name required")
      return false
    }

    if (!form.category) {
      toast.error("Select a category")
      return false
    }

    if (!form.basePrice) {
      toast.error("Base price required")
      return false
    }

    if (isPhysical) {
      if (!form.stock) {
        toast.error("Stock required")
        return false
      }

      if (!colors.length) {
        toast.error("Add at least one color")
        return false
      }

      if (!cleanSizes.length) {
        toast.error("Select at least one variant option")
        return false
      }
    }

    if (isDigital) {
      if (!form.digitalProduct.licenseType) {
        toast.error("Select a license type")
        return false
      }

      if (!form.digitalProduct.dpi) {
        toast.error("Add DPI")
        return false
      }

      if (!form.digitalProduct.printSize) {
        toast.error("Add print size")
        return false
      }

      if (!form.digitalProduct.fileFormats) {
        toast.error("Add file formats")
        return false
      }

      if (
        !form.digitalProduct.previewImage &&
        !form.digitalProduct.previewFiles?.length
      ) {
        toast.error("Add a digital artwork preview image")
        return false
      }
    }

    return true
  }

  const buildFormData = () => {
    const colors = getColorList()
    const cleanSizes = getCleanSizes()
    const variants = buildVariants()

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

    if (isDigital && form.digitalProduct.previewFiles?.length > 0) {
      form.digitalProduct.previewFiles.forEach(file => {
        formData.append("images", file)
        formData.append("imageColors", "__digital_preview__")
      })
    }

    return formData
  }

  const saveProduct = async () => {
    if (!validateForm()) return

    try {
      setCreating(true)

      const formData = buildFormData()

      if (editingProduct?._id) {
        await api.patch(`/products/${editingProduct._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })

        toast.success("Product updated")
      } else {
        await api.post("/products", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })

        toast.success("Product created")
      }

      resetForm()
      loadProducts()
    } catch (err) {
      console.error("❌ PRODUCT ERROR STATUS:", err.response?.status)
      console.error("❌ PRODUCT ERROR DATA:", err.response?.data)
      console.error("❌ PRODUCT ERROR FULL:", err)

      toast.error(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Save failed"
      )
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (product) => {
    const productType = product.productType || "physical"
    const variants = product.variants || []

    const colors = product.colors?.length
      ? product.colors.map(color => color.name).filter(Boolean)
      : [...new Set(variants.map(variant => variant.color))].filter(Boolean)

    const sizes = product.sizes?.length
      ? product.sizes.map(normalizeVariantSize).filter(Boolean)
      : [...new Set(variants.map(variant => normalizeVariantSize(variant.size)))].filter(Boolean)

    const sizePrices = {}
    const existingVariantImages = {}

    variants.forEach(variant => {
      const size = normalizeVariantSize(variant.size)

      if (size && sizePrices[size] === undefined) {
        sizePrices[size] = String(
          variant.price ||
          variant.basePrice ||
          variant.listPrice ||
          product.price ||
          product.basePrice ||
          product.listPrice ||
          ""
        )
      }

      if (variant.color && size) {
        existingVariantImages[getVariantImageKey(variant.color, size)] =
          Array.isArray(variant.images) ? variant.images : []
      }
    })

    const digitalProduct = product.digitalProduct || {}

    setEditingProduct(product)

    setForm({
      name: product.name || "",
      description: product.description || "",
      basePrice: String(product.price || product.basePrice || product.listPrice || ""),
      stock: String(product.stock || product.quantity || ""),
      category: product.category || "",
      productType,

      customVariant: "",
      colors: colors.join(", "),
      sizes,
      sizePrices,
      colorImages: {},
      existingVariantImages,

      digitalProduct: {
        previewImage: digitalProduct.previewImage || product.image || "",
        previewFiles: [],
        downloadFile: digitalProduct.downloadFile || "",
        licenseType: digitalProduct.licenseType || "personal-use",
        dpi: String(digitalProduct.dpi || "300"),
        printSize: digitalProduct.printSize || "",
        fileFormats: Array.isArray(digitalProduct.fileFormats)
          ? digitalProduct.fileFormats.join(", ")
          : "",
        downloadLimit: String(digitalProduct.downloadLimit || "3"),
        licenseRequired: digitalProduct.licenseRequired !== false
      }
    })

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  const deleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This cannot be undone.`
    )

    if (!confirmed) return

    try {
      await api.delete(`/products/${product._id}`)

      toast.success("Product deleted")

      if (editingProduct?._id === product._id) {
        resetForm()
      }

      loadProducts()
    } catch (err) {
      console.error("❌ DELETE PRODUCT ERROR:", err.response?.data || err)
      toast.error(err.response?.data?.message || "Delete failed")
    }
  }

  const resolveImage = (image) => {
    if (!image) return "/image_placeholder/placeholder.png"
    if (typeof image !== "string") return "/image_placeholder/placeholder.png"

    if (image.startsWith("http")) return image
    if (image.startsWith("data:image")) return image
    if (image.startsWith("/uploads")) return `${API_IMAGE_BASE}${image}`
    if (image.startsWith("uploads")) return `${API_IMAGE_BASE}/${image}`

    return image
  }

  const getProductImage = (product) => {
    const variantImage = product.variants
      ?.find(variant => variant.images?.length)
      ?.images?.[0]

    const image =
      product.digitalProduct?.previewImage ||
      product.image ||
      product.images?.[0] ||
      variantImage

    return resolveImage(image)
  }

  const getProductPrice = (product) => {
    return Number(
      product.price ||
      product.basePrice ||
      product.listPrice ||
      product.variants?.[0]?.price ||
      0
    )
  }

  return (
    <div style={page}>
      <h1 style={heading}>Admin Products</h1>

      <div style={card}>
        <h2 style={sectionHeading}>
          {editingProduct ? "Edit Product" : "Create Product"}
        </h2>

        {editingProduct && (
          <div style={editNotice}>
            <span>
              <strong>Editing:</strong> {editingProduct.name}
            </span>

            <button
              type="button"
              onClick={resetForm}
              style={cancelEditBtn}
            >
              Cancel Edit
            </button>
          </div>
        )}

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

            <label style={label}>Digital Artwork Preview Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleDigitalPreviewUpload}
              style={fileInput}
            />

            {form.digitalProduct.previewImage && (
              <div style={existingPreviewBox}>
                <p style={helperText}>Current Preview</p>

                <img
                  src={resolveImage(form.digitalProduct.previewImage)}
                  alt="Current digital preview"
                  style={existingPreviewImage}
                />
              </div>
            )}

            {form.digitalProduct.previewFiles?.length > 0 && (
              <div style={previewWrap}>
                {form.digitalProduct.previewFiles.map((file, i) => (
                  <div key={`${file.name}-${i}`} style={previewItem}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Digital preview ${i + 1}`}
                      style={previewImage}
                    />

                    <button
                      type="button"
                      onClick={removeDigitalPreview}
                      style={removeBtn}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}

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
          onClick={saveProduct}
          disabled={creating}
          style={{
            ...btn,
            opacity: creating ? 0.7 : 1,
            cursor: creating ? "not-allowed" : "pointer"
          }}
        >
          {creating
            ? editingProduct
              ? "Updating Product..."
              : "Creating Product..."
            : editingProduct
              ? "Update Product"
              : "Add Product"}
        </button>
      </div>

      <div style={productsSection}>
        <div style={productsHeader}>
          <h2 style={sectionHeading}>Current Products</h2>

          <button
            type="button"
            onClick={loadProducts}
            style={refreshBtn}
          >
            Refresh
          </button>
        </div>

        {loadingProducts ? (
          <p style={helperText}>Loading products...</p>
        ) : products.length === 0 ? (
          <p style={helperText}>No products found.</p>
        ) : (
          <div style={productGrid}>
            {products.map(product => (
              <div key={product._id} style={productCard}>
                <div style={productImageBox}>
                  <img
                    src={getProductImage(product)}
                    alt={product.name || "Product"}
                    style={productImage}
                    onError={(e) => {
                      e.currentTarget.src = "/image_placeholder/placeholder.png"
                    }}
                  />
                </div>

                <div style={productInfo}>
                  <h3 style={productName}>{product.name}</h3>

                  <p style={productMeta}>
                    {product.productType || "physical"} • {product.category || "general"}
                  </p>

                  <p style={productPrice}>
                    ${getProductPrice(product).toFixed(2)}
                  </p>

                  {product.productType === "digital" && (
                    <p style={digitalBadge}>
                      Digital Download
                    </p>
                  )}

                  {product.variants?.length > 0 && (
                    <p style={productMeta}>
                      {product.variants.length} variants
                    </p>
                  )}
                </div>

                <div style={productActions}>
                  <button
                    type="button"
                    onClick={() => startEdit(product)}
                    style={editBtn}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteProduct(product)}
                    style={deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const page = {
  color: "white",
  minHeight: "100vh"
}

const heading = {
  marginTop: 0,
  marginBottom: 28,
  fontSize: 54,
  lineHeight: 0.95,
  letterSpacing: "-0.06em",
  fontWeight: 900
}

const card = {
  background: "#0f172a",
  padding: 28,
  borderRadius: 28,
  border: "1px solid #1e293b",
  maxWidth: 980
}

const sectionHeading = {
  marginTop: 0,
  marginBottom: 18,
  fontSize: 24,
  fontWeight: 900
}

const label = {
  display: "block",
  marginBottom: 8,
  color: "#cbd5e1",
  fontWeight: 800
}

const input = {
  display: "block",
  marginBottom: 12,
  padding: "14px 16px",
  width: "100%",
  borderRadius: 16,
  border: "1px solid #334155",
  boxSizing: "border-box",
  background: "#f8fafc",
  color: "#020617",
  fontSize: 16
}

const textarea = {
  ...input,
  minHeight: 110,
  resize: "vertical"
}

const selectedText = {
  marginTop: -4,
  marginBottom: 12,
  color: "#22d3ee"
}

const sectionTitle = {
  marginTop: 22,
  marginBottom: 12,
  fontSize: 20,
  fontWeight: 900
}

const helperText = {
  color: "#94a3b8",
  marginTop: 0
}

const digitalBox = {
  background: "#020617",
  padding: 18,
  borderRadius: 20,
  marginTop: 18,
  marginBottom: 20,
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
  gap: 10,
  marginBottom: 18
}

const variantBtn = {
  padding: "10px 16px",
  border: "none",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer"
}

const customWrap = {
  display: "grid",
  gridTemplateColumns: "1fr 200px",
  gap: 12,
  alignItems: "start",
  marginBottom: 18
}

const secondaryBtn = {
  padding: 14,
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  borderRadius: 16,
  fontWeight: 900,
  cursor: "pointer"
}

const variantPriceBox = {
  background: "#020617",
  padding: 18,
  borderRadius: 20,
  marginBottom: 20,
  border: "1px solid #1e293b"
}

const variantPriceRow = {
  display: "grid",
  gridTemplateColumns: "130px 1fr",
  gap: 12,
  alignItems: "center",
  marginBottom: 12
}

const variantSizeLabel = {
  fontWeight: 900,
  color: "#e5e7eb"
}

const variantPriceInput = {
  ...input,
  marginBottom: 0
}

const uploadBox = {
  marginTop: 22,
  padding: 18,
  background: "#020617",
  borderRadius: 20,
  border: "1px solid #1e293b"
}

const colorTitle = {
  marginTop: 0
}

const fileInput = {
  ...input
}

const previewWrap = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 10
}

const previewItem = {
  position: "relative"
}

const previewImage = {
  width: 86,
  height: 86,
  objectFit: "cover",
  borderRadius: 12,
  border: "1px solid #334155"
}

const existingPreviewBox = {
  marginBottom: 12
}

const existingPreviewImage = {
  width: 130,
  height: 130,
  objectFit: "contain",
  background: "#fff",
  borderRadius: 16,
  padding: 8,
  boxSizing: "border-box"
}

const removeBtn = {
  display: "block",
  marginTop: 4,
  width: "100%",
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: 5,
  cursor: "pointer"
}

const btn = {
  padding: 16,
  marginTop: 22,
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  borderRadius: 18,
  width: "100%",
  fontWeight: 900,
  fontSize: 17,
  cursor: "pointer"
}

const editNotice = {
  background: "rgba(34, 211, 238, 0.1)",
  border: "1px solid #22d3ee",
  color: "#e0faff",
  padding: 14,
  borderRadius: 16,
  marginBottom: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12
}

const cancelEditBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: 900
}

const productsSection = {
  marginTop: 36
}

const productsHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  maxWidth: 1180,
  marginBottom: 18
}

const refreshBtn = {
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  borderRadius: 16,
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 900
}

const productGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 280px))",
  gap: 28,
  maxWidth: 1180
}

const productCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 28,
  padding: 28,
  minHeight: 420,
  display: "flex",
  flexDirection: "column"
}

const productImageBox = {
  width: "100%",
  height: 200,
  background: "#111827",
  borderRadius: 22,
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 22
}

const productImage = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  padding: 18,
  boxSizing: "border-box"
}

const productInfo = {
  flex: 1
}

const productName = {
  margin: "0 0 12px",
  fontSize: 24,
  fontWeight: 900
}

const productMeta = {
  margin: "0 0 8px",
  color: "#94a3b8",
  fontSize: 15
}

const productPrice = {
  margin: "0 0 8px",
  color: "#f8fafc",
  fontWeight: 900,
  fontSize: 20
}

const digitalBadge = {
  margin: "0 0 8px",
  color: "#22d3ee",
  fontSize: 14,
  fontWeight: 900
}

const productActions = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginTop: 18
}

const editBtn = {
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  borderRadius: 16,
  padding: 12,
  cursor: "pointer",
  fontWeight: 900
}

const deleteBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 16,
  padding: 12,
  cursor: "pointer",
  fontWeight: 900
}