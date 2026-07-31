import { Link } from 'react-router-dom'
import { clearAdminSession } from '../../lib/adminSession'
import './Admin.css'

export function AdminDashboardPage() {
  return (
    <div className="admin-page">
      <AdminTopBar title="Tableau de bord" />
      <main className="admin-page__main">
        <p className="admin-page__lead">
          Gérez la plateforme Urbyn. Les partenaires s&apos;appuient sur les catalogues que
          vous définissez ici.
        </p>
        <div className="admin-cards">
          <Link to="/admin/catalogues" className="admin-card">
            <span className="admin-card__icon" aria-hidden>
              📁
            </span>
            <strong>Catalogues</strong>
            <span>Arborescence partagée — créer, modifier, désactiver</span>
          </Link>
          <Link to="/admin/utilisateurs" className="admin-card">
            <span className="admin-card__icon" aria-hidden>
              👤
            </span>
            <strong>Comptes utilisateurs</strong>
            <span>Partenaires et clients — fiches et suppression</span>
          </Link>
          <Link to="/admin/societes" className="admin-card">
            <span className="admin-card__icon" aria-hidden>
              🏢
            </span>
            <strong>Sociétés</strong>
            <span>Boîtes inscrites — fiches et suppression complète</span>
          </Link>
        </div>
      </main>
    </div>
  )
}

export function AdminTopBar({ title }: { title: string }) {
  return (
    <header className="admin-topbar">
      <div className="admin-topbar__left">
        <Link to="/admin" className="admin-topbar__brand">
          Urbyn Admin
        </Link>
        <span className="admin-topbar__sep">/</span>
        <h1>{title}</h1>
      </div>
      <nav className="admin-topbar__nav">
        <Link to="/admin/catalogues">Catalogues</Link>
        <Link to="/admin/utilisateurs">Utilisateurs</Link>
        <Link to="/admin/societes">Sociétés</Link>
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--sm"
          onClick={() => {
            clearAdminSession()
            window.location.href = '/admin/login'
          }}
        >
          Déconnexion
        </button>
      </nav>
    </header>
  )
}
