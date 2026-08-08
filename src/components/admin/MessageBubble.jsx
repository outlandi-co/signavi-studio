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

  const attachments =
    Array.isArray(message.attachments)
      ? message.attachments
      : []

  const formatFileSize = (bytes = 0) => {
    const size = Number(bytes || 0)

    if (!size) {
      return ""
    }

    if (size < 1024) {
      return `${size} B`
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`
  }

  const isImageAttachment = (attachment = {}) => {
    const mimeType =
      String(
        attachment.mimeType || ""
      ).toLowerCase()

    return mimeType.startsWith("image/")
  }

  const getFileIcon = (attachment = {}) => {
    const mimeType =
      String(
        attachment.mimeType || ""
      ).toLowerCase()

    const fileName =
      String(
        attachment.fileName || ""
      ).toLowerCase()

    if (
      mimeType === "application/pdf" ||
      fileName.endsWith(".pdf")
    ) {
      return "📄"
    }

    if (
      fileName.endsWith(".ai") ||
      fileName.endsWith(".eps") ||
      fileName.endsWith(".svg")
    ) {
      return "🎨"
    }

    if (
      fileName.endsWith(".doc") ||
      fileName.endsWith(".docx")
    ) {
      return "📝"
    }

    return "📎"
  }

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
        <p className="mb-2 text-xs font-bold uppercase tracking-wide opacity-70">
          {isAdminMessage
            ? "Admin"
            : "Customer"}
        </p>

        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.message ||
            message.text ||
            message.body ||
            (attachments.length
              ? "Attachment received."
              : "No message")}
        </p>

        {attachments.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide opacity-70">
              📎 Attachments ({attachments.length})
            </p>

            {attachments.map(
              (attachment, index) => {
                const fileName =
                  attachment.fileName ||
                  `attachment-${index + 1}`

                const url =
                  attachment.url || ""

                const fileSize =
                  formatFileSize(
                    attachment.size
                  )

                const isImage =
                  isImageAttachment(
                    attachment
                  )

                return (
                  <div
                    key={`${fileName}-${index}`}
                    className={
                      isAdminMessage
                        ? "rounded-xl border border-black/10 bg-white/20 p-3"
                        : "rounded-xl border border-slate-800 bg-slate-900 p-3"
                    }
                  >
                    {isImage && url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={url}
                          alt={fileName}
                          className="mb-3 max-h-64 w-auto max-w-full rounded-lg object-contain"
                        />
                      </a>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {getFileIcon(
                            attachment
                          )}{" "}
                          {fileName}
                        </p>

                        {fileSize && (
                          <p className="mt-1 text-[11px] opacity-60">
                            {fileSize}
                          </p>
                        )}
                      </div>

                      {url && (
                        <div className="flex gap-2">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={
                              isAdminMessage
                                ? "rounded-lg bg-black/15 px-3 py-2 text-xs font-bold text-black hover:bg-black/25"
                                : "rounded-lg bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                            }
                          >
                            View
                          </a>

                          <a
                            href={url}
                            download={fileName}
                            className={
                              isAdminMessage
                                ? "rounded-lg bg-black/15 px-3 py-2 text-xs font-bold text-black hover:bg-black/25"
                                : "rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                            }
                          >
                            Download
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }
            )}
          </div>
        )}

        {createdAt && (
          <p className="mt-3 text-[11px] opacity-60">
            {new Date(createdAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
}