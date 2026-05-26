export default function MessageBubble({
  message = {},
  isAdmin = false
}) {
  const sender =
    message.sender ||
    (isAdmin ? "admin" : "customer")

  const isAdminMessage =
    sender === "admin" ||
    sender === "staff"

  const createdAt =
    message.createdAt ||
    message.sentAt ||
    message.timestamp ||
    ""

  return (
    <div
      className={
        isAdminMessage
          ? "flex justify-end"
          : "flex justify-start"
      }
    >
      <div
        className={
          isAdminMessage
            ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-cyan-500 px-4 py-3 text-black shadow-lg shadow-cyan-500/10"
            : "max-w-[80%] rounded-2xl rounded-tl-sm border border-slate-800 bg-slate-950 px-4 py-3 text-white"
        }
      >
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] opacity-70">
          {isAdminMessage ? "Admin" : "Customer"}
        </p>

        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.message ||
            message.text ||
            message.body ||
            "No message"}
        </p>

        {createdAt && (
          <p className="mt-2 text-[11px] opacity-60">
            {new Date(createdAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
}