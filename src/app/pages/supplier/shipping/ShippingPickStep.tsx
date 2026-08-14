import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchShippingRates } from '../../../api/supplierShippingPayment'
import { saveShippingFlow, loadShippingFlow } from '../../../lib/supplierFlow'
import { usePortalSession } from '../../../lib/supplier'
import type { SessionUser } from '../../../types/auth'
import type { ShippingRateListEntry } from '../../../api/supplierShippingPayment'
import { SimpleWizardShell } from '../SimpleWizardShell'

export function ShippingPickStep({ session }: { session: SessionUser }) {
  const navigate = useNavigate()
  const portal = usePortalSession(session)
  const [rates, setRates] = useState<ShippingRateListEntry[]>([])
  const [selectedId, setSelectedId] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const flow = loadShippingFlow()
    if (!flow || flow.mode !== 'edit') {
      navigate('/fournisseur/expedition', { replace: true })
      return
    }
    fetchShippingRates(portal)
      .then(setRates)
      .catch((e: Error) => setError(e.message))
  }, [navigate, portal])

  const handleContinue = () => {
    if (!selectedId) {
      setError('Sélectionnez un tarif à modifier.')
      return
    }
    saveShippingFlow({ mode: 'edit', rateId: Number(selectedId) })
    navigate('/fournisseur/expedition/modifier/zones')
  }

  return (
    <SimpleWizardShell
      backTo="/fournisseur/expedition"
      title="Modifier un tarif"
      step={1}
      step1Label="Choix"
      step2Label="Zones & tarifs"
      flowLabel="Parcours modification"
    >
      <div className="wizard__panel">
        {error ? <p className="wizard__error">{error}</p> : null}
        <div className="wizard__fields">
          <label className="field">
            <span>Tarif à modifier *</span>
            <select
              className="company-select"
              size={Math.min(5, Math.max(rates.length, 1))}
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">— Sélectionnez —</option>
              {rates.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.carrier_name} — {r.zone_from} → {r.zone_to}
                  {!r.is_active ? ' (inactif)' : ''}
                </option>
              ))}
            </select>
            {rates.length === 0 ? (
              <span className="field__unit-hint">Aucun tarif en base. Créez-en un d&apos;abord.</span>
            ) : null}
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
