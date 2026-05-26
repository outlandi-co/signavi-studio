import { useState } from "react"
import api from "../../services/api"

const templates = {
  orderUpdate: {
    subject: "Order Status Update",
    message:
      "Hello,\n\nWe wanted to provide an update regarding your order.\n\nThank you for choosing SignaVi Studio.\n\n- SignaVi Studio"
  },

  proofApproval: {
    subject: "Artwork Proof Ready For Approval",
    message:
      "Hello,\n\nYour artwork proof is ready for review.\n\nPlease review and approve the attached proof so production can begin.\n\nThank you,\nSignaVi Studio"
  },

  paymentReminder: {
    subject: "Payment Reminder",
    message:
      "Hello,\n\nThis is a friendly reminder that payment is still required before production can begin.\n\nThank you,\nSignaVi Studio"
  }
}

export default function AdminSendEmail() {
  const [form, setForm] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    message: ""
  })

  const [loading, setLoading] = useState(false)

  const [status, setStatus] = useState({
    type: "",
    message: ""
  })

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const applyTemplate = (key) => {
    const template = templates[key]

    setForm((prev) => ({
      ...prev,
      subject: template.subject,
      message: template.message
    }))
  }

  const handleSend = async (e) => {
    e.preventDefault()

    if (!form.to.trim()) {
      return setStatus({
        type: "error",
        message: "Recipient email required"
      })
    }

    try {
      setLoading(true)

      setStatus({
        type: "",
        message: ""
      })

      await api.post(
        "/admin-email/send-email",
        form
      )

      setStatus({
        type: "success",
        message: "Email sent successfully"
      })

      setForm({
        to: "",
        cc: "",
        bcc: "",
        subject: "",
        message: ""
      })
    } catch (err) {
      console.error(
        "❌ SEND EMAIL ERROR:",
        err
      )

      setStatus({
        type: "error",
        message:
          err?.response?.data?.message ||
          "Failed to send email"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold">
          📧 Send Email
        </h1>

        <p className="mb-6 text-slate-400">
          Send emails directly from your
          SignaVi Studio admin panel.
        </p>

        {/* TEMPLATES */}

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              applyTemplate("orderUpdate")
            }
            className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-black"
          >
            Order Update
          </button>

          <button
            type="button"
            onClick={() =>
              applyTemplate("proofApproval")
            }
            className="rounded-xl bg-green-500 px-4 py-2 font-semibold text-black"
          >
            Proof Approval
          </button>

          <button
            type="button"
            onClick={() =>
              applyTemplate("paymentReminder")
            }
            className="rounded-xl bg-yellow-500 px-4 py-2 font-semibold text-black"
          >
            Payment Reminder
          </button>
        </div>

        <form
          onSubmit={handleSend}
          className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6"
        >
          {/* TO */}

          <label className="mb-2 block text-sm text-slate-400">
            To
          </label>

          <input
            name="to"
            type="email"
            value={form.to}
            onChange={handleChange}
            placeholder="customer@email.com"
            className="mb-4 w-full rounded-xl border border-slate-700 bg-[#020617] p-3 outline-none focus:border-cyan-400"
          />

          {/* CC */}

          <label className="mb-2 block text-sm text-slate-400">
            CC
          </label>

          <input
            name="cc"
            value={form.cc}
            onChange={handleChange}
            placeholder="optional@email.com"
            className="mb-4 w-full rounded-xl border border-slate-700 bg-[#020617] p-3 outline-none focus:border-cyan-400"
          />

          {/* BCC */}

          <label className="mb-2 block text-sm text-slate-400">
            BCC
          </label>

          <input
            name="bcc"
            value={form.bcc}
            onChange={handleChange}
            placeholder="optional@email.com"
            className="mb-4 w-full rounded-xl border border-slate-700 bg-[#020617] p-3 outline-none focus:border-cyan-400"
          />

          {/* SUBJECT */}

          <label className="mb-2 block text-sm text-slate-400">
            Subject
          </label>

          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Email subject"
            className="mb-4 w-full rounded-xl border border-slate-700 bg-[#020617] p-3 outline-none focus:border-cyan-400"
          />

          {/* MESSAGE */}

          <label className="mb-2 block text-sm text-slate-400">
            Message
          </label>

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={10}
            placeholder="Write your message..."
            className="mb-2 w-full rounded-xl border border-slate-700 bg-[#020617] p-3 outline-none focus:border-cyan-400"
          />

          <div className="mb-4 text-right text-xs text-slate-500">
            {form.message.length} characters
          </div>

          {/* STATUS */}

          {status.message && (
            <div
              className={`mb-4 rounded-xl p-3 font-medium ${
                status.type === "success"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {status.message}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
            )}

            {loading
              ? "Sending..."
              : "Send Email"}
          </button>
        </form>
      </div>
    </div>
  )
}