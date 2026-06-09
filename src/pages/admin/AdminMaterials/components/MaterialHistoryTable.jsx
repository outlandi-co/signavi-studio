export default function MaterialHistoryTable({ history = [] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="mb-4 text-lg font-bold text-white">Price History</h3>

      {history.length === 0 ? (
        <p className="text-sm text-slate-400">No price history yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Old</th>
                <th className="py-2">New</th>
                <th className="py-2">Supplier</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index} className="border-t border-slate-800">
                  <td className="py-2">{item.date}</td>
                  <td className="py-2">${item.oldPrice}</td>
                  <td className="py-2">${item.newPrice}</td>
                  <td className="py-2">{item.supplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}