
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../../services/api"
import MaterialUsageEditor, { useMaterialsCatalog, serializeMaterialUsage } from "./MaterialUsageEditor"

const blankVariant = () => ({
  color: "",
  size: "",
  stock: "",
  price: "",
  basePrice: "",
  listPrice: "",
  images: [],
  materialUsage: []
})

const blankShipping = {
  weightOz: "",
  lengthIn: "",
  widthIn: "",
  heightIn: "",
  packagingType: "unassigned",
  shipSeparately: false
}

const money = (value = 0) =>
  Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })

const box =
  "rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-6"

const field =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"

const label =
  "grid gap-2 text-sm font-bold text-slate-300"

const hint =
  "text-sm leading-relaxed text-slate-400"

export default function CreateStoreProduct() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    productType: "physical"
  })

  const [shipping, setShipping] = useState(blankShipping)
  const [variants, setVariants] = useState([blankVariant()])
  const [saving, setSaving] = useState(false)
  const [materialUsage, setMaterialUsage] = useState([])
  const { materials, loading: materialsLoading, error: materialsError } = useMaterialsCatalog()

  const updateForm = (fieldName, value) =>
    setForm((prev) => ({
      ...prev,
      [fieldName]: value
    }))

  const updateShipping = (fieldName, value) =>
    setShipping((prev) => ({
      ...prev,
      [fieldName]: value
    }))

  const updateVariant = (index, fieldName, value) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index
          ? { ...variant, [fieldName]: value }
          : variant
      )
    )
  }

  const updateVariantImages = (index, files) => {
    updateVariant(
      index,
      "images",
      Array.from(files || [])
    )
  }

  const applyMarkup = (index, markupPercent) => {
    setVariants((prev) =>
      prev.map((variant, i) => {
        if (i !== index) return variant

        const cost = Number(variant.basePrice || 0)

        if (!(cost > 0)) {
          alert("Enter Base Price / Cost first.")
          return variant
        }

        const price = (
          cost * (1 + markupPercent / 100)
        ).toFixed(2)

        return {
          ...variant,
          price,
          listPrice: price
        }
      })
    )
  }

  const createProduct = async (event) => {
    event.preventDefault()

    if (saving) return

    const validVariants = variants.filter(
      (variant) =>
        variant.color.trim() &&
        variant.size.trim()
    )

    if (validVariants.length === 0) {
      alert("Add at least one color/size variant.")
      return
    }

    let productShipping = null

    if (form.productType === "physical") {
      const keys = [
        "weightOz",
        "lengthIn",
        "widthIn",
        "heightIn"
      ]

      const measurementsValid = keys.every((key) => {
        const raw = String(shipping[key]).trim()

        return (
          raw !== "" &&
          Number.isFinite(Number(raw)) &&
          Number(raw) > 0
        )
      })

      if (
        !measurementsValid ||
        shipping.packagingType === "unassigned"
      ) {
        alert(
          "For a physical product, enter all four positive shipping measurements and choose a packaging type."
        )
        return
      }

      productShipping = {
        weightOz: Number(shipping.weightOz),
        lengthIn: Number(shipping.lengthIn),
        widthIn: Number(shipping.widthIn),
        heightIn: Number(shipping.heightIn),
        packagingType: shipping.packagingType,
        shipSeparately: Boolean(
          shipping.shipSeparately
        )
      }
    }

    const firstVariant = validVariants[0]

    const uniqueSizes = [
      ...new Set(
        validVariants.map((variant) =>
          variant.size.trim()
        )
      )
    ]

    const uniqueColors = [
      ...new Map(
        validVariants.map((variant) => [
          variant.color.trim(),
          { name: variant.color.trim() }
        ])
      ).values()
    ]

    const totalStock = validVariants.reduce(
      (sum, variant) =>
        sum + Number(variant.stock || 0),
      0
    )

    const formData = new FormData()

    formData.append("name", form.name)
    formData.append("description", form.description)
    formData.append("category", form.category)
    formData.append("productType", form.productType)

    formData.append(
      "price",
      firstVariant.price || 0
    )

    formData.append(
      "basePrice",
      firstVariant.basePrice ||
        firstVariant.price ||
        0
    )

    formData.append(
      "listPrice",
      firstVariant.listPrice ||
        firstVariant.price ||
        0
    )

    formData.append(
      "cost",
      firstVariant.basePrice || 0
    )

    formData.append(
      "unitCost",
      firstVariant.basePrice || 0
    )

    formData.append("stock", totalStock)
    formData.append("quantity", totalStock)

    formData.append("storefrontVisible", "true")
    formData.append("storefront", "signavi_store")
    formData.append("salesChannel", "signavi_store")
    formData.append("active", "true")

    formData.append(
      "sizes",
      JSON.stringify(uniqueSizes)
    )

    formData.append(
      "colors",
      JSON.stringify(uniqueColors)
    )
    formData.append("materialUsage", JSON.stringify(serializeMaterialUsage(materialUsage)))

    // Backend route must parse this JSON field.
    if (productShipping) {
      formData.append(
        "shipping",
        JSON.stringify(productShipping)
      )
    }

    const cleanVariants = validVariants.map(
      (variant) => ({
        color: variant.color.trim(),
        size: variant.size.trim(),
        stock: Number(variant.stock || 0),
        quantity: Number(variant.stock || 0),

        price: Number(
          variant.price ||
          firstVariant.price ||
          0
        ),

        basePrice: Number(
          variant.basePrice ||
          variant.price ||
          firstVariant.price ||
          0
        ),

        listPrice: Number(
          variant.listPrice ||
          variant.price ||
          firstVariant.price ||
          0
        ),

        cost: Number(
          variant.basePrice ||
          variant.price ||
          firstVariant.price ||
          0
        ),

        unitCost: Number(
          variant.basePrice ||
          variant.price ||
          firstVariant.price ||
          0
        ),
        materialUsage: serializeMaterialUsage(variant.materialUsage || [])
      })
    )

    formData.append(
      "variants",
      JSON.stringify(cleanVariants)
    )

    validVariants.forEach((variant) => {
      variant.images.forEach((file) => {
        formData.append("images", file)
        formData.append(
          "imageColors",
          variant.color.trim()
        )
      })
    })

    try {
      setSaving(true)

      await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      navigate("/admin/signavi-store/products")
    } catch (err) {
      console.error(
        "CREATE STORE PRODUCT ERROR:",
        err
      )

      alert(
        err?.response?.data?.message ||
        "Failed to create store product"
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-5xl">

        <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">
              Create Store Product
            </h1>

            <p className="mt-2 text-slate-400">
              Add a product to signavi.store with
              variants, inventory, and shipping settings.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/signavi-store/products")
            }
            className="rounded-xl border border-cyan-400 px-4 py-3 font-bold text-cyan-300"
          >
            ← Back
          </button>
        </header>

        <form
          onSubmit={createProduct}
          className="space-y-6"
        >

          {/* PRODUCT INFORMATION */}

          <section className={box}>
            <h2 className="mb-5 text-xl font-bold">
              Product Info
            </h2>

            <div className="grid gap-5">

              <label className={label}>
                Product Name
                <input
                  required
                  className={field}
                  value={form.name}
                  onChange={(e) =>
                    updateForm("name", e.target.value)
                  }
                  placeholder="Example: Signavi Hoodie"
                />
              </label>

              <label className={label}>
                Description
                <textarea
                  className={`${field} min-h-28`}
                  value={form.description}
                  onChange={(e) =>
                    updateForm(
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Describe the product..."
                />
              </label>

              <label className={label}>
                Category
                <input
                  required
                  className={field}
                  value={form.category}
                  onChange={(e) =>
                    updateForm(
                      "category",
                      e.target.value
                    )
                  }
                  placeholder="Apparel, Accessories, Digital, etc."
                />
              </label>

              <label className={label}>
                Product Type
                <select
                  className={field}
                  value={form.productType}
                  onChange={(e) =>
                    updateForm(
                      "productType",
                      e.target.value
                    )
                  }
                >
                  <option value="physical">
                    Physical
                  </option>
                  <option value="digital">
                    Digital
                  </option>
                  <option value="service">
                    Service
                  </option>
                </select>
              </label>

            </div>
          </section>

          {/* SHIPPING INFORMATION */}

          {form.productType === "physical" && (
            <section className={box}>
              <h2 className="text-xl font-bold">
                Shipping Information
              </h2>

              <p className={`${hint} mb-5 mt-2`}>
                Measurements are for ONE item before
                packaging. Enter actual item weight and
                dimensions. A future packaging calculator
                will determine cartons for quantities
                such as 30 shirts. Do not enter a
                made-up shipping cost.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">

                {[
                  ["weightOz", "Item Weight (oz)"],
                  ["lengthIn", "Item Length (in)"],
                  ["widthIn", "Item Width (in)"],
                  ["heightIn", "Item Height (in)"]
                ].map(([key, title]) => (
                  <label
                    key={key}
                    className={label}
                  >
                    {title}

                    <input
                      required
                      type="number"
                      min="0.01"
                      step="any"
                      className={field}
                      value={shipping[key]}
                      onChange={(e) =>
                        updateShipping(
                          key,
                          e.target.value
                        )
                      }
                      placeholder="Enter measurement"
                    />
                  </label>
                ))}

                <label className={label}>
                  Packaging Category

                  <select
                    required
                    className={field}
                    value={shipping.packagingType}
                    onChange={(e) =>
                      updateShipping(
                        "packagingType",
                        e.target.value
                      )
                    }
                  >
                    <option value="unassigned">
                      Choose packaging type
                    </option>

                    <option value="mailer">
                      Mailer
                    </option>

                    <option value="box">
                      Box
                    </option>

                    <option value="fragile">
                      Fragile / Protective Packaging
                    </option>

                    <option value="oversized">
                      Oversized
                    </option>

                    <option value="custom">
                      Custom
                    </option>
                  </select>
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-slate-700 p-4 text-sm font-semibold text-slate-200">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-cyan-400"
                    checked={shipping.shipSeparately}
                    onChange={(e) =>
                      updateShipping(
                        "shipSeparately",
                        e.target.checked
                      )
                    }
                  />

                  Ship this item separately
                </label>
              </div>

              <p className={`${hint} mt-4`}>
                Settings apply to this product and
                its variants. Variant-specific weight
                overrides are not supported yet.
                Digital products and services do
                not require carrier shipping.
              </p>
            </section>
          )}

          {/* PRODUCT MATERIALS */}
          <section className={box}>
            <MaterialUsageEditor
              title="Shared Materials (all variants)"
              value={materialUsage}
              onChange={setMaterialUsage}
              materials={materials}
              loading={materialsLoading}
              error={materialsError}
            />
          </section>

          {/* PRODUCT VARIANTS */}

          <section className={box}>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  Variants
                </h2>

                <p className={`${hint} mt-2`}>
                  Add stock, base cost, markup
                  adjustments, and images by color/size.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setVariants((prev) => [
                    ...prev,
                    blankVariant()
                  ])
                }
                className="rounded-xl bg-emerald-500 px-4 py-3 font-bold text-black"
              >
                + Add Variant
              </button>
            </div>

            <div className="space-y-5">

              {variants.map((variant, index) => {
                const cost = Number(
                  variant.basePrice || 0
                )

                const sell = Number(
                  variant.listPrice ||
                  variant.price ||
                  0
                )

                const profit = sell - cost

                const markup =
                  cost > 0
                    ? (profit / cost) * 100
                    : 0

                const margin =
                  sell > 0
                    ? (profit / sell) * 100
                    : 0

                return (
                  <div
                    key={index}
                    className="space-y-5 rounded-2xl border border-slate-700 bg-slate-950 p-5"
                  >

                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold text-cyan-300">
                        Variant #{index + 1}
                      </h3>

                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setVariants((prev) =>
                              prev.filter(
                                (_, i) => i !== index
                              )
                            )
                          }
                          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">

                      {[
                        ["color", "Color", "text", "Black"],
                        ["size", "Size", "text", "M"],
                        [
                          "stock",
                          "Quantity In Stock",
                          "number",
                          "0"
                        ],
                        [
                          "basePrice",
                          "Base Price / Cost",
                          "number",
                          "20.00"
                        ],
                        [
                          "price",
                          "Selling Price",
                          "number",
                          "30.00"
                        ],
                        [
                          "listPrice",
                          "List Price",
                          "number",
                          "Optional"
                        ]
                      ].map(
                        ([
                          key,
                          title,
                          type,
                          placeholder
                        ]) => (
                          <label
                            key={key}
                            className={label}
                          >
                            {title}

                            <input
                              className={field}
                              type={type}
                              required={
                                key !== "listPrice"
                              }
                              min={
                                type === "number"
                                  ? "0"
                                  : undefined
                              }
                              step={
                                type === "number"
                                  ? key === "stock"
                                    ? "1"
                                    : "0.01"
                                  : undefined
                              }
                              placeholder={placeholder}
                              value={variant[key]}
                              onChange={(e) => {
                                updateVariant(
                                  index,
                                  key,
                                  e.target.value
                                )

                                if (key === "price") {
                                  updateVariant(
                                    index,
                                    "listPrice",
                                    e.target.value
                                  )
                                }
                              }}
                            />
                          </label>
                        )
                      )}
                    </div>

                    {/* PRICING & MARKUP */}

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                      <h4 className="font-bold">
                        Markup Adjustment
                      </h4>

                      <p className={`${hint} my-2`}>
                        Markup buttons update Selling
                        Price and List Price from
                        Base Price / Cost.
                      </p>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {[40, 50, 60, 80].map(
                          (percent) => (
                            <button
                              key={percent}
                              type="button"
                              onClick={() =>
                                applyMarkup(
                                  index,
                                  percent
                                )
                              }
                              className="rounded-lg bg-cyan-500 px-3 py-2 font-bold text-black"
                            >
                              {percent}% Markup
                            </button>
                          )
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
                        {[
                          ["Cost", money(cost)],
                          ["Sell", money(sell)],
                          ["Profit", money(profit)],
                          [
                            "Markup",
                            `${markup.toFixed(1)}%`
                          ],
                          [
                            "Margin",
                            `${margin.toFixed(1)}%`
                          ]
                        ].map(([title, value]) => (
                          <div
                            key={title}
                            className="rounded-lg border border-slate-800 bg-slate-950 p-3"
                          >
                            <div className="text-xs uppercase text-slate-400">
                              {title}
                            </div>

                            <strong>{value}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    <MaterialUsageEditor
                      title="Materials for this variant"
                      value={variant.materialUsage || []}
                      onChange={(next) => updateVariant(index, "materialUsage", next)}
                      materials={materials}
                      loading={materialsLoading}
                      error={materialsError}
                    />

                    {/* VARIANT IMAGES */}

                    <label className={label}>
                      Images for this color

                      <input
                        className="text-slate-200"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) =>
                          updateVariantImages(
                            index,
                            e.target.files
                          )
                        }
                      />

                      {variant.images.length > 0 && (
                        <span className={hint}>
                          {variant.images.length}
                          {" "}image(s) selected for{" "}
                          {variant.color ||
                            "this variant"}
                        </span>
                      )}
                    </label>

                  </div>
                )
              })}

            </div>
          </section>

          {/* STOREFRONT DEFAULTS */}

          <section className="rounded-2xl border border-sky-500 bg-sky-950 p-5 text-sky-100">
            <h2 className="mb-3 text-xl font-bold">
              Storefront Defaults
            </h2>

            <ul className="list-inside list-disc space-y-1">
              <li>storefrontVisible: true</li>
              <li>storefront: signavi_store</li>
              <li>salesChannel: signavi_store</li>
            </ul>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-cyan-400 px-5 py-4 text-lg font-bold text-slate-950 hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-50"
          >
            {saving
              ? "Creating..."
              : "Create Store Product"}
          </button>

        </form>
      </div>
    </main>
  )
}
