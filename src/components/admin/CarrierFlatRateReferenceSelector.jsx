import { useEffect, useMemo, useState } from "react"
import api from "../../services/api"

// STUDIO_058H44Z_REFERENCE_ONLY
// Published carrier reference data, never checkout configuration.
export default function CarrierFlatRateReferenceSelector({ onApply }) {
  const [items, setItems] = useState([])
  const [carrier, setCarrier] = useState("USPS")
  const [service, setService] = useState("")
  const [packageId, setPackageId] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    async function loadCatalog() {
      try {
        const response = await api.get(
          "/shipping-packages/reference-catalog"
        )

        if (!mounted) return

        const payload = response.data
        const catalog = payload?.data
        const records = catalog?.packages

        if (
          payload?.success !== true ||
          payload?.referenceOnly !== true ||
          catalog?.activatedForCheckout !== false ||
          !Array.isArray(records) ||
          records.length !== 20 ||
          !records.every(item =>
            item.active === false &&
            item.checkoutEligible === false &&
            item.physicallyVerified === false
          )
        ) {
          throw new Error("Invalid reference catalog response")
        }

        setItems(records)
        setError("")
      } catch (err) {
        if (!mounted) return

        setItems([])

        const status = err?.response?.status

        setError(
          status === 401
            ? "Administrator session required. Sign in again to view carrier references."
            : status === 403
              ? "Your account does not have administrator access."
              : "Carrier packaging references could not be loaded."
        )
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadCatalog()

    return () => {
      mounted = false
    }
  }, [])

  const services = useMemo(
    () => [...new Set(
      items
        .filter(item => item.carrier === carrier)
        .map(item => item.service)
    )],
    [items, carrier]
  )

  const activeService = services.includes(service)
    ? service
    : (services[0] || "")

  const options = items.filter(
    item =>
      item.carrier === carrier &&
      item.service === activeService
  )

  const selected = options.find(item => item.id === packageId)

  const dimensions = selected?.dimensions
  const size = dimensions?.insideIn
    ? "Inside: " + dimensions.insideIn.join(" ? ") + " in"
    : dimensions?.nominalIn
      ? "Nominal: " + dimensions.nominalIn.join(" ? ") + " in"
      : null

  const outside = dimensions?.outsideIn
    ? "Outside: " + dimensions.outsideIn.join(" ? ") + " in"
    : null

  return (
    <section
      aria-label="Carrier flat rate reference catalog"
      style={{
        border: "1px solid #334155",
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        marginBottom: 20,
        background: "rgba(15, 23, 42, 0.45)",
        color: "#f8fafc"
      }}
    >
      <h4 style={{ fontSize: 18, fontWeight: 700 }}>
        USPS / UPS Carrier Packaging Reference
      </h4>

      <p style={{ color: "#cbd5e1", margin: "8px 0 16px" }}>
        Published carrier specifications only. These selections
        are inactive, unverified, and cannot be used for checkout.
      </p>

      {loading && <p>Loading carrier references...</p>}

      {error && (
        <p role="alert" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <label style={{ display: "block", marginBottom: 12 }}>
            Carrier
            <select
              value={carrier}
              onChange={event => {
                setCarrier(event.target.value)
                setService("")
                setPackageId("")
              }}
              style={{
                display: "block",
                width: "100%",
                marginTop: 6,
                padding: 12,
                border: "1px solid #475569",
                borderRadius: 12,
                color: "#f8fafc",
                background: "#0f172a",
                outlineColor: "#22d3ee"
              }}
            >
              <option value="USPS">USPS</option>
              <option value="UPS">UPS</option>
            </select>
          </label>

          <label style={{ display: "block", marginBottom: 12 }}>
            Shipping program
            <select
              value={activeService}
              onChange={event => {
                setService(event.target.value)
                setPackageId("")
              }}
              style={{
                display: "block",
                width: "100%",
                marginTop: 6,
                padding: 12,
                border: "1px solid #475569",
                borderRadius: 12,
                color: "#f8fafc",
                background: "#0f172a",
                outlineColor: "#22d3ee"
              }}
            >
              {services.map(value => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "block", marginBottom: 12 }}>
            Reference packaging
            <select
              value={selected?.id || ""}
              onChange={event => setPackageId(event.target.value)}
              style={{
                display: "block",
                width: "100%",
                marginTop: 6,
                padding: 12,
                border: "1px solid #475569",
                borderRadius: 12,
                color: "#f8fafc",
                background: "#0f172a",
                outlineColor: "#22d3ee"
              }}
            >
              <option value="">Select carrier packaging</option>
              {options.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          {selected && (
            <div
              style={{
                border: "1px solid #334155",
                borderRadius: 8,
                padding: 12
              }}
            >
              <strong>{selected.name}</strong>

              {size && <p>{size}</p>}
              {outside && <p>{outside}</p>}

              {selected.volumeRangeCubicIn && (
                <p>
                  Volume tier:{" "}
                  {selected.volumeRangeCubicIn.min}?{" "}
                  {selected.volumeRangeCubicIn.max} cubic inches
                </p>
              )}

              {selected.notes && <p>{selected.notes}</p>}

              {onApply && selected.dimensions?.outsideIn && (
                <button
                  type="button"
                  onClick={() => onApply(selected)}
                  style={{
                    display: "block",
                    marginTop: 12,
                    marginBottom: 12,
                    padding: 10,
                    borderRadius: 8,
                    background: "#22d3ee",
                    color: "#082f49",
                    fontWeight: 700
                  }}
                >
                  Preview dimensions in Package 1
                </button>
              )}

              {onApply && !selected.dimensions?.outsideIn && (
                <p style={{ color: "#fbbf24" }}>
                  No complete three-dimensional parcel measurement
                  is published for this reference. Automatic
                  dimension entry is unavailable.
                </p>
              )}

              <p style={{ color: "#fbbf24" }}>
                Reference only ? not saved as an active package.
              </p>

              {selected.sourceUrl && (
                <a
                  href={selected.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#67e8f9" }}
                >
                  View official carrier reference
                </a>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}
