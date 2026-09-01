import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Users, Inbox, Bot, User, BookOpen, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import './Sidebar.css'

const links = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/groups', icon: Users, label: 'Groups' },
  { to: '/inbox', icon: Inbox, label: 'Inbox' },
  { to: '/ai', icon: Bot, label: 'AI Assistant' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
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
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <BookOpen size={18} strokeWidth={2.5} />
        </div>
        <div>
          <div className="sidebar-app-name">Cha-Read</div>
          <div className="sidebar-tagline">Collaborative AI Library</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar avatar-sm">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.first_name || user?.username}</div>
            <div className="sidebar-user-role">{user?.email || 'Member'}</div>
          </div>
        </div>
        <button className="btn-ghost sidebar-logout" onClick={handleLogout} title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
