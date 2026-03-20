import { useEffect, useState } from "react"
import api from "../services/api"

function MyJobs() {

  const [jobs, setJobs] = useState([])

  useEffect(() => {

    api.get("/jobs")
    .then(res => setJobs(res.data))
    .catch(err => console.error(err))

  }, [])

  return (

    <div>

      <h1>Production Jobs</h1>

      {jobs.map(job => (

        <div key={job._id}>

          <h3>{job.product}</h3>

          <p>{job.productionType}</p>

          <p>Quantity: {job.quantity}</p>

          <p>Status: {job.status}</p>

        </div>

      ))}

    </div>

  )

}

export default MyJobs