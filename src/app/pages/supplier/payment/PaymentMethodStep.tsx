import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createPaymentMethodStep1,
  fetchPaymentMethod,
  updatePaymentMethodStep1,
} from '../../../api/supplierShippingPayment'
import { loadPaymentFlow, savePaymentFlow } from '../../../lib/supplierFlow'
import { usePortalSession } from '../../../lib/supplier'
import type { SessionUser } from '../../../types/auth'
import { SimpleWizardShell, WizardActions } from '../SimpleWizardShell'

interface PaymentMethodStepProps {
  session: SessionUser
  pathMode: 'creer' | 'modifier'
}

export function PaymentMethodStep({ session, pathMode }: PaymentMethodStepProps) {
  const navigate = useNavigate()
  const portal = usePortalSession(session)
  const isCreate = pathMode === 'creer'
  const [methodId, setMethodId] = useState<number | null>(null)
  const [methode, setMethode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const flow = loadPaymentFlow()
    if (!flow || flow.mode !== (isCreate ? 'create' : 'edit')) {
      navigate('/fournisseur/paiement', { replace: true })
      return
    }
    if (!isCreate) {
      if (!flow.methodId) {
        navigate('/fournisseur/paiement/modifier/choix', { replace: true })
        return
      }
      setMethodId(flow.methodId)
      fetchPaymentMethod(portal, flow.methodId)
        .then((m) => setMethode(m.methode))
        .catch((e: Error) => setError(e.message))
    }
  }, [isCreate, navigate, portal])

  async function persistMethod(): Promise<number | null> {
    if (!methode.trim()) {
      setError('Le type de méthode est obligatoire.')
      return null
    }
    setSaving(true)
    setSuccess(null)
    setError(null)
    try {
      if (isCreate) {
        const created = await createPaymentMethodStep1(portal, methode.trim())
        savePaymentFlow({ mode: 'create', methodId: created.id })
        setMethodId(created.id)
        setSuccess('Méthode enregistrée.')
        return created.id
      }
      if (!methodId) return null
      await updatePaymentMethodStep1(portal, methodId, methode.trim())
      setSuccess('Méthode mise à jour.')
      return methodId
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
      return null
    } finally {
      setSaving(false)
    }
  }

  const bankPath = isCreate
    ? '/fournisseur/paiement/creer/banque'
    : '/fournisseur/paiement/modifier/banque'

  return (
    <SimpleWizardShell
      backTo="/fournisseur/paiement"
      title={isCreate ? 'Créer — Méthode' : 'Modifier — Méthode'}
      step={1}
      step1Label="Méthode"
      step2Label="Coordonnées bancaires"
      flowLabel={isCreate ? 'Parcours création' : 'Parcours modification'}
    >
      <div className="wizard__panel">
        {error ? <p className="wizard__error">{error}</p> : null}
        {success ? <p className="wizard__success">{success}</p> : null}
        <div className="wizard__fields">
          <label className="field">
            <span>Méthode de paiement *</span>
            <input
              value={methode}
              onChange={(e) => setMethode(e.target.value)}
              placeholder="Ex. Virement, Prélèvement SEPA…"
            />
          </label>
        </div>
      </div>
      <WizardActions
        onSave={() => void persistMethod()}
        onNext={async () => {
          const id = await persistMethod()
          if (id) navigate(bankPath)
        }}
        saving={saving}
      />
    </SimpleWizardShell>
  )
}
