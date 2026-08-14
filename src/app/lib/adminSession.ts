const ADMIN_TOKEN_KEY = 'urbyn_admin_token'
const ADMIN_EXPIRES_KEY = 'urbyn_admin_expires'

export function saveAdminSession(token: string, expiresAt: number): void {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
  sessionStorage.setItem(ADMIN_EXPIRES_KEY, String(expiresAt))
}

export function loadAdminToken(): string | null {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY)
  const exp = sessionStorage.getItem(ADMIN_EXPIRES_KEY)
  if (!token || !exp) return null
  if (Date.now() / 1000 > Number(exp)) {
    clearAdminSession()
    return null
  }
  return token
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY)
  sessionStorage.removeItem(ADMIN_EXPIRES_KEY)
}

export function isAdminAuthenticated(): boolean {
  return loadAdminToken() !== null
}
