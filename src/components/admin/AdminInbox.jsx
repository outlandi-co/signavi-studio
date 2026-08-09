import {
  useEffect,
  useState,
  useCallback,
  useMemo
} from "react"

import { io } from "socket.io-client"
import api from "../../services/api"

import MessageBubble from "../../components/admin/MessageBubble"
import ReplyBox from "../../components/admin/ReplyBox"

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5050"

const FOLDERS = [
  {
    id: "info",
    label: "📥 Information",
    channel: "info"
  },
  {
    id: "quotes",
    label: "💲 Quotes",
    channel: "quotes"
  },
  {
    id: "support",
    label: "🛟 Support",
    channel: "support"
  },
  {
    id: "archive",
    label: "🗄 Archive",
    channel: null
  }
]

export default function AdminInbox() {
  const [activeFolder, setActiveFolder] = useState("info")
  const [threads, setThreads] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isMobile, setIsMobile] = useState(
  () => window.innerWidth <= 900
)

  const token = localStorage.getItem("adminToken")
  
useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 900)
  }

  handleResize()

  window.addEventListener("resize", handleResize)

  return () => {
    window.removeEventListener("resize", handleResize)
  }
}, [])

  const authHeaders = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
    [token]
  )

  const currentFolder = useMemo(() => {
    return FOLDERS.find(
      (folder) => folder.id === activeFolder
    )
  }, [activeFolder])

  const unreadCount = useMemo(() => {
    return threads.filter(
      (thread) =>
        thread.unread &&
        !thread.archived
    ).length
  }, [threads])

  const loadThreads = useCallback(async () => {
    try {
      setLoading(true)

      let endpoint = "/admin-email-threads"

      if (activeFolder === "archive") {
        endpoint =
          "/admin-email-threads/archived"
      } else {
        endpoint =
          `/admin-email-threads?channel=${activeFolder}`
      }

      const res = await api.get(
        endpoint,
        authHeaders
      )

      setThreads(
        Array.isArray(res.data?.data)
          ? res.data.data
          : []
      )
    } catch (error) {
      console.error(
        "LOAD THREADS ERROR:",
        error
      )

      setThreads([])
    } finally {
      setLoading(false)
    }
  }, [activeFolder, authHeaders])

  const loadMessages = async (thread) => {
    try {
      setSelectedThread(thread)

      const res = await api.get(
        `/admin-email-threads/${thread._id}/messages`,
        authHeaders
      )

      setMessages(
        Array.isArray(res.data?.data)
          ? res.data.data
          : []
      )

      await loadThreads()
    } catch (error) {
      console.error(
        "LOAD MESSAGES ERROR:",
        error
      )
    }
  }

  const sendReply = async (message) => {
    if (!message.trim() || !selectedThread) {
      return
    }

    try {
      setSending(true)

      await api.post(
        `/admin-email-threads/${selectedThread._id}/reply`,
        {
          message
        },
        authHeaders
      )

      await loadMessages(selectedThread)
    } catch (error) {
      console.error(
        "SEND REPLY ERROR:",
        error
      )

      alert("Reply could not be sent.")
    } finally {
      setSending(false)
    }
  }

  const archiveThread = async () => {
    if (!selectedThread) {
      return
    }

    try {
      await api.patch(
        `/admin-email-threads/${selectedThread._id}/archive`,
        {},
        authHeaders
      )

      setSelectedThread(null)
      setMessages([])

      await loadThreads()
    } catch (error) {
      console.error(
        "ARCHIVE THREAD ERROR:",
        error
      )
    }
  }

  const restoreThread = async () => {
    if (!selectedThread) {
      return
    }

    try {
      await api.patch(
        `/admin-email-threads/${selectedThread._id}/restore`,
        {},
        authHeaders
      )

      setSelectedThread(null)
      setMessages([])

      await loadThreads()
    } catch (error) {
      console.error(
        "RESTORE THREAD ERROR:",
        error
      )
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadThreads()
    }, 0)

    return () => clearTimeout(timer)
  }, [loadThreads])

  useEffect(() => {
    const socket = io(SOCKET_URL)

    const refreshThreads = async () => {
      await loadThreads()
    }

    socket.on(
      "customerEmailReply",
      refreshThreads
    )

    socket.on(
      "threadRestored",
      refreshThreads
    )

    socket.on(
      "threadArchived",
      refreshThreads
    )

    socket.on(
      "adminNotification",
      refreshThreads
    )

    return () => {
      socket.off(
        "customerEmailReply",
        refreshThreads
      )

      socket.off(
        "threadRestored",
        refreshThreads
      )

      socket.off(
        "threadArchived",
        refreshThreads
      )

      socket.off(
        "adminNotification",
        refreshThreads
      )

      socket.disconnect()
    }
  }, [loadThreads])

  const handleFolderClick = (folderId) => {
    setActiveFolder(folderId)
    setSelectedThread(null)
    setMessages([])
    setLoading(true)
  }

  const getChannelLabel = (thread) => {
  if (thread?.channel === "quotes") {
    return "Quote"
  }

  if (thread?.channel === "support") {
    return "Support"
  }

  return "Information"
}

  const getSenderEmail = (thread) => {
  if (thread?.channel === "quotes") {
    return "quote@signavistudio.store"
  }

  if (thread?.channel === "support") {
    return "support@signavistudio.store"
  }

  return "info@signavistudio.store"
}

  if (loading) {
    return (
      <main style={page}>
        Loading communications...
      </main>
    )
  }

  return (
    <main style={page}>
      <div style={pageHeader}>
        <div>
          <p style={eyebrow}>
            SignaVi Studio
          </p>

          <h1 style={heading}>
            💬 Communications
          </h1>

          <p style={subheading}>
  Customer information, quote, and support
  conversations in one place.
</p>
        </div>
      </div>

      <div style={folderBar}>
        {FOLDERS.map((folder) => {
          const isActive =
            activeFolder === folder.id

          return (
            <button
              key={folder.id}
              type="button"
              onClick={() =>
                handleFolderClick(folder.id)
              }
              style={{
                ...folderButton,
                background: isActive
                  ? "#22d3ee"
                  : "#111827",
                color: isActive
                  ? "#020617"
                  : "#e5e7eb"
              }}
            >
              {folder.label}

              {folder.id !== "archive" &&
                isActive &&
                unreadCount > 0 && (
                  <span style={folderBadge}>
                    {unreadCount}
                  </span>
                )}
            </button>
          )
        })}
      </div>

      <div
  style={{
    ...layout,
    gridTemplateColumns: isMobile
      ? "minmax(0, 1fr)"
      : "340px minmax(0, 1fr)",
    gap: isMobile ? 14 : 24,
    width: "100%",
    minWidth: 0
  }}
>
        {(!isMobile || !selectedThread) && (
  <aside
    style={{
      ...threadList,
      width: "100%",
      height: isMobile ? "auto" : "78vh"
    }}
  >
          <div style={threadListHeader}>
            <div>
              <p style={threadListLabel}>
                {currentFolder?.label ||
                  "Communications"}
              </p>

              <p style={threadCount}>
                {threads.length} conversation
                {threads.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>
          </div>

          {threads.length === 0 ? (
            <div style={noThreads}>
              <p style={muted}>
                {activeFolder === "archive"
  ? "No archived conversations yet."
  : activeFolder === "quotes"
    ? "No quote emails yet."
    : activeFolder === "support"
      ? "No support emails yet."
      : "No information emails yet."}
              </p>
            </div>
          ) : (
            threads.map((thread) => {
              const active =
                selectedThread?._id ===
                thread._id

              return (
                <button
                  key={thread._id}
                  type="button"
                  onClick={() =>
                    loadMessages(thread)
                  }
                  style={{
                    ...threadButton,
                    border: active
                      ? "1px solid #22d3ee"
                      : "1px solid #1e293b",
                    background: active
                      ? "#082f49"
                      : "#020617"
                  }}
                >
                  <div style={threadTopRow}>
                    <strong>
                      {thread.customerName ||
                        thread.customerEmail}
                    </strong>

                    {thread.unread &&
                      activeFolder !==
                        "archive" && (
                        <span
                          style={unreadDot}
                        />
                      )}
                  </div>

                  <span style={subject}>
                    {thread.subject ||
                      "(No Subject)"}
                  </span>

                  <span style={preview}>
                    {thread.lastMessage ||
                      "No message preview"}
                  </span>

                  <div style={threadMeta}>
                    <span
                      style={
  thread.channel === "quotes"
    ? quoteBadge
    : thread.channel === "support"
      ? supportBadge
      : infoBadge
}
                    >
                      {getChannelLabel(thread)}
                    </span>

                    {thread.unread &&
                      activeFolder !==
                        "archive" && (
                        <span style={unread}>
                          Unread
                        </span>
                      )}
                  </div>
                </button>
              )
            })
          )}
        </aside>
        )}

        {(!isMobile || selectedThread) && (
  <section
    style={{
      ...conversation,
      width: "100%",
      minWidth: 0,
      minHeight: isMobile ? "auto" : "78vh",
      padding: isMobile ? 8 : 22
    }}
  >
    {isMobile && selectedThread && (
      <button
        type="button"
        onClick={() => {
          setSelectedThread(null)
          setMessages([])
        }}
        style={{
          width: "fit-content",
          marginBottom: 12,
          background: "#1e293b",
          color: "#e5e7eb",
          border: "1px solid #334155",
          borderRadius: 12,
          padding: "10px 14px",
          fontWeight: 800,
          cursor: "pointer"
        }}
      >
        ← Back to Inbox
      </button>
    )}

    {!selectedThread ? (
      <div style={empty}>
        <h2>
          Select a conversation
        </h2>

        <p>
          Customer messages will appear here.
        </p>
      </div>
    ) : (
      <>
        <div
          style={{
            ...conversationHeader,
            flexDirection: isMobile
              ? "column"
              : "row"
          }}
        >
          <div
            style={{
              width: "100%",
              minWidth: 0
            }}
          >
            <div
              style={
                selectedThread.channel === "quotes"
                  ? quoteBadgeLarge
                  : selectedThread.channel === "support"
                    ? supportBadgeLarge
                    : infoBadgeLarge
              }
            >
              {getChannelLabel(selectedThread)}
            </div>

            <h2
              style={{
                ...conversationTitle,
                overflowWrap: "anywhere",
                wordBreak: "break-word"
              }}
            >
              {selectedThread.subject || "(No Subject)"}
            </h2>

            <p
              style={{
                ...muted,
                overflowWrap: "anywhere",
                wordBreak: "break-word"
              }}
            >
              Customer: {selectedThread.customerEmail}
            </p>

            {activeFolder !== "archive" && (
              <p
                style={{
                  ...fromLine,
                  overflowWrap: "anywhere",
                  wordBreak: "break-word"
                }}
              >
                Replies send from:{" "}
                <strong>
                  {getSenderEmail(selectedThread)}
                </strong>
              </p>
            )}
          </div>

          {activeFolder !== "archive" ? (
            <button
              type="button"
              onClick={archiveThread}
              style={{
                ...archiveButton,
                width: isMobile ? "100%" : "auto"
              }}
            >
              Archive
            </button>
          ) : (
            <button
              type="button"
              onClick={restoreThread}
              style={{
                ...restoreButton,
                width: isMobile ? "100%" : "auto"
              }}
            >
              Restore
            </button>
          )}
        </div>

        <div
          style={{
            ...messageList,
            width: "100%",
            minWidth: 0,
            overflowX: "hidden",
            paddingRight: isMobile ? 0 : 8
          }}
        >
          {messages.length === 0 ? (
            <p style={muted}>
              No messages in this conversation.
            </p>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={{
                  sender:
                    msg.direction === "outbound"
                      ? "admin"
                      : "customer",

                  message: msg.message,

                  createdAt: msg.createdAt,

                  attachments:
                    Array.isArray(msg.attachments)
                      ? msg.attachments
                      : []
                }}
              />
            ))
          )}
        </div>

        {activeFolder !== "archive" && (
          <div
            style={{
              width: "100%",
              minWidth: 0,
              marginTop: 18
            }}
          >
            <ReplyBox
              loading={sending}
              onSend={sendReply}
              placeholder={
                selectedThread.channel === "quotes"
                  ? "Reply to this quote inquiry..."
                  : "Reply to this customer..."
              }
              buttonText={
                selectedThread.channel === "quotes"
                  ? "Send Quote Reply"
                  : "Send Reply"
              }
            />
          </div>
        )}
      </>
    )}
    </section>
)}
      </div>
    </main>
  )
}

