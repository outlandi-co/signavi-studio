export default function MessageBubble({
  message = {},
  isAdmin = false,
  onDelete = null,
  deleting = false
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

  const isImageAttachment = (
    attachment = {}
  ) => {
    const mimeType =
      String(
        attachment.mimeType || ""
      ).toLowerCase()

    return mimeType.startsWith(
      "image/"
    )
  }

  const getFileIcon = (
    attachment = {}
  ) => {
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

  const downloadAttachment = async (
    url,
    fileName
  ) => {
    if (!url) {
      return
    }

    try {
      const response =
        await fetch(url)

      if (!response.ok) {
        throw new Error(
          `Download failed: ${response.status}`
        )
      }

      const blob =
        await response.blob()

      const blobUrl =
        window.URL.createObjectURL(
          blob
        )

      const link =
        document.createElement("a")

      link.href =
        blobUrl

      link.download =
        fileName ||
        "attachment"

      document.body.appendChild(
        link
      )

      link.click()

      link.remove()

      window.URL.revokeObjectURL(
        blobUrl
      )
    } catch (error) {
      console.error(
        "ATTACHMENT DOWNLOAD ERROR:",
        error
      )

      alert(
        "The attachment could not be downloaded directly."
      )
    }
  }

  const handleDelete = () => {
    if (
      !onDelete ||
      deleting ||
      !message?._id
    ) {
      return
    }

    onDelete(message)
  }

  const messageText =
    message.message ||
    message.text ||
    message.body ||
    (attachments.length
      ? "Attachment received."
      : "No message")

  return (
    <div
      className={
        isAdminMessage
          ? "flex w-full min-w-0 justify-end"
          : "flex w-full min-w-0 justify-start"
      }
    >
      <div
        className={
          isAdminMessage
            ? "w-full min-w-0 rounded-2xl rounded-tr-sm bg-cyan-500 px-4 py-3 text-black shadow-lg shadow-cyan-500/10 sm:w-auto sm:max-w-[85%]"
            : "w-full min-w-0 rounded-2xl rounded-tl-sm border border-slate-800 bg-slate-950 px-4 py-3 text-white sm:w-auto sm:max-w-[85%]"
        }
        style={{
          boxSizing:
            "border-box",

          overflow:
            "hidden"
        }}
      >
        {/* ================= HEADER ================= */}

        <div className="mb-2 flex items-start justify-between gap-4">
          <p className="m-0 text-xs font-black uppercase tracking-wide opacity-70">
            {isAdminMessage
              ? "Admin"
              : "Customer"}
          </p>

          {onDelete &&
            message?._id && (
              <button
                type="button"
                onClick={
                  handleDelete
                }
                disabled={
                  deleting
                }
                title="Delete message"
                aria-label="Delete message"
                className={
                  isAdminMessage
                    ? "shrink-0 rounded-lg border border-red-900/20 bg-red-950/20 px-2 py-1 text-xs font-black text-red-950 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    : "shrink-0 rounded-lg border border-red-900 bg-red-950/40 px-2 py-1 text-xs font-black text-red-300 transition hover:border-red-500 hover:bg-red-900 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                }
              >
                {deleting
                  ? "Deleting..."
                  : "🗑 Delete"}
              </button>
            )}
        </div>

        {/* ================= MESSAGE TEXT ================= */}

        <div
          className="w-full min-w-0 whitespace-pre-wrap break-words text-sm leading-relaxed"
          style={{
            overflowWrap:
              "anywhere",

            wordBreak:
              "break-word"
          }}
        >
          {messageText}
        </div>

        {/* ================= ATTACHMENTS ================= */}

        {attachments.length > 0 && (
          <div className="mt-4 w-full min-w-0 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide opacity-70">
              📎 Attachments (
              {attachments.length})
            </p>

            {attachments.map(
              (
                attachment,
                index
              ) => {
                const fileName =
                  attachment.fileName ||
                  `attachment-${index + 1}`

                const url =
                  attachment.url ||
                  ""

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
                        ? "w-full min-w-0 rounded-xl border border-black/10 bg-white/20 p-3"
                        : "w-full min-w-0 rounded-xl border border-slate-800 bg-slate-900 p-3"
                    }
                  >
                    {isImage &&
                      url && (
                        <a
                          href={
                            url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full"
                        >
                          <img
                            src={
                              url
                            }
                            alt={
                              fileName
                            }
                            className="mb-3 h-auto max-h-64 w-auto max-w-full rounded-lg object-contain"
                          />
                        </a>
                      )}

                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p
                          className="break-words text-sm font-bold"
                          style={{
                            overflowWrap:
                              "anywhere",

                            wordBreak:
                              "break-word"
                          }}
                        >
                          {getFileIcon(
                            attachment
                          )}{" "}
                          {
                            fileName
                          }
                        </p>

                        {fileSize && (
                          <p className="mt-1 text-[11px] opacity-60">
                            {
                              fileSize
                            }
                          </p>
                        )}
                      </div>

                      {url && (
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={
                              url
                            }
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

                          <button
                            type="button"
                            onClick={() =>
                              downloadAttachment(
                                url,
                                fileName
                              )
                            }
                            className={
                              isAdminMessage
                                ? "rounded-lg bg-black/15 px-3 py-2 text-xs font-bold text-black hover:bg-black/25"
                                : "rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                            }
                          >
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }
            )}
          </div>
        )}

        {/* ================= DATE ================= */}

        {createdAt && (
          <p className="mt-3 text-[11px] opacity-60">
            {new Date(
              createdAt
            ).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
}