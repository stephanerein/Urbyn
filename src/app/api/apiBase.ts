let resolvedBase: string | null = null
let resolutionError: string | null = null
let resolvePromise: Promise<string> | null = null

const PROBE_TIMEOUT_MS = 12_000

function normalizeBase(url: string): string {
  return url.replace(/\/+$/, '')
}

function getCandidateBases(): string[] {
  const web = import.meta.env.VITE_API_URL_WEB?.trim()
  const local =
    import.meta.env.VITE_API_URL_LOCAL?.trim() ||
    import.meta.env.VITE_API_URL?.trim() ||
    'http://127.0.0.1:8000'

  const ordered: string[] = []
  if (web) ordered.push(normalizeBase(web))
  const localNorm = normalizeBase(local)
  if (!ordered.includes(localNorm)) ordered.push(localNorm)
  return ordered
}

async function probeBase(base: string): Promise<boolean> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
  try {
    const response = await fetch(`${base}/health`, {
      method: 'GET',
      signal: controller.signal,
    })
    return response.ok
  } catch {
    return false
  } finally {
    window.clearTimeout(timer)
  }
}

/** Teste les URLs une seule fois au démarrage (web puis local). */
export function resolveApiBase(): Promise<string> {
  if (resolvedBase) return Promise.resolve(resolvedBase)
  if (resolvePromise) return resolvePromise

  resolvePromise = (async () => {
    const candidates = getCandidateBases()
    if (candidates.length === 0) {
      resolutionError = 'Aucune URL API configurée (VITE_API_URL_WEB / VITE_API_URL_LOCAL).'
      throw new Error(resolutionError)
    }

    for (const base of candidates) {
      if (await probeBase(base)) {
        resolvedBase = base
        return base
      }
    }

    resolutionError = `API injoignable. URLs testées : ${candidates.join(', ')}`
    throw new Error(resolutionError)
  })()

  return resolvePromise
}

export function getApiBase(): string {
  if (!resolvedBase) {
    throw new Error(resolutionError ?? 'API non initialisée.')
  }
  return resolvedBase
}

export function getApiBaseOrNull(): string | null {
  return resolvedBase
}
