import { Link } from 'react-router-dom'
import './SupplierPortal.css'

interface SimpleWizardShellProps {
  backTo: string
  title: string
  step: 1 | 2
  step1Label: string
  step2Label: string
  flowLabel: string
  children: React.ReactNode
}

export function SimpleWizardShell({
  backTo,
  title,
  step,
  step1Label,
  step2Label,
  flowLabel,
  children,
}: SimpleWizardShellProps) {
  return (
    <div className="supplier-page wizard">
      <Link to={backTo} className="btn btn--ghost" style={{ alignSelf: 'flex-start' }}>
        ← Retour
      </Link>
      <h1 className="supplier-page__title">{title}</h1>
      <p className="supplier-page__subtitle">{flowLabel}</p>
      <nav className="wizard__progress" aria-label="Étapes">
        <span className={step === 1 ? 'is-active' : undefined}>1. {step1Label}</span>
        <span> · </span>
        <span className={step === 2 ? 'is-active' : undefined}>2. {step2Label}</span>
      </nav>
      {children}
    </div>
  )
}

export function WizardActions({
  onSave,
  onNext,
  saveLabel = 'Enregistrer',
  nextLabel = 'Suivant',
  finishLabel = 'Terminer',
  saving,
  nextDisabled,
  isFinish,
}: {
  onSave?: () => void
  onNext?: () => void
  saveLabel?: string
  nextLabel?: string
  finishLabel?: string
  saving?: boolean
  nextDisabled?: boolean
  isFinish?: boolean
}) {
  return (
    <div className="wizard__actions">
      {onSave ? (
        <button type="button" className="btn btn--ghost" onClick={onSave} disabled={saving}>
          {saving ? 'Enregistrement…' : saveLabel}
        </button>
      ) : null}
      {onNext ? (
        <button
          type="button"
          className="btn btn--primary"
          onClick={onNext}
          disabled={saving || nextDisabled}
        >
          {saving ? 'Enregistrement…' : isFinish ? finishLabel : nextLabel}
        </button>
      ) : null}
    </div>
  )
}
