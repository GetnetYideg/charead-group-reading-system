import { useState, useEffect } from 'react'
import { Mail, Check, X, Inbox as InboxIcon } from 'lucide-react'
import Sidebar from '../components/Layout/Sidebar'
import TopBar from '../components/Layout/TopBar'
import { getInvitations, acceptInvitation, declineInvitation } from '../api/invites'
import { useToast } from '../context/ToastContext'

export default function Inbox() {
  const { addToast } = useToast()
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState({})

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await getInvitations()
      setInvites(res.data || [])
    } catch { addToast('Failed to load invitations', 'error') }
    finally { setLoading(false) }
  }

  const handleAccept = async (invite) => {
    setProcessing(p => ({ ...p, [invite.id]: 'accept' }))
    try {
      await acceptInvitation(invite.group_id)
      addToast('You joined the group!', 'success')
      setInvites(i => i.filter(x => x.id !== invite.id))
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to accept invitation'
      addToast(msg, 'error')
    } finally { setProcessing(p => ({ ...p, [invite.id]: null })) }
  }

  const handleDecline = async (invite) => {
    setProcessing(p => ({ ...p, [invite.id]: 'decline' }))
    try {
      await declineInvitation(invite.group_id)
      addToast('Invitation declined', 'info')
      setInvites(i => i.filter(x => x.id !== invite.id))
    } catch { addToast('Fail?to_user_id=46&group_id&=20ed to decline invitation', 'error') }
    finally { setProcessing(p => ({ ...p, [invite.id]: null })) }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="Inbox" />
        <div className="page-body" style={{ maxWidth: 680 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <Mail size={20} color="var(--brand)" />
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Group Invitations</h2>
            {invites.length > 0 && (
              <span className="badge badge-orange">{invites.length} pending</span>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <span className="spinner spinner-brand" style={{ width: 28, height: 28 }} />
            </div>
          ) : invites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <InboxIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.3, display: 'block' }} />
              <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>All caught up!</p>
              <p style={{ fontSize: 13 }}>No pending invitations.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {invites.map(invite => (
                <div key={invite.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                  <div className="avatar" style={{ background: 'var(--brand-faint)', color: 'var(--brand)', fontSize: 18 }}>
                    📚
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      Invitation to join Group {invite.group_id.slug}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      From {invite.from_user_id.first_name + ' ' + invite.from_user_id.last_name + ' (' + invite.from_user_id.username + ')'} · {invite.created_at ? new Date(invite.created_at).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      id={`accept-invite-${invite.id}`}
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAccept(invite)}
                      disabled={!!processing[invite.id]}
                    >
                      {processing[invite.id] === 'accept'
                        ? <span className="spinner" style={{ width: 14, height: 14 }} />
                        : <><Check size={13} /> Accept</>
                      }
                    </button>
                    <button
                      id={`decline-invite-${invite.id}`}
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDecline(invite)}
                      disabled={!!processing[invite.id]}
                      style={{ color: 'var(--danger)', borderColor: '#fca5a5' }}
                    >
                      {processing[invite.id] === 'decline'
                        ? <span className="spinner spinner-brand" style={{ width: 14, height: 14 }} />
                        : <><X size={13} /> Decline</>
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
