import api from './axios'

export const askAI = (message) => api.post('/ai', { message })
