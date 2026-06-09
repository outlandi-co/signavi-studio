export default function MaterialSpecs({ material }) {
  const specs = material?.specs || {}
  const dimensions = material?.dimensions || {}

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="mb-4 text-lg font-bold text-white">Material Specs</h3>

      <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
        <p>Listed Width: {dimensions.listedWidth}</p>
        <p>Actual Width: {dimensions.actualWidth}</p>
        <p>Length Per Unit: {dimensions.lengthPerUnit}</p>
        <p>Thickness: {dimensions.thickness}</p>
        <p>Composition: {specs.composition}</p>
        <p>Backing: {specs.backing}</p>
        <p>Finish: {specs.finish}</p>
        <p>Blade: {specs.blade}</p>
        <p>Certification: {specs.certification}</p>
      </div>
    </div>
  )
}