const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export class ApiError extends Error {
  constructor(status, detail) {
    super(detail || `Request failed with status ${status}`)
    this.status = status
    this.detail = detail
  }
}

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const options = { method, headers }
  if (body !== undefined && method !== 'GET') options.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, options)
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({ detail: res.statusText }))
  if (!res.ok) {
    const detail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
    throw new ApiError(res.status, detail)
  }
  return data
}

const api = {
  get:    (path, token)       => request('GET',    path, undefined, token),
  post:   (path, body, token) => request('POST',   path, body, token),
  put:    (path, body, token) => request('PUT',    path, body, token),
  delete: (path, token)       => request('DELETE', path, undefined, token),
}

export default api
