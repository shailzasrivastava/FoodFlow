/**
 * useApi — minimal data-fetching hook.
 *
 * Usage (auto-fetch on mount):
 *   const { data, loading, error, refetch } = useApi(() => api.get('/api/products'))
 *
 * Usage (manual, e.g. on form submit):
 *   const { loading, execute } = useApi(
 *     () => api.post('/api/products', body),
 *     { immediate: false }
 *   )
 */
import { useState, useEffect, useCallback } from 'react'

export default function useApi(fn, { immediate = true } = {}) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError]     = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!immediate) return
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await fn()
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate])

  return { data, loading, error, refetch: execute, execute }
}
