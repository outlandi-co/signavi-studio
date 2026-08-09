ChatGPT Plus






I can't see the invox mail because it is literally like outside the phone screen

Generated image: SignaVi Studio Communications Dashboard


Edit



Pasted code(20260809-065910).js
JavaScript
 

import {
Outlet,
NavLink
} from "react-router-dom"

import useNotifications from "../../hooks/useNotifications"

export default function AdminLayout() {
const {
supportUnread,
emailUnread,
clearSupportUnread,
clearEmailUnread
} = useNotifications()

const downloadOrdersCSV = () => {
window.open(
"https://signavi-backend.onrender.com/api/orders/export",
"_blank"
)
}

const downloadTaxCSV = () => {
window.open(
"https://signavi-backend.onrender.com/api/export-taxes",
"_blank"
)
}

const handleLogout = () => {
localStorage.removeItem("adminToken")
localStorage.removeItem("adminUser")

sessionStorage.removeItem("adminToken")
sessionStorage.removeItem("adminUser")

window.location.href = "/login"
}

return (

    {/* ================= BRAND ================= */}

    <div style={brandBox}>
      <div style={brandIcon}>
        <img
          src="/logo.png"
          alt="SignaVi"
          style={brandImage}
          onError={(event) => {
            event.currentTarget.style.display =
              "none"

            event.currentTarget.parentElement.textContent =
              "S"
          }}
        />
      </div>

      <div>
        <h2 style={title}>
          SignaVi
        </h2>

        <p style={subtitle}>
          Admin Panel
        </p>
      </div>
    </div>

    {/* ================= WORKFLOW ================= */}

    <div style={sectionLabel}>
      Workflow
    </div>

    <SideLink to="/admin">
      📊 Dashboard
    </SideLink>

    <SideLink to="/admin/production">
      🏭 Production
    </SideLink>

    <SideLink to="/admin/orders">
      📦 Orders
    </SideLink>

    <SideLink to="/admin/invoices">
      🧾 Invoices
    </SideLink>

    <SideLink to="/admin/custom-order/new">
      🧾 New Custom Order
    </SideLink>

    {/* ================= STORE ================= */}

    <div style={sectionLabel}>
      Store
    </div>

    <SideLink to="/admin/products/new">
      ➕ Create Product
    </SideLink>

    <SideLink to="/admin/signavi-store/products">
      🛍️ Store Products
    </SideLink>

    <SideLink to="/admin/signavi-store/discounts">
      💸 Store Discounts
    </SideLink>

    <SideLink to="/admin/materials">
      🧵 Materials Catalog
    </SideLink>

    {/* ================= CUSTOMERS ================= */}

    <div style={sectionLabel}>
      Customers
    </div>

    <SideLink to="/admin/customers">
      👥 Customers
    </SideLink>

    {/* ================= COMMUNICATIONS ================= */}

    <div onClick={clearEmailUnread}>
      <SideLink to="/admin/emails">
        <div style={linkRow}>
          <span>
            💬 Communications
          </span>

          {emailUnread > 0 && (
            <span style={badge}>
              {emailUnread}
            </span>
          )}
        </div>
      </SideLink>
    </div>

    {/* ================= SUPPORT ================= */}

    <div onClick={clearSupportUnread}>
      <SideLink to="/admin/support">
        <div style={linkRow}>
          <span>
            🛟 Support
          </span>

          {supportUnread > 0 && (
            <span style={badge}>
              {supportUnread}
            </span>
          )}
        </div>
      </SideLink>
    </div>

    {/* ================= BUSINESS ================= */}

    <div style={sectionLabel}>
      Business
    </div>

    <SideLink to="/admin/revenue">
      💰 Revenue
    </SideLink>

    <SideLink to="/admin/marketing">
      📣 Marketing Hub
    </SideLink>

    {/* ================= QUICK TOOLS ================= */}

    <div style={quickStats}>
      <div style={quickStatCard}>
        <span>
          💰 Revenue Tools
        </span>
      </div>

      <div style={quickStatCard}>
        <span>
          📦 Order Exports
        </span>
      </div>
    </div>

    {/* ================= EXPORT / LOGOUT ================= */}

    <div style={csvGroup}>
      <button
        type="button"
        onClick={downloadOrdersCSV}
        style={csvButton}
      >
        📄 Orders CSV
      </button>

      <button
        type="button"
        onClick={downloadTaxCSV}
        style={taxButton}
      >
        🧾 Tax CSV
      </button>

      <button
        type="button"
        onClick={handleLogout}
        style={logoutButton}
      >
        🚪 Logout
      </button>
    </div>
  </aside>

  {/* ================= PAGE CONTENT ================= */}

  <main style={content}>
    <Outlet />
  </main>
</div>
)
}

/* ================= SIDE LINK ================= */

function SideLink({
to,
children
}) {
return (
<NavLink
to={to}
style={({ isActive }) => ({
...link,

    background: isActive
      ? "rgba(34, 211, 238, 0.12)"
      : "transparent",

    border: isActive
      ? "1px solid #22d3ee"
      : "1px solid transparent",

    color: isActive
      ? "#22d3ee"
      : "#cbd5e1",

    boxShadow: isActive
      ? "0 10px 30px rgba(34,211,238,.12)"
      : "none"
  })}
  end={to === "/admin"}
>
  {children}
</NavLink>
)
}

/* ================= STYLES ================= */

const wrapper = {
display: "flex",
minHeight: "100vh",
background: "#020617"
}

const sidebar = {
width: 320,
minWidth: 320,

background: "#020617",
color: "#fff",

display: "flex",
flexDirection: "column",

gap: 10,

padding: 24,

borderRight:
"1px solid #1e293b",

position: "sticky",
top: 0,

height: "100vh",

boxSizing: "border-box",

overflowY: "auto"
}

const brandBox = {
display: "flex",
alignItems: "center",
gap: 14,

marginBottom: 22,
paddingBottom: 18,

borderBottom:
"1px solid #1e293b"
}

const brandIcon = {
width: 52,
height: 52,

borderRadius: 16,

background:
"linear-gradient(135deg, #22d3ee, #2563eb)",

color: "#ffffff",

display: "flex",
alignItems: "center",
justifyContent: "center",

fontSize: 28,
fontWeight: 900,

overflow: "hidden",

boxShadow:
"0 14px 30px rgba(34,211,238,.22)"
}

const brandImage = {
width: "100%",
height: "100%",

objectFit: "contain",

borderRadius: 16
}

const title = {
margin: 0,

fontSize: 28,
fontWeight: 900,

letterSpacing: "-0.04em"
}

const subtitle = {
margin: 0,

color: "#94a3b8",

fontSize: 13,
fontWeight: 700
}

const content = {
flex: 1,

padding: "42px 48px",

minWidth: 0,

background:
"radial-gradient(circle at top left, rgba(34, 211, 238, 0.08), transparent 30%), #020617"
}

const sectionLabel = {
marginTop: 10,
marginBottom: 2,

color: "#64748b",

fontSize: 11,
fontWeight: 900,

letterSpacing: "0.18em",

textTransform: "uppercase"
}

const link = {
padding: "14px 16px",

borderRadius: 16,

textDecoration: "none",

fontWeight: 800,

transition: "0.2s ease",

display: "block"
}

const quickStats = {
display: "grid",

gap: 10,

marginTop: 14,
marginBottom: 14
}

const quickStatCard = {
background: "#0f172a",

border:
"1px solid #1e293b",

borderRadius: 16,

padding: 12,

color: "#cbd5e1",

fontWeight: 800
}

const csvGroup = {
marginTop: "auto",

display: "grid",

gap: 12,

paddingTop: 16,

borderTop:
"1px solid #1e293b"
}

const csvButton = {
background: "#22d3ee",

color: "#020617",

border: "none",

padding: "14px 16px",

borderRadius: 16,

fontWeight: 900,

cursor: "pointer",

textAlign: "left"
}

const taxButton = {
background: "#38bdf8",

color: "#020617",

border: "none",

padding: "14px 16px",

borderRadius: 16,

fontWeight: 900,

cursor: "pointer",

textAlign: "left"
}

const logoutButton = {
background: "#dc2626",

color: "#ffffff",

border: "none",

padding: "14px 16px",

borderRadius: 16,

fontWeight: 900,

cursor: "pointer",

textAlign: "left"
}

const linkRow = {
display: "flex",

justifyContent:
"space-between",

alignItems: "center",

gap: 10
}

const badge = {
minWidth: 22,
height: 22,

borderRadius: "999px",

background: "#ef4444",

color: "#ffffff",

fontSize: 12,
fontWeight: "bold",

display: "flex",

alignItems: "center",
justifyContent: "center",

padding: "0 6px"
}



Pasted code(20260809-072050).js
JavaScript

Screenshot 2026-08-09 002721.png
no

Screenshot 2026-08-09 002823.png

Screenshot 2026-08-09 003004.png

Screenshot 2026-08-09 004740.png

Screenshot 2026-08-09 004900.png
that worked. 

Screenshot 2026-08-09 004953.png
i cant read the emails


Pasted code(20260809-075238).js
JavaScript

Pasted code (2)(20260809-075253).js
JavaScript


Pasted code(20260809-080107).js
JavaScript
like this?


Pasted code(20260809-080317).js
JavaScript


Pasted code(20260809-081443).js
JavaScript
is this correct 


Pasted code(20260809-081829).js
JavaScript
update file with full drop in file 

Screenshot 2026-08-09 012105.png

Yep — this is much closer. The important part is working now: when you clicked the email, the actual conversation moved into the phone viewport instead of staying off-screen to the right.

But I can see the next problem in your screenshot:

The email conversation is too narrow.

There is still a large left/right inset around the content.

The message bubble is especially narrow, so the Google email wraps into a tall skinny column.

The floating hamburger button is overlapping the lower-right area.

The Archive button is taking horizontal room away from the email header.

So we fixed the sliding/view problem, but we haven't finished the mobile presentation yet.

What I want it to do
On a 349px phone screen, after you tap an email, it should basically become:

┌──────────────────────────────┐
│ ← Back to Inbox              │
│                              │
│ Boost productivity...        │
│ workspace-noreply@google...  │
│                              │
│ [ Archive ]                  │
│──────────────────────────────│
│                              │
│ CUSTOMER                     │
│                              │
│ Google Workspace...          │
│ Welcome to a better way...   │
│                              │
│                              │
│──────────────────────────────│
│ Write a reply...             │
│                              │
│ [       Send Reply        ]  │
└──────────────────────────────┘
The email itself should use almost the entire width of the phone, not the skinny column we're seeing now.

And your API is working — the console shows a successful response for the selected thread's /messages request. So I would not touch the backend. This is now a frontend/mobile CSS/layout issue.

If you want, send me the current AdminInbox.jsx after the replacement and I'll adjust this exact version so the email opens full-width without breaking what we just got working.



Pasted code(20260809-082207).js
JavaScript

Got it — I have the new JavaScript file you just uploaded. I can work directly from this version. 


I’ll treat this latest file as the current version, not the older code we were editing.


ok

Perfect. I’ll use the latest AdminInbox version from here forward.

The next fix is the mobile width issue from your screenshot: make the opened email use nearly the full phone width, widen the message bubbles, and keep the Archive/Back controls from squeezing the content. When you're ready, I can give you the updated full drop-in AdminInbox.jsx based on this exact version.


give me the full drop in file

Done — I rebuilt the full drop-in AdminInbox.jsx for the Communications page, keeping your Information / Quotes / Support / Archive setup and tightening the mobile layout so the opened email uses much more of the phone width.

I also changed the mobile behavior so the big Communications intro and folder buttons disappear once an email is opened, which gives the message area more room.

Download the full updated AdminInbox.jsx

Replace your current AdminInbox.jsx with that file, save, and test locally at the 349px mobile width before pushing. 


AdminInbox_full_mobile.jsx
Code


AdminInbox_full_mobile.jsx


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

  const loadThreads = useCallback(async () => {
    try {
      setLoading(true)

      let endpoint = "/admin-email-threads"

      if (activeFolder === "archive") {
        endpoint = "/admin-email-threads/archived"
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

  const handleBackToInbox = () => {
    setSelectedThread(null)
    setMessages([])
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
      <main
        style={{
          ...page,
          padding: isMobile ? 0 : 30
        }}
      >
        Loading communications...
      </main>
    )
  }

  return (
    <main
      style={{
        ...page,
        padding: isMobile ? 0 : 30
      }}
    >
      {/* Hide the large page intro after an email is opened on mobile */}
      {(!isMobile || !selectedThread) && (
        <>
          <div
            style={{
              ...pageHeader,
              marginBottom: isMobile ? 16 : 24,
              padding: isMobile ? "4px 0 0" : 0
            }}
          >
            <div>
              <p style={eyebrow}>
                SignaVi Studio
              </p>

              <h1
                style={{
                  ...heading,
                  fontSize: isMobile ? 30 : 34
                }}
              >
                💬 Communications
              </h1>

              <p
                style={{
                  ...subheading,
                  fontSize: isMobile ? 14 : undefined
                }}
              >
                Customer information, quote, and support
                conversations in one place.
              </p>
            </div>
          </div>

          <div
            style={{
              ...folderBar,
              gap: isMobile ? 8 : 12,
              marginBottom: isMobile ? 14 : 20
            }}
          >
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
                      : "#e5e7eb",
                    flex: isMobile
                      ? "1 1 calc(50% - 8px)"
                      : "0 0 auto",
                    justifyContent: "center"
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
        </>
      )}

      <div
        style={{
          ...layout,
          gridTemplateColumns: isMobile
            ? "minmax(0, 1fr)"
            : "340px minmax(0, 1fr)",
          gap: isMobile ? 0 : 24,
          width: "100%",
          minWidth: 0
        }}
      >
        {/* ================= THREAD LIST ================= */}

        {(!isMobile || !selectedThread) && (
          <aside
            style={{
              ...threadList,
              width: "100%",
              minWidth: 0,
              height: isMobile ? "auto" : "78vh",
              maxHeight: isMobile ? "none" : "78vh",
              padding: isMobile ? 10 : 16,
              borderRadius: isMobile ? 14 : 18
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
                        : "#020617",
                      padding: isMobile ? 12 : 14
                    }}
                  >
                    <div style={threadTopRow}>
                      <strong
                        style={{
                          overflowWrap: "anywhere",
                          wordBreak: "break-word"
                        }}
                      >
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
                          thread.channel ===
                          "quotes"
                            ? quoteBadge
                            : thread.channel ===
                                "support"
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

        {/* ================= CONVERSATION ================= */}

        {(!isMobile || selectedThread) && (
          <section
            style={{
              ...conversation,
              width: "100%",
              minWidth: 0,
              minHeight: isMobile ? "auto" : "78vh",
              padding: isMobile ? 8 : 22,
              borderRadius: isMobile ? 12 : 18,
              border: isMobile
                ? "1px solid #172033"
                : conversation.border
            }}
          >
            {isMobile && selectedThread && (
              <button
                type="button"
                onClick={handleBackToInbox}
                style={{
                  ...backButton,
                  marginBottom: 12
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
                  Customer messages will appear
                  here.
                </p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    ...conversationHeader,
                    flexDirection: isMobile
                      ? "column"
                      : "row",
                    alignItems: isMobile
                      ? "stretch"
                      : "flex-start",
                    gap: isMobile ? 10 : 16,
                    paddingBottom: isMobile
                      ? 12
                      : 16,
                    marginBottom: isMobile
                      ? 12
                      : 16
                  }}
                >
                  <div
                    style={{
                      minWidth: 0,
                      width: "100%"
                    }}
                  >
                    <div
                      style={
                        selectedThread.channel ===
                        "quotes"
                          ? quoteBadgeLarge
                          : selectedThread.channel ===
                              "support"
                            ? supportBadgeLarge
                            : infoBadgeLarge
                      }
                    >
                      {getChannelLabel(
                        selectedThread
                      )}
                    </div>

                    <h2
                      style={{
                        ...conversationTitle,
                        fontSize: isMobile
                          ? 20
                          : undefined,
                        lineHeight: 1.25,
                        overflowWrap: "anywhere",
                        wordBreak: "break-word"
                      }}
                    >
                      {selectedThread.subject ||
                        "(No Subject)"}
                    </h2>

                    <p
                      style={{
                        ...muted,
                        marginTop: 0,
                        marginBottom: 6,
                        fontSize: isMobile
                          ? 13
                          : undefined,
                        overflowWrap: "anywhere",
                        wordBreak: "break-word"
                      }}
                    >
                      Customer:{" "}
                      {
                        selectedThread.customerEmail
                      }
                    </p>

                    {activeFolder !==
                      "archive" && (
                      <p
                        style={{
                          ...fromLine,
                          marginBottom: 0,
                          overflowWrap:
                            "anywhere",
                          wordBreak:
                            "break-word"
                        }}
                      >
                        Replies send from:{" "}
                        <strong>
                          {getSenderEmail(
                            selectedThread
                          )}
                        </strong>
                      </p>
                    )}
                  </div>

                  {activeFolder !==
                  "archive" ? (
                    <button
                      type="button"
                      onClick={archiveThread}
                      style={{
                        ...archiveButton,
                        width: isMobile
                          ? "100%"
                          : "auto"
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
                        width: isMobile
                          ? "100%"
                          : "auto"
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
                    paddingRight: isMobile
                      ? 0
                      : 8,
                    gap: isMobile ? 10 : 14
                  }}
                >
                  {messages.length === 0 ? (
                    <p style={muted}>
                      No messages in this
                      conversation.
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        style={{
                          width: "100%",
                          minWidth: 0
                        }}
                      >
                        <MessageBubble
                          message={{
                            sender:
                              msg.direction ===
                              "outbound"
                                ? "admin"
                                : "customer",

                            message:
                              msg.message,

                            createdAt:
                              msg.createdAt,

                            attachments:
                              Array.isArray(
                                msg.attachments
                              )
                                ? msg.attachments
                                : []
                          }}
                        />
                      </div>
                    ))
                  )}
                </div>

                {activeFolder !==
                  "archive" && (
                  <div
                    style={{
                      width: "100%",
                      minWidth: 0,
                      marginTop: isMobile
                        ? 12
                        : 18
                    }}
                  >
                    <ReplyBox
                      loading={sending}
                      onSend={sendReply}
                      placeholder={
                        selectedThread.channel ===
                        "quotes"
                          ? "Reply to this quote inquiry..."
                          : "Reply to this customer..."
                      }
                      buttonText={
                        selectedThread.channel ===
                        "quotes"
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
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  padding: 30,
  background: "#020617",
  minHeight: "100vh",
  color: "#e5e7eb",
  boxSizing: "border-box",
  overflowX: "hidden"
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
  fontSize: 34,
  lineHeight: 1.1
}

const subheading = {
  marginTop: 8,
  color: "#94a3b8",
  lineHeight: 1.45
}

const folderBar = {
  display: "flex",
  gap: 12,
  marginBottom: 20,
  flexWrap: "wrap",
  width: "100%"
}

const folderButton = {
  border: "1px solid #334155",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  minWidth: 0
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
  gap: 24,
  width: "100%",
  minWidth: 0
}

const threadList = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 18,
  padding: 16,
  height: "78vh",
  overflowY: "auto",
  overflowX: "hidden",
  boxSizing: "border-box",
  minWidth: 0
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
  minWidth: 0,
  display: "grid",
  gap: 6,
  padding: 14,
  marginBottom: 12,
  borderRadius: 14,
  color: "#e5e7eb",
  textAlign: "left",
  cursor: "pointer",
  boxSizing: "border-box"
}

const threadTopRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  minWidth: 0
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
  fontWeight: 800,
  overflowWrap: "anywhere"
}

const preview = {
  color: "#94a3b8",
  fontSize: 13,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0
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
  border:
    "1px solid rgba(34,211,238,.35)",
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 900,
  width: "fit-content"
}

const quoteBadge = {
  color: "#fde68a",
  background: "#713f12",
  border:
    "1px solid rgba(245,158,11,.4)",
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 900,
  width: "fit-content"
}

const supportBadge = {
  color: "#bbf7d0",
  background: "#14532d",
  border:
    "1px solid rgba(34,197,94,.4)",
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
  minWidth: 0,
  boxSizing: "border-box",
  overflowX: "hidden"
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
  overflowX: "hidden",
  paddingRight: 8,
  minWidth: 0
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

const backButton = {
  width: "fit-content",
  background: "#1e293b",
  color: "#e5e7eb",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: 800,
  cursor: "pointer"
}
