import api from "../../../../services/api"

export const getMaterials = async () => {
  const res = await api.get("/materials")
  return res.data
}

export const getMaterialById = async (id) => {
  const res = await api.get(`/materials/${id}`)
  return res.data
}

export const searchMaterials = async (query) => {
  const res = await api.get(`/materials/search?q=${encodeURIComponent(query)}`)
  return res.data
}

export const createMaterial = async (payload) => {
  const res = await api.post("/materials", payload)
  return res.data
}

export const updateMaterial = async (id, payload) => {
  const res = await api.put(`/materials/${id}`, payload)
  return res.data
}

export const deleteMaterial = async (id) => {
  const res = await api.delete(`/materials/${id}`)
  return res.data
}