import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Upload, Download, Trash2, Grid, List, UserPlus, MessageSquare, LayoutGrid } from 'lucide-react'
import Sidebar from '../components/Layout/Sidebar'
import TopBar from '../components/Layout/TopBar'
import { getGroup, listGroupFiles, deleteGroup } from '../api/groups'
import { uploadFile, deleteFile, getDownloadUrl } from '../api/files'
import { sendInvitation } from '../api/invites'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import './GroupWorkspace.css'

const FILE_COVERS = [
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=180&fit=crop',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=180&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=180&fit=crop',
]

function InviteModal({ groupId, onClose }) {
  const { addToast } = useToast()
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const handleInvite = async (e) => {
    e.preventDefault()
    if (!userId) return
    setLoading(true)
    try {
      await sendInvitation(parseInt(userId), groupId)
      addToast('Invitation sent!', 'success')
      onClose()
    } catch { addToast('Failed to send invitation', 'error') }
    finally { setLoading(false) }
  }
  return (
    <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Invite Member</h2>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleInvite}>
          <div className="form-group" style={{marginBottom:20}}>
            <label className="form-label">User ID to invite</label>
            <input id="invite-user-id" className="form-input" placeholder="Enter user ID number" type="number" value={userId} onChange={e=>setUserId(e.target.value)} autoFocus />
            <span className="form-hint">Ask the user for their numeric account ID.</span>
          </div>
          <div className="flex gap-3 justify-between">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button id="invite-submit-btn" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"/>Sending…</> : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteGroupModal({ group, onClose, onDeleted }) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteGroup(group.id)
      addToast('Group deleted', 'success')
      onDeleted()
    } catch { addToast('Failed to delete group (only owner can delete)', 'error') }
    finally { setLoading(false) }
  }
  return (
    <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Delete Group</h2>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>
        <p style={{marginBottom:20,color:'var(--text-secondary)'}}>Are you sure you want to delete <strong>{group.name}</strong>? This action cannot be undone.</p>
        <div className="flex gap-3 justify-between">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? <><span className="spinner"/>Deleting…</> : 'Delete Group'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GroupWorkspace() {
  const { slug } = useParams()
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [viewGrid, setViewGrid] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deletingFileId, setDeletingFileId] = useState(null)

  useEffect(() => { loadAll() }, [slug])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [gRes, fRes] = await Promise.all([getGroup(slug), listGroupFiles(slug)])
      setGroup(gRes.data)
      setFiles(fRes.data || [])
    } catch { addToast('Failed to load workspace', 'error') }
    finally { setLoading(false) }
  }

  const onDrop = useCallback(async (accepted) => {
    if (!accepted.length || !group) return
    setUploading(true)
    let successCount = 0
    for (const file of accepted) {
      try {
        await uploadFile(file, group.id)
        successCount++
      } catch (err) {
        const msg = err?.response?.data?.message || `Failed to upload ${file.name}`
        addToast(msg, 'error')
      }
    }
    if (successCount > 0) {
      addToast(`${successCount} file(s) uploaded!`, 'success')
      loadAll()
    }
    setUploading(false)
  }, [group])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/epub+zip': ['.epub'], 'text/plain': ['.txt'] },
    maxSize: 50 * 1024 * 1024,
    multiple: true
  })

  const handleDeleteFile = async (file) => {
    setDeletingFileId(file.id)
    try {
      await deleteFile(file.id, group.id)
      addToast('File deleted', 'success')
      setFiles(f => f.filter(x => x.id !== file.id))
    } catch { addToast('Failed to delete file (admin only)', 'error') }
    finally { setDeletingFileId(null) }
  }

  const isOwner = group && user && group.owner_id === user.id

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content"><div style={{display:'flex',alignItems:'center',justifyContent:'center',flex:1}}><span className="spinner spinner-brand" style={{width:32,height:32}} /></div></div>
    </div>
  )

  if (!group) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content"><div style={{padding:40,color:'var(--text-secondary)'}}>Group not found.</div></div>
    </div>
  )

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title={group.name} badge="GROUP WORKSPACE" searchPlaceholder="Search library…">
          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/groups/${slug}/chat`)}>
            <MessageSquare size={14}/> Chat
          </button>
        </TopBar>
        <div className="page-body gw-body">
          <div className="gw-main">
            {/* Upload Section */}
            <div className="card gw-upload-card">
              <div className="gw-upload-header">
                <div>
                  <h2 className="font-bold" style={{fontSize:16}}>Upload Documents</h2>
                  <p className="text-sm text-secondary">Add new PDFs to the shared repository for AI analysis.</p>
                </div>
                <Upload size={20} color="var(--brand)" />
              </div>
              <div {...getRootProps()} className={`gw-dropzone${isDragActive ? ' active' : ''}${uploading ? ' uploading' : ''}`}>
                <input {...getInputProps()} id="file-upload-input" />
                {uploading ? (
                  <><span className="spinner spinner-brand" style={{width:28,height:28}} /><p>Uploading…</p></>
                ) : (
                  <>
                    <div className="gw-drop-icon">⊕</div>
                    <p className="gw-drop-text">Click to browse or drag &amp; drop</p>
                    <p className="text-sm text-muted">PDF, EPUB or TXT (Max 50MB)</p>
                  </>
                )}
              </div>
            </div>

            {/* Library */}
            <div className="gw-library">
              <div className="gw-library-header">
                <h2 className="font-bold" style={{fontSize:16,display:'flex',alignItems:'center',gap:8}}>
                  <LayoutGrid size={18} color="var(--brand)" /> Group Library
                </h2>
                <div className="flex gap-2">
                  <button className={`btn-ghost${viewGrid?' active':''}`} onClick={() => setViewGrid(true)}><Grid size={16}/></button>
                  <button className={`btn-ghost${!viewGrid?' active':''}`} onClick={() => setViewGrid(false)}><List size={16}/></button>
                </div>
              </div>

              {files.length === 0 ? (
                <div className="gw-empty">No documents yet. Upload the first one!</div>
              ) : viewGrid ? (
                <div className="gw-files-grid">
                  {files.map((f, i) => (
                    <div key={f.id} className="gw-file-card card card-hover">
                      <div className="gw-file-cover" onClick={() => navigate(`/reader/${f.id}`)}>
                        <img src={FILE_COVERS[i % FILE_COVERS.length]} alt={f.original_name} />
                        <span className="gw-file-ext">{f.mime_type?.includes('pdf') ? 'PDF' : f.mime_type?.includes('epub') ? 'EPUB' : 'TXT'}</span>
                      </div>
                      <div className="gw-file-info">
                        <h4 className="gw-file-name" title={f.original_name}>{f.original_name}</h4>
                        <p className="text-sm text-muted">{f.created_at ? new Date(f.created_at).toLocaleDateString() : ''}</p>
                        <div className="gw-file-actions">
                          <a href={getDownloadUrl(f.id)} className="btn-ghost" title="Download" target="_blank" rel="noreferrer">
                            <Download size={14}/>
                          </a>
                          <button className="btn-ghost" title="Delete" onClick={() => handleDeleteFile(f)} disabled={deletingFileId === f.id}>
                            {deletingFileId === f.id ? <span className="spinner spinner-brand" style={{width:14,height:14}}/> : <Trash2 size={14} color="var(--danger)"/>}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="gw-files-list">
                  {files.map(f => (
                    <div key={f.id} className="gw-file-row card">
                      <div className="gw-file-row-icon">📄</div>
                      <div style={{flex:1}}>
                        <div className="font-semibold" style={{fontSize:13}}>{f.original_name}</div>
                        <div className="text-sm text-muted">{f.created_at ? new Date(f.created_at).toLocaleDateString() : ''}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/reader/${f.id}`)}>Read</button>
                        <a href={getDownloadUrl(f.id)} className="btn btn-outline btn-sm" target="_blank" rel="noreferrer">Download</a>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteFile(f)} disabled={deletingFileId === f.id}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Panel */}
          <div className="gw-sidebar">
            <div className="card gw-members-card">
              <div className="gw-members-header">
                <h3 className="font-bold">Members ({group.member_count || 1})</h3>
                <button id="invite-btn" className="btn-ghost" title="Invite member" onClick={() => setShowInvite(true)}>
                  <UserPlus size={16} color="var(--brand)"/>
                </button>
              </div>
              <div className="gw-members-list">
                {/* Placeholder member row - real member list would need a separate endpoint */}
                <div className="gw-member-row">
                  <div className="avatar avatar-sm" style={{background:'var(--brand-faint)',color:'var(--brand)'}}>
                    {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                  </div>
                  <div style={{flex:1}}>
                    <div className="font-semibold" style={{fontSize:13}}>{user?.first_name || user?.username}</div>
                    <span className="badge badge-orange" style={{fontSize:10}}>ADMIN</span>
                  </div>
                </div>
              </div>
              <button id="view-all-members-btn" className="btn btn-outline w-full btn-sm" style={{marginTop:12}} onClick={() => navigate(`/groups/${slug}/chat`)}>
                Open Group Chat
              </button>
            </div>

            <div className="card gw-ai-insight">
              <div className="gw-ai-insight-label">AI INSIGHT</div>
              <p style={{fontSize:13,lineHeight:1.6}}>
                This group has <strong>{files.length}</strong> document{files.length !== 1 ? 's' : ''} in its library.
                {files.length > 0 && <span> Open a document to analyze it with the AI assistant.</span>}
              </p>
            </div>

            {isOwner && (
              <button className="btn btn-danger w-full btn-sm" onClick={() => setShowDelete(true)}>
                <Trash2 size={14}/> Delete Group
              </button>
            )}
          </div>
        </div>
      </div>

      {showInvite && <InviteModal groupId={group.id} onClose={() => setShowInvite(false)} />}
      {showDelete && <DeleteGroupModal group={group} onClose={() => setShowDelete(false)} onDeleted={() => navigate('/dashboard')} />}
    </div>
  )
}
