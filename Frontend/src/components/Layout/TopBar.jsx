import {
  Bell,
  Moon,
  Sun,
  Search,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

import './TopBar.css'

export default function TopBar({
  title,
  badge,
  children,
  searchPlaceholder,
  onSearch,
}) {
  const { user } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`
        .toUpperCase() ||
      user.username?.[0]?.toUpperCase()
    : 'U'

  return (
    <header className="topbar">

      {/* =========================================
          LEFT
      ========================================= */}

      <div className="topbar-left">

        <div className="topbar-heading">

          <h1 className="topbar-title">
            {title}
          </h1>

          {badge && (
            <span className="topbar-badge">
              {badge}
            </span>
          )}

        </div>

      </div>


      {/* =========================================
          RIGHT
      ========================================= */}

      <div className="topbar-right">

        {/* Extra content */}

        {children}


        {/* Search */}

        {searchPlaceholder && (
          <div className="topbar-search">

            <Search
              size={15}
              strokeWidth={2}
            />

            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) =>
                onSearch?.(e.target.value)
              }
            />

          </div>
        )}


        {/* Inbox */}

        <button
          id="topbar-inbox-btn"
          type="button"
          className="topbar-icon"
          title="Inbox"
          aria-label="Inbox"
          onClick={() =>
            navigate('/inbox')
          }
        >
          <Bell size={18} />
        </button>


        {/* Theme */}

        <button
          id="topbar-theme-btn"
          type="button"
          className="topbar-icon"
          title={
            dark
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
          aria-label={
            dark
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
          onClick={toggle}
        >
          {dark ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
        </button>


        {/* Avatar */}

        <button
          type="button"
          className="topbar-avatar-button"
          onClick={() =>
            navigate('/profile')
          }
          aria-label="Open profile"
        >

          <div className="avatar avatar-sm topbar-avatar">

            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Profile"
              />
            ) : (
              initials
            )}

          </div>

        </button>

      </div>

    </header>
  )
}

