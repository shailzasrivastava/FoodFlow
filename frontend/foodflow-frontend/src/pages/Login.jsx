import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Button, Input } from '../components/ui'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  function validate() {
    const next = {}
    if (!email) next.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Password is required.'
    else if (password.length < 6) next.password = 'Password must be at least 6 characters.'
    return next
  }

  function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      toast({ title: 'Check the form', description: 'Some fields need attention.', variant: 'error' })
      return
    }

    setSubmitting(true)
    // Placeholder auth call — wire up to the FastAPI backend's auth endpoint later.
    setTimeout(() => {
      setSubmitting(false)
      toast({ title: 'Signed in', description: `Welcome back, ${email}.`, variant: 'success' })
    }, 700)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-5 py-16 sm:py-24">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-pine-950 dark:text-parchment-50">
            Staff login
          </h1>
          <p className="mt-2 text-sm text-pine-600 dark:text-parchment-300/70">
            For HimShakti staff managing inventory, QC, and production. This is a placeholder form —
            it isn't connected to a real account yet.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@himshakti.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
              required
            />
            <Button type="submit" variant="primary" size="lg" disabled={submitting} className="mt-2">
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
