import {
  useMemo,
  useState,
} from "react"

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
}

const percent = (value = 0) => {
  return `${Number(value || 0).toFixed(1)}%`
}

const defaultServices = [
  {
    id: "screen-printing",
    name: "Screen Printing",
    category: "Apparel",
    baseCost: 8,
    laborCost: 5,
    markup: 65,
    setupFee: 25,
  },
  {
    id: "laser-engraving",
    name: "Laser Engraving",
    category: "Custom Products",
    baseCost: 6,
    laborCost: 8,
    markup: 70,
    setupFee: 15,
  },
  {
    id: "signs-banners",
    name: "Signs & Banners",
    category: "Signage",
    baseCost: 20,
    laborCost: 15,
    markup: 60,
    setupFee: 35,
  },
  {
    id: "graphic-design",
    name: "Graphic Design",
    category: "Design",
    baseCost: 0,
    laborCost: 45,
    markup: 50,
    setupFee: 0,
  },
  {
    id: "photography",
    name: "Photography",
    category: "Media",
    baseCost: 10,
    laborCost: 75,
    markup: 50,
    setupFee: 0,
  },
]

export default function AdminPricing() {
  const [services, setServices] = useState(defaultServices)

  const [estimate, setEstimate] = useState({
    serviceId: "screen-printing",
    quantity: 12,
    extraCost: 0,
    discount: 0,
  })

  const selectedService = services.find(
    (service) => service.id === estimate.serviceId
  )

  const updateService = (id, field, value) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === id
          ? {
              ...service,
              [field]:
                field === "name" || field === "category"
                  ? value
                  : Number(value || 0),
            }
          : service
      )
    )
  }

  const updateEstimate = (field, value) => {
    setEstimate((prev) => ({
      ...prev,
      [field]:
        field === "serviceId"
          ? value
          : Number(value || 0),
    }))
  }

  const pricing = useMemo(() => {
    if (!selectedService) {
      return {
        unitCost: 0,
        markedUpUnit: 0,
        subtotal: 0,
        discountAmount: 0,
        total: 0,
        profit: 0,
        margin: 0,
      }
    }

    const quantity = Number(estimate.quantity || 1)
    const baseCost = Number(selectedService.baseCost || 0)
    const laborCost = Number(selectedService.laborCost || 0)
    const markup = Number(selectedService.markup || 0)
    const setupFee = Number(selectedService.setupFee || 0)
    const extraCost = Number(estimate.extraCost || 0)
    const discount = Number(estimate.discount || 0)

    const unitCost = baseCost + laborCost + extraCost
    const markedUpUnit = unitCost * (1 + markup / 100)
    const subtotal = markedUpUnit * quantity + setupFee
    const discountAmount = subtotal * (discount / 100)
    const total = Math.max(0, subtotal - discountAmount)
    const totalCost = unitCost * quantity
    const profit = total - totalCost
    const margin = total > 0 ? (profit / total) * 100 : 0

    return {
      unitCost,
      markedUpUnit,
      subtotal,
      discountAmount,
      total,
      profit,
      margin,
    }
  }, [selectedService, estimate])

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            Pricing Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Manage service pricing, markup, labor, setup fees, and quick
            estimates for customer quotes.
          </p>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Estimated Total"
            value={money(pricing.total)}
            accent="text-cyan-300"
          />

          <MetricCard
            label="Estimated Profit"
            value={money(pricing.profit)}
            accent={pricing.profit >= 0 ? "text-emerald-300" : "text-red-300"}
          />

          <MetricCard
            label="Margin"
            value={percent(pricing.margin)}
            accent={pricing.margin >= 30 ? "text-emerald-300" : "text-yellow-300"}
          />

          <MetricCard
            label="Unit Price"
            value={money(pricing.markedUpUnit)}
            accent="text-blue-300"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
            <h2 className="mb-5 text-2xl font-bold">
              Service Pricing Rules
            </h2>

            <div className="space-y-5">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-2xl border border-slate-800 bg-[#020617] p-5"
                >
                  <div className="mb-4 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold text-slate-300">
                      Service Name
                      <input
                        value={service.name}
                        onChange={(event) =>
                          updateService(service.id, "name", event.target.value)
                        }
                        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-bold text-slate-300">
                      Category
                      <input
                        value={service.category}
                        onChange={(event) =>
                          updateService(service.id, "category", event.target.value)
                        }
                        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <NumberField
                      label="Base Cost"
                      value={service.baseCost}
                      onChange={(value) =>
                        updateService(service.id, "baseCost", value)
                      }
                    />

                    <NumberField
                      label="Labor Cost"
                      value={service.laborCost}
                      onChange={(value) =>
                        updateService(service.id, "laborCost", value)
                      }
                    />

                    <NumberField
                      label="Markup %"
                      value={service.markup}
                      onChange={(value) =>
                        updateService(service.id, "markup", value)
                      }
                    />

                    <NumberField
                      label="Setup Fee"
                      value={service.setupFee}
                      onChange={(value) =>
                        updateService(service.id, "setupFee", value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
              <h2 className="mb-5 text-2xl font-bold">
                Quick Estimate
              </h2>

              <label className="mb-4 grid gap-2 text-sm font-bold text-slate-300">
                Service
                <select
                  value={estimate.serviceId}
                  onChange={(event) =>
                    updateEstimate("serviceId", event.target.value)
                  }
                  className="rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white"
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>

              <NumberField
                label="Quantity"
                value={estimate.quantity}
                onChange={(value) => updateEstimate("quantity", value)}
              />

              <NumberField
                label="Extra Unit Cost"
                value={estimate.extraCost}
                onChange={(value) => updateEstimate("extraCost", value)}
              />

              <NumberField
                label="Discount %"
                value={estimate.discount}
                onChange={(value) => updateEstimate("discount", value)}
              />

              <div className="mt-6 rounded-2xl border border-slate-800 bg-[#020617] p-5">
                <Summary label="Unit Cost" value={money(pricing.unitCost)} />
                <Summary label="Unit Price" value={money(pricing.markedUpUnit)} />
                <Summary label="Subtotal" value={money(pricing.subtotal)} />
                <Summary label="Discount" value={money(pricing.discountAmount)} />
                <Summary label="Total" value={money(pricing.total)} strong />
                <Summary label="Profit" value={money(pricing.profit)} />
                <Summary label="Margin" value={percent(pricing.margin)} />
              </div>
            </section>

            <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-6">
              <h2 className="mb-3 text-2xl font-bold text-cyan-300">
                Pricing Formula
              </h2>

              <p className="text-slate-300">
                Price is calculated from base cost, labor, extra unit cost,
                markup percentage, quantity, setup fee, and discount.
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  )
}

function MetricCard({ label, value, accent }) {
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

function NumberField({ label, value, onChange }) {
  return (
    <label className="mb-4 grid gap-2 text-sm font-bold text-slate-300">
      {label}

      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white"
      />
    </label>
  )
}

function Summary({ label, value, strong = false }) {
  return (
    <div className="flex justify-between border-b border-slate-800 py-3 last:border-b-0">
      <span className="text-slate-400">
        {label}
      </span>

      <span
        className={
          strong
            ? "text-xl font-extrabold text-cyan-300"
            : "font-bold text-white"
        }
      >
        {value}
      </span>
    </div>
  )
}