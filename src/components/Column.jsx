export default function Column({ title, orders }) {

  return (
    <div className="bg-white rounded-xl shadow-md p-4 min-h-[400px]">

      <h2 className="font-semibold capitalize mb-4">{title}</h2>

      <div className="space-y-4">
        {orders.map(order => (
          <Card key={order._id} order={order} />
        ))}
      </div>

    </div>
  )
}