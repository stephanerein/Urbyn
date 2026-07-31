import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteAdminUser, displayRole, fetchAdminUser, userDisplayName } from '../../api/adminAccounts'
import { AdminTopBar } from './AdminDashboardPage'
import { AdminBackLink, AdminFieldGrid, AdminIdentityCard } from './AdminAccountsShared'
import './Admin.css'

export function AdminUserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const userId = Number(id)
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof fetchAdminUser>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    fetchAdminUser(userId)
      .then(setDetail)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId])

  async function handleDelete() {
    if (!detail) return
    const msg =
      'Supprimer définitivement cet utilisateur ?\n\n' +
      'Effacé : profil, lien société, codes OTP, avis personnels.\n' +
      'Conservé en base : la société (table companies), ses produits, adresses et catalogues.\n' +
      'Un nouvel utilisateur pourra se rattacher à cette société ensuite.'
    if (!window.confirm(msg)) return
    setDeleting(true)
    setError(null)
    try {
      await deleteAdminUser(detail.id)
      navigate('/admin/utilisateurs')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suppression impossible.')
      setDeleting(false)
    }
  }

  return (
    <div className="admin-page">
      <AdminTopBar title="Fiche utilisateur" />
      <main className="admin-page__main">
        <AdminBackLink to="/admin/utilisateurs" label="Retour aux comptes" />
        {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}
        {loading ? (
          <p className="admin-catalog__hint">Chargement…</p>
        ) : detail ? (
          <AdminIdentityCard
            title={userDisplayName(detail)}
            subtitle={`${displayRole(detail.role)} · #${detail.id}`}
            deleteLabel="Supprimer l'utilisateur"
            deleting={deleting}
            onDelete={() => void handleDelete()}
          >
            <AdminFieldGrid
              items={[
                { label: 'Email', value: detail.email },
                { label: 'Civilité', value: detail.title },
                { label: 'Prénom', value: detail.first_name },
                { label: 'Nom', value: detail.last_name },
                { label: 'Mobile', value: detail.mobile_phone },
                { label: 'Fixe', value: detail.fixe_phone },
                { label: 'Compte actif', value: detail.is_active ? 'Oui' : 'Non' },
                { label: 'Email vérifié', value: detail.email_verified ? 'Oui' : 'Non' },
                { label: 'Créé le', value: new Date(detail.created_at).toLocaleString('fr-FR') },
                { label: 'Mis à jour', value: new Date(detail.updated_at).toLocaleString('fr-FR') },
              ]}
            />
            {detail.companies.length > 0 ? (
              <section className="admin-identity__section">
                <h3>Sociétés associées</h3>
                <ul className="admin-identity__list">
                  {detail.companies.map((c) => (
                    <li key={c.tva_intra_com}>
                      <strong>{c.company_name}</strong> — TVA {c.tva_intra_com}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </AdminIdentityCard>
        ) : null}
      </main>
    </div>
  )
}
