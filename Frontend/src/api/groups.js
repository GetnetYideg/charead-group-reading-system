import api from './axios'

export const getMyGroups = () => api.get('/groups')
export const getGroup = (slug) => api.get(`/groups/${slug}`)
export const searchGroups = (slug) => api.get(`/groups/${slug}/search`)
export const createGroup = (name) => api.post('/groups', { name })
export const joinGroup = (slug) => api.post(`/groups/${slug}/join`)
export const deleteGroup = (id) => api.delete(`/groups/${id}`)
export const listGroupFiles = (slug) => api.get(`/groups/${slug}/files`)
