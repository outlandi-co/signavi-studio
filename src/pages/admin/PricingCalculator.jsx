import { useMemo, useState } from "react"

const money = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })

const margins = [
  { label: "80% Profit Margin", margin: 0.8 },
  { label: "60% Profit Margin", margin: 0.6 },
  { label: "50% Profit Margin", margin: 0.5 },
  { label: "40% Profit Margin", margin: 0.4 }
]

export default function PricingCalculator() {
  const [cost, setCost] = useState("")

  const prices = useMemo(() => {
    const baseCost = Number(cost || 0)

    return margins.map((item) => ({
      ...item,
      price:
        baseCost > 0
          ? baseCost / (1 - item.margin)
          : 0
    }))
  }, [cost])

  return (
    <main className="min-h-screen bg-[#020617] p-6 text-white">
      <section className="mx-auto max-w-5xl">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
          Admin Pricing
        </p>

        <h1 className="text-4xl font-black">
          Pricing Calculator
        </h1>

        <p className="mt-3 max-w-2xl text-slate-400">
          Enter your product cost and calculate selling prices based on
          80%, 60%, 50%, and 40% profit margins.
        </p>

        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
          <label className="mb-2 block text-sm font-bold text-slate-300">
            Product Cost
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="Enter cost, example: 12.50"
            className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {prices.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-800 bg-[#020617] p-5"
              >
                <p className="text-sm text-slate-400">
                  {item.label}
                </p>

                <h2 className="mt-2 text-3xl font-black text-cyan-300">
                  {money(item.price)}
                </h2>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}