import api from './axios'

export const getMessages = (groupId) => api.get(`/chat/${groupId}/messages`)
export const sendMessage = (groupId, content) => api.post(`/chat/${groupId}/messages`, { content })
