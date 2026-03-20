import { useState } from "react"
import api from "../services/api"

function UploadArtwork({ setArtwork }) {

  const [file, setFile] = useState(null)

  const handleUpload = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await api.post("/upload", formData)

      console.log("✅ Uploaded:", res.data)

      // 🔥 IMPORTANT: FULL URL
      const fullUrl = `http://localhost:5050${res.data.url}`

      setArtwork(fullUrl)

    } catch (err) {
      console.error("❌ Upload error:", err)
    }
  }

  return (
    <div className="space-y-2">

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        type="button"
        onClick={handleUpload}
        className="bg-gray-800 text-white px-4 py-2 rounded"
      >
        Upload Artwork
      </button>

      {/* 👇 Preview */}
      {file && (
        <img
          src={URL.createObjectURL(file)}
          className="w-32 mt-2 border"
        />
      )}

    </div>
  )
}

export default UploadArtwork