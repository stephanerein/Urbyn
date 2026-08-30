import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { clearSession, loadSession, saveSession } from '../api/auth'
import { AuthModal } from '../components/auth/AuthModal'
import { isBuyer, isSupplier, userDisplayName } from '../lib/session'
import type { AccountSide, SessionUser } from '../types/auth'

interface AuthContextValue {
  session: SessionUser | null
  ready: boolean
  isLoggedIn: boolean
  isBuyer: boolean
  isSupplier: boolean
  userLabel: string | null
  openAuth: (side?: AccountSide) => void
  closeAuth: () => void
  logout: () => void
  setSessionUser: (user: SessionUser | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionUser | null>(null)
  const [ready, setReady] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authSide, setAuthSide] = useState<AccountSide>('buyer')

  useEffect(() => {
    setSession(loadSession())
    setReady(true)
  }, [])

  const setSessionUser = useCallback((user: SessionUser | null) => {
    if (user) saveSession(user)
    else clearSession()
    setSession(user)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
    navigate('/')
  }, [navigate])

  const openAuth = useCallback((side: AccountSide = 'buyer') => {
    setAuthSide(side)
    setAuthOpen(true)
  }, [])

  const handleAuthSuccess = useCallback(
    (user: SessionUser) => {
      setSessionUser(user)
      if (isSupplier(user)) {
        navigate('/fournisseur')
      }
    },
    [navigate, setSessionUser],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      ready,
      isLoggedIn: session !== null,
      isBuyer: isBuyer(session),
      isSupplier: isSupplier(session),
      userLabel: userDisplayName(session),
      openAuth,
      closeAuth: () => setAuthOpen(false),
      logout,
      setSessionUser,
    }),
    [session, ready, logout, setSessionUser, openAuth],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal
        open={authOpen}
        initialSide={authSide}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans AuthProvider')
  }
  return ctx
}
