import { useEffect, useState } from "react"
import axios from "axios"

const API_URL = "http://localhost:5050/api"
const FILE_URL = "http://localhost:"

const STATUS_COLUMNS = [
  "pending",
  "approved",
  "printing",
  "completed"
]

function ShopFloor() {

  const [jobs, setJobs] = useState([])

  useEffect(() => {

    const loadJobs = async () => {

      try {

        const res = await axios.get(`${API_URL}/jobs`)
        setJobs(res.data)

      } catch (error) {

        console.error("Failed to fetch jobs:", error)

      }

    }

    loadJobs()

    const interval = setInterval(loadJobs, 4000)

    return () => clearInterval(interval)

  }, [])

  return (

    <div
      style={{
        display: "flex",
        gap: "20px",
        padding: "20px",
        height: "100vh",
        background: "#111",
        color: "white"
      }}
    >

      {STATUS_COLUMNS.map(status => {

        const columnJobs = jobs.filter(j => j.status === status)

        return (

          <div
            key={status}
            style={{
              flex: 1,
              background: "#222",
              padding: "15px",
              borderRadius: "10px"
            }}
          >

            <h2
              style={{
                textTransform: "uppercase",
                textAlign: "center",
                marginBottom: "15px"
              }}
            >
              {status}
            </h2>

            {columnJobs.map(job => (

              <div
                key={job._id}
                style={{
                  background: "#333",
                  padding: "12px",
                  marginBottom: "12px",
                  borderRadius: "6px"
                }}
              >

                <strong style={{ fontSize: "18px" }}>
                  {job.product}
                </strong>

                <p>Customer: {job.customerName}</p>

                <p>Qty: {job.quantity}</p>

                <p>{job.productionType}</p>

                {job.artwork && (
                  <img
                    src={`${FILE_URL}${job.artwork}`}
                    alt="artwork"
                    style={{
                      width: "100%",
                      marginTop: "6px",
                      borderRadius: "4px"
                    }}
                  />
                )}

              </div>

            ))}

          </div>

        )

      })}

    </div>

  )

}

export default ShopFloor