/* ================= STYLES ================= */

const page = {
  padding: 30,
  background: "#020617",
  minHeight: "100vh",
  color: "#e5e7eb"
}

const pageHeader = {
  marginBottom: 24
}

const eyebrow = {
  margin: 0,
  marginBottom: 6,
  color: "#22d3ee",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  fontSize: 12
}

const heading = {
  margin: 0,
  fontSize: 34
}

const subheading = {
  marginTop: 8,
  color: "#94a3b8"
}

const folderBar = {
  display: "flex",
  gap: 12,
  marginBottom: 20,
  flexWrap: "wrap"
}

const folderButton = {
  border: "1px solid #334155",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8
}

const folderBadge = {
  background: "#ef4444",
  color: "#fff",
  borderRadius: 999,
  padding: "2px 8px",
  fontSize: 11,
  fontWeight: 900
}

const layout = {
  display: "grid",
  gridTemplateColumns:
    "340px minmax(0, 1fr)",
  gap: 24
}

const threadList = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 18,
  padding: 16,
  height: "78vh",
  overflowY: "auto"
}

const threadListHeader = {
  marginBottom: 14,
  paddingBottom: 12,
  borderBottom:
    "1px solid #1e293b"
}

const threadListLabel = {
  margin: 0,
  fontWeight: 900
}

const threadCount = {
  marginTop: 4,
  marginBottom: 0,
  color: "#64748b",
  fontSize: 12
}

const noThreads = {
  padding: "30px 10px",
  textAlign: "center"
}

const threadButton = {
  width: "100%",
  display: "grid",
  gap: 6,
  padding: 14,
  marginBottom: 12,
  borderRadius: 14,
  color: "#e5e7eb",
  textAlign: "left",
  cursor: "pointer"
}

const threadTopRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10
}

const unreadDot = {
  width: 9,
  height: 9,
  borderRadius: "50%",
  background: "#22c55e",
  flexShrink: 0
}

const subject = {
  color: "#22d3ee",
  fontSize: 13,
  fontWeight: 800
}

const preview = {
  color: "#94a3b8",
  fontSize: 13,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
}

const threadMeta = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  flexWrap: "wrap",
  marginTop: 4
}

const unread = {
  color: "#020617",
  background: "#22c55e",
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 900,
  width: "fit-content"
}

const infoBadge = {
  color: "#67e8f9",
  background: "#164e63",
  border: "1px solid rgba(34,211,238,.35)",
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 900,
  width: "fit-content"
}

const quoteBadge = {
  color: "#fde68a",
  background: "#713f12",
  border: "1px solid rgba(245,158,11,.4)",
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 900,
  width: "fit-content"
}

