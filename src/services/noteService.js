import { api } from './index'

export const getNotes = async () => {
  const response = await api.get('/api/notes')
  return response.data.map(n => ({ ...n, id: n._id || n.id }))
}

export const getNote = async (id) => {
  const response = await api.get(`/api/notes/${id}`)
  return { ...response.data, id: response.data._id || response.data.id }
}

export const createNote = async (data, passcode) => {
  const response = await api.post('/api/notes', data, {
    headers: { 'x-admin-passcode': passcode }
  })
  return { ...response.data, id: response.data._id || response.data.id }
}

export const updateNote = async (id, data, passcode) => {
  const response = await api.put(`/api/notes/${id}`, data, {
    headers: { 'x-admin-passcode': passcode }
  })
  return { ...response.data, id: response.data._id || response.data.id }
}

export const deleteNote = async (id, passcode) => {
  const response = await api.delete(`/api/notes/${id}`, {
    headers: { 'x-admin-passcode': passcode }
  })
  return response.data
}
