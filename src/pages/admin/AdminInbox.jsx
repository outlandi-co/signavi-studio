import {
  useEffect,
  useState,
  useCallback,
  useMemo
} from "react"

import { io } from "socket.io-client"
import api from "../../services/api"

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5050"

const FOLDERS = [
  { id: "inbox", label: "📥 Inbox" },
  { id: "archive", label: "🗄 Archive" }
]

export default function AdminInbox() {
  const [activeFolder, setActiveFolder] = useState("inbox")
  const [threads, setThreads] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const token = localStorage.getItem("adminToken")

  const authHeaders = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
    [token]
  )

  const unreadCount = useMemo(() => {
    return threads.filter((thread) => {
      return thread.unread && !thread.archived
    }).length
  }, [threads])

  const loadThreads = useCallback(async () => {
    try {
      const endpoint =
        activeFolder === "archive"
          ? "/admin-email-threads/archived"
          : "/admin-email-threads"

      const res = await api.get(endpoint, authHeaders)

      setThreads(res.data?.data || [])
    } catch (error) {
      console.error("LOAD THREADS ERROR:", error)
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

      setMessages(res.data?.data || [])
      await loadThreads()
    } catch (error) {
      console.error("LOAD MESSAGES ERROR:", error)
    }
  }

  const sendReply = async () => {
    if (!reply.trim() || !selectedThread) return

    try {
      setSending(true)

      await api.post(
        `/admin-email-threads/${selectedThread._id}/reply`,
        { message: reply },
        authHeaders
      )

      setReply("")
      await loadMessages(selectedThread)
    } catch (error) {
      console.error("SEND REPLY ERROR:", error)
      alert("Reply could not be sent.")
    } finally {
      setSending(false)
    }
  }

  const archiveThread = async () => {
    if (!selectedThread) return

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
      console.error("ARCHIVE THREAD ERROR:", error)
    }
  }

  const restoreThread = async () => {
    if (!selectedThread) return

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
      console.error("RESTORE THREAD ERROR:", error)
    }
  }

  useEffect(() => {
    let mounted = true

    const timer = setTimeout(async () => {
      if (mounted) {
        await loadThreads()
      }
    }, 0)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [loadThreads])

  useEffect(() => {
    const socket = io(SOCKET_URL)

    socket.on("customerEmailReply", async () => {
      await loadThreads()
    })

    socket.on("threadRestored", async () => {
      await loadThreads()
    })

    socket.on("adminNotification", async () => {
      await loadThreads()
    })

    return () => {
      socket.disconnect()
    }
  }, [loadThreads])

  const handleFolderClick = (folderId) => {
    setActiveFolder(folderId)
    setSelectedThread(null)
    setMessages([])
    setLoading(true)
  }

  if (loading) {
    return (
      <main style={page}>
        Loading inbox...
      </main>
    )
  }

  return (
    <main style={page}>
      <h1 style={heading}>
        📥 Email Inbox
      </h1>

      <div style={folderBar}>
        {FOLDERS.map((folder) => (
          <button
            key={folder.id}
            type="button"
            onClick={() => handleFolderClick(folder.id)}
            style={{
              ...folderButton,
              background:
                activeFolder === folder.id
                  ? "#22d3ee"
                  : "#111827",
              color:
                activeFolder === folder.id
                  ? "#020617"
                  : "#e5e7eb"
            }}
          >
            {folder.label}

            {folder.id === "inbox" && unreadCount > 0 && (
              <span style={folderBadge}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={layout}>
        <aside style={threadList}>
          {threads.length === 0 ? (
            <p style={muted}>
              {activeFolder === "archive"
                ? "No archived conversations yet."
                : "No customer replies yet."}
            </p>
          ) : (
            threads.map((thread) => (
              <button
                key={thread._id}
                type="button"
                onClick={() => loadMessages(thread)}
                style={{
                  ...threadButton,
                  border:
                    selectedThread?._id === thread._id
                      ? "1px solid #22d3ee"
                      : "1px solid #1e293b"
                }}
              >
                <strong>
                  {thread.customerName ||
                    thread.customerEmail}
                </strong>

                <span style={subject}>
                  {thread.subject}
                </span>

                <span style={preview}>
                  {thread.lastMessage}
                </span>

                {thread.unread && activeFolder !== "archive" && (
                  <span style={unread}>
                    Unread
                  </span>
                )}
              </button>
            ))
          )}
        </aside>

        <section style={conversation}>
          {!selectedThread ? (
            <div style={empty}>
              <h2>Select a conversation</h2>
              <p>Customer replies will appear here.</p>
            </div>
          ) : (
            <>
              <div style={conversationHeader}>
                <div>
                  <h2>
                    {selectedThread.subject}
                  </h2>

                  <p style={muted}>
                    {selectedThread.customerEmail}
                  </p>
                </div>

                {activeFolder !== "archive" ? (
                  <button
                    type="button"
                    onClick={archiveThread}
                    style={archiveButton}
                  >
                    Archive
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={restoreThread}
                    style={restoreButton}
                  >
                    Restore
                  </button>
                )}
              </div>

              <div style={messageList}>
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    style={{
                      ...messageBubble,
                      alignSelf:
                        msg.direction === "outbound"
                          ? "flex-end"
                          : "flex-start",
                      background:
                        msg.direction === "outbound"
                          ? "#22d3ee"
                          : "#111827",
                      color:
                        msg.direction === "outbound"
                          ? "#020617"
                          : "#e5e7eb"
                    }}
                  >
                    <strong>
                      {msg.direction === "outbound"
                        ? "SignaVi Studio"
                        : msg.senderEmail}
                    </strong>

                    <p style={messageText}>
                      {msg.message}
                    </p>

                    <span style={dateText}>
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {activeFolder !== "archive" && (
                <div style={replyBox}>
                  <textarea
                    rows={5}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write a reply..."
                    style={textarea}
                  />

                  <button
                    type="button"
                    onClick={sendReply}
                    disabled={sending}
                    style={sendButton}
                  >
                    {sending ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

const page = {
  padding: 30,
  background: "#020617",
  minHeight: "100vh",
  color: "#e5e7eb"
}

const heading = {
  marginTop: 0,
  fontSize: 34
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
  gridTemplateColumns: "340px 1fr",
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

const threadButton = {
  width: "100%",
  display: "grid",
  gap: 6,
  padding: 14,
  marginBottom: 12,
  borderRadius: 14,
  background: "#020617",
  color: "#e5e7eb",
  textAlign: "left",
  cursor: "pointer"
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

const unread = {
  color: "#020617",
  background: "#22c55e",
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 900,
  width: "fit-content"
}

const conversation = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 18,
  padding: 22,
  minHeight: "78vh",
  display: "flex",
  flexDirection: "column"
}

const conversationHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  borderBottom: "1px solid #1e293b",
  paddingBottom: 16,
  marginBottom: 16
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

const messageBubble = {
  maxWidth: "72%",
  padding: 16,
  borderRadius: 16,
  whiteSpace: "pre-wrap"
}

const messageText = {
  margin: "8px 0"
}

const dateText = {
  fontSize: 11,
  opacity: 0.7
}

const replyBox = {
  marginTop: 18,
  display: "grid",
  gap: 12
}

const textarea = {
  width: "100%",
  resize: "vertical",
  borderRadius: 12,
  padding: 14,
  background: "#020617",
  color: "#fff",
  border: "1px solid #334155",
  boxSizing: "border-box"
}

const sendButton = {
  background: "#22c55e",
  color: "#020617",
  border: "none",
  padding: "14px 18px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer"
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