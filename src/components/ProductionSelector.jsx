const productionOptions = [
  {
    value: "laser",
    label: "Laser Engraving",
    description:
      "Tumblers, leather patches, acrylic, wood, awards, and gifts."
  },
  {
    value: "vinyl",
    label: "Vinyl Printing",
    description:
      "HTV apparel, decals, stickers, names, numbers, and transfers."
  },
  {
    value: "digital",
    label: "Digital Services",
    description:
      "Digital products, file preparation, online content, and assets."
  },
  {
    value: "signage",
    label: "Signs & Banners",
    description:
      "Business signs, event banners, decals, and displays."
  },
  {
    value: "design",
    label: "Graphic Design",
    description:
      "Logos, branding, flyers, mockups, and marketing materials."
  },
  {
    value: "photo_video",
    label: "Photography & Video",
    description:
      "Portraits, products, events, aerial footage, and editing."
  }
]

export default function ProductionSelector({
  value = "",
  onChange = () => {},
  disabled = false,
  label = "Production Type"
}) {
  return (
    <div style={container}>
      <label style={title}>
        {label}
      </label>

      <div style={grid}>
        {productionOptions.map((option) => {
          const selected = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              style={{
                ...card,
                ...(selected ? selectedCard : {}),
                opacity: disabled ? 0.55 : 1,
                cursor: disabled ? "not-allowed" : "pointer"
              }}
            >
              <div style={header}>
                <span style={name}>
                  {option.label}
                </span>

                {selected && (
                  <span style={check}>
                    ✓
                  </span>
                )}
              </div>

              <p style={description}>
                {option.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const container = {
  display: "flex",
  flexDirection: "column",
  gap: 12
}

const title = {
  color: "#cbd5e1",
  fontSize: 14,
  fontWeight: 700
}

const grid = {
  display: "grid",
  gap: 12,
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))"
}

const card = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 16,
  padding: 16,
  textAlign: "left",
  transition: "all 0.2s ease",
  color: "#fff"
}

const selectedCard = {
  border: "1px solid #06b6d4",
  background:
    "linear-gradient(180deg,#0f172a,#020617)",
  boxShadow:
    "0 0 0 1px rgba(6,182,212,0.3), 0 8px 25px rgba(6,182,212,0.15)"
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8
}

const name = {
  fontWeight: 700,
  color: "#f8fafc"
}

const check = {
  color: "#06b6d4",
  fontWeight: 900,
  fontSize: 18
}

const description = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 13,
  lineHeight: 1.5
}