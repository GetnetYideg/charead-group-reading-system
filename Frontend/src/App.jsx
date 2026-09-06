import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard'
import Groups from './pages/Groups'
import GroupWorkspace from './pages/GroupWorkspace'
import GroupChat from './pages/GroupChat'
import Inbox from './pages/Inbox'
import AIAssistant from './pages/AIAssistant'
import PDFReader from './pages/PDFReader'
import Profile from './pages/Profile'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <span className="spinner spinner-brand" style={{ width: 32, height: 32 }} />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<PublicRoute><Dashboard /></PublicRoute>} />
      <Route path="/groups" element={<PublicRoute><Groups /></PublicRoute>} />
      <Route path="/groups/:slug" element={<PublicRoute><GroupWorkspace /></PublicRoute>} />
      <Route path="/groups/:slug/chat" element={<PublicRoute><GroupChat /></PublicRoute>} />
      <Route path="/inbox" element={<PublicRoute><Inbox /></PublicRoute>} />
      <Route path="/ai" element={<PublicRoute><AIAssistant /></PublicRoute>} />
      <Route path="/reader/:fileId" element={<PublicRoute><PDFReader /></PublicRoute>} />
      <Route path="/profile" element={<PublicRoute><Profile /></PublicRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
