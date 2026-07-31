import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isAdminAuthenticated } from '../../lib/adminSession'
import './Admin.css'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }
  return <>{children}</>
}

export function AdminLayout() {
  return (
    <div className="admin-shell">
      <Outlet />
    </div>
  )
}
