
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Users,
  Inbox,
  Bot,
  User,
  BookOpen,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

import './Sidebar.css'

const links = [
  {
    to: '/dashboard',
    icon: Home,
    label: 'Home',
  },
  {
    to: '/groups',
    icon: Users,
    label: 'Groups',
  },
  {
    to: '/inbox',
    icon: Inbox,
    label: 'Inbox',
  },
  {
    to: '/ai',
    icon: Bot,
    label: 'AI Assistant',
  },
  {
    to: '/profile',
    icon: User,
    label: 'Profile',
  },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)

  const openSidebar = () => {
    setIsOpen(true)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  const handleLogout = async () => {
    await logout()

    addToast('Logged out successfully', 'success')

    setIsOpen(false)

    navigate('/login')
  }

  const handleNavigation = () => {
    setIsOpen(false)
  }

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`
        .toUpperCase() ||
      user.username?.[0]?.toUpperCase()
    : 'U'

  return (
    <>
      {/* =========================================
          MOBILE HAMBURGER
      ========================================= */}

      <button
        type="button"
        className="sidebar-hamburger"
        onClick={openSidebar}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        <Menu size={21} strokeWidth={2.3} />
      </button>


      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}

      <div
        className={`sidebar-overlay ${
          isOpen ? 'show' : ''
        }`}
        onClick={closeSidebar}
      />


      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside
        className={`sidebar ${
          isOpen ? 'sidebar-open' : ''
        }`}
      >

        {/* =========================================
            BRAND
        ========================================= */}

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            <BookOpen
              size={18}
              strokeWidth={2.5}
            />
          </div>

          <div className="sidebar-brand-text">

            <div className="sidebar-app-name">
              Cha-Read
            </div>

            <div className="sidebar-tagline">
              Collaborative AI Library
            </div>

          </div>


          {/* Mobile close */}

          <button
            type="button"
            className="sidebar-close"
            onClick={closeSidebar}
            aria-label="Close navigation menu"
          >
            <X size={19} />
          </button>

        </div>


        {/* =========================================
            NAVIGATION
        ========================================= */}

        <nav className="sidebar-nav">

          <div className="sidebar-section-label">
            MENU
          </div>

          {links.map(
            ({ to, icon: Icon, label }) => (

              <NavLink
                key={to}
                to={to}
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `sidebar-link${
                    isActive ? ' active' : ''
                  }`
                }
              >

                <span className="sidebar-link-icon">
                  <Icon
                    size={18}
                    strokeWidth={2}
                  />
                </span>

                <span className="sidebar-link-label">
                  {label}
                </span>

              </NavLink>

            )
          )}

        </nav>


        {/* =========================================
            USER FOOTER
        ========================================= */}

        <div className="sidebar-footer">

          <div className="sidebar-user">

            <div className="avatar avatar-sm sidebar-avatar">
              {initials}
            </div>

            <div className="sidebar-user-info">

              <div className="sidebar-user-name">
                {user?.first_name ||
                  user?.username ||
                  'User'}
              </div>

              <div className="sidebar-user-role">
                {user?.email || 'Member'}
              </div>

            </div>

          </div>


          {/* Logout */}

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>

        </div>

      </aside>
    </>
  )
}

