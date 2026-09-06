import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { register } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import AuthBranding from './AuthBranding'
import './Auth.css'

export default function Register() {
  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState({})

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e = {}

    if (!form.first_name || form.first_name.length < 3) {
      e.first_name = 'Minimum 3 characters'
    }

    if (
      !form.username ||
      !/^[a-zA-Z0-9_]{5,}$/.test(form.username)
    ) {
      e.username =
        'Min 5 chars, letters/numbers/underscores only'
    }

    if (
      !form.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      e.email = 'Please enter a valid email address'
    }

    if (!form.password || form.password.length < 8) {
      e.password = 'Must be at least 8 characters'
    }

    if (!agreed) {
      e.agreed = 'You must agree to continue'
    }

    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errs = validate()

    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setLoading(true)

    try {
      await register(form)

      addToast(
        'Account created! Please log in.',
        'success'
      )

      navigate('/login')
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Registration failed. Please try again.'

      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">

      {/* LEFT BRANDING */}
      <AuthBranding />

      {/* RIGHT FORM */}
      <div className="auth-form-panel">
        <div className="auth-form-container">

          {/* HEADER */}
          <div className="auth-form-header">
            <span className="auth-form-kicker">
              JOIN THE COMMUNITY
            </span>

            <h1>Create your account</h1>

            <p>
              Welcome! Please enter your details.
            </p>
          </div>

          {/* OAUTH BUTTONS */}
          <div className="auth-oauth-btns">

            {/* GOOGLE */}
            <a
              href="http://localhost:3000/api/auth/oauth/google"
              className="btn btn-outline auth-oauth-btn"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.27c0-.72-.06-1.42-.18-2.09H12v3.95h5.23a4.47 4.47 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.92-4.18 2.92-7.23Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.78c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.78Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.54 13.87A5.85 5.85 0 0 1 6.23 12c0-.65.11-1.28.31-1.87V7.61H3.3A9.76 9.76 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.39l3.24-2.52Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.1c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.18 14.63 2.22 12 2.22a9.74 9.74 0 0 0-8.7 5.39l3.24 2.52C6.85 7.82 9 6.1 12 6.1Z"
                />
              </svg>

              <span>Google</span>
            </a>

            {/* GITHUB */}
            <a
              href="http://localhost:3000/api/auth/oauth/github"
              className="btn btn-outline auth-oauth-btn"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1.87 2.02 2.95 1.42.1-.7.39-1.18.71-1.45-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.16a10.76 10.76 0 0 1 5.64 0c2.15-1.46 3.1-1.16 3.1-1.16.61 1.55.23 2.7.11 2.98.72.79 1.16 1.8 1.16 3.03 0 4.32-2.63 5.27-5.14 5.55.4.35.76 1.04.76 2.1v3.11c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z" />
              </svg>

              <span>GitHub</span>
            </a>

          </div>

          {/* DIVIDER */}
          <div className="divider">
            <span>OR CONTINUE WITH</span>
          </div>

          {/* FORM */}
          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >

            {/* FIRST + LAST NAME */}
            <div className="auth-name-row">

              {/* FIRST NAME */}
              <div className="form-group">
                <label
                  className="form-label"
                  htmlFor="first_name"
                >
                  First Name
                </label>

                <input
                  id="first_name"
                  className={`form-input${
                    errors.first_name ? ' error' : ''
                  }`}
                  placeholder="Elias"
                  value={form.first_name}
                  onChange={e =>
                    set('first_name', e.target.value)
                  }
                />

                {errors.first_name && (
                  <span className="form-error">
                    ⊘ {errors.first_name}
                  </span>
                )}
              </div>

              {/* LAST NAME */}
              <div className="form-group">
                <label
                  className="form-label"
                  htmlFor="last_name"
                >
                  Last Name
                </label>

                <input
                  id="last_name"
                  className="form-input"
                  placeholder="Thorne"
                  value={form.last_name}
                  onChange={e =>
                    set('last_name', e.target.value)
                  }
                />
              </div>

            </div>

            {/* USERNAME */}
            <div className="form-group">

              <label
                className="form-label"
                htmlFor="username"
              >
                Username
              </label>

              <input
                id="username"
                className={`form-input${
                  errors.username ? ' error' : ''
                }`}
                placeholder="elias_thorne"
                value={form.username}
                onChange={e =>
                  set('username', e.target.value)
                }
              />

              {errors.username && (
                <span className="form-error">
                  ⊘ {errors.username}
                </span>
              )}

            </div>

            {/* EMAIL */}
            <div className="form-group">

              <label
                className="form-label"
                htmlFor="email"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                className={`form-input${
                  errors.email ? ' error' : ''
                }`}
                placeholder="elias@example.com"
                value={form.email}
                onChange={e =>
                  set('email', e.target.value)
                }
              />

              {errors.email && (
                <span className="form-error">
                  ⊘ {errors.email}
                </span>
              )}

            </div>

            {/* PASSWORD */}
            <div className="form-group">

              <label
                className="form-label"
                htmlFor="password"
              >
                Password
              </label>

              <div className="auth-pass-wrap">

                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className={`form-input${
                    errors.password ? ' error' : ''
                  }`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e =>
                    set('password', e.target.value)
                  }
                />

                <button
                  type="button"
                  className="auth-pass-toggle"
                  onClick={() =>
                    setShowPass(s => !s)
                  }
                  aria-label={
                    showPass
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPass ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>

              </div>

              <span className="form-hint">
                Must be at least 8 characters.
              </span>

              {errors.password && (
                <span className="form-error">
                  ⊘ {errors.password}
                </span>
              )}

            </div>

            {/* TERMS */}
            <div className="auth-terms">

              <input
                id="terms"
                type="checkbox"
                checked={agreed}
                onChange={e =>
                  setAgreed(e.target.checked)
                }
              />

              <label htmlFor="terms">
                I agree to the{' '}
                <span className="auth-link">
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="auth-link">
                  Privacy Policy
                </span>
                .
              </label>

            </div>

            {errors.agreed && (
              <span className="form-error">
                ⊘ {errors.agreed}
              </span>
            )}

            {/* REGISTER BUTTON */}
            <button
              id="register-btn"
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Creating account…
                </>
              ) : (
                'Get started'
              )}
            </button>

          </form>

          {/* LOGIN LINK */}
          <p className="auth-switch">
            Already have an account?{' '}

            <Link
              to="/login"
              className="auth-link"
            >
              Log in
            </Link>
          </p>

          {/* AI STATUS */}
          <div className="auth-ai-status">
            <span className="online-dot online-dot-lg" />
            AI Engine Online
          </div>

        </div>
      </div>
    </div>
  )
}