export default function MaterialCare({ careInstructions = [] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="mb-4 text-lg font-bold text-white">Care Instructions</h3>

      <ul className="space-y-2 text-sm text-slate-300">
        {careInstructions.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </div>
  )
}