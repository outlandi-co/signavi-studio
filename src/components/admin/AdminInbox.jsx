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

const WORKFLOW_STEPS = [
  {
    number: 1,
    key: "quotes",
    label: "Request Quote",
    description:
      "Customer submitted project details and artwork."
  },
  {
    number: 2,
    key: "review_mockup",
    label: "Review & Mockup",
    description:
      "Review details, answer questions, and prepare mockups when needed."
  },
  {
    number: 3,
    key: "approval_payment",
    label: "Approval & Payment",
    description:
      "Confirm final project details, customer approval, and payment."
  },
  {
    number: 4,
    key: "production",
    label: "Production",
    description:
      "Produce the order after approval and payment."
  },
  {
    number: 5,
    key: "pickup_shipping",
    label: "Pickup or Shipping",
    description:
      "Prepare the completed order for local pickup or shipment."
  }
]

export default function AdminInbox() {
  const [activeFolder, setActiveFolder] = useState("info")
  const [threads, setThreads] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [deletingMessageId, setDeletingMessageId] = useState(null)
  const [updatingQuote, setUpdatingQuote] = useState(false)
  const [quotePrice, setQuotePrice] = useState("")

  const [mockupFile, setMockupFile] = useState(null)
  const [mockupPreview, setMockupPreview] = useState("")
  const [mockupMessage, setMockupMessage] = useState(
    "Here is your digital mockup. Please review the design, placement, colors, and project details before approval."
  )
  const [uploadingMockup, setUploadingMockup] = useState(false)

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
    if (activeFolder === "quotes") {
      return 0
    }

    return threads.filter(
      (thread) =>
        thread.unread &&
        !thread.archived
    ).length
  }, [threads, activeFolder])

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

  useEffect(() => {
    if (selectedThread?.isQuoteRecord) {
      setQuotePrice(
        String(
          selectedThread.finalPrice ??
            selectedThread.price ??
            ""
        )
      )

      setMockupFile(null)
      setMockupPreview(
        selectedThread.mockupUrl ||
          selectedThread.mockup ||
          ""
      )

      setMockupMessage(
        selectedThread.mockupMessage ||
          "Here is your digital mockup. Please review the design, placement, colors, and project details before approval."
      )
    } else {
      setMockupFile(null)
      setMockupPreview("")
    }
  }, [selectedThread])

  /* ======================================================
     QUOTE HELPERS
     ====================================================== */

  const getWorkflowIndex = (quote) => {
    const status = String(quote?.status || "quotes")
      .trim()
      .toLowerCase()

    if (
      status === "completed" ||
      status === "pickup_shipping" ||
      status === "pickup" ||
      status === "shipping" ||
      status === "ready_for_pickup" ||
      status === "shipped"
    ) {
      return 4
    }

    if (
      status === "production" ||
      status === "in_production"
    ) {
      return 3
    }

    if (
      status === "approval_payment" ||
      status === "approval" ||
      status === "payment" ||
      status === "payment_required"
    ) {
      return 2
    }

    if (
      status === "review_mockup" ||
      status === "review" ||
      status === "mockup"
    ) {
      return 1
    }

    return 0
  }

  const updateQuote = async (patch) => {
    if (!selectedThread?.isQuoteRecord) {
      return null
    }

    try {
      setUpdatingQuote(true)

      const res = await api.patch(
        `/quotes/${selectedThread._id}`,
        patch,
        authHeaders
      )

      const updated =
        res.data?.data ||
        res.data?.quote ||
        res.data

      const merged = {
        ...selectedThread,
        ...(updated && typeof updated === "object"
          ? updated
          : patch),
        isQuoteRecord: true,
        channel: "quotes"
      }

      setSelectedThread(merged)

      setThreads((current) =>
        current.map((thread) =>
          thread._id === merged._id
            ? {
                ...thread,
                ...merged,
                customerEmail:
                  merged.email ||
                  merged.customerEmail ||
                  "",
                subject:
                  merged.serviceLabel ||
                  merged.serviceType ||
                  merged.printType ||
                  "Quote Request",
                lastMessage:
                  merged.notes ||
                  "Quote request submitted"
              }
            : thread
        )
      )

      return merged
    } catch (error) {
      console.error(
        "UPDATE QUOTE ERROR:",
        error
      )

      alert(
        error?.response?.data?.message ||
          "The quote could not be updated."
      )

      return null
    } finally {
      setUpdatingQuote(false)
    }
  }

  const moveQuoteToStep = async (status) => {
    await updateQuote({ status })
  }

  const saveQuotePrice = async () => {
    const numericPrice = Number(quotePrice)

    if (
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      alert("Enter a valid quote price.")
      return
    }

    await updateQuote({
      price: numericPrice,
      finalPrice: numericPrice
    })
  }

  const approveQuote = async () => {
    await updateQuote({
      approvalStatus: "approved",
      status: "approval_payment"
    })
  }

  const handleMockupFile = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "application/pdf"
    ]

    if (!allowedTypes.includes(file.type)) {
      alert("Use a PNG, JPG, WEBP, or PDF mockup file.")
      event.target.value = ""
      return
    }

    const maxSize = 15 * 1024 * 1024

    if (file.size > maxSize) {
      alert("Mockup files must be 15 MB or smaller.")
      event.target.value = ""
      return
    }

    if (mockupPreview?.startsWith("blob:")) {
      window.URL.revokeObjectURL(mockupPreview)
    }

    setMockupFile(file)
    setMockupPreview(window.URL.createObjectURL(file))
  }

  const removeMockupFile = () => {
    if (mockupPreview?.startsWith("blob:")) {
      window.URL.revokeObjectURL(mockupPreview)
    }

    setMockupFile(null)
    setMockupPreview(
      selectedThread?.mockupUrl ||
        selectedThread?.mockup ||
        ""
    )
  }

  const sendMockupAndQuote = async () => {
    if (!selectedThread?.isQuoteRecord) {
      return
    }

    const numericPrice = Number(quotePrice)

    if (
      Number.isNaN(numericPrice) ||
      numericPrice <= 0
    ) {
      alert("Enter a valid final quote price before sending.")
      return
    }

    if (
      !mockupFile &&
      !selectedThread.mockupUrl &&
      !selectedThread.mockup
    ) {
      alert("Choose a digital mockup or proof to send to the customer.")
      return
    }

    if (!mockupMessage.trim()) {
      alert("Add a short message for the customer.")
      return
    }

    try {
      setUploadingMockup(true)

      const formData = new FormData()

      if (mockupFile) {
        formData.append("mockup", mockupFile)
      }

      formData.append("mockupMessage", mockupMessage.trim())
      formData.append("price", String(numericPrice))
      formData.append("finalPrice", String(numericPrice))
      formData.append("status", "approval_payment")

      const res = await api.patch(
        `/quotes/${selectedThread._id}/mockup`,
        formData,
        authHeaders
      )

      const updated =
        res.data?.data ||
        res.data?.quote ||
        res.data

      const merged = {
        ...selectedThread,
        ...(updated && typeof updated === "object"
          ? updated
          : {
              price: numericPrice,
              finalPrice: numericPrice,
              mockupMessage: mockupMessage.trim(),
              status: "approval_payment"
            }),
        isQuoteRecord: true,
        channel: "quotes"
      }

      setSelectedThread(merged)
      setQuotePrice(String(numericPrice))
      setMockupFile(null)

      if (merged.mockupUrl || merged.mockup) {
        setMockupPreview(
          merged.mockupUrl ||
            merged.mockup
        )
      }

      setThreads((current) =>
        current.map((thread) =>
          thread._id === merged._id
            ? {
                ...thread,
                ...merged,
                customerEmail:
                  merged.email ||
                  merged.customerEmail ||
                  "",
                subject:
                  merged.serviceLabel ||
                  merged.serviceType ||
                  merged.printType ||
                  "Quote Request",
                lastMessage:
                  merged.mockupMessage ||
                  merged.notes ||
                  "Digital mockup sent"
              }
            : thread
        )
      )

      alert("Digital mockup and quote sent to the customer.")
    } catch (error) {
      console.error(
        "SEND MOCKUP ERROR:",
        error
      )

      alert(
        error?.response?.data?.message ||
          "The digital mockup could not be sent."
      )
    } finally {
      setUploadingMockup(false)
    }
  }

  const downloadArtwork = async (quote) => {
    const artworkUrl =
      quote?.artwork ||
      quote?.artworkUrl

    if (!artworkUrl) {
      return
    }

    try {
      const response = await fetch(artworkUrl)

      if (!response.ok) {
        throw new Error(
          "Artwork download failed"
        )
      }

      const blob = await response.blob()
      const blobUrl =
        window.URL.createObjectURL(blob)

      const urlWithoutQuery =
        artworkUrl.split("?")[0]

      const extensionMatch =
        urlWithoutQuery.match(
          /\.([a-zA-Z0-9]+)$/
        )

      const extension =
        extensionMatch?.[1] || "png"

      const preferredName =
        quote?.artworkName?.trim()

      const filename =
        preferredName ||
        `quote-${quote._id}-artwork.${extension}`

      const anchor =
        document.createElement("a")

      anchor.href = blobUrl
      anchor.download = filename

      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()

      window.URL.revokeObjectURL(
        blobUrl
      )
    } catch (error) {
      console.error(
        "DOWNLOAD ARTWORK ERROR:",
        error
      )

      window.open(
        artworkUrl,
        "_blank",
        "noopener,noreferrer"
      )
    }
  }

  /* ======================================================
     LOAD COMMUNICATIONS
     ====================================================== */

  const loadThreads = useCallback(async () => {
    try {
      setLoading(true)

      if (activeFolder === "quotes") {
        const res = await api.get(
          "/quotes",
          authHeaders
        )

        const quoteData = Array.isArray(res.data?.data)
          ? res.data.data
          : []

        const normalizedQuotes = quoteData.map((quote) => ({
          ...quote,
          isQuoteRecord: true,
          channel: "quotes",

          customerEmail:
            quote.email ||
            quote.customerEmail ||
            "",

          customerName:
            quote.customerName ||
            quote.name ||
            quote.email ||
            "Quote Customer",

          subject:
            quote.serviceLabel ||
            quote.serviceType ||
            quote.printType ||
            "Quote Request",

          lastMessage:
            quote.notes ||
            "Quote request submitted",

          unread: false,
          archived: false
        }))

        setThreads(normalizedQuotes)
        return
      }

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
        "LOAD COMMUNICATIONS ERROR:",
        error
      )

      setThreads([])
    } finally {
      setLoading(false)
    }
  }, [activeFolder, authHeaders])

  /* ======================================================
     OPEN THREAD / QUOTE
     ====================================================== */

  const loadMessages = async (thread) => {
    if (thread?.isQuoteRecord) {
      setSelectedThread(thread)
      setMessages([])
      return
    }

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

  /* ======================================================
     SEND EMAIL REPLY
     ====================================================== */

  const sendReply = async (message) => {
    if (
      !message.trim() ||
      !selectedThread ||
      selectedThread?.isQuoteRecord
    ) {
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

  /* ======================================================
     DELETE EMAIL MESSAGE
     ====================================================== */

  const deleteMessage = async (message) => {
    if (
      !selectedThread ||
      selectedThread?.isQuoteRecord ||
      !message?._id
    ) {
      return
    }

    const confirmed = window.confirm(
      "Delete this message? This cannot be undone."
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingMessageId(
        message._id
      )

      await api.delete(
        `/admin-email-threads/${selectedThread._id}/messages/${message._id}`,
        authHeaders
      )

      setMessages((current) =>
        current.filter(
          (item) =>
            item._id !== message._id
        )
      )

      await loadThreads()
    } catch (error) {
      console.error(
        "DELETE MESSAGE ERROR:",
        error
      )

      alert(
        "The message could not be deleted."
      )
    } finally {
      setDeletingMessageId(null)
    }
  }

  /* ======================================================
     ARCHIVE EMAIL THREAD
     ====================================================== */

  const archiveThread = async () => {
    if (
      !selectedThread ||
      selectedThread?.isQuoteRecord
    ) {
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

  /* ======================================================
     RESTORE EMAIL THREAD
     ====================================================== */

  const restoreThread = async () => {
    if (
      !selectedThread ||
      selectedThread?.isQuoteRecord
    ) {
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

  /* ======================================================
     INITIAL LOAD / FOLDER CHANGE
     ====================================================== */

  useEffect(() => {
    const timer = setTimeout(() => {
      loadThreads()
    }, 0)

    return () => clearTimeout(timer)
  }, [loadThreads])

  /* ======================================================
     SOCKET
     ====================================================== */

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

    socket.on(
      "adminEmailMessageDeleted",
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

      socket.off(
        "adminEmailMessageDeleted",
        refreshThreads
      )

      socket.disconnect()
    }
  }, [loadThreads])

  /* ======================================================
     FOLDER / BACK
     ====================================================== */

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

  /* ======================================================
     LABEL HELPERS
     ====================================================== */

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

  const formatMoney = (value) => {
    const number = Number(value || 0)

    return number.toLocaleString(
      "en-US",
      {
        style: "currency",
        currency: "USD"
      }
    )
  }

  const formatDate = (value) => {
    if (!value) {
      return "Not available"
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return "Not available"
    }

    return date.toLocaleString()
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

  const workflowIndex =
    selectedThread?.isQuoteRecord
      ? getWorkflowIndex(selectedThread)
      : 0

  return (
    <main
      style={{
        ...page,
        padding: isMobile ? 0 : 30
      }}
    >
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
        {(!isMobile || !selectedThread) && (
          <aside
            style={{
              ...threadList,
              width: "100%",
              minWidth: 0,
              height: isMobile
                ? "auto"
                : "78vh",
              maxHeight: isMobile
                ? "none"
                : "78vh",
              padding: isMobile ? 10 : 16,
              borderRadius: isMobile
                ? 14
                : 18
            }}
          >
            <div style={threadListHeader}>
              <div>
                <p style={threadListLabel}>
                  {currentFolder?.label ||
                    "Communications"}
                </p>

                <p style={threadCount}>
                  {threads.length}{" "}
                  {activeFolder === "quotes"
                    ? "quote request"
                    : "conversation"}
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
                      ? "No quote requests yet."
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
                      padding: isMobile
                        ? 12
                        : 14
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
                          thread.customerEmail ||
                          "Customer"}
                      </strong>

                      {thread.unread &&
                        activeFolder !== "archive" && (
                          <span style={unreadDot} />
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

                      {thread.isQuoteRecord && (
                        <>
                          <span style={quoteStatusBadge}>
                            {thread.approvalStatus ||
                              "pending"}
                          </span>

                          <span style={workflowSmallBadge}>
                            Step{" "}
                            {getWorkflowIndex(thread) + 1}
                          </span>
                        </>
                      )}

                      {thread.unread &&
                        activeFolder !== "archive" && (
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
              minHeight: isMobile
                ? "auto"
                : "78vh",
              padding: isMobile
                ? 8
                : 22,
              borderRadius: isMobile
                ? 12
                : 18,
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
                  {activeFolder === "quotes"
                    ? "Customer quote requests will appear here."
                    : "Customer messages will appear here."}
                </p>
              </div>
            ) : selectedThread.isQuoteRecord ? (
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
                    gap: isMobile
                      ? 10
                      : 16
                  }}
                >
                  <div
                    style={{
                      minWidth: 0,
                      width: "100%"
                    }}
                  >
                    <div style={quoteBadgeLarge}>
                      Quote Request
                    </div>

                    <h2
                      style={{
                        ...conversationTitle,
                        fontSize: isMobile
                          ? 20
                          : undefined,
                        lineHeight: 1.25,
                        overflowWrap:
                          "anywhere"
                      }}
                    >
                      {selectedThread.serviceLabel ||
                        selectedThread.serviceType ||
                        selectedThread.printType ||
                        "Custom Quote"}
                    </h2>

                    <p style={customerLine}>
                      <strong>
                        {selectedThread.customerName ||
                          "Customer"}
                      </strong>
                    </p>

                    <p style={muted}>
                      {selectedThread.email ||
                        selectedThread.customerEmail ||
                        "No email provided"}
                    </p>

                    {selectedThread.phone && (
                      <p style={muted}>
                        {selectedThread.phone}
                      </p>
                    )}
                  </div>

                  <span style={quotePendingLarge}>
                    {selectedThread.approvalStatus ||
                      "pending"}
                  </span>
                </div>

                <div style={workflowPanel}>
                  <div style={workflowHeader}>
                    <div>
                      <p style={quoteSectionTitle}>
                        Project Workflow
                      </p>

                      <h3 style={workflowTitle}>
                        From Idea To Finished Product
                      </h3>
                    </div>

                    <span style={workflowCurrentBadge}>
                      Step {workflowIndex + 1} of 5
                    </span>
                  </div>

                  <div style={workflowGrid}>
                    {WORKFLOW_STEPS.map(
                      (step, index) => {
                        const complete =
                          index < workflowIndex
                        const current =
                          index === workflowIndex

                        return (
                          <div
                            key={step.key}
                            style={{
                              ...workflowCard,
                              border: current
                                ? "1px solid #22d3ee"
                                : complete
                                  ? "1px solid rgba(34,197,94,.45)"
                                  : "1px solid #1e293b",
                              background: current
                                ? "rgba(34,211,238,.08)"
                                : complete
                                  ? "rgba(34,197,94,.06)"
                                  : "#020617"
                            }}
                          >
                            <div
                              style={{
                                ...workflowNumber,
                                background: complete
                                  ? "#22c55e"
                                  : current
                                    ? "#22d3ee"
                                    : "#1e293b",
                                color:
                                  complete ||
                                  current
                                    ? "#020617"
                                    : "#94a3b8"
                              }}
                            >
                              {complete
                                ? "✓"
                                : step.number}
                            </div>

                            <strong
                              style={workflowStepLabel}
                            >
                              {step.label}
                            </strong>

                            <p
                              style={workflowDescription}
                            >
                              {step.description}
                            </p>

                            {current && (
                              <span style={currentStepPill}>
                                Current
                              </span>
                            )}
                          </div>
                        )
                      }
                    )}
                  </div>

                  <div style={workflowActions}>
                    {workflowIndex === 0 && (
                      <button
                        type="button"
                        disabled={updatingQuote}
                        onClick={() =>
                          moveQuoteToStep(
                            "review_mockup"
                          )
                        }
                        style={primaryAction}
                      >
                        {updatingQuote
                          ? "Updating..."
                          : "Begin Review & Mockup"}
                      </button>
                    )}

                    {(workflowIndex === 1 ||
                      workflowIndex === 2) && (
                      <button
                        type="button"
                        disabled={
                          updatingQuote ||
                          uploadingMockup
                        }
                        onClick={sendMockupAndQuote}
                        style={primaryAction}
                      >
                        {uploadingMockup
                          ? "Sending Mockup..."
                          : workflowIndex === 2
                            ? "Resend Mockup & Quote to Customer"
                            : "Send Mockup & Quote to Customer"}
                      </button>
                    )}

                    {workflowIndex === 2 && (
                      <>
                        {selectedThread.approvalStatus !==
                          "approved" && (
                          <button
                            type="button"
                            disabled={updatingQuote}
                            onClick={approveQuote}
                            style={approveButton}
                          >
                            {updatingQuote
                              ? "Updating..."
                              : "Approve Quote"}
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={updatingQuote}
                          onClick={() =>
                            moveQuoteToStep(
                              "production"
                            )
                          }
                          style={primaryAction}
                        >
                          {updatingQuote
                            ? "Updating..."
                            : "Move to Production"}
                        </button>
                      </>
                    )}

                    {workflowIndex === 3 && (
                      <button
                        type="button"
                        disabled={updatingQuote}
                        onClick={() =>
                          moveQuoteToStep(
                            "pickup_shipping"
                          )
                        }
                        style={primaryAction}
                      >
                        {updatingQuote
                          ? "Updating..."
                          : "Move to Pickup or Shipping"}
                      </button>
                    )}

                    {workflowIndex === 4 && (
                      <button
                        type="button"
                        disabled={updatingQuote}
                        onClick={() =>
                          moveQuoteToStep(
                            "completed"
                          )
                        }
                        style={completeButton}
                      >
                        {updatingQuote
                          ? "Updating..."
                          : "Mark Project Complete"}
                      </button>
                    )}
                  </div>

                  {workflowIndex === 2 && (
                    <p style={workflowHint}>
                      Move to Production after customer approval and payment are confirmed.
                    </p>
                  )}
                </div>

                <div style={quoteGrid}>
                  <div style={quoteStat}>
                    <span style={quoteStatLabel}>
                      Quantity
                    </span>

                    <strong style={quoteStatValue}>
                      {selectedThread.quantity || 1}
                    </strong>
                  </div>

                  <div style={quoteStat}>
                    <span style={quoteStatLabel}>
                      Estimate
                    </span>

                    <strong style={quoteStatValue}>
                      {formatMoney(
                        selectedThread.finalPrice ??
                          selectedThread.price
                      )}
                    </strong>
                  </div>

                  <div style={quoteStat}>
                    <span style={quoteStatLabel}>
                      Turnaround
                    </span>

                    <strong style={quoteStatValue}>
                      {selectedThread.turnaround ||
                        "Standard"}
                    </strong>
                  </div>

                  <div style={quoteStat}>
                    <span style={quoteStatLabel}>
                      Submitted
                    </span>

                    <strong
                      style={{
                        ...quoteStatValue,
                        fontSize: 13
                      }}
                    >
                      {formatDate(
                        selectedThread.createdAt
                      )}
                    </strong>
                  </div>
                </div>

                <div style={quoteSection}>
                  <p style={quoteSectionTitle}>
                    Final Quote Price
                  </p>

                  <div style={priceRow}>
                    <div style={priceInputWrap}>
                      <span style={currencyPrefix}>
                        $
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={quotePrice}
                        onChange={(event) =>
                          setQuotePrice(
                            event.target.value
                          )
                        }
                        style={priceInput}
                      />
                    </div>

                    <button
                      type="button"
                      disabled={updatingQuote}
                      onClick={saveQuotePrice}
                      style={secondaryAction}
                    >
                      {updatingQuote
                        ? "Saving..."
                        : "Save Price"}
                    </button>
                  </div>

                  <p style={priceHint}>
                    Set or adjust the final project price before customer approval and payment.
                  </p>
                </div>

                {(selectedThread.serviceLabel ||
                  selectedThread.serviceType ||
                  selectedThread.printType) && (
                  <div style={quoteSection}>
                    <p style={quoteSectionTitle}>
                      Service
                    </p>

                    <p style={quoteText}>
                      {selectedThread.serviceLabel ||
                        selectedThread.serviceType ||
                        selectedThread.printType}
                    </p>
                  </div>
                )}

                <div style={quoteSection}>
                  <p style={quoteSectionTitle}>
                    Project Description
                  </p>

                  <p style={quoteText}>
                    {selectedThread.notes ||
                      "No project description provided."}
                  </p>
                </div>

                {(selectedThread.artwork ||
                  selectedThread.artworkUrl) && (
                  <div style={quoteSection}>
                    <p style={quoteSectionTitle}>
                      Artwork / Reference
                    </p>

                    <img
                      src={
                        selectedThread.artwork ||
                        selectedThread.artworkUrl
                      }
                      alt="Customer quote artwork"
                      style={artworkImage}
                    />

                    <div style={artworkButtonRow}>
                      <button
                        type="button"
                        onClick={() =>
                          downloadArtwork(
                            selectedThread
                          )
                        }
                        style={downloadButton}
                      >
                        ⬇ Download Artwork
                      </button>

                      <a
                        href={
                          selectedThread.artwork ||
                          selectedThread.artworkUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        style={openArtworkButton}
                      >
                        ↗ Open Full Artwork
                      </a>
                    </div>
                  </div>
                )}

                {workflowIndex >= 1 && (
                  <div style={quoteSection}>
                    <p style={quoteSectionTitle}>
                      Digital Mockup / Proof
                    </p>

                    <p style={priceHint}>
                      Upload the finished proof you want the customer to review before approval and payment.
                    </p>

                    <label style={mockupUploadBox}>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,application/pdf"
                        onChange={handleMockupFile}
                        style={{ display: "none" }}
                      />

                      <span style={mockupUploadIcon}>
                        ⬆
                      </span>

                      <strong style={mockupUploadTitle}>
                        {mockupFile
                          ? "Replace Mockup"
                          : selectedThread.mockupUrl ||
                              selectedThread.mockup
                            ? "Replace Existing Mockup"
                            : "Choose Mockup File"}
                      </strong>

                      <span style={mockupUploadHint}>
                        PNG, JPG, WEBP, or PDF • Maximum 15 MB
                      </span>
                    </label>

                    {mockupPreview && (
                      <div style={mockupPreviewWrap}>
                        {(
                          mockupFile?.type === "application/pdf" ||
                          (!mockupFile &&
                            String(mockupPreview)
                              .toLowerCase()
                              .includes(".pdf"))
                        ) ? (
                          <a
                            href={mockupPreview}
                            target="_blank"
                            rel="noreferrer"
                            style={openArtworkButton}
                          >
                            ↗ Open PDF Mockup
                          </a>
                        ) : (
                          <img
                            src={mockupPreview}
                            alt="Digital customer mockup"
                            style={artworkImage}
                          />
                        )}

                        {mockupFile && (
                          <button
                            type="button"
                            onClick={removeMockupFile}
                            style={removeMockupButton}
                          >
                            Remove Selected File
                          </button>
                        )}
                      </div>
                    )}

                    <label style={mockupLabel}>
                      Message to Customer
                    </label>

                    <textarea
                      value={mockupMessage}
                      onChange={(event) =>
                        setMockupMessage(event.target.value)
                      }
                      rows={5}
                      placeholder="Add a message for the customer..."
                      style={mockupTextarea}
                    />

                    <div style={mockupSummary}>
                      <div>
                        <span style={quoteStatLabel}>
                          Final Quote
                        </span>

                        <strong style={quoteStatValue}>
                          {formatMoney(
                            Number(quotePrice || 0)
                          )}
                        </strong>
                      </div>

                      <div>
                        <span style={quoteStatLabel}>
                          Next Step
                        </span>

                        <strong
                          style={{
                            ...quoteStatValue,
                            fontSize: 14
                          }}
                        >
                          Customer Approval & Payment
                        </strong>
                      </div>
                    </div>

                    {(workflowIndex === 1 ||
                      workflowIndex === 2) && (
                      <button
                        type="button"
                        onClick={sendMockupAndQuote}
                        disabled={
                          updatingQuote ||
                          uploadingMockup
                        }
                        style={{
                          ...primaryAction,
                          width: "100%",
                          marginTop: 14
                        }}
                      >
                        {uploadingMockup
                          ? "Sending Mockup..."
                          : workflowIndex === 2
                            ? "Resend Mockup & Quote to Customer"
                            : "Send Mockup & Quote to Customer"}
                      </button>
                    )}

                    {(selectedThread.mockupUrl ||
                      selectedThread.mockup) &&
                      selectedThread.mockupSentAt && (
                        <p style={mockupSentText}>
                          Last sent:{" "}
                          {formatDate(
                            selectedThread.mockupSentAt
                          )}
                        </p>
                      )}
                  </div>
                )}

                <div style={quoteSection}>
                  <p style={quoteSectionTitle}>
                    Quote ID
                  </p>

                  <code style={quoteId}>
                    {selectedThread._id}
                  </code>
                </div>
              </>
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
                    gap: isMobile
                      ? 10
                      : 16,
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
                        overflowWrap:
                          "anywhere",
                        wordBreak:
                          "break-word"
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
                        overflowWrap:
                          "anywhere",
                        wordBreak:
                          "break-word"
                      }}
                    >
                      Customer:{" "}
                      {
                        selectedThread.customerEmail
                      }
                    </p>

                    {activeFolder !== "archive" && (
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

                  {activeFolder !== "archive" ? (
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
                    overflowX:
                      "hidden",
                    paddingRight:
                      isMobile
                        ? 0
                        : 8,
                    gap: isMobile
                      ? 10
                      : 14
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
                            _id: msg._id,
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
                          onDelete={() =>
                            deleteMessage(msg)
                          }
                          deleting={
                            deletingMessageId ===
                            msg._id
                          }
                        />
                      </div>
                    ))
                  )}
                </div>

                {activeFolder !== "archive" && (
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
                      placeholder="Reply to this customer..."
                      buttonText="Send Reply"
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

/* ======================================================
   STYLES
   ====================================================== */

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

const quoteStatusBadge = {
  color: "#fde68a",
  background:
    "rgba(245,158,11,.12)",
  border:
    "1px solid rgba(245,158,11,.25)",
  borderRadius: 999,
  padding: "4px 8px",
  fontSize: 11,
  fontWeight: 900,
  textTransform: "capitalize"
}

const workflowSmallBadge = {
  color: "#67e8f9",
  background:
    "rgba(34,211,238,.08)",
  border:
    "1px solid rgba(34,211,238,.22)",
  borderRadius: 999,
  padding: "4px 8px",
  fontSize: 11,
  fontWeight: 900
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

/* ======================================================
   QUOTE DETAIL STYLES
   ====================================================== */

const customerLine = {
  marginTop: 0,
  marginBottom: 4,
  color: "#f8fafc",
  fontSize: 15
}

const quotePendingLarge = {
  background:
    "rgba(245,158,11,.12)",
  border:
    "1px solid rgba(245,158,11,.35)",
  color: "#fde68a",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "capitalize",
  height: "fit-content",
  width: "fit-content"
}

const quoteGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(130px, 1fr))",
  gap: 12,
  width: "100%",
  marginBottom: 18
}

const quoteStat = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 14,
  padding: 14,
  minWidth: 0
}

const quoteStatLabel = {
  display: "block",
  color: "#64748b",
  fontSize: 11,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: ".08em",
  marginBottom: 6
}

const quoteStatValue = {
  display: "block",
  color: "#f8fafc",
  fontSize: 18,
  overflowWrap: "anywhere"
}

const quoteSection = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 14,
  padding: 16,
  marginBottom: 14,
  minWidth: 0
}

const quoteSectionTitle = {
  marginTop: 0,
  marginBottom: 8,
  color: "#22d3ee",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: ".08em"
}

const quoteText = {
  margin: 0,
  color: "#e2e8f0",
  fontSize: 14,
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere"
}

const artworkImage = {
  display: "block",
  width: "100%",
  maxWidth: 520,
  maxHeight: 420,
  objectFit: "contain",
  background: "#ffffff",
  borderRadius: 12,
  border: "1px solid #334155"
}

const artworkButtonRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 12
}

const downloadButton = {
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer"
}

const openArtworkButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#111827",
  color: "#e5e7eb",
  border: "1px solid #334155",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 900,
  textDecoration: "none"
}

const quoteId = {
  color: "#94a3b8",
  overflowWrap: "anywhere",
  wordBreak: "break-all"
}

const mockupUploadBox = {
  width: "100%",
  minHeight: 130,
  border: "1px dashed #22d3ee",
  borderRadius: 14,
  background: "rgba(34,211,238,.05)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: 18,
  boxSizing: "border-box",
  cursor: "pointer",
  marginTop: 12,
  marginBottom: 14,
  textAlign: "center"
}

const mockupUploadIcon = {
  width: 38,
  height: 38,
  borderRadius: 999,
  background: "#22d3ee",
  color: "#020617",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
  fontSize: 20
}

const mockupUploadTitle = {
  color: "#f8fafc",
  fontSize: 14
}

const mockupUploadHint = {
  color: "#64748b",
  fontSize: 12
}

const mockupPreviewWrap = {
  display: "grid",
  gap: 10,
  marginBottom: 14
}

const removeMockupButton = {
  width: "fit-content",
  background: "rgba(239,68,68,.1)",
  color: "#fca5a5",
  border: "1px solid rgba(239,68,68,.35)",
  borderRadius: 10,
  padding: "9px 12px",
  fontWeight: 800,
  cursor: "pointer"
}

const mockupLabel = {
  display: "block",
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: ".08em",
  marginBottom: 8
}

const mockupTextarea = {
  width: "100%",
  minHeight: 120,
  resize: "vertical",
  boxSizing: "border-box",
  background: "#0f172a",
  color: "#f8fafc",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: 12,
  outline: "none",
  lineHeight: 1.55,
  fontFamily: "inherit"
}

const mockupSummary = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 12,
  padding: 14,
  marginTop: 14
}

const mockupSentText = {
  marginTop: 10,
  marginBottom: 0,
  color: "#86efac",
  fontSize: 12,
  fontWeight: 800
}

/* ======================================================
   WORKFLOW STYLES
   ====================================================== */

const workflowPanel = {
  background:
    "linear-gradient(180deg, rgba(15,23,42,.96), rgba(2,6,23,.96))",
  border: "1px solid #1e293b",
  borderRadius: 16,
  padding: 16,
  marginBottom: 18
}

const workflowHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 14
}

const workflowTitle = {
  margin: 0,
  color: "#f8fafc",
  fontSize: 20
}

const workflowCurrentBadge = {
  display: "inline-flex",
  alignItems: "center",
  background:
    "rgba(34,211,238,.08)",
  border:
    "1px solid rgba(34,211,238,.24)",
  color: "#67e8f9",
  padding: "7px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900
}

const workflowGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(145px, 1fr))",
  gap: 10
}

const workflowCard = {
  position: "relative",
  minWidth: 0,
  borderRadius: 14,
  padding: 13,
  minHeight: 150
}

const workflowNumber = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  marginBottom: 10
}

const workflowStepLabel = {
  display: "block",
  color: "#f8fafc",
  lineHeight: 1.35
}

const workflowDescription = {
  color: "#94a3b8",
  fontSize: 12,
  lineHeight: 1.5,
  marginBottom: 0
}

const currentStepPill = {
  display: "inline-block",
  marginTop: 10,
  color: "#020617",
  background: "#22d3ee",
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 10,
  fontWeight: 900
}

const workflowActions = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 14
}

const workflowHint = {
  color: "#94a3b8",
  fontSize: 12,
  marginBottom: 0
}

/* ======================================================
   PRICE / ACTION STYLES
   ====================================================== */

const priceRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  alignItems: "center"
}

const priceInputWrap = {
  position: "relative",
  minWidth: 190,
  flex: "1 1 220px"
}

const currencyPrefix = {
  position: "absolute",
  left: 12,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#94a3b8",
  fontWeight: 900,
  pointerEvents: "none"
}

const priceInput = {
  width: "100%",
  boxSizing: "border-box",
  background: "#0f172a",
  border: "1px solid #334155",
  color: "#f8fafc",
  borderRadius: 10,
  padding: "11px 12px 11px 28px",
  outline: "none",
  fontWeight: 800
}

const priceHint = {
  marginBottom: 0,
  color: "#64748b",
  fontSize: 12,
  lineHeight: 1.5
}

const primaryAction = {
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer"
}

const secondaryAction = {
  background: "#1e293b",
  color: "#e5e7eb",
  border: "1px solid #334155",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer"
}

const approveButton = {
  background: "#22c55e",
  color: "#020617",
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer"
}

const completeButton = {
  background: "#a78bfa",
  color: "#020617",
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer"
}
