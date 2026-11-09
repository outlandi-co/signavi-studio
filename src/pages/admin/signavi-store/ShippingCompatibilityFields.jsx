import React from "react"

// SIGNAVI_SHIPPING_011_COMPATIBILITY_FIELDS
// Product-level configuration only; no checkout or carrier calls.
export default function ShippingCompatibilityFields({ value, onChange }) {
  const mode = value.compatibilityMode || (
    value.shipSeparately ? "separate" : "combine"
  )

  const field = {
    width: "100%",
    padding: 10,
    border: "1px solid #64748b",
    borderRadius: 8,
    background: "#0f172a",
    color: "#f8fafc"
  }

  const row = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    color: "#e2e8f0"
  }

  return (
    <div
      style={{
        marginTop: 20,
        padding: 16,
        border: "1px solid #475569",
        borderRadius: 12,
        background: "#1e293b"
      }}
    >
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
        Shipping Compatibility
      </h3>

      <p style={{ marginTop: 8, color: "#cbd5e1", fontSize: 13 }}>
        Determine whether this product may share a shipping package
        with other items in a mixed order.
      </p>

      <label style={{ display: "block", marginTop: 16 }}>
        <span style={{ display: "block", marginBottom: 6, color: "#fff" }}>
          Packing compatibility
        </span>
        <select
          aria-label="Packing compatibility"
          style={field}
          value={mode}
          onChange={event => {
            const nextMode = event.target.value
            onChange({
              compatibilityMode: nextMode,
              shipSeparately: nextMode === "separate",
              requiresProtection:
                nextMode === "protected" ? true : value.requiresProtection === true
            })
          }}
        >
          <option value="combine">Can combine with other products</option>
          <option value="protected">Combine with protective packaging</option>
          <option value="separate">Must ship separately</option>
        </select>
      </label>

      <label style={row}>
        <input
          type="checkbox"
          checked={mode === "protected" || value.requiresProtection === true}
          disabled={mode === "protected"}
          onChange={event =>
            onChange({ requiresProtection: event.target.checked })
          }
        />
        Requires protective packaging
      </label>

      <label style={row}>
        <input
          type="checkbox"
          checked={value.oversized === true}
          onChange={event => onChange({ oversized: event.target.checked })}
        />
        Oversized item
      </label>

      <label style={{ display: "block", marginTop: 16 }}>
        <span style={{ display: "block", marginBottom: 6, color: "#fff" }}>
          Maximum units per package (optional)
        </span>
        <input
          aria-label="Maximum units per package"
          type="number"
          min="1"
          step="1"
          placeholder="Leave empty until capacity is verified"
          style={field}
          value={value.maxUnitsPerPackage ?? ""}
          onChange={event =>
            onChange({ maxUnitsPerPackage: event.target.value })
          }
        />
      </label>

      <p style={{ marginTop: 10, color: "#cbd5e1", fontSize: 12 }}>
        A blank capacity is unverified, not unlimited. These settings
        do not activate automatic mixed-order shipping until the
        backend packing engine is connected and tested.
      </p>
    </div>
  )
}
