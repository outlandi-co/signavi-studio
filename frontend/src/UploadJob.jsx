import axios from "axios"
import { useState } from "react"

function UploadJob() {

  const [file, setFile] = useState(null)

  const handleUpload = async () => {

    const formData = new FormData()
    formData.append("artwork", file)

    const res = await axios.post(
      "http://localhost:5050/api/upload",
      formData
    )

    console.log(res.data)

  }

  return (

    <div>

      <h1>Upload Artwork</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload}>
        Upload
      </button>

    </div>

  )

}

export default UploadJob