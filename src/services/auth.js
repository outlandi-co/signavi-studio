export const logout = (navigate) => {
  localStorage.removeItem("adminToken")
  localStorage.removeItem("adminUser")

  navigate("/login")
}