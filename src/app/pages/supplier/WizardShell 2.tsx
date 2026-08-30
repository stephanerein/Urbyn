import { Link } from 'react-router-dom'
import './SupplierPortal.css'

const STEPS = [
  { path: 'catalogue', label: 'Catalogue' },
  { path: 'produit', label: 'Produit' },
] as const

export type WizardStepPath = (typeof STEPS)[number]['path']

interface WizardShellProps {
  step: WizardStepPath
  title: string
  children: React.ReactNode
}

export function WizardShell({ step, title, children }: WizardShellProps) {
  const stepIndex = STEPS.findIndex((s) => s.path === step)

  return (
    <div className="supplier-page wizard">
      <Link to="/fournisseur" className="btn btn--ghost" style={{ alignSelf: 'flex-start' }}>
        ← Accueil partenaire
      </Link>
      <h1 className="supplier-page__title">{title}</h1>
      <nav className="wizard__progress" aria-label="Étapes">
        {STEPS.map((s, i) => (
          <span key={s.path} className={i === stepIndex ? 'is-active' : undefined}>
            {i + 1}. {s.label}
            {i < STEPS.length - 1 ? ' · ' : ''}
          </span>
        ))}
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
  saving,
  nextDisabled,
}: {
  onSave: () => void
  onNext?: () => void
  saveLabel?: string
  nextLabel?: string
  saving?: boolean
  nextDisabled?: boolean
}) {
  return (
    <div className="wizard__actions">
      <button type="button" className="btn btn--ghost" onClick={onSave} disabled={saving}>
        {saving ? 'Enregistrement…' : saveLabel}
      </button>
      {onNext ? (
        <button
          type="button"
          className="btn btn--primary"
          onClick={onNext}
          disabled={saving || nextDisabled}
        >
          {nextLabel}
        </button>
      ) : null}
    </div>
  )
}
