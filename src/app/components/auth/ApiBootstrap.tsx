import { useEffect, useState } from 'react'
import { resolveApiBase } from '../../api/apiBase'

export function ApiBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [baseUrl, setBaseUrl] = useState<string | null>(null)

  useEffect(() => {
    resolveApiBase()
      .then((base) => {
        setBaseUrl(base)
        setReady(true)
      })
      .catch((e: Error) => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="api-bootstrap api-bootstrap--error">
        <div className="api-bootstrap__card">
          <h1>Connexion API impossible</h1>
          <p>{error}</p>
          <p className="api-bootstrap__hint">
            Vérifiez que le backend Render est démarré ou lancez uvicorn en local, puis
            rechargez la page.
          </p>
          <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="api-bootstrap">
        <div className="api-bootstrap__card">
          <p className="api-bootstrap__spinner" aria-hidden />
          <p>Connexion à l&apos;API…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {import.meta.env.DEV && baseUrl ? (
        <div className="api-bootstrap__badge" title="URL API active (testée au démarrage)">
          API : {baseUrl}
        </div>
      ) : null}
      {children}
    </>
  )
}
