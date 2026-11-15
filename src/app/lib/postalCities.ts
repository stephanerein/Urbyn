import { useEffect, useState } from 'react'

/** Communes françaises correspondant à un code postal. */
export function usePostalCities(postalCode: string, country: string) {
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const france = country === 'France' || country === 'FR'
  const code = postalCode.trim()

  useEffect(() => {
    if (!france || !/^\d{5}$/.test(code)) {
      setCities([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetch(
      `https://geo.api.gouv.fr/communes?codePostal=${encodeURIComponent(code)}&fields=nom&format=json`,
    )
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (cancelled) return
        const names = Array.isArray(data)
          ? [...new Set(data.map((item) => String(item?.nom || '').trim()).filter(Boolean))].sort(
              (a, b) => a.localeCompare(b, 'fr'),
            )
          : []
        setCities(names)
      })
      .catch(() => {
        if (!cancelled) setCities([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [code, france])

  return { cities, loading, france }
}
