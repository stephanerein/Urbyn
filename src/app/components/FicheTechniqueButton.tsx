import { useEffect, useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { getApiBase, resolveApiBase } from '../api/apiBase'

type Props = {
  /** Clé stable mappée côté backend → ID fichier Drive (ex. caisson-bois-120, sign-iz) */
  documentKey: string
  className?: string
  label?: string
}

/**
 * Bouton outline cohérent avec l'UI totem.
 * Le PDF est servi par le backend (proxy Drive) — aucun secret côté front.
 */
export function FicheTechniqueButton({
  documentKey,
  className,
  label = 'Télécharger la fiche technique',
}: Props) {
  const [available, setAvailable] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setAvailable(null)
    setError(null)
    ;(async () => {
      try {
        await resolveApiBase()
        const base = getApiBase()
        const res = await fetch(
          `${base}/api/v1/documents/fiche-technique/${encodeURIComponent(documentKey)}/status`,
        )
        if (!res.ok) {
          if (!cancelled) setAvailable(false)
          return
        }
        const data = (await res.json()) as { available?: boolean }
        if (!cancelled) setAvailable(Boolean(data.available))
      } catch {
        if (!cancelled) setAvailable(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [documentKey])

  const handleDownload = async () => {
    setLoading(true)
    setError(null)
    try {
      await resolveApiBase()
      const base = getApiBase()
      const res = await fetch(
        `${base}/api/v1/documents/fiche-technique/${encodeURIComponent(documentKey)}`,
      )
      if (!res.ok) {
        let message = 'Fiche technique indisponible pour le moment.'
        try {
          const body = await res.json()
          if (body?.detail?.message) message = body.detail.message
        } catch {
          /* ignore */
        }
        throw new Error(message)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fiche-technique-${documentKey}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Téléchargement impossible')
    } finally {
      setLoading(false)
    }
  }

  // Tant que le status charge : bouton discret désactivé (évite un flash d'erreur)
  const disabled = loading || available === false || available === null

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => void handleDownload()}
        className="w-full border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4 mr-2" />
        )}
        {loading ? 'Téléchargement…' : label}
      </Button>
      {available === false ? (
        <p className="text-xs text-gray-400 mt-2">
          Fiche technique bientôt disponible.
        </p>
      ) : null}
      {error ? <p className="text-xs text-red-600 mt-2">{error}</p> : null}
    </div>
  )
}
