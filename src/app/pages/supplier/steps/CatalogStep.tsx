import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchCatalogChildren,
  fetchRootCatalogs,
  searchCatalogs,
} from '../../../api/supplierPortal'
import { CatalogHelpTrigger, CatalogTreeHelpModal } from '../../../components/CatalogTreeHelp'
import { catalogPathLabel } from '../../../lib/catalogDisplay'
import { loadWizardDraft, patchWizardDraft, usePortalSession } from '../../../lib/supplier'
import type { SessionUser } from '../../../types/auth'
import type { CatalogRecord } from '../../../types/supplierPortal'
import { WizardActions, WizardShell } from '../WizardShell'

interface CatalogStepProps {
  session: SessionUser
}

type PickMode = 'search' | 'browse'

export function CatalogStep({ session }: CatalogStepProps) {
  const navigate = useNavigate()
  const portal = usePortalSession(session)
  const draft = loadWizardDraft()

  const [mode, setMode] = useState<PickMode>('search')
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<CatalogRecord[]>([])
  const [searching, setSearching] = useState(false)
  const [roots, setRoots] = useState<CatalogRecord[]>([])
  const [path, setPath] = useState<CatalogRecord[]>([])
  const [levelOptions, setLevelOptions] = useState<CatalogRecord[][]>([])
  const [selected, setSelected] = useState<CatalogRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [treeHelpOpen, setTreeHelpOpen] = useState(false)

  useEffect(() => {
    fetchRootCatalogs(portal)
      .then(setRoots)
      .catch((e: Error) => setError(e.message))
  }, [portal])

  useEffect(() => {
    if (draft.catalogRef && !selected) {
      setSelected({
        id: draft.catalogRef,
        name: draft.catalogName ?? `Catalogue #${draft.catalogRef}`,
        description: null,
        is_active: true,
        parent_id: null,
      })
    }
  }, [draft.catalogRef, draft.catalogName, selected])

  useEffect(() => {
    const q = search.trim()
    if (mode !== 'search' || q.length < 2) {
      setSearchResults([])
      return
    }
    const timer = window.setTimeout(() => {
      setSearching(true)
      searchCatalogs(portal, q)
        .then(setSearchResults)
        .catch((e: Error) => setError(e.message))
        .finally(() => setSearching(false))
    }, 300)
    return () => window.clearTimeout(timer)
  }, [search, mode, portal])

  const selectCatalog = useCallback((cat: CatalogRecord) => {
    setSelected(cat)
    setError(null)
    patchWizardDraft({ catalogRef: cat.id, catalogName: cat.name ?? undefined, productId: undefined })
  }, [])

  async function onRootChange(rootId: number) {
    const root = roots.find((r) => r.id === rootId)
    if (!root) return
    setPath([root])
    setLevelOptions([])
    setSelected(null)
    try {
      const children = await fetchCatalogChildren(portal, root.id)
      if (children.length === 0) {
        selectCatalog(root)
      } else {
        setLevelOptions([children])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    }
  }

  async function onLevelChange(levelIndex: number, catalogId: number) {
    const options = levelOptions[levelIndex]
    const cat = options?.find((c) => c.id === catalogId)
    if (!cat) return
    const newPath = [...path.slice(0, levelIndex + 1), cat]
    setPath(newPath)
    setLevelOptions((opts) => opts.slice(0, levelIndex + 1))
    setSelected(null)
    try {
      const children = await fetchCatalogChildren(portal, cat.id)
      if (children.length === 0) {
        selectCatalog(cat)
      } else {
        setLevelOptions((opts) => [...opts.slice(0, levelIndex + 1), children])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    }
  }

  function confirmCurrentBrowseSelection() {
    const current = path[path.length - 1]
    if (current) selectCatalog(current)
    else setError('Sélectionnez un catalogue dans l’arborescence.')
  }

  function goNext() {
    if (!selected) {
      setError('Sélectionnez un catalogue avant de continuer.')
      return
    }
    patchWizardDraft({
      catalogRef: selected.id,
      catalogName: selected.name ?? undefined,
      productId: undefined,
    })
    navigate('/fournisseur/offres/produit')
  }

  return (
    <WizardShell step="catalogue" title="Étape 1 — Choisir un catalogue">
      <p className="wizard__context-banner">
        Les catalogues sont partagés sur la plateforme. Trouvez celui qui correspond à votre
        produit — vous ne pouvez pas en créer un nouveau.
      </p>

      <div className="wizard__mode">
        <button
          type="button"
          className={mode === 'search' ? 'is-active' : undefined}
          onClick={() => setMode('search')}
        >
          Recherche
        </button>
        <button
          type="button"
          className={mode === 'browse' ? 'is-active' : undefined}
          onClick={() => setMode('browse')}
        >
          Parcourir l&apos;arborescence
        </button>
      </div>

      <div className="wizard__panel">
        {error ? <p className="wizard__error">{error}</p> : null}

        {selected ? (
          <p className="wizard__success">
            Catalogue sélectionné : <strong>{catalogPathLabel(selected)}</strong>
            {selected.description ? ` — ${selected.description}` : ''}
          </p>
        ) : null}

        {mode === 'search' ? (
          <div className="wizard__fields">
            <label className="field">
              <span className="field-label-row">
                Rechercher un catalogue
                <CatalogHelpTrigger onClick={() => setTreeHelpOpen(true)} />
              </span>
              <input
                type="search"
                placeholder="Nom ou description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="field__unit-hint">
                {search.trim().length < 2
                  ? 'Saisissez au moins 2 caractères.'
                  : searching
                    ? 'Recherche…'
                    : `${searchResults.length} résultat(s)`}
              </span>
            </label>
            <ul className="link-catalog-picker" aria-label="Résultats de recherche">
              {searchResults.length === 0 && search.trim().length >= 2 && !searching ? (
                <li className="link-catalog-picker__empty">Aucun catalogue trouvé.</li>
              ) : (
                searchResults.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={selected?.id === c.id ? 'is-selected' : undefined}
                      onClick={() => selectCatalog(c)}
                    >
                      <span className="link-catalog-picker__name">{catalogPathLabel(c)}</span>
                      {c.description ? (
                        <span className="link-catalog-picker__desc">{c.description}</span>
                      ) : null}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : (
          <div className="wizard__fields">
            <label className="field">
              <span className="field-label-row">
                Catalogue racine
                <CatalogHelpTrigger onClick={() => setTreeHelpOpen(true)} />
              </span>
              <select
                value={path[0]?.id ?? ''}
                onChange={(e) => void onRootChange(Number(e.target.value))}
              >
                <option value="">— Choisir une racine —</option>
                {roots.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name ?? `Catalogue #${r.id}`}
                  </option>
                ))}
              </select>
            </label>

            {levelOptions.map((options, levelIndex) => (
              <label key={levelIndex} className="field">
                <span>Sous-catalogue (niveau {levelIndex + 1})</span>
                <select
                  value={path[levelIndex + 1]?.id ?? ''}
                  onChange={(e) => void onLevelChange(levelIndex, Number(e.target.value))}
                >
                  <option value="">— Choisir —</option>
                  {options.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name ?? `Catalogue #${c.id}`}
                    </option>
                  ))}
                </select>
              </label>
            ))}

            {path.length > 0 && levelOptions.length > 0 && !selected ? (
              <button type="button" className="btn btn--ghost" onClick={confirmCurrentBrowseSelection}>
                Utiliser le catalogue du niveau actuel
              </button>
            ) : null}

            {roots.length === 0 ? (
              <p className="field__unit-hint">Aucun catalogue racine en base pour le moment.</p>
            ) : null}
          </div>
        )}
      </div>

      <WizardActions onSave={() => goNext()} onNext={goNext} nextDisabled={!selected} />

      <CatalogTreeHelpModal
        portal={portal}
        open={treeHelpOpen}
        onClose={() => setTreeHelpOpen(false)}
        onSelect={selectCatalog}
        title="Arborescence des catalogues"
      />
    </WizardShell>
  )
}
