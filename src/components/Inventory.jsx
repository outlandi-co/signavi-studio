import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react"

import api from "../../services/api"

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const getProductArray = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.products)) return data.products

  return []
}

const getStock = (product = {}) => {
  if (product.variants?.length) {
    return product.variants.reduce(
      (sum, variant) =>
        sum + Number(variant.stock ?? variant.quantity ?? 0),
      0
    )
  }

  return Number(product.stock ?? product.quantity ?? 0)
}

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState("")

  const [editData, setEditData] = useState({
    name: "",
    price: "",
    stock: "",
    category: ""
  })

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)

      const res = await api.get("/products")

      setProducts(getProductArray(res.data))
    } catch (err) {
      console.error("❌ LOAD INVENTORY ERROR:", err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts()
    }, 0)

    return () => clearTimeout(timer)
  }, [loadProducts])

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products

    const term = search.trim().toLowerCase()

    return products.filter((product) =>
      [
        product.name,
        product.sku,
        product.category,
        product.productType
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    )
  }, [products, search])

  const totalStock = useMemo(() => {
    return products.reduce(
      (sum, product) => sum + getStock(product),
      0
    )
  }, [products])

  const lowStockCount = useMemo(() => {
    return products.filter((product) => {
      const stock = getStock(product)
      return stock > 0 && stock < 5
    }).length
  }, [products])

  const outOfStockCount = useMemo(() => {
    return products.filter((product) => getStock(product) <= 0).length
  }, [products])

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return

    try {
      await api.delete(`/products/${id}`)

      setProducts((prev) =>
        prev.filter((product) => product._id !== id)
      )
    } catch (err) {
      console.error("❌ DELETE PRODUCT ERROR:", err)
      alert("Failed to delete product.")
    }
  }

  const startEdit = (product) => {
    setEditingId(product._id)

    setEditData({
      name: product.name || "",
      price:
        product.price ||
        product.basePrice ||
        product.listPrice ||
        "",
      stock: getStock(product),
      category: product.category || ""
    })
  }

  const cancelEdit = () => {
    setEditingId(null)

    setEditData({
      name: "",
      price: "",
      stock: "",
      category: ""
    })
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setEditData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const saveEdit = async (id) => {
    try {
      const payload = {
        name: editData.name.trim(),
        price: Number(editData.price) || 0,
        stock: Number(editData.stock) || 0,
        quantity: Number(editData.stock) || 0,
        category: editData.category.trim()
      }

      const res = await api.patch(`/products/${id}`, payload)

      const updatedProduct =
        res.data?.data ||
        res.data?.product ||
        res.data

      setProducts((prev) =>
        prev.map((product) =>
          product._id === id
            ? {
                ...product,
                ...updatedProduct
              }
            : product
        )
      )

      cancelEdit()
    } catch (err) {
      console.error("❌ UPDATE PRODUCT ERROR:", err)

      try {
        const res = await api.put(`/products/${id}`, {
          name: editData.name.trim(),
          price: Number(editData.price) || 0,
          stock: Number(editData.stock) || 0,
          quantity: Number(editData.stock) || 0,
          category: editData.category.trim()
        })

        const updatedProduct =
          res.data?.data ||
          res.data?.product ||
          res.data

        setProducts((prev) =>
          prev.map((product) =>
            product._id === id
              ? {
                  ...product,
                  ...updatedProduct
                }
              : product
          )
        )

        cancelEdit()
      } catch (fallbackErr) {
        console.error("❌ UPDATE FALLBACK ERROR:", fallbackErr)
        alert("Failed to update product.")
      }
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        Loading inventory...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] p-6 text-white">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            Inventory
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Manage product names, pricing, categories, and stock levels.
          </p>
        </div>

        <button
          type="button"
          onClick={loadProducts}
          className="rounded-full bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
        >
          Refresh
        </button>
      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-3">
        <MetricCard
          label="Total Stock"
          value={totalStock}
          accent="text-cyan-300"
        />

        <MetricCard
          label="Low Stock"
          value={lowStockCount}
          accent="text-yellow-300"
        />

        <MetricCard
          label="Out of Stock"
          value={outOfStockCount}
          accent="text-red-300"
        />
      </div>

      <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search product, SKU, category, type..."
          className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-[#020617] text-sm text-slate-400">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center text-slate-400"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stock = getStock(product)
                  const lowStock = stock > 0 && stock < 5
                  const outOfStock = stock <= 0
                  const isEditing = editingId === product._id

                  return (
                    <tr
                      key={product._id}
                      className="border-t border-slate-800 text-sm transition hover:bg-cyan-400/5"
                    >
                      <td className="p-4">
                        {isEditing ? (
                          <input
                            name="name"
                            value={editData.name}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        ) : (
                          <div>
                            <p className="font-bold text-white">
                              {product.name || "Untitled"}
                            </p>

                            <p className="text-xs text-slate-500">
                              {product.sku || product._id}
                            </p>
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input
                            name="category"
                            value={editData.category}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        ) : (
                          <span className="capitalize text-slate-300">
                            {product.category || "general"}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={editData.price}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        ) : (
                          <span className="font-bold text-emerald-300">
                            {money(
                              product.price ||
                                product.basePrice ||
                                product.listPrice ||
                                0
                            )}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input
                            name="stock"
                            type="number"
                            min="0"
                            value={editData.stock}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        ) : (
                          <span
                            className={
                              outOfStock
                                ? "font-bold text-red-300"
                                : lowStock
                                  ? "font-bold text-yellow-300"
                                  : "font-bold text-slate-200"
                            }
                          >
                            {stock}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {outOfStock ? (
                          <span className="rounded-full border border-red-400/40 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300">
                            Out
                          </span>
                        ) : lowStock ? (
                          <span className="rounded-full border border-yellow-400/40 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-300">
                            Low
                          </span>
                        ) : (
                          <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                            In Stock
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(product._id)}
                              className="rounded-xl bg-emerald-500 px-4 py-2 font-bold text-black hover:bg-emerald-400"
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="rounded-xl bg-slate-700 px-4 py-2 font-bold text-white hover:bg-slate-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(product)}
                              className="rounded-xl bg-cyan-500 px-4 py-2 font-bold text-black hover:bg-cyan-400"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteProduct(product._id)}
                              className="rounded-xl bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-400"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

function MetricCard({
  label,
  value,
  accent
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
      <p className="mb-2 text-sm text-slate-400">
        {label}
      </p>

      <h2 className={`text-3xl font-extrabold ${accent}`}>
        {value}
      </h2>
    </div>
  )
}

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-[#020617] px-3 py-2 text-white outline-none focus:border-cyan-400"