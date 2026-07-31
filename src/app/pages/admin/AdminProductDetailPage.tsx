import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchAdminProduct } from '../../api/admin'
import { AdminTopBar } from './AdminDashboardPage'
import { AdminBackLink, AdminFieldGrid } from './AdminAccountsShared'
import './Admin.css'

export function AdminProductDetailPage() {
  const { id } = useParams()
  const productId = Number(id)
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof fetchAdminProduct>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!productId) return
    fetchAdminProduct(productId)
      .then(setDetail)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [productId])

  return (
    <div className="admin-page">
      <AdminTopBar title="Fiche produit" />
      <main className="admin-page__main">
        <AdminBackLink to="/admin/catalogues" label="Retour aux catalogues" />
        {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}
        {loading ? (
          <p className="admin-catalog__hint">Chargement…</p>
        ) : detail ? (
          <div className="admin-identity admin-identity--readonly">
            <div className="admin-identity__head">
              <div>
                <h2>{detail.product_name}</h2>
                <p className="admin-identity__subtitle">
                  {detail.admin_sku} · {detail.is_active ? 'Actif' : 'Inactif'}
                </p>
              </div>
            </div>
            <div className="admin-identity__body">
              <AdminFieldGrid
                items={[
                  { label: 'SKU admin', value: detail.admin_sku },
                  { label: 'SKU client', value: detail.client_sku },
                  { label: 'Nom produit', value: detail.product_name },
                  { label: 'Société', value: detail.company_name },
                  { label: 'TVA intracom', value: detail.company_tva },
                  {
                    label: 'Prix',
                    value: `${detail.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${detail.currency}`,
                  },
                  { label: 'État', value: detail.is_active ? 'Actif' : 'Inactif' },
                  {
                    label: 'Catalogues',
                    value: detail.catalog_names.length ? detail.catalog_names.join(' · ') : '—',
                  },
                ]}
              />
              {detail.mandatory_attributes.length > 0 ? (
                <section className="admin-identity__section">
                  <h3>Attributs obligatoires</h3>
                  <ul className="admin-identity__list">
                    {detail.mandatory_attributes.map((a) => (
                      <li key={a.name}>
                        <strong>{a.name}</strong> — {a.value ?? '—'}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {detail.free_attributes.length > 0 ? (
                <section className="admin-identity__section">
                  <h3>Attributs libres</h3>
                  <ul className="admin-identity__list">
                    {detail.free_attributes.map((a) => (
                      <li key={a.name}>
                        <strong>{a.name}</strong> — {a.value ?? '—'}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
