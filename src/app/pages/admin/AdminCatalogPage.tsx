import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createAdminCatalog,
  fetchAdminCatalog,
  fetchAdminCatalogProducts,
  fetchAdminCatalogTree,
  updateAdminCatalog,
  type AdminCatalogAttributeIn,
  type AdminCatalogNode,
  type AdminCatalogProductEntry,
} from '../../api/admin'
import { AdminTopBar } from './AdminDashboardPage'
import './Admin.css'

type PanelMode = 'empty' | 'edit' | 'create-root' | 'create-child'

function nodeMatches(node: AdminCatalogNode, q: string): boolean {
  const hay = `${node.name ?? ''} ${node.description ?? ''}`.toLowerCase()
  return hay.includes(q)
}

function filterTree(nodes: AdminCatalogNode[], q: string): AdminCatalogNode[] {
  if (!q) return nodes
  const result: AdminCatalogNode[] = []
  for (const node of nodes) {
    const filteredChildren = filterTree(node.children, q)
    if (nodeMatches(node, q) || filteredChildren.length > 0) {
      result.push({ ...node, children: filteredChildren })
    }
  }
  return result
}

function collectExpandIds(nodes: AdminCatalogNode[], q: string, acc: Set<number>): void {
  for (const node of nodes) {
    if (node.children.length) {
      collectExpandIds(node.children, q, acc)
      if (q && (nodeMatches(node, q) || node.children.some((c) => acc.has(c.id)))) {
        acc.add(node.id)
      }
    }
  }
}

function TreeNode({
  node,
  depth,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
}: {
  node: AdminCatalogNode
  depth: number
  selectedId: number | null
  expandedIds: Set<number>
  onSelect: (id: number) => void
  onToggle: (id: number) => void
}) {
  const hasChildren = node.children.length > 0
  const expanded = expandedIds.has(node.id)
  const selected = selectedId === node.id

  return (
    <li className="admin-tree__item">
      <div
        className={`admin-tree__row ${selected ? 'is-selected' : ''}`}
        style={{ paddingLeft: `${depth * 1.1 + 0.5}rem` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="admin-tree__toggle"
            aria-label={expanded ? 'Replier' : 'Déplier'}
            onClick={() => onToggle(node.id)}
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="admin-tree__toggle admin-tree__toggle--spacer" />
        )}
        <button type="button" className="admin-tree__label" onClick={() => onSelect(node.id)}>
          <span className="admin-tree__name">{node.name ?? `Catalogue #${node.id}`}</span>
          {!node.is_active ? <span className="admin-tree__badge">Inactif</span> : null}
          {node.product_count > 0 ? (
            <span className="admin-tree__meta">{node.product_count} prod.</span>
          ) : null}
        </button>
      </div>
      {hasChildren && expanded ? (
        <ul className="admin-tree__children">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function AdminCatalogPage() {
  const [roots, setRoots] = useState<AdminCatalogNode[]>([])
  const [total, setTotal] = useState(0)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<PanelMode>('empty')
  const [createParentId, setCreateParentId] = useState<number | null>(null)
  const [breadcrumb, setBreadcrumb] = useState<string[]>([])
  const [childCount, setChildCount] = useState(0)
  const [productCount, setProductCount] = useState(0)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [attributes, setAttributes] = useState<AdminCatalogAttributeIn[]>([])
  const [newAttributeName, setNewAttributeName] = useState('')
  const [newAttributeDefault, setNewAttributeDefault] = useState('')

  const [catalogProducts, setCatalogProducts] = useState<AdminCatalogProductEntry[]>([])
  const [productsLoading, setProductsLoading] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const q = search.trim().toLowerCase()
  const displayTree = useMemo(() => filterTree(roots, q), [roots, q])

  const reloadTree = useCallback(async () => {
    const data = await fetchAdminCatalogTree()
    setRoots(data.roots)
    setTotal(data.total)
  }, [])

  useEffect(() => {
    reloadTree()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [reloadTree])

  useEffect(() => {
    if (!q) return
    const expanded = new Set<number>()
    collectExpandIds(roots, q, expanded)
    setExpandedIds(expanded)
  }, [q, roots])

  async function loadCatalogProducts(id: number) {
    setProductsLoading(true)
    try {
      setCatalogProducts(await fetchAdminCatalogProducts(id))
    } catch {
      setCatalogProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  async function loadDetail(id: number) {
    const detail = await fetchAdminCatalog(id)
    setSelectedId(id)
    setMode('edit')
    setName(detail.name ?? '')
    setDescription(detail.description ?? '')
    setIsActive(detail.is_active)
    setAttributes(
      detail.attribute_definitions
        .map((a) => ({
          attribute_name: a.attribute_name,
          default_value: a.default_value?.trim() || '',
        }))
        .sort((a, b) => a.attribute_name.localeCompare(b.attribute_name, 'fr')),
    )
    setBreadcrumb(detail.breadcrumb)
    setChildCount(detail.child_count)
    setProductCount(detail.product_count)
    setCreateParentId(null)
    setError(null)
    void loadCatalogProducts(id)
  }

  function startCreateRoot() {
    setSelectedId(null)
    setMode('create-root')
    setCreateParentId(null)
    setName('')
    setDescription('')
    setIsActive(true)
    setAttributes([])
    setNewAttributeName('')
    setNewAttributeDefault('')
    setBreadcrumb([])
    setChildCount(0)
    setProductCount(0)
    setCatalogProducts([])
    setError(null)
    setSuccess(null)
  }

  function startCreateChild() {
    if (!selectedId) return
    setMode('create-child')
    setCreateParentId(selectedId)
    setName('')
    setDescription('')
    setIsActive(true)
    setAttributes([])
    setNewAttributeName('')
    setNewAttributeDefault('')
    setError(null)
    setSuccess(null)
  }

  function toggleExpand(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function addAttributeName() {
    const trimmed = newAttributeName.trim()
    const defaultVal = newAttributeDefault.trim()
    if (!trimmed) {
      setError('Indiquez un nom d’attribut.')
      return
    }
    if (!defaultVal) {
      setError('Indiquez une valeur par défaut (appliquée à tous les produits du catalogue).')
      return
    }
    if (attributes.some((a) => a.attribute_name.toLowerCase() === trimmed.toLowerCase())) {
      setError('Cet attribut existe déjà pour ce catalogue.')
      return
    }
    setAttributes((list) =>
      [...list, { attribute_name: trimmed, default_value: defaultVal }].sort((a, b) =>
        a.attribute_name.localeCompare(b.attribute_name, 'fr'),
      ),
    )
    setNewAttributeName('')
    setNewAttributeDefault('')
    setError(null)
  }

  function removeAttributeName(index: number) {
    setAttributes((list) => list.filter((_, i) => i !== index))
  }

  function updateAttributeDefault(index: number, value: string) {
    setAttributes((list) =>
      list.map((a, i) => (i === index ? { ...a, default_value: value } : a)),
    )
  }

  async function handleSave() {
    if (!name.trim() || !description.trim()) {
      setError('Nom et description sont obligatoires.')
      return
    }
    if (attributes.some((a) => !a.default_value.trim())) {
      setError('Chaque attribut obligatoire doit avoir une valeur par défaut.')
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const body = {
        name: name.trim(),
        description: description.trim(),
        is_active: isActive,
        attributes: attributes.map((a) => ({
          attribute_name: a.attribute_name.trim(),
          default_value: a.default_value.trim(),
        })),
      }
      if (mode === 'edit' && selectedId) {
        await updateAdminCatalog(selectedId, body)
        setSuccess('Catalogue mis à jour.')
        await reloadTree()
        await loadDetail(selectedId)
      } else if (mode === 'create-root') {
        const created = await createAdminCatalog(body)
        setSuccess('Catalogue racine créé.')
        await reloadTree()
        await loadDetail(created.id)
      } else if (mode === 'create-child' && createParentId) {
        const created = await createAdminCatalog({ ...body, parent_id: createParentId })
        setSuccess('Sous-catalogue créé.')
        setExpandedIds((prev) => new Set(prev).add(createParentId))
        await reloadTree()
        await loadDetail(created.id)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(next: boolean) {
    if (!selectedId || mode !== 'edit') return
    setIsActive(next)
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await updateAdminCatalog(selectedId, {
        name: name.trim(),
        description: description.trim(),
        is_active: next,
        attributes: attributes.map((a) => ({
          attribute_name: a.attribute_name.trim(),
          default_value: a.default_value.trim(),
        })),
      })
      setSuccess(next ? 'Catalogue activé.' : 'Catalogue désactivé.')
      await reloadTree()
    } catch (e) {
      setIsActive(!next)
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const panelTitle =
    mode === 'create-root'
      ? 'Nouveau catalogue racine'
      : mode === 'create-child'
        ? 'Nouveau sous-catalogue'
        : mode === 'edit'
          ? (name || 'Catalogue')
          : 'Sélectionnez un catalogue'

  return (
    <div className="admin-page admin-page--catalog">
      <AdminTopBar title="Catalogues" />
      <main className="admin-catalog">
        <aside className="admin-catalog__tree-panel">
          <div className="admin-catalog__tree-head">
            <input
              type="search"
              className="admin-search"
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="button" className="admin-btn admin-btn--soft" onClick={startCreateRoot}>
              + Racine
            </button>
          </div>
          <p className="admin-catalog__tree-meta">{total} catalogue(s) au total</p>
          {loading ? (
            <p className="admin-catalog__hint">Chargement…</p>
          ) : displayTree.length === 0 ? (
            <p className="admin-catalog__hint">
              {q ? 'Aucun résultat.' : 'Aucun catalogue. Créez une racine pour commencer.'}
            </p>
          ) : (
            <ul className="admin-tree">
              {displayTree.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  depth={0}
                  selectedId={selectedId}
                  expandedIds={expandedIds}
                  onSelect={(id) => void loadDetail(id)}
                  onToggle={toggleExpand}
                />
              ))}
            </ul>
          )}
        </aside>

        <section className="admin-catalog__detail">
          <div className="admin-catalog__detail-head">
            <div>
              <h2>{panelTitle}</h2>
              {breadcrumb.length > 0 ? (
                <p className="admin-catalog__breadcrumb">{breadcrumb.join(' › ')}</p>
              ) : null}
            </div>
            {mode === 'edit' && selectedId ? (
              <div className="admin-catalog__detail-actions">
                <button type="button" className="admin-btn admin-btn--soft" onClick={startCreateChild}>
                  + Enfant
                </button>
              </div>
            ) : null}
          </div>

          {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}
          {success ? <p className="admin-alert admin-alert--success">{success}</p> : null}

          {mode === 'empty' ? (
            <div className="admin-catalog__empty">
              <p>Choisissez un nœud dans l&apos;arborescence ou créez un catalogue racine.</p>
            </div>
          ) : (
            <>
              {mode === 'edit' ? (
                <div className="admin-stats">
                  <span>{childCount} sous-catalogue(s)</span>
                  <span>{productCount} produit(s)</span>
                  <span className={isActive ? 'admin-status--active' : 'admin-status--inactive'}>
                    {isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              ) : null}
              {mode === 'create-child' && createParentId ? (
                <p className="admin-catalog__hint">Parent : catalogue #{createParentId}</p>
              ) : null}

              <div className="admin-form">
                <label className="admin-field">
                  <span>Nom *</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="admin-field">
                  <span>Description *</span>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>

                <div className="admin-attr-section">
                  <h3>Attributs obligatoires produit</h3>
                  <p className="admin-catalog__hint">
                    Schéma commun à tous les produits de ce catalogue. À l&apos;ajout, la valeur par
                    défaut est appliquée automatiquement aux produits déjà présents. Au retrait,
                    l&apos;attribut disparaît de tous les produits du catalogue.
                  </p>
                  {attributes.length === 0 ? (
                    <p className="admin-catalog__hint">Aucun attribut défini.</p>
                  ) : (
                    <ul className="admin-attr-list">
                      {attributes.map((attr, idx) => (
                        <li key={`${attr.attribute_name}-${idx}`} className="admin-attr-list__item">
                          <div className="admin-attr-list__meta">
                            <strong>{attr.attribute_name}</strong>
                            <label className="admin-attr-list__default">
                              <span>Défaut</span>
                              <input
                                type="text"
                                value={attr.default_value}
                                onChange={(e) => updateAttributeDefault(idx, e.target.value)}
                                placeholder="valeur par défaut"
                              />
                            </label>
                          </div>
                          <button
                            type="button"
                            className="admin-btn admin-btn--ghost"
                            onClick={() => removeAttributeName(idx)}
                          >
                            Retirer
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="admin-attr-add admin-attr-add--with-default">
                    <input
                      type="text"
                      placeholder="Nom (ex. Entraxe)"
                      value={newAttributeName}
                      onChange={(e) => setNewAttributeName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addAttributeName()
                        }
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Valeur par défaut *"
                      value={newAttributeDefault}
                      onChange={(e) => setNewAttributeDefault(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addAttributeName()
                        }
                      }}
                    />
                    <button type="button" className="admin-btn admin-btn--soft" onClick={addAttributeName}>
                      + Attribut
                    </button>
                  </div>
                </div>
              </div>

              <div className="admin-form__actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  disabled={saving}
                  onClick={() => void handleSave()}
                >
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                {mode === 'edit' && selectedId ? (
                  isActive ? (
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger"
                      disabled={saving}
                      onClick={() => void toggleActive(false)}
                    >
                      Désactiver le catalogue
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="admin-btn admin-btn--soft"
                      disabled={saving}
                      onClick={() => void toggleActive(true)}
                    >
                      Activer le catalogue
                    </button>
                  )
                ) : null}
              </div>
            </>
          )}
        </section>

        <aside className="admin-catalog__products-panel">
          <h3>Produits du catalogue</h3>
          {mode !== 'edit' || !selectedId ? (
            <p className="admin-catalog__hint">Sélectionnez un catalogue pour voir ses produits.</p>
          ) : productsLoading ? (
            <p className="admin-catalog__hint">Chargement…</p>
          ) : catalogProducts.length === 0 ? (
            <p className="admin-catalog__hint">Aucun produit enregistré dans ce catalogue.</p>
          ) : (
            <div className="admin-mini-table__scroll">
              <table className="admin-mini-table">
                <thead>
                  <tr>
                    <th>SKU admin</th>
                    <th>Produit</th>
                    <th>Société</th>
                    <th>Prix</th>
                    <th>État</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogProducts.map((p) => (
                    <tr key={p.product_id}>
                      <td>
                        <Link to={`/admin/produits/${p.product_id}`} className="admin-mini-table__link">
                          {p.admin_sku}
                        </Link>
                      </td>
                      <td>
                        <Link to={`/admin/produits/${p.product_id}`} className="admin-mini-table__link">
                          {p.product_name}
                        </Link>
                      </td>
                      <td>{p.company_name}</td>
                      <td>
                        {p.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {p.currency}
                      </td>
                      <td>
                        <span
                          className={
                            p.is_active ? 'admin-status--active' : 'admin-status--inactive'
                          }
                        >
                          {p.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}
