import { useState, useRef } from "react"
import { useLocation } from "react-router-dom"
import html2canvas from "html2canvas"

const productImage =
  "https://www.bellacanvas.com/wp-content/uploads/2018/10/3001_white.jpg"

const API_URL =
  (import.meta.env.VITE_API_URL || "https://signavi-backend.onrender.com").replace("/api", "")

export default function AdminMockups() {
  const location = useLocation()
  const job = location.state?.job || null

  const mockupRef = useRef(null)

  const [image, setImage] = useState(
    job?.artwork ? `${API_URL}/uploads/${job.artwork}` : null
  )

  const [placement, setPlacement] = useState("front")
  const [loading, setLoading] = useState(false)

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(URL.createObjectURL(file))
    }
  }

  const saveMockup = async () => {
    if (!job || !mockupRef.current) return alert("No job connected")

    try {
      setLoading(true)

      const canvas = await html2canvas(mockupRef.current)
      const imageData = canvas.toDataURL("image/png")

      await fetch(`${API_URL}/api/orders/${job._id}/mockup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData })
      })

      alert("Mockup saved!")
    } catch (err) {
      console.error(err)
      alert("Save failed")
    } finally {
      setLoading(false)
    }
  }

  const sendForApproval = async () => {
    if (!job) return alert("No job connected")

    try {
      await fetch(`${API_URL}/api/orders/send-artwork/${job._id}`, {
        method: "POST"
      })

      alert("Sent for approval!")
    } catch (err) {
      console.error(err)
      alert("Failed")
    }
  }

  const resetMockup = () => {
    setImage(null)
    setPlacement("front")
  }

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">🎨 Mockup Generator</h1>

      {!job && (
        <div className="bg-yellow-500 text-black p-3 rounded-lg">
          ⚠ Manual Mode
        </div>
      )}

      {job && (
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p><strong>{job.customerName}</strong></p>
          <p>{job.email}</p>
          <p className="text-xs opacity-60">{job._id}</p>
        </div>
      )}

      {/* Upload */}
      <input type="file" accept="image/png,image/svg+xml" onChange={handleUpload} />

      {/* Preview */}
      <div className="flex justify-center bg-black p-6 rounded-xl">
        <div ref={mockupRef} className="relative w-[300px]">

          <img src={productImage} alt="shirt" />

          {image && (
            <img
              src={image}
              alt="art"
              className={`absolute ${
                placement === "sleeve"
                  ? "top-28 left-10 w-16"
                  : "top-24 left-1/2 -translate-x-1/2 w-32"
              }`}
            />
          )}

        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={sendForApproval} className="bg-green-600 px-4 py-2 rounded">
          Send
        </button>

        <button onClick={saveMockup} className="bg-blue-600 px-4 py-2 rounded">
          {loading ? "Saving..." : "Save"}
        </button>

        <button onClick={resetMockup} className="bg-red-600 px-4 py-2 rounded">
          Reset
        </button>
      </div>

    </div>
  )
}