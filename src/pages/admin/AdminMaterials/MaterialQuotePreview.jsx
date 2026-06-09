import { useState } from "react"

import QuoteMaterialLine from "./quote-integration/QuoteMaterialLine"
import QuoteCostSummary from "./quote-integration/QuoteCostSummary"

export default function MaterialQuotePreview({ materials = [] }) {
  const [line, setLine] = useState(null)

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
          Quote Integration
        </p>

        <h2 className="mt-1 text-2xl font-bold text-white">
          Material Quote Preview
        </h2>

        <p className="mt-2 text-slate-400">
          Select a material and calculate estimated customer pricing.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <QuoteMaterialLine
          materials={materials}
          onChange={setLine}
        />

        <QuoteCostSummary
          materialCost={line?.materialCost}
          laborCost={line?.laborCost}
          wasteAmount={line?.wasteAmount}
          markupAmount={line?.markupAmount}
          customerPrice={line?.customerPrice}
          profit={line?.profit}
        />
      </div>
    </div>
  )
}