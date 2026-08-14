import { createContext, useContext } from 'react'
import type { SessionUser } from '../types/auth'

const SupplierSessionContext = createContext<SessionUser | null>(null)

export function SupplierSessionProvider({
  session,
  children,
}: {
  session: SessionUser
  children: React.ReactNode
}) {
  return (
    <SupplierSessionContext.Provider value={session}>{children}</SupplierSessionContext.Provider>
  )
}

export function useSupplierSession(): SessionUser {
  const session = useContext(SupplierSessionContext)
  if (!session) {
    throw new Error('useSupplierSession doit être utilisé dans l’espace partenaire.')
  }
  return session
}
