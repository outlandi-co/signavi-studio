import { useMemo } from "react";
import { calculateProductPricing } from "../../utils/productPricing.js";

const MARKUPS = [40, 50, 60, 80];

export default function ProductPricingPanel({
  unitCost,
  markupPercent,
  onCostChange,
  onMarkupChange,
  onApplyPrice
}) {
  const pricing = useMemo(() => {
    try {
      return calculateProductPricing(unitCost, markupPercent);
    } catch {
      return null;
    }
  }, [unitCost, markupPercent]);

  const card = {
    padding: 20,
    border: "1px solid #ddd",
    borderRadius: 12,
    marginTop: 18
  };

  const field = {
  padding: "12px 14px",
  width: "100%",
  boxSizing: "border-box",
  backgroundColor: "#ffffff",
  color: "#262626",
  WebkitTextFillColor: "#262626",
  border: "1px solid #94a3b8",
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 500,
  outlineColor: "#22d3ee",
  colorScheme: "light"
};

  return (
    <section style={card}>
      <h3>Pricing & Markup</h3>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 12
      }}>
        <label>
          Unit Cost ($)
          <input
            type="number"
            min="0"
            step="0.01"
            value={unitCost}
            onChange={(event) => onCostChange(event.target.value)}
            style={field}
          />
        </label>

        <label>
          Markup (%)
          <input
            type="number"
            min="0"
            step="1"
            value={markupPercent}
            onChange={(event) => onMarkupChange(event.target.value)}
            style={field}
          />
        </label>
      </div>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 14
      }}>
        {MARKUPS.map((percent) => (
          <button
            key={percent}
            type="button"
            onClick={() => onMarkupChange(String(percent))}
            aria-pressed={Number(markupPercent) === percent}
            className={`rounded-xl border px-5 py-3 text-sm font-bold
              transition-all duration-200 hover:-translate-y-0.5
              focus-visible:outline-2 focus-visible:outline-cyan-400
              ${
                Number(markupPercent) === percent
                  ? "border-cyan-300 bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                  : "border-slate-600 bg-slate-800 text-white hover:border-cyan-400 hover:bg-slate-700"
              }`}
          >
            {percent}% Markup
          </button>
        ))}
      </div>

      {pricing ? (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 14,
            marginTop: 20
          }}>
            <div>
              <small>Selling Price</small>
              <h3>${pricing.sellingPrice.toFixed(2)}</h3>
            </div>
            <div>
              <small>Profit / Unit</small>
              <h3>${pricing.profit.toFixed(2)}</h3>
            </div>
            <div>
              <small>Profit Margin</small>
              <h3>{pricing.margin.toFixed(1)}%</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onApplyPrice(pricing.sellingPrice)}
            className="mt-5 w-full rounded-xl bg-cyan-400 px-5 py-4 text-base font-bold text-slate-950 transition-all duration-200 hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            Apply Selling Price
          </button>
        </>
      ) : (
        <p role="alert">
          Enter a valid non-negative cost and markup.
        </p>
      )}
    </section>
  );
}