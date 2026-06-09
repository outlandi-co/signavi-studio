import api from "../../../../services/api"

export const getSuppliers = async () => {
  const res = await api.get("/suppliers")
  return res.data
}

export const createSupplier = async (data) => {
  const res = await api.post("/suppliers", data)
  return res.data
}

export const updateSupplier = async (
  id,
  data
) => {
  const res = await api.put(
    `/suppliers/${id}`,
    data
  )

  return res.data
}

export const deleteSupplier = async (id) => {
  const res = await api.delete(
    `/suppliers/${id}`
  )

  return res.data
}