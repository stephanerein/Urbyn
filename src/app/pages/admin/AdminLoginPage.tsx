import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { adminLogin } from '../../api/admin'
import { saveAdminSession } from '../../lib/adminSession'
import './Admin.css'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await adminLogin(login.trim(), password)
      saveAdminSession(res.token, res.expires_at)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__brand">
          <span className="admin-login__logo">U</span>
          <div>
            <h1>Administration Urbyn</h1>
            <p>Accès réservé — connexion requise</p>
          </div>
        </div>
        <form className="admin-login__form" onSubmit={(e) => void handleSubmit(e)}>
          {error ? <p className="admin-login__error">{error}</p> : null}
          <label className="admin-field">
            <span>Identifiant</span>
            <input
              type="text"
              autoComplete="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </label>
          <label className="admin-field">
            <span>Mot de passe</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
