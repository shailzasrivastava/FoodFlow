import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader } from '../components/ui'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    // AuthContext already handles extracting token from URL in its useEffect
    // Give it a moment then redirect
    const timer = setTimeout(() => {
      navigate(isLoggedIn ? '/' : '/login?error=oauth_failed')
    }, 1000)
    return () => clearTimeout(timer)
  }, [isLoggedIn, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader variant="spinner" size="lg" />
      <p className="text-sm text-pine-500 dark:text-parchment-300/60">
        Completing sign in…
      </p>
    </div>
  )
}