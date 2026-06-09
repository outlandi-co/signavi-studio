export default function MaterialApplication({ applicationInstructions = [] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="mb-4 text-lg font-bold text-white">Application Instructions</h3>

      <ol className="space-y-2 text-sm text-slate-300">
        {applicationInstructions.map((item, index) => (
          <li key={index}>
            <span className="mr-2 text-cyan-400">{index + 1}.</span>
            {item}
          </li>
        ))}
      </ol>
    </div>
  )
}