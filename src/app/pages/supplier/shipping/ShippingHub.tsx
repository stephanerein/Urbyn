import { useNavigate } from 'react-router-dom'
import { saveShippingFlow } from '../../../lib/supplierFlow'
import '../SupplierPortal.css'

export function ShippingHub() {
  const navigate = useNavigate()

  return (
    <main className="supplier-page">
      <button
        type="button"
        className="btn btn--ghost"
        style={{ alignSelf: 'flex-start' }}
        onClick={() => navigate('/fournisseur')}
      >
        ← Accueil partenaire
      </button>
      <h1 className="supplier-page__title">Tarifs d&apos;expédition</h1>
      <p className="supplier-page__subtitle">
        Choisissez un parcours : création ou modification. Vous ne pourrez pas changer en cours de route.
      </p>
      <div className="supplier-menu">
        <button
          type="button"
          className="supplier-menu__card"
          onClick={() => {
            saveShippingFlow({ mode: 'create' })
            navigate('/fournisseur/expedition/creer/zones')
          }}
        >
          <strong>Créer un tarif d&apos;expédition</strong>
          <span>Zones de départ / arrivée, puis tarification au poids</span>
        </button>
        <button
          type="button"
          className="supplier-menu__card"
          onClick={() => {
            saveShippingFlow({ mode: 'edit' })
            navigate('/fournisseur/expedition/modifier/choix')
          }}
        >
          <strong>Modifier un tarif existant</strong>
          <span>Sélectionner un tarif déjà enregistré pour votre société</span>
        </button>
      </div>
    </main>
  )
}
