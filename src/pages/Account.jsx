import { useEffect, useState } from "react"
import api from "../services/api"

function Account(){

  const [user,setUser] = useState(null)

  useEffect(()=>{

    const loadUser = async()=>{

      const res = await api.get("/auth/me")

      setUser(res.data)

    }

    loadUser()

  },[])

  if(!user) return <p>Loading...</p>

  return(

    <div style={{padding:"20px"}}>

      <h1>Welcome, {user.name}</h1>

      <p>Membership: {user.membershipTier}</p>

      <p>Points: {user.points}</p>

      <h3>Badges</h3>

      <div style={{display:"flex", gap:"10px"}}>

        {user.badges.length === 0 && <p>No badges yet</p>}

        {user.badges.map((badge,i)=>(
          <div
            key={i}
            style={{
              padding:"10px",
              background:"#111",
              color:"#fff",
              borderRadius:"6px"
            }}
          >
            {badge}
          </div>
        ))}

      </div>

    </div>

  )

}

export default Account