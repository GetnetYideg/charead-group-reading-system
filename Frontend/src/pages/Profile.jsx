import { useNavigate } from 'react-router-dom'
import { User, Mail, AtSign, LogOut, BookOpen } from 'lucide-react'
import Sidebar from '../components/Layout/Sidebar'
import TopBar from '../components/Layout/TopBar'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Profile() {
  const { user, logout } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    addToast('Logged out successfully', 'success')
    navigate('/login')
  }

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase()
    : 'U'

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title="Profile" />
        <div className="page-body" style={{ maxWidth: 560 }}>
          <div className="card" style={{ padding: 32, textAlign: 'center', marginBottom: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--brand-faint)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, margin: '0 auto 16px' }}>
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                : initials
              }
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>@{user?.username}</p>
            {user?.oauth_provider && (
              <span className="badge badge-purple" style={{ marginTop: 8 }}>
                via {user.oauth_provider}
              </span>
            )}
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>ACCOUNT INFO</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {user?.first_name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <User size={16} color="var(--text-muted)" />
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Full Name</div>
                    <div style={{ fontWeight: 600 }}>{user.first_name} {user.last_name || ''}</div>
                  </div>
                </div>
              )}
              {user?.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Mail size={16} color="var(--text-muted)" />
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Email</div>
                    <div style={{ fontWeight: 600 }}>{user.email}</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AtSign size={16} color="var(--text-muted)" />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Username</div>
                  <div style={{ fontWeight: 600 }}>{user?.username}</div>
                </div>
              </div>
              {user?.id && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <BookOpen size={16} color="var(--text-muted)" />
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>User ID</div>
                    <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{user.id}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button id="logout-btn" className="btn btn-danger w-full" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
