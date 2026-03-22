import axios from "axios"
import { useState } from "react"
import Button from "../components/UI/Button"

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

     <Button onClick={handleUpload}>
  📤 Upload
</Button>

    </div>

  )

}

export default UploadJob