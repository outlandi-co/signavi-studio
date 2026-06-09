export default function MaterialPricing({ material }) {
  const priceWatch = material?.priceWatch || {}

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="mb-4 text-lg font-bold text-white">Price Watch</h3>

      <div className="space-y-2 text-sm text-slate-300">
        <p>Status: {priceWatch.enabled ? "Watching" : "Not Watching"}</p>
        <p>Current Price: ${priceWatch.currentPrice ?? material?.price}</p>
        <p>Previous Price: ${priceWatch.previousPrice ?? material?.regularPrice}</p>
        <p>Alert On Change: {priceWatch.alertOnChange ? "Yes" : "No"}</p>
        <p>Last Checked: {priceWatch.lastChecked || "Not checked yet"}</p>
      </div>
    </div>
  )
}