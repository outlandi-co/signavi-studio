import { useState } from "react"

export default function ReplyBox({
  onSend,
  placeholder = "Write a reply...",
  buttonText = "Send Reply",
  loading = false
}) {
  const [message, setMessage] = useState("")

  const handleSubmit = async () => {
    const trimmed = message.trim()

    if (!trimmed || loading) return

    await onSend?.(trimmed)

    setMessage("")
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
      <textarea
        rows={5}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none focus:border-cyan-400"
      />

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          Enter to send • Shift + Enter for new line
        </p>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !message.trim()}
          className="rounded-xl bg-cyan-500 px-5 py-3 font-bold text-black hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Sending..." : buttonText}
        </button>
      </div>
    </div>
  )
}