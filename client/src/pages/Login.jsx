import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { httpClient, getUser } from '../utils'

export function Login() {
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState()
  const user = getUser()

  async function handleSubmit(e) {
    try {
      e.preventDefault()

      const formData = new FormData(e.target)
      const formObject = Object.fromEntries(formData)

      const tokens = await httpClient
        .post('/login', formObject)
        .then((r) => r.data)

      sessionStorage.setItem('tokens', JSON.stringify(tokens))

      window.location.href = '/'
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  if (user) return <Navigate to="/" replace />

  return (
    <div>
      <h1>Login</h1>
      {error && <p className="notice">{error.message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            defaultValue="wintorez@gmail.com"
            name="username"
            type="email"
            placeholder="Username"
            disabled={isLoading}
            required
          />
        </div>
        <div>
          <input
            defaultValue="password"
            name="password"
            type="password"
            placeholder="Password"
            disabled={isLoading}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          Login
        </button>
      </form>
    </div>
  )
}
