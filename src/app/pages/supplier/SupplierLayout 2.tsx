import { Navigate, Outlet } from 'react-router-dom'
import { SupplierSessionProvider } from '../../contexts/SupplierSessionContext'
import { useAuth } from '../../context/AuthContext'

export function SupplierLayout() {
  const { session, ready, isSupplier } = useAuth()

  if (!ready) return null
  if (!session || !isSupplier) {
    return <Navigate to="/" replace />
  }

  return (
    <SupplierSessionProvider session={session}>
      <Outlet />
    </SupplierSessionProvider>
  )
}