const supportBadge = {
  color: "#bbf7d0",
  background: "#14532d",
  border: "1px solid rgba(34,197,94,.4)",
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 900,
  width: "fit-content"
}

const infoBadgeLarge = {
  ...infoBadge,
  display: "inline-block",
  marginBottom: 10
}

const quoteBadgeLarge = {
  ...quoteBadge,
  display: "inline-block",
  marginBottom: 10
}

const supportBadgeLarge = {
  ...supportBadge,
  display: "inline-block",
  marginBottom: 10
}

const conversation = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 18,
  padding: 22,
  minHeight: "78vh",
  display: "flex",
  flexDirection: "column",
  minWidth: 0
}

const conversationHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  borderBottom:
    "1px solid #1e293b",
  paddingBottom: 16,
  marginBottom: 16
}

const conversationTitle = {
  marginTop: 0,
  marginBottom: 8
}

const fromLine = {
  color: "#64748b",
  fontSize: 12,
  marginTop: 6
}

const empty = {
  margin: "auto",
  textAlign: "center",
  color: "#94a3b8"
}

const muted = {
  color: "#94a3b8"
}

const messageList = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  flex: 1,
  overflowY: "auto",
  paddingRight: 8
}

const archiveButton = {
  background: "#f59e0b",
  color: "#020617",
  border: "none",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer",
  height: "fit-content"
}

const restoreButton = {
  background: "#22c55e",
  color: "#020617",
  border: "none",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer",
  height: "fit-content"
}