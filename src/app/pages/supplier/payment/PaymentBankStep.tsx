import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPaymentMethod, updatePaymentMethodBank } from '../../../api/supplierShippingPayment'
import { clearPaymentFlow, loadPaymentFlow } from '../../../lib/supplierFlow'
import { usePortalSession } from '../../../lib/supplier'
import type { SessionUser } from '../../../types/auth'
import { SimpleWizardShell, WizardActions } from '../SimpleWizardShell'

interface PaymentBankStepProps {
  session: SessionUser
  pathMode: 'creer' | 'modifier'
}

export function PaymentBankStep({ session, pathMode }: PaymentBankStepProps) {
  const navigate = useNavigate()
  const portal = usePortalSession(session)
  const [methodId, setMethodId] = useState<number | null>(null)
  const [iban, setIban] = useState('')
  const [bic, setBic] = useState('')
  const [bankName, setBankName] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const flow = loadPaymentFlow()
    const expected = pathMode === 'creer' ? 'create' : 'edit'
    if (!flow || flow.mode !== expected || !flow.methodId) {
      navigate('/fournisseur/paiement', { replace: true })
      return
    }
    setMethodId(flow.methodId)
    fetchPaymentMethod(portal, flow.methodId)
      .then((m) => {
        if (m.iban_number) setIban(m.iban_number)
        if (m.bic) setBic(m.bic)
        if (m.bank_name) setBankName(m.bank_name)
        setIsPrimary(m.is_primary)
      })
      .catch((e: Error) => setError(e.message))
  }, [navigate, pathMode, portal])

  async function finish() {
    if (!methodId) return
    if (!iban.trim() || !bic.trim() || !bankName.trim()) {
      setError('IBAN, BIC et nom de la banque sont obligatoires.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updatePaymentMethodBank(portal, methodId, {
        iban_number: iban.trim(),
        bic: bic.trim(),
        bank_name: bankName.trim(),
        is_primary: isPrimary,
      })
      clearPaymentFlow()
      navigate('/fournisseur')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SimpleWizardShell
      backTo="/fournisseur/paiement"
      title={pathMode === 'creer' ? 'Créer — Banque' : 'Modifier — Banque'}
      step={2}
      step1Label="Méthode"
      step2Label="Coordonnées bancaires"
      flowLabel={pathMode === 'creer' ? 'Parcours création' : 'Parcours modification'}
    >
      <div className="wizard__panel">
        {error ? <p className="wizard__error">{error}</p> : null}
        <div className="wizard__fields">
          <label className="field">
            <span>IBAN *</span>
            <input value={iban} onChange={(e) => setIban(e.target.value)} />
          </label>
          <label className="field">
            <span>BIC *</span>
            <input value={bic} onChange={(e) => setBic(e.target.value.toUpperCase())} maxLength={11} />
          </label>
          <label className="field">
            <span>Nom de la banque *</span>
            <input value={bankName} onChange={(e) => setBankName(e.target.value)} />
          </label>
          <label className="field checkbox-row">
            <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
            <span>Compte principal</span>
          </label>
        </div>
      </div>
      <WizardActions onNext={() => void finish()} nextLabel="Terminer" isFinish saving={saving} />
    </SimpleWizardShell>
  )
}
