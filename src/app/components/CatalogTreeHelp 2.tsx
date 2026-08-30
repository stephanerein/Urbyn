import { useCallback, useEffect, useState } from 'react'
import { fetchCatalogChildren, fetchRootCatalogs } from '../api/supplierPortal'
import type { CatalogRecord, PortalSessionPayload } from '../types/supplierPortal'

interface TreeNodeData extends CatalogRecord {
  children?: TreeNodeData[]
  loading?: boolean
  expanded?: boolean
  loaded?: boolean
}

interface CatalogTreeHelpProps {
  portal: PortalSessionPayload
  open: boolean
  onClose: () => void
  onSelect?: (catalog: CatalogRecord) => void
  title?: string
  excludeIds?: number[]
}

function patchNodes(
  nodes: TreeNodeData[],
  nodeId: number,
  patch: (n: TreeNodeData) => TreeNodeData,
): TreeNodeData[] {
  return nodes.map((n) => {
    if (n.id === nodeId) return patch(n)
    if (n.children) return { ...n, children: patchNodes(n.children, nodeId, patch) }
    return n
  })
}

function HelpTreeNode({
  node,
  depth,
  excludeIds,
  onToggle,
  onSelect,
}: {
  node: TreeNodeData
  depth: number
  excludeIds: Set<number>
  onToggle: (id: number) => void
  onSelect?: (catalog: CatalogRecord) => void
}) {
  const excluded = excludeIds.has(node.id)
  const canExpand = !node.loaded || (node.children?.length ?? 0) > 0

  return (
    <li className="catalog-help-tree__item">
      <div
        className="catalog-help-tree__row"
        style={{ paddingLeft: `${depth * 1 + 0.35}rem` }}
      >
        {canExpand ? (
          <button
            type="button"
            className="catalog-help-tree__toggle"
            aria-label={node.expanded ? 'Replier' : 'Déplier'}
            disabled={node.loading}
            onClick={() => onToggle(node.id)}
          >
            {node.loading ? '…' : node.expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="catalog-help-tree__toggle catalog-help-tree__toggle--spacer">·</span>
        )}
        <span className={`catalog-help-tree__label ${excluded ? 'is-disabled' : ''}`}>
          {node.name ?? `Catalogue #${node.id}`}
        </span>
        {onSelect && !excluded ? (
          <button type="button" className="catalog-help-tree__pick" onClick={() => onSelect(node)}>
            Choisir
          </button>
        ) : null}
      </div>
      {node.expanded && node.children && node.children.length > 0 ? (
        <ul className="catalog-help-tree__children">
          {node.children.map((child) => (
            <HelpTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              excludeIds={excludeIds}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function CatalogHelpTrigger({
  onClick,
  label = 'Voir l’arborescence des catalogues',
}: {
  onClick: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      className="catalog-help-trigger"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      ?
    </button>
  )
}

export function CatalogTreeHelpModal({
  portal,
  open,
  onClose,
  onSelect,
  title = 'Arborescence des catalogues',
  excludeIds = [],
}: CatalogTreeHelpProps) {
  const [roots, setRoots] = useState<TreeNodeData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const excludeSet = new Set(excludeIds)

  const loadRoots = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRootCatalogs(portal)
      setRoots(data.map((r) => ({ ...r, loaded: false, expanded: false })))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }, [portal])

  useEffect(() => {
    if (open) void loadRoots()
  }, [open, loadRoots])

  async function toggleNode(nodeId: number) {
    let target: TreeNodeData | undefined
    const find = (nodes: TreeNodeData[]) => {
      for (const n of nodes) {
        if (n.id === nodeId) {
          target = n
          return
        }
        if (n.children) find(n.children)
      }
    }
    find(roots)
    if (!target) return

    if (target.expanded) {
      setRoots((prev) => patchNodes(prev, nodeId, (n) => ({ ...n, expanded: false })))
      return
    }

    if (target.loaded) {
      setRoots((prev) => patchNodes(prev, nodeId, (n) => ({ ...n, expanded: true })))
      return
    }

    setRoots((prev) =>
      patchNodes(prev, nodeId, (n) => ({ ...n, loading: true, expanded: true })),
    )

    try {
      const children = await fetchCatalogChildren(portal, nodeId)
      setRoots((prev) =>
        patchNodes(prev, nodeId, (n) => ({
          ...n,
          loading: false,
          loaded: true,
          expanded: true,
          children: children.map((c) => ({ ...c, loaded: false, expanded: false })),
        })),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
      setRoots((prev) =>
        patchNodes(prev, nodeId, (n) => ({ ...n, loading: false, expanded: false })),
      )
    }
  }

  function handleSelect(catalog: CatalogRecord) {
    onSelect?.(catalog)
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="catalog-help-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-help-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="catalog-help-modal">
        <div className="catalog-help-modal__head">
          <h3 id="catalog-help-title">{title}</h3>
          <button type="button" className="catalog-help-modal__close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>
        <p className="catalog-help-modal__hint">
          Parcourez l&apos;arborescence pour vous repérer.
          {onSelect ? ' Cliquez sur « Choisir » pour sélectionner un catalogue.' : ''}
        </p>
        {error ? <p className="wizard__error">{error}</p> : null}
        {loading ? (
          <p className="field__unit-hint">Chargement…</p>
        ) : roots.length === 0 ? (
          <p className="field__unit-hint">Aucun catalogue disponible.</p>
        ) : (
          <ul className="catalog-help-tree">
            {roots.map((node) => (
              <HelpTreeNode
                key={node.id}
                node={node}
                depth={0}
                excludeIds={excludeSet}
                onToggle={(id) => void toggleNode(id)}
                onSelect={onSelect ? handleSelect : undefined}
              />
            ))}
          </ul>
        )}
        <div className="catalog-help-modal__foot">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
