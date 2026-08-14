import type { SessionUser } from '../types/auth'

export function isBuyer(session: SessionUser | null): boolean {
  if (!session) return false
  return session.role_name === 'Client' || session.account_type === 'buyer'
}

export function isSupplier(session: SessionUser | null): boolean {
  if (!session) return false
  return session.role_name === 'Fournisseur' || session.account_type === 'partner'
}

export function userDisplayName(session: SessionUser | null): string | null {
  if (!session) return null
  const name = [session.first_name, session.last_name].filter(Boolean).join(' ')
  return name || session.email
}
