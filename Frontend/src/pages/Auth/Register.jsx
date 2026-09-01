import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { register } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import './Auth.css'

export default function Register() {
  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', username: '', email: '', password: '' })
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.first_name || form.first_name.length < 3) e.first_name = 'Minimum 3 characters'
    if (!form.username || !/^[a-zA-Z0-9_]{5,}$/.test(form.username)) e.username = 'Min 5 chars, letters/numbers/underscores only'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address'
    if (!form.password || form.password.length < 8) e.password = 'Must be at least 8 characters'
    if (!agreed) e.agreed = 'You must agree to continue'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await register(form)
      addToast('Account created! Please log in.', 'success')
      navigate('/login')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.'
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="auth-brand">
            <div className="auth-brand-logo">📖</div>
            <span>Cha-Read</span>
          </div>
          <div className="auth-hero-text">
            <h2>Bridging literary tradition and intelligence.</h2>
            <p>Join a collaborative ecosystem where books meet AI. Curate your library, interact with intelligent agents, and share insights with your community.</p>
          </div>
          <div className="auth-social-proof">
            <div className="auth-avatars">
              {['A','B','C'].map((l,i) => <div key={i} className="avatar avatar-sm" style={{marginLeft: i>0?'-8px':'0', border:'2px solid white', zIndex:3-i}}>{l}</div>)}
              <div className="avatar avatar-sm" style={{marginLeft:'-8px', border:'2px solid white', background:'#e5e7eb', color:'#6b7280', fontSize:'10px'}}>+24</div>
            </div>
            <span>Active in "Philosophy &amp; Ethics"</span>
          </div>
          <div className="auth-trust">TRUSTED BY RESEARCH INSTITUTIONS</div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1>Create your account</h1>
            <p>Welcome! Please enter your details.</p>
          </div>

          <div className="auth-oauth-btns">
            <a href="http://localhost:3000/api/auth/oauth/google" className="btn btn-outline auth-oauth-btn">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </a>
            <a href="http://localhost:3000/api/auth/oauth/github" className="btn btn-outline auth-oauth-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
          </div>

          <div className="divider">OR CONTINUE WITH</div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-name-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input id="first_name" className={`form-input${errors.first_name ? ' error' : ''}`} placeholder="Elias" value={form.first_name} onChange={e => set('first_name', e.target.value)} />
                {errors.first_name && <span className="form-error">⊘ {errors.first_name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input id="last_name" className="form-input" placeholder="Thorne" value={form.last_name} onChange={e => set('last_name', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input id="username" className={`form-input${errors.username ? ' error' : ''}`} placeholder="elias_thorne" value={form.username} onChange={e => set('username', e.target.value)} />
              {errors.username && <span className="form-error">⊘ {errors.username}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input id="email" type="email" className={`form-input${errors.email ? ' error' : ''}`} placeholder="elias@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
              {errors.email && <span className="form-error">⊘ {errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="auth-pass-wrap">
                <input id="password" type={showPass ? 'text' : 'password'} className={`form-input${errors.password ? ' error' : ''}`} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
                <button type="button" className="auth-pass-toggle" onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span className="form-hint">Must be at least 8 characters.</span>
              {errors.password && <span className="form-error">⊘ {errors.password}</span>}
            </div>

            <div className="auth-terms">
              <input id="terms" type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              <label htmlFor="terms">
                I agree to the <span className="auth-link">Terms of Service</span> and <span className="auth-link">Privacy Policy</span>.
              </label>
            </div>
            {errors.agreed && <span className="form-error">⊘ {errors.agreed}</span>}

            <button id="register-btn" type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating account…</> : 'Get started'}
            </button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/login" className="auth-link">Log in</Link></p>
          <div className="auth-ai-status"><span className="online-dot online-dot-lg" /> AI Engine Online</div>
        </div>
      </div>
    </div>
  )
}
