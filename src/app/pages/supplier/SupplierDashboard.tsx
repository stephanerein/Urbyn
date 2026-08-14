import { Fragment, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPortalContext, fetchProductsGroupedByCatalog, type ProductCatalogGroup } from '../../api/supplierPortal'
import { patchWizardDraft, usePortalSession } from '../../lib/supplier'
import type { SessionUser } from '../../types/auth'
import type { ProductListEntry } from '../../types/supplierPortal'
import './SupplierPortal.css'

interface SupplierDashboardProps {
  session: SessionUser
}

export function SupplierDashboard({ session }: SupplierDashboardProps) {
  const navigate = useNavigate()
  const portal = usePortalSession(session)
  const [companyName, setCompanyName] = useState<string | null>(null)
  const [groups, setGroups] = useState<ProductCatalogGroup[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    fetchPortalContext(portal)
      .then((ctx) => setCompanyName(ctx.company_name))
      .catch(() => setCompanyName(null))
  }, [portal])

  useEffect(() => {
    fetchProductsGroupedByCatalog(portal)
      .then((data) => setGroups(data.groups))
      .catch(() => setGroups([]))
      .finally(() => setLoadingProducts(false))
  }, [portal])

  const totalProducts = groups.reduce((sum, g) => sum + g.products.length, 0)

  function openProduct(p: ProductListEntry) {
    patchWizardDraft({
      catalogRef: p.primary_catalog_id,
      catalogName: p.catalog_name ?? undefined,
      productId: p.product_id,
    })
    navigate('/fournisseur/offres/produit')
  }

  function goToCatalog() {
    navigate('/fournisseur/offres/catalogue')
  }

  return (
    <main className="supplier-page supplier-page--wide">
      <h1 className="supplier-page__title">Espace partenaire</h1>
      <p className="supplier-page__subtitle">
        {companyName ? `Société : ${companyName}` : 'Gérez vos offres et paramètres'}
      </p>

      <section className="supplier-products-panel">
        <div className="supplier-products-panel__head">
          <h2>Vos produits</h2>
          <span className="supplier-products-panel__count">
            {totalProducts} produit{totalProducts > 1 ? 's' : ''}
          </span>
        </div>
        {loadingProducts ? (
          <p className="supplier-products-panel__hint">Chargement…</p>
        ) : totalProducts === 0 ? (
          <div className="supplier-products-panel__empty">
            <p>Aucun produit pour le moment.</p>
            <button type="button" className="btn btn--primary" onClick={goToCatalog}>
              Renseignez votre premier produit
            </button>
          </div>
        ) : (
          <div className="supplier-products-table__scroll">
            <table className="supplier-products-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Produit</th>
                  <th>Prix</th>
                  <th>État</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <Fragment key={group.catalog_id}>
                    <tr className="supplier-products-table__group">
                      <td colSpan={4}>{group.catalog_name ?? `Catalogue #${group.catalog_id}`}</td>
                    </tr>
                    {group.products.map((p) => (
                      <tr key={p.product_id}>
                        <td>
                          <button
                            type="button"
                            className="supplier-products-table__link"
                            onClick={() => openProduct(p)}
                          >
                            {p.client_sku}
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="supplier-products-table__link"
                            onClick={() => openProduct(p)}
                          >
                            {p.product_name}
                          </button>
                        </td>
                        <td>
                          {p.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {p.currency}
                        </td>
                        <td>{p.is_active ? 'Actif' : 'Inactif'}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="supplier-menu">
        <button
          type="button"
          className="supplier-menu__card"
          onClick={goToCatalog}
        >
          <strong>Catalogues & produits</strong>
          <span>Choisir un catalogue existant puis créer ou modifier vos produits</span>
        </button>
        <button
          type="button"
          className="supplier-menu__card"
          onClick={() => navigate('/fournisseur/expedition')}
        >
          <strong>Méthodes d&apos;expédition</strong>
          <span>Créer ou modifier vos tarifs de transport (2 étapes)</span>
        </button>
        <button
          type="button"
          className="supplier-menu__card"
          onClick={() => navigate('/fournisseur/paiement')}
        >
          <strong>Informations de paiement</strong>
          <span>Créer ou modifier une méthode et ses coordonnées bancaires</span>
        </button>
      </div>
    </main>
  )
}
