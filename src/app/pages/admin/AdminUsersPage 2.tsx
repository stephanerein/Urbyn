import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchAdminUsers,
  userDisplayName,
  type AdminUserListItem,
} from '../../api/adminAccounts'
import { AdminTopBar } from './AdminDashboardPage'
import { AdminSplitTable } from './AdminAccountsShared'
import './Admin.css'

function UserTable({ rows, linkPrefix }: { rows: AdminUserListItem[]; linkPrefix: string }) {
  if (rows.length === 0) return null
  return (
    <table className="admin-data-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th>Société</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((u) => (
          <tr key={u.id}>
            <td>
              <Link to={`${linkPrefix}/${u.id}`} className="admin-data-table__link">
                {userDisplayName(u)}
              </Link>
            </td>
            <td>{u.email}</td>
            <td>{u.company_name ?? '—'}</td>
            <td>
              {!u.is_active ? (
                <span className="admin-tree__badge">Inactif</span>
              ) : u.email_verified ? (
                <span className="admin-status--active">Vérifié</span>
              ) : (
                <span className="admin-status--inactive">Non vérifié</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function AdminUsersPage() {
  const [suppliers, setSuppliers] = useState<AdminUserListItem[]>([])
  const [clients, setClients] = useState<AdminUserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAdminUsers()
      .then((data) => {
        setSuppliers(data.suppliers)
        setClients(data.clients)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="admin-page">
      <AdminTopBar title="Comptes utilisateurs" />
      <main className="admin-page__main">
        <p className="admin-page__lead">
          Partenaires à gauche, clients à droite. Cliquez sur une ligne pour la fiche détail.
        </p>
        {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}
        {loading ? (
          <p className="admin-catalog__hint">Chargement…</p>
        ) : (
          <AdminSplitTable
            leftTitle="Partenaires"
            rightTitle="Clients"
            leftRows={<UserTable rows={suppliers} linkPrefix="/admin/utilisateurs" />}
            rightRows={<UserTable rows={clients} linkPrefix="/admin/utilisateurs" />}
          />
        )}
      </main>
    </div>
  )
}
