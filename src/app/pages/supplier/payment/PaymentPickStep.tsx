import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPaymentMethods } from '../../../api/supplierShippingPayment'
import { loadPaymentFlow, savePaymentFlow } from '../../../lib/supplierFlow'
import { usePortalSession } from '../../../lib/supplier'
import type { SessionUser } from '../../../types/auth'
import type { PaymentMethodListEntry } from '../../../api/supplierShippingPayment'
import { SimpleWizardShell } from '../SimpleWizardShell'

export function PaymentPickStep({ session }: { session: SessionUser }) {
  const navigate = useNavigate()
  const portal = usePortalSession(session)
  const [methods, setMethods] = useState<PaymentMethodListEntry[]>([])
  const [selectedId, setSelectedId] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const flow = loadPaymentFlow()
    if (!flow || flow.mode !== 'edit') {
      navigate('/fournisseur/paiement', { replace: true })
      return
    }
    fetchPaymentMethods(portal)
      .then(setMethods)
      .catch((e: Error) => setError(e.message))
  }, [navigate, portal])

  const handleContinue = () => {
    if (!selectedId) {
      setError('Sélectionnez une méthode à modifier.')
      return
    }
    savePaymentFlow({ mode: 'edit', methodId: Number(selectedId) })
    navigate('/fournisseur/paiement/modifier/methode')
  }

  return (
    <SimpleWizardShell
      backTo="/fournisseur/paiement"
      title="Modifier une méthode"
      step={1}
      step1Label="Choix"
      step2Label="Méthode & banque"
      flowLabel="Parcours modification"
    >
      <div className="wizard__panel">
        {error ? <p className="wizard__error">{error}</p> : null}
        <div className="wizard__fields">
          <label className="field">
            <span>Méthode à modifier *</span>
            <select
              className="company-select"
              size={Math.min(5, Math.max(methods.length, 1))}
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">— Sélectionnez —</option>
              {methods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.methode}
                  {m.has_bank_info ? '' : ' (banque à compléter)'}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="wizard__actions">
        <button type="button" className="btn btn--primary" onClick={handleContinue}>
          Continuer
        </button>
      </div>
    </SimpleWizardShell>
  )
}
