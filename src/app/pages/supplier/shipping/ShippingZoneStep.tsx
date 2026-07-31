import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createShippingRateZone,
  fetchShippingRate,
  updateShippingRateZone,
} from '../../../api/supplierShippingPayment'
import { loadShippingFlow, saveShippingFlow } from '../../../lib/supplierFlow'
import { usePortalSession } from '../../../lib/supplier'
import type { SessionUser } from '../../../types/auth'
import { SimpleWizardShell, WizardActions } from '../SimpleWizardShell'

interface ShippingZoneStepProps {
  session: SessionUser
  pathMode: 'creer' | 'modifier'
}

export function ShippingZoneStep({ session, pathMode }: ShippingZoneStepProps) {
  const navigate = useNavigate()
  const portal = usePortalSession(session)
  const isCreate = pathMode === 'creer'
  const [rateId, setRateId] = useState<number | null>(null)
  const [carrierName, setCarrierName] = useState('')
  const [zoneFrom, setZoneFrom] = useState('')
  const [zoneTo, setZoneTo] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const flow = loadShippingFlow()
    if (!flow || flow.mode !== (isCreate ? 'create' : 'edit')) {
      navigate('/fournisseur/expedition', { replace: true })
      return
    }
    if (!isCreate) {
      if (!flow.rateId) {
        navigate('/fournisseur/expedition/modifier/choix', { replace: true })
        return
      }
      setRateId(flow.rateId)
      fetchShippingRate(portal, flow.rateId)
        .then((r) => {
          setCarrierName(r.carrier_name)
          setZoneFrom(r.zone_from)
          setZoneTo(r.zone_to)
          setIsActive(r.is_active)
        })
        .catch((e: Error) => setError(e.message))
    }
  }, [isCreate, navigate, portal])

  function validateZones(): boolean {
    if (!carrierName.trim() || !zoneFrom.trim() || !zoneTo.trim()) {
      setError('Transporteur, zone de départ et zone d\'arrivée sont obligatoires.')
      return false
    }
    setError(null)
    return true
  }

  const zoneBody = {
    carrier_name: carrierName.trim(),
    zone_from: zoneFrom.trim(),
    zone_to: zoneTo.trim(),
    is_active: isActive,
  }

  async function persistZones(): Promise<number | null> {
    if (!validateZones()) return null
    setSaving(true)
    setSuccess(null)
    try {
      if (isCreate) {
        const created = await createShippingRateZone(portal, zoneBody)
        saveShippingFlow({ mode: 'create', rateId: created.id })
        setRateId(created.id)
        setSuccess('Zones enregistrées.')
        return created.id
      }
      if (!rateId) return null
      await updateShippingRateZone(portal, rateId, zoneBody)
      setSuccess('Zones mises à jour.')
      return rateId
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
      return null
    } finally {
      setSaving(false)
    }
  }

  const tarifsPath = isCreate
    ? '/fournisseur/expedition/creer/tarifs'
    : '/fournisseur/expedition/modifier/tarifs'

  return (
    <SimpleWizardShell
      backTo="/fournisseur/expedition"
      title={isCreate ? 'Créer — Zones' : 'Modifier — Zones'}
      step={1}
      step1Label="Zones"
      step2Label="Tarification"
      flowLabel={isCreate ? 'Parcours création' : 'Parcours modification'}
    >
      <div className="wizard__panel">
        {error ? <p className="wizard__error">{error}</p> : null}
        {success ? <p className="wizard__success">{success}</p> : null}
        <div className="wizard__fields">
          <label className="field">
            <span>Transporteur *</span>
            <input value={carrierName} onChange={(e) => setCarrierName(e.target.value)} />
          </label>
          <label className="field">
            <span>Zone de départ *</span>
            <input value={zoneFrom} onChange={(e) => setZoneFrom(e.target.value)} placeholder="Ex. Île-de-France" />
          </label>
          <label className="field">
            <span>Zone d&apos;arrivée *</span>
            <input value={zoneTo} onChange={(e) => setZoneTo(e.target.value)} placeholder="Ex. Provence" />
          </label>
          <label className="field checkbox-row">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>Tarif actif</span>
          </label>
        </div>
      </div>
      <WizardActions
        onSave={() => void persistZones()}
        onNext={async () => {
          const id = await persistZones()
          if (id) navigate(tarifsPath)
        }}
        saving={saving}
      />
    </SimpleWizardShell>
  )
}
