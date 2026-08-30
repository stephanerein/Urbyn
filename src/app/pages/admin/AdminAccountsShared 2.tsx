import { Link } from 'react-router-dom'

export function AdminSplitTable({
  leftTitle,
  rightTitle,
  leftRows,
  rightRows,
  emptyLeft = 'Aucune entrée.',
  emptyRight = 'Aucune entrée.',
}: {
  leftTitle: string
  rightTitle: string
  leftRows: React.ReactNode
  rightRows: React.ReactNode
  emptyLeft?: string
  emptyRight?: string
}) {
  return (
    <div className="admin-split-table">
      <div className="admin-split-table__col">
        <h3>{leftTitle}</h3>
        <div className="admin-split-table__scroll">{leftRows || <p className="admin-catalog__hint">{emptyLeft}</p>}</div>
      </div>
      <div className="admin-split-table__col">
        <h3>{rightTitle}</h3>
        <div className="admin-split-table__scroll">{rightRows || <p className="admin-catalog__hint">{emptyRight}</p>}</div>
      </div>
    </div>
  )
}

export function AdminIdentityCard({
  title,
  subtitle,
  children,
  onDelete,
  deleting,
  deleteLabel,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  onDelete: () => void
  deleting?: boolean
  deleteLabel: string
}) {
  return (
    <div className="admin-identity">
      <div className="admin-identity__head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="admin-identity__subtitle">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--danger"
          disabled={deleting}
          onClick={onDelete}
        >
          {deleting ? 'Suppression…' : deleteLabel}
        </button>
      </div>
      <div className="admin-identity__body">{children}</div>
    </div>
  )
}

export function AdminFieldGrid({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="admin-field-grid">
      {items.map((item) => (
        <div key={item.label} className="admin-field-grid__row">
          <dt>{item.label}</dt>
          <dd>{item.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

export function AdminBackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="admin-back-link">
      ← {label}
    </Link>
  )
}
