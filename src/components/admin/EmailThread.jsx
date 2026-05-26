export default function EmailThread({
  emails = [],
  selectedEmail = null,
  onSelectEmail,
  onArchive,
  onRestore,
  onReply
}) {
  if (!emails.length) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-center text-white">
        <h2 className="mb-3 text-2xl font-bold">
          No Emails Found
        </h2>

        <p className="text-slate-400">
          Email conversations will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {emails.map((email) => {
        const active = selectedEmail?._id === email._id

        return (
          <article
            key={email._id}
            onClick={() => onSelectEmail?.(email)}
            className={
              active
                ? "cursor-pointer rounded-3xl border border-cyan-400 bg-cyan-400/10 p-5 text-white shadow-xl shadow-cyan-500/10"
                : "cursor-pointer rounded-3xl border border-slate-800 bg-slate-950/80 p-5 text-white transition hover:border-cyan-400/60"
            }
          >
            <div className="mb-3 flex flex-col justify-between gap-2 md:flex-row md:items-start">
              <div>
                <h3 className="text-xl font-bold">
                  {email.subject || "(No Subject)"}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  To: {email.to || "No recipient"}
                </p>

                {email.cc && (
                  <p className="text-sm text-slate-500">
                    CC: {email.cc}
                  </p>
                )}
              </div>

              <span className="w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                {email.status || "email"}
              </span>
            </div>

            <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
              {email.message || "No message content."}
            </p>

            {email.attachments?.length > 0 && (
              <div className="mt-4 rounded-2xl border border-slate-800 bg-[#020617] p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Attachments
                </p>

                <div className="grid gap-2">
                  {email.attachments.map((file, index) => (
                    <p
                      key={`${file.fileName || file.name || "file"}-${index}`}
                      className="text-sm text-cyan-300"
                    >
                      📎 {file.fileName || file.name || `Attachment ${index + 1}`}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <p className="text-xs text-slate-500">
                {email.sentAt || email.createdAt
                  ? new Date(email.sentAt || email.createdAt).toLocaleString()
                  : ""}
              </p>

              <div className="flex flex-wrap gap-2">
                {onReply && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onReply(email)
                    }}
                    className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-400"
                  >
                    Reply
                  </button>
                )}

                {email.status !== "archived" && onArchive && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onArchive(email._id)
                    }}
                    className="rounded-full bg-slate-700 px-4 py-2 text-xs font-bold text-white hover:bg-slate-600"
                  >
                    Archive
                  </button>
                )}

                {email.status === "archived" && onRestore && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onRestore(email._id)
                    }}
                    className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400"
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}