export default function MaterialPriceTable({ material }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="mb-4 text-lg font-bold text-white">Pricing</h3>

      <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
        <p>Current Price: <span className="text-green-400">${material?.price}</span></p>
        <p>Regular Price: ${material?.regularPrice}</p>
        <p>Currency: {material?.currency}</p>
        <p>Unit: {material?.unit}</p>
      </div>
    </div>
  )
}