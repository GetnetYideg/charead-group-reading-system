import { Bell, Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import './TopBar.css'

export default function TopBar({ title, badge, children, searchPlaceholder, onSearch }) {
  const { user } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase()
    : 'U'

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
        {badge && <span className="topbar-badge">{badge}</span>}
      </div>
      <div className="topbar-right">
        {children}
        {searchPlaceholder && (
          <div className="topbar-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder={searchPlaceholder} onChange={e => onSearch?.(e.target.value)} />
          </div>
        )}
        <button
          id="topbar-inbox-btn"
          className="btn-ghost topbar-icon"
          title="Inbox"
          onClick={() => navigate('/inbox')}
        >
          <Bell size={18} />
        </button>
        <button
          id="topbar-theme-btn"
          className="btn-ghost topbar-icon"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggle}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div
          className="avatar avatar-sm topbar-avatar"
          onClick={() => navigate('/profile')}
          style={{ cursor: 'pointer' }}
        >
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            : initials
          }
        </div>
      </div>
    </header>
  )
}
