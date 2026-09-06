/** Parse la valeur Google Sheet (ligne résultats) → nombre de lests 25 kg par totem. */
export function parseSheetBalastsPerUnit(value: number | string | null | undefined): number | null {
  if (value == null || value === '') return null
  const raw = typeof value === 'number' ? value : String(value).trim()
  if (typeof raw === 'string' && /^(ok|conforme|aucun|none|n\/?a|-)$/i.test(raw)) {
    return 0
  }
  const n =
    typeof raw === 'number'
      ? raw
      : Number(String(raw).replace(/\s/g, '').replace(',', '.').replace(/[^\d.-]/g, ''))
  if (!Number.isFinite(n) || n < 0) return null
  // Valeur ≥ 25 → souvent un poids (kg) → convertir en unités de 25 kg
  if (n >= 25) return Math.ceil(n / 25)
  return Math.ceil(n)
}

export function balastLineId(forTotemId: string): string {
  return `balast-for-${forTotemId}`
}
