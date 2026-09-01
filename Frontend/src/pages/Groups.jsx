import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, MessageSquare, FolderOpen, Plus, Search } from 'lucide-react'
import Sidebar from '../components/Layout/Sidebar'
import TopBar from '../components/Layout/TopBar'
import { getMyGroups, createGroup, joinGroup, searchGroups } from '../api/groups'
import { useToast } from '../context/ToastContext'

export default function Groups() {
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [createName, setCreateName] = useState('')
  const [joinSlug, setJoinSlug] = useState('')
  const [searchRes, setSearchRes] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try { const r = await getMyGroups(); setGroups(r.data || []) }
    catch { addToast('Failed to load groups', 'error') }
    finally { setLoading(false) }
  }

  const filtered = q ? groups.filter(g => g.name.toLowerCase().includes(q.toLowerCase()) || g.slug.includes(q)) : groups

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!createName.trim()) return
    setSubmitting(true)
    try {
      const r = await createGroup(createName.trim())
      addToast('Group created!', 'success')
      setShowCreate(false); setCreateName('')
      load(); navigate(`/groups/${r.data[0].slug}`)
    } catch { addToast('Failed to create group', 'error') }
    finally { setSubmitting(false) }
  }

  const handleSearchSlug = async (val) => {
    setJoinSlug(val)
    if (!val.trim()) { setSearchRes([]); return }
    try { const r = await searchGroups(val); setSearchRes(r.data) }
    catch { setSearchRes([]) }
  }

  const handleJoin = async (slug) => {
    setSubmitting(true)
    try {
      await joinGroup(slug)
      addToast('Joined!', 'success')
      setShowJoin(false); setJoinSlug(''); setSearchRes([])
      load()
    } catch (err) { addToast(err?.response?.data?.message || 'Failed', 'error') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="Groups" searchPlaceholder="Search your groups…" onSearch={setQ}>
          <button className="btn btn-outline btn-sm" onClick={() => setShowJoin(true)}><Search size={13}/> Join</button>
          <button id="create-group-btn" className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}><Plus size={13}/> Create</button>
        </TopBar>
        <div className="page-body">
          {loading ? (
            <div style={{display:'flex',justifyContent:'center',padding:60}}>
              <span className="spinner spinner-brand" style={{width:28,height:28}}/>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-muted)'}}>
              <Users size={48} style={{margin:'0 auto 16px',opacity:0.3,display:'block'}}/>
              <p style={{fontWeight:600,fontSize:15,marginBottom:6}}>No groups yet</p>
              <p style={{fontSize:13,marginBottom:20}}>Create your first reading group or join an existing one.</p>
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15}/> Create Group</button>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
              {filtered.map(g => (
                <div key={g.id} className="card card-hover" style={{cursor:'pointer',padding:20}} onClick={() => navigate(`/groups/${g.slug}`)}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                    <div className="avatar avatar-lg" style={{background:'var(--brand-faint)',color:'var(--brand)',fontSize:20,borderRadius:12}}>
                      {g.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{fontWeight:700,fontSize:15}}>{g.name}</h3>
                      <span style={{fontSize:12,color:'var(--text-muted)'}}>{g.slug}</span>
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span className="badge badge-purple"><Users size={10}/> {g.member_count||1} members</span>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-outline btn-sm" onClick={e=>{e.stopPropagation();navigate(`/groups/${g.slug}/chat`)}}>
                        <MessageSquare size={13}/> Chat
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={e=>{e.stopPropagation();navigate(`/groups/${g.slug}`)}}>
                        <FolderOpen size={13}/> Open
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setShowCreate(false)}>
          <div className="modal">
            <div className="modal-header"><h2 className="modal-title">Create Group</h2><button className="btn-ghost" onClick={()=>setShowCreate(false)}>✕</button></div>
            <form onSubmit={handleCreate}>
              <div className="form-group" style={{marginBottom:20}}>
                <label className="form-label">Group Name</label>
                <input id="new-group-name" className="form-input" placeholder="e.g. Classic Literature Circle" value={createName} onChange={e=>setCreateName(e.target.value)} autoFocus/>
              </div>
              <div className="flex gap-3 justify-between">
                <button type="button" className="btn btn-outline" onClick={()=>setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting?<><span className="spinner"/>Creating…</>:'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJoin && (
        <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&(setShowJoin(false),setSearchRes([]),setJoinSlug(''))}>
          <div className="modal">
            <div className="modal-header"><h2 className="modal-title">Join a Group</h2><button className="btn-ghost" onClick={()=>{setShowJoin(false);setSearchRes([]);setJoinSlug('')}}>✕</button></div>
            <div className="form-group" style={{marginBottom:16}}>
              <label className="form-label">Search by slug</label>
              <input id="join-slug-input" className="form-input" placeholder="e.g. classic-literature" value={joinSlug} onChange={e=>handleSearchSlug(e.target.value)} autoFocus/>
            </div>
            {searchRes.map(g=>(
              <div key={g.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'var(--bg)',borderRadius:8,marginBottom:8,border:'1px solid var(--border)'}}>
                <div><div className="font-semibold">{g.name}</div><div className="text-sm text-muted">{g.slug}</div></div>
                <button className="btn btn-primary btn-sm" onClick={()=>handleJoin(g.slug)} disabled={submitting}>Join</button>
              </div>
            ))}
            <div style={{marginTop:16,textAlign:'right'}}><button className="btn btn-outline" onClick={()=>{setShowJoin(false);setSearchRes([]);setJoinSlug('')}}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
