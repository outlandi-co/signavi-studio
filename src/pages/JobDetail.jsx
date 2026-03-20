import { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"

const API_URL = "http://localhost:5050/api"
const FILE_URL = "http://localhost:5050"

function JobDetail() {

  const { id } = useParams()
  const [job, setJob] = useState(null)

  useEffect(() => {

    const fetchJob = async () => {

      try {

        const res = await axios.get(`${API_URL}/jobs`)
        const found = res.data.find(j => j._id === id)

        setJob(found)

      } catch (error) {

        console.error("Failed to load job", error)

      }

    }

    fetchJob()

  }, [id])

  if (!job) {
    return <p style={{ padding: "20px" }}>Loading job...</p>
  }

  return (

    <div style={{ padding: "30px", maxWidth: "700px" }}>

      <h1>{job.product}</h1>

      <p><strong>Customer:</strong> {job.customerName}</p>

      <p><strong>Email:</strong> {job.email}</p>

      <p><strong>Quantity:</strong> {job.quantity}</p>

      <p><strong>Production Type:</strong> {job.productionType}</p>

      <p><strong>Status:</strong> {job.status}</p>

      <p><strong>Notes:</strong> {job.notes}</p>

      {job.artwork && (

        <div style={{ marginTop: "20px" }}>

          <h3>Artwork</h3>

          <a
            href={`${FILE_URL}${job.artwork}`}
            target="_blank"
            rel="noopener noreferrer"
          >

            <img
              src={`${FILE_URL}${job.artwork}`}
              alt="artwork"
              style={{
                width: "300px",
                border: "1px solid #ddd",
                borderRadius: "6px"
              }}
            />

          </a>

        </div>

      )}

    </div>

  )

}

export default JobDetail