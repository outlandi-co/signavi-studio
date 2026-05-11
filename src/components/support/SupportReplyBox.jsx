import { useState } from "react"

export default function SupportReplyBox({
  ticket,
  onSendReply,
  onCloseTicket,
  onArchiveTicket,
  onReopenTicket
}) {
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  const isArchived = ticket?.archived
  const isClosed = ticket?.status === "closed"

  const handleSubmit = async e => {
    e.preventDefault()

    if (!message.trim()) return
    if (isArchived) return

    try {
      setSending(true)

      await onSendReply(message.trim())

      setMessage("")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        {!isArchived && !isClosed && (
          <button
            type="button"
            onClick={onCloseTicket}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
          >
            Close Chat
          </button>
        )}

        {!isArchived && isClosed && (
          <>
            <button
              type="button"
              onClick={onReopenTicket}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              Reopen
            </button>

            <button
              type="button"
              onClick={onArchiveTicket}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-black"
            >
              Archive
            </button>
          </>
        )}

        {isArchived && (
          <button
            type="button"
            onClick={onReopenTicket}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            Restore / Reopen
          </button>
        )}
      </div>

      {isArchived ? (
        <div className="rounded-xl bg-slate-100 p-4 text-sm font-semibold text-slate-600">
          This conversation is archived. Reopen it to reply.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={
              isClosed
                ? "Reopen this chat before replying..."
                : "Write a reply..."
            }
            disabled={sending || isClosed}
            className="min-h-[90px] flex-1 resize-none rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
          />

          <button
            type="submit"
            disabled={sending || isClosed || !message.trim()}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      )}
    </div>
  )
}