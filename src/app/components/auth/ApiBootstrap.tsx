import { useEffect, useState } from 'react'
import { resolveApiBase } from '../../api/apiBase'

// Vérifie la connectivité API en arrière-plan sans jamais bloquer le rendu :
// - Pendant le pré-rendu serveur (voir prerender.mjs), useEffect ne s'exécute
//   jamais — un composant qui attendrait `ready` resterait bloqué pour
//   toujours et le HTML statique livré aux crawlers perdrait tout son
//   contenu (plus de <title>/<meta> par page).
// - Côté client, bloquer le premier rendu le temps de la vérification créerait
//   un écart avec le HTML pré-rendu par le serveur (mismatch d'hydratation).
// On affiche donc toujours les enfants immédiatement, et on ne montre qu'un
// bandeau non bloquant si l'API se révèle injoignable.
export function ApiBootstrap({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null)
  const [baseUrl, setBaseUrl] = useState<string | null>(null)

  useEffect(() => {
    resolveApiBase()
      .then((base) => setBaseUrl(base))
      .catch((e: Error) => setError(e.message))
  }, [])

  return (
    <>
      {error ? (
        <div className="api-bootstrap__banner" role="alert">
          <span>Connexion API impossible : {error}</span>
          <button type="button" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      ) : null}
      {import.meta.env.DEV && baseUrl ? (
        <div className="api-bootstrap__badge" title="URL API active (testée au démarrage)">
          API : {baseUrl}
        </div>
      ) : null}
      {children}
    </>
  )
}
