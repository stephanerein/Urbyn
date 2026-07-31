import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchShippingRate, updateShippingRatePricing } from '../../../api/supplierShippingPayment'
import { clearShippingFlow, loadShippingFlow } from '../../../lib/supplierFlow'
import { usePortalSession } from '../../../lib/supplier'
import type { SessionUser } from '../../../types/auth'
import { SimpleWizardShell, WizardActions } from '../SimpleWizardShell'

interface ShippingPricingStepProps {
  session: SessionUser
  pathMode: 'creer' | 'modifier'
}

export function ShippingPricingStep({ session, pathMode }: ShippingPricingStepProps) {
  const navigate = useNavigate()
  const portal = usePortalSession(session)
  const [rateId, setRateId] = useState<number | null>(null)
  const [weightMin, setWeightMin] = useState('')
  const [weightMax, setWeightMax] = useState('')
  const [volumeMax, setVolumeMax] = useState('')
  const [ratePerKg, setRatePerKg] = useState('')
  const [baseRate, setBaseRate] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const flow = loadShippingFlow()
    const expected = pathMode === 'creer' ? 'create' : 'edit'
    if (!flow || flow.mode !== expected || !flow.rateId) {
      navigate('/fournisseur/expedition', { replace: true })
      return
    }
    setRateId(flow.rateId)
    fetchShippingRate(portal, flow.rateId)
      .then((r) => {
        if (r.weight_max_kg > 0 || r.rate_per_kg > 0) {
          setWeightMin(String(r.weight_min_kg))
          setWeightMax(String(r.weight_max_kg))
          setVolumeMax(String(r.volume_max_m3))
          setRatePerKg(String(r.rate_per_kg))
          setBaseRate(String(r.base_rate))
          setCurrency(r.currency)
        }
      })
      .catch((e: Error) => setError(e.message))
  }, [navigate, pathMode, portal])

  async function finish() {
    if (!rateId) return
    if (!weightMin || !weightMax || !volumeMax || !ratePerKg || !baseRate || !currency.trim()) {
      setError('Tous les champs de tarification sont obligatoires.')
      return
    }
    if (Number(weightMax) < Number(weightMin)) {
      setError('Le poids maximum doit être supérieur ou égal au minimum.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updateShippingRatePricing(portal, rateId, {
        weight_min_kg: Number(weightMin),
        weight_max_kg: Number(weightMax),
        volume_max_m3: Number(volumeMax),
        rate_per_kg: Number(ratePerKg),
        base_rate: Number(baseRate),
        currency: currency.trim(),
      })
      clearShippingFlow()
      navigate('/fournisseur')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SimpleWizardShell
      backTo="/fournisseur/expedition"
      title={pathMode === 'creer' ? 'Créer — Tarification' : 'Modifier — Tarification'}
      step={2}
      step1Label="Zones"
      step2Label="Tarification"
      flowLabel={pathMode === 'creer' ? 'Parcours création' : 'Parcours modification'}
    >
      <div className="wizard__panel">
        {error ? <p className="wizard__error">{error}</p> : null}
        <div className="wizard__fields">
          <div className="auth-form__row auth-form__row--two">
            <label className="field">
              <span>Poids min. (kg) *</span>
              <input type="number" min="0" step="0.01" value={weightMin} onChange={(e) => setWeightMin(e.target.value)} />
            </label>
            <label className="field">
              <span>Poids max. (kg) *</span>
              <input type="number" min="0" step="0.01" value={weightMax} onChange={(e) => setWeightMax(e.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>Volume max. (m³) *</span>
            <input type="number" min="0" step="0.001" value={volumeMax} onChange={(e) => setVolumeMax(e.target.value)} />
          </label>
          <div className="auth-form__row auth-form__row--two">
            <label className="field">
              <span>Tarif au kg *</span>
              <input type="number" min="0" step="0.0001" value={ratePerKg} onChange={(e) => setRatePerKg(e.target.value)} />
            </label>
            <label className="field">
              <span>Tarif de base *</span>
              <input type="number" min="0" step="0.01" value={baseRate} onChange={(e) => setBaseRate(e.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>Devise *</span>
            <input type="text" maxLength={3} value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} />
          </label>
        </div>
      </div>
      <WizardActions
        onNext={() => void finish()}
        nextLabel="Terminer"
        isFinish
        saving={saving}
      />
    </SimpleWizardShell>
  )
}
