import api from './axios'

export const uploadFile = (file, groupId) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('document', JSON.stringify({ group_id: groupId }))
  return api.post('/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const getFileMetadata = (id) => api.get(`/file/metadata/${id}`)
export const deleteFile = (id, groupId) => api.delete(`/file/delete/${id}`, { data: { group_id: groupId } })
export const getDownloadUrl = (id) => `/api/file/download/${id}`
