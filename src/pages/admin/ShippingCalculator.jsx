
import { useState } from "react"
import api from "../../../services/api"

const blankParcel = () => ({
  length: "",
  width: "",
  height: "",
  weight: "",
  mass_unit: "lb"
})

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-300"

const cardClass =
  "rounded-3xl border border-slate-800 bg-slate-950/80 p-6"

const money = (amount, currency = "USD") => {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency
  })
}

export default function ShippingCalculator() {
  const [destination, setDestination] = useState({
    name: "",
    street1: "",
    city: "",
    state: "",
    zip: "",
    country: "US"
  })

  const [parcels, setParcels] = useState([
    blankParcel()
  ])

  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [quoted, setQuoted] = useState(false)

  const clearResults = () => {
    setRates([])
    setError("")
    setQuoted(false)
  }

  const updateDestination = (field, value) => {
    setDestination((previous) => ({
      ...previous,
      [field]: value
    }))

    clearResults()
  }

  const updateParcel = (index, field, value) => {
    setParcels((previous) =>
      previous.map((parcel, i) =>
        i === index
          ? { ...parcel, [field]: value }
          : parcel
      )
    )

    clearResults()
  }

  const addParcel = () => {
    if (parcels.length >= 10) return

    setParcels((previous) => [
      ...previous,
      blankParcel()
    ])

    clearResults()
  }

  const removeParcel = (index) => {
    if (parcels.length <= 1) return

    setParcels((previous) =>
      previous.filter((_, i) => i !== index)
    )

    clearResults()
  }

  const compareRates = async (event) => {
    event.preventDefault()

    setError("")
    setRates([])
    setQuoted(false)

    const requiredAddress = [
      "street1",
      "city",
      "state",
      "zip"
    ]

    if (
      requiredAddress.some(
        (field) => !destination[field].trim()
      )
    ) {
      setError("Enter a complete destination address.")
      return
    }

    const invalidParcel = parcels.some(
      (parcel) =>
        ["length", "width", "height", "weight"].some(
          (field) =>
            !Number.isFinite(Number(parcel[field])) ||
            Number(parcel[field]) <= 0
        )
    )

    if (invalidParcel) {
      setError(
        "Enter positive dimensions and weight for every package."
      )
      return
    }

    try {
      setLoading(true)

      const response = await api.post(
        "/shipping/admin/compare",
        {
          address_to: {
            name: destination.name.trim() || "Recipient",
            street1: destination.street1.trim(),
            city: destination.city.trim(),
            state: destination.state.trim(),
            zip: destination.zip.trim(),
            country: destination.country.trim() || "US"
          },
          parcels: parcels.map((parcel) => ({
            length: Number(parcel.length),
            width: Number(parcel.width),
            height: Number(parcel.height),
            weight: Number(parcel.weight),
            mass_unit: parcel.mass_unit
          }))
        }
      )

      const results = Array.isArray(response.data?.rates)
        ? response.data.rates
        : []

      setRates(results)
      setQuoted(true)

      if (results.length === 0) {
        setError(
          "Shippo returned no rates for these packages."
        )
      }
    } catch (err) {
      console.error("Shipping comparison failed:", err)

      setError(
        err.response?.data?.message ||
        "Unable to compare shipping rates."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 text-white">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">
          Signavi Store
        </p>

        <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
          Shipping Calculator
        </h1>

        <p className="mt-3 text-slate-400">
          Compare shipping rates using actual packed
          dimensions, weights, and destination.
        </p>
      </header>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
        TEST MODE — These are Shippo test quotes.
        They are not guaranteed live postage prices.
        This calculator cannot purchase shipping labels.
      </div>

      <form onSubmit={compareRates} className="space-y-6">
        <section className={cardClass}>
          <h2 className="mb-5 text-xl font-bold">
            1. Destination Address
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["name", "Recipient Name"],
              ["street1", "Street Address"],
              ["city", "City"],
              ["state", "State"],
              ["zip", "ZIP / Postal Code"],
              ["country", "Country Code"]
            ].map(([field, label]) => (
              <div key={field}>
                <label className={labelClass}>
                  {label}
                </label>

                <input
                  className={inputClass}
                  value={destination[field]}
                  onChange={(event) =>
                    updateDestination(
                      field,
                      event.target.value
                    )
                  }
                  placeholder={
                    field === "country" ? "US" : label
                  }
                />
              </div>
            ))}
          </div>
        </section>

        <section className={cardClass}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">
                2. Packages
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Enter measurements for each packed box or mailer.
              </p>
            </div>

            <button
              type="button"
              onClick={addParcel}
              disabled={parcels.length >= 10}
              className="rounded-xl bg-cyan-500 px-4 py-3 font-bold text-black hover:bg-cyan-400 disabled:opacity-50"
            >
              + Add Package
            </button>
          </div>

          <div className="space-y-4">
            {parcels.map((parcel, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-cyan-300">
                    Package {index + 1}
                  </h3>

                  {parcels.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParcel(index)}
                      className="text-sm font-semibold text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {[
                    ["length", "Length (in)"],
                    ["width", "Width (in)"],
                    ["height", "Height (in)"],
                    ["weight", "Packed Weight"]
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label className={labelClass}>
                        {label}
                      </label>

                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        className={inputClass}
                        value={parcel[field]}
                        onChange={(event) =>
                          updateParcel(
                            index,
                            field,
                            event.target.value
                          )
                        }
                        placeholder="0"
                      />
                    </div>
                  ))}

                  <div>
                    <label className={labelClass}>
                      Weight Unit
                    </label>

                    <select
                      className={inputClass}
                      value={parcel.mass_unit}
                      onChange={(event) =>
                        updateParcel(
                          index,
                          "mass_unit",
                          event.target.value
                        )
                      }
                    >
                      <option value="lb">Pounds (lb)</option>
                      <option value="oz">Ounces (oz)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-cyan-500 px-6 py-4 text-lg font-extrabold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Comparing Carrier Rates..."
            : "Compare Shipping Rates"}
        </button>
      </form>

      {quoted && rates.length > 0 && (
        <section className={cardClass}>
          <h2 className="mb-2 text-2xl font-bold">
            3. Carrier Rate Comparison
          </h2>

          <p className="mb-5 text-slate-400">
            {rates.length} test shipping option(s)
            returned for {parcels.length} package(s).
          </p>

          <div className="space-y-3">
            {rates.map((rate, index) => (
              <div
                key={rate.id || index}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-900/50 p-5"
              >
                <div>
                  <h3 className="text-lg font-bold">
                    {rate.provider || "Carrier"}
                  </h3>

                  <p className="text-slate-400">
                    {rate.service || "Shipping Service"}
                  </p>

                  {rate.estimatedDays != null && (
                    <p className="mt-1 text-sm text-slate-500">
                      Estimated transit: {rate.estimatedDays} days
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-2xl font-extrabold text-cyan-300">
                    {money(rate.amount, rate.currency)}
                  </p>

                  <p className="text-xs text-slate-500">
                    Test rate
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="pb-8 text-sm text-slate-500">
        Package quantity means the number of actual packed
        parcels, not the number of products. Enter separate
        parcels when an order requires multiple boxes.
      </p>
    </main>
  )
}
