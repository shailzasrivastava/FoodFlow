import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Button, Input } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  function validate() {
    const e = {}
    if (!email || !email.includes('@')) e.email = 'Enter a valid email.'
    if (!password || password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (mode === 'register' && (!fullName || fullName.trim().length < 2))
      e.fullName = 'Enter your full name.'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        toast({ title: 'Welcome back!', variant: 'success' })
      } else {
        await register(email, password, fullName)
        toast({ title: 'Account created!', variant: 'success' })
      }
      navigate('/')
    } catch (err) {
      toast({ title: mode === 'login' ? 'Login failed' : 'Registration failed',
              description: err.detail || 'Something went wrong.', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleLogin() {
    window.location.href = 'http://localhost:8000/api/auth/google'
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-pine-950 dark:text-parchment-50">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h1>
          <p className="mt-1 text-sm text-pine-500 dark:text-parchment-300/60">
            {mode === 'login'
              ? 'Sign in to manage the HimShakti catalog.'
              : 'Create your account to get started.'}
          </p>

          {/* Google OAuth button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-6 w-full flex items-center justify-center gap-3 rounded-lg border border-pine-200 dark:border-pine-700 bg-white dark:bg-pine-900 px-4 py-2.5 text-sm font-medium text-pine-900 dark:text-parchment-50 hover:bg-pine-50 dark:hover:bg-pine-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-pine-200 dark:bg-pine-700" />
            <span className="text-xs text-pine-400">or</span>
            <div className="flex-1 h-px bg-pine-200 dark:bg-pine-700" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {mode === 'register' && (
              <Input
                label="Full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                error={errors.fullName}
                placeholder="Shailza Srivastava"
                required
              />
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
              placeholder="Min. 8 characters"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
            <Button type="submit" size="lg" disabled={loading} className="mt-2">
              {loading
                ? mode === 'login' ? 'Signing in…' : 'Creating account…'
                : mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-pine-500 dark:text-parchment-300/60">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}) }}
              className="text-saffron-600 dark:text-saffron-300 hover:underline font-medium"
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}