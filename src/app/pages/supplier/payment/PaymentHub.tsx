import { useNavigate } from 'react-router-dom'
import { savePaymentFlow } from '../../../lib/supplierFlow'
import '../SupplierPortal.css'

export function PaymentHub() {
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
      <h1 className="supplier-page__title">Méthodes de paiement</h1>
      <p className="supplier-page__subtitle">
        Choisissez un parcours : création ou modification. Le parcours reste fixe jusqu&apos;à la fin.
      </p>
      <div className="supplier-menu">
        <button
          type="button"
          className="supplier-menu__card"
          onClick={() => {
            savePaymentFlow({ mode: 'create' })
            navigate('/fournisseur/paiement/creer/methode')
          }}
        >
          <strong>Créer une méthode de paiement</strong>
          <span>Type de méthode, puis coordonnées bancaires</span>
        </button>
        <button
          type="button"
          className="supplier-menu__card"
          onClick={() => {
            savePaymentFlow({ mode: 'edit' })
            navigate('/fournisseur/paiement/modifier/choix')
          }}
        >
          <strong>Modifier une méthode existante</strong>
          <span>Sélectionner une méthode déjà enregistrée</span>
        </button>
      </div>
    </main>
  )
}
