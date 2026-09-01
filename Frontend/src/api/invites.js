import api from './axios'

export const getInvitations = () => api.get('/invites')
export const sendInvitation = (toUserId, groupId) => api.post('/invites', { to_user_id: toUserId, group_id: groupId })
export const acceptInvitation = (groupId) => api.post(`/invites/accepted/${groupId}`)
export const declineInvitation = (groupId) => api.post(`/invites/declined/${groupId}`)
