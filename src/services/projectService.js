import axios from 'axios'

const projectApi = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? '',
})

const normalizeProject = (project) => ({
  ...project,
  id: project.id || project._id || project.uuid || null,
})

export const getProjects = async (filters = {}) => {
  const params = {}
  if (filters.category && filters.category !== 'all') {
    params.category = filters.category
  }
  if (filters.featured != null) {
    params.featured = filters.featured
  }

  const response = await projectApi.get('/api/projects', {
    params,
  })
  return response.data.map(normalizeProject)
}

export const getProject = async (id) => {
  const response = await projectApi.get(`/api/projects/${id}`)
  return normalizeProject(response.data)
}

export const createProject = async (data, passcode) => {
  const response = await projectApi.post('/api/projects', data, {
    headers: { 'x-admin-passcode': passcode },
  })
  return normalizeProject(response.data)
}

export const updateProject = async (id, data, passcode) => {
  const response = await projectApi.put(`/api/projects/${id}`, data, {
    headers: { 'x-admin-passcode': passcode },
  })
  return normalizeProject(response.data)
}

export const deleteProject = async (id, passcode) => {
  const response = await projectApi.delete(`/api/projects/${id}`, {
    headers: { 'x-admin-passcode': passcode },
  })
  return response.data
}
