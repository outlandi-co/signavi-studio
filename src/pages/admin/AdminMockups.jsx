import { useState, useRef } from "react"
import { useLocation } from "react-router-dom"
import html2canvas from "html2canvas"

/* 🔥 SAMPLE PRODUCT IMAGE */
const productImage =
  "https://www.bellacanvas.com/wp-content/uploads/2018/10/3001_white.jpg"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050"

export default function AdminMockups() {
  const location = useLocation()
  const job = location.state?.job

  const mockupRef = useRef()

  /* 🔥 AUTO LOAD ARTWORK IF FROM PRODUCTION */
  const [image, setImage] = useState(
    job?.artwork ? `${API_URL}/uploads/${job.artwork}` : null
  )

  const [placement, setPlacement] = useState("front")

  /* HANDLE UPLOAD (fallback) */
  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(URL.createObjectURL(file))
    }
  }

  /* 🔥 SAVE MOCKUP IMAGE */
  const saveMockup = async () => {
    if (!job) {
      console.warn("No job connected — cannot save")
      return
    }

    try {
      const canvas = await html2canvas(mockupRef.current)
      const imageData = canvas.toDataURL("image/png")

      await fetch(`${API_URL}/api/orders/${job._id}/mockup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: imageData })
      })

      alert("Mockup saved!")
    } catch (err) {
      console.error(err)
      alert("Failed to save mockup")
    }
  }

  /* 🔥 SEND FOR APPROVAL */
  const sendForApproval = async () => {
    if (!job) {
      console.warn("No job connected — manual mode")
      return
    }

    try {
      await fetch(`${API_URL}/api/orders/send-artwork/${job._id}`, {
        method: "POST"
      })

      alert("Mockup sent for approval!")
    } catch (err) {
      console.error(err)
      alert("Failed to send")
    }
  }

  /* RESET */
  const resetMockup = () => {
    setImage(null)
    setPlacement("front")
  }

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">🎨 Mockup Generator</h1>

      {/* 🔥 MANUAL MODE WARNING */}
      {!job && (
        <div className="bg-yellow-500 text-black p-3 rounded-lg">
          ⚠ No order connected — manual mockup mode
        </div>
      )}

      {/* 🔥 ORDER INFO */}
      {job && (
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p><strong>Customer:</strong> {job.customerName}</p>
          <p><strong>Email:</strong> {job.email}</p>
          <p><strong>Order ID:</strong> {job._id}</p>
        </div>
      )}

      {/* UPLOAD */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <label className="block mb-2 text-sm text-gray-400">
          Upload Artwork (PNG recommended)
        </label>

        <input
          type="file"
          accept="image/png, image/svg+xml"
          onChange={handleUpload}
          className="text-white"
        />
      </div>

      {/* PLACEMENT */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="mb-4 text-lg font-semibold">Placement</h2>

        <div className="flex gap-4">
          {["front", "back", "sleeve"].map((p) => (
            <button
              key={p}
              onClick={() => setPlacement(p)}
              className={`px-4 py-2 rounded-lg border ${
                placement === p
                  ? "bg-cyan-600"
                  : "bg-black border-gray-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* MOCKUP PREVIEW */}
      <div className="bg-black p-6 rounded-xl border border-gray-800 flex justify-center">
        <div ref={mockupRef} className="relative w-[300px]">

          {/* PRODUCT */}
          <img src={productImage} alt="product" />

          {/* ARTWORK OVERLAY */}
          {image && (
            <img
              src={image}
              alt="artwork"
              className={`absolute ${
                placement === "front"
                  ? "top-24 left-1/2 -translate-x-1/2 w-32"
                  : placement === "back"
                  ? "top-24 left-1/2 -translate-x-1/2 w-32"
                  : "top-28 left-10 w-16"
              }`}
            />
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-4">
        <button
          onClick={sendForApproval}
          className="bg-green-600 px-4 py-2 rounded-lg"
        >
          Send for Approval
        </button>

        <button
          onClick={saveMockup}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          💾 Save Mockup
        </button>

        <button
          onClick={resetMockup}
          className="bg-red-600 px-4 py-2 rounded-lg"
        >
          Reset
        </button>
      </div>

    </div>
  )
}