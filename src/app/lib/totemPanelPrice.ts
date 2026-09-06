/**
 * Prix panneau imprimé totem :
 * [(Longueur cm / 100) × (Hauteur cm / 100)] × 100 €/m²
 * ⇔ (L × H) / 100
 */

const LENGTH_KEYS = [
  'Longueur panneau imprimé (cm)',
  'Longueur panneau imprimé',
  'Longueur panneau',
]

const HEIGHT_KEYS = [
  'Hauteur panneau imprimé (cm)',
  'Hauteur panneau imprimé',
  'Hauteur panneau',
]

function attrCi(
  attrs: Record<string, string> | null | undefined,
  names: string[],
): string | null {
  if (!attrs) return null
  const entries = Object.entries(attrs)
  for (const name of names) {
    const target = name.trim().toLowerCase()
    const hit = entries.find(([k]) => k.trim().toLowerCase() === target)
    if (hit?.[1] != null && String(hit[1]).trim() !== '') return String(hit[1]).trim()
  }
  // Partial match (ex. typos / suffixes)
  for (const name of names) {
    const needle = name.trim().toLowerCase().replace(/\s*\(cm\)\s*$/i, '')
    const hit = entries.find(([k]) => k.trim().toLowerCase().includes(needle))
    if (hit?.[1] != null && String(hit[1]).trim() !== '') return String(hit[1]).trim()
  }
  return null
}

export function parseCm(raw: string | number | null | undefined): number | null {
  if (raw == null) return null
  if (typeof raw === 'number') return Number.isFinite(raw) && raw > 0 ? raw : null
  const m = String(raw).replace(',', '.').match(/(\d+(?:\.\d+)?)/)
  if (!m) return null
  const n = parseFloat(m[1])
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Parse "108 x 145 cm" / "108×145". */
export function parsePanelFormatSize(
  format: string | null | undefined,
): { lengthCm: number; heightCm: number } | null {
  if (!format) return null
  const m = format.replace(',', '.').match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i)
  if (!m) return null
  const lengthCm = parseFloat(m[1])
  const heightCm = parseFloat(m[2])
  if (!(lengthCm > 0 && heightCm > 0)) return null
  return { lengthCm, heightCm }
}

export function panelPrintPriceFromDims(lengthCm: number, heightCm: number): number {
  const price = (lengthCm / 100) * (heightCm / 100) * 100
  return Math.round(price * 100) / 100
}

export type PanelPriceSource = {
  attributes?: Record<string, string> | null
  panel_format?: string | null
  product_name?: string | null
}

/**
 * Prix unitaire HT du panneau imprimé pour un produit totem.
 * Priorité : attributs L/H → format panneau → fallback legacy par taille.
 */
export function computeTotemPanelPrintPrice(product: PanelPriceSource): number {
  const attrs = product.attributes
  const lengthCm = parseCm(attrCi(attrs, LENGTH_KEYS))
  const heightCm = parseCm(attrCi(attrs, HEIGHT_KEYS))
  if (lengthCm != null && heightCm != null) {
    return panelPrintPriceFromDims(lengthCm, heightCm)
  }

  const fromFormat = parsePanelFormatSize(product.panel_format)
  if (fromFormat) {
    return panelPrintPriceFromDims(fromFormat.lengthCm, fromFormat.heightCm)
  }

  // Legacy fallback (anciennes tailles caisson bois)
  const fromName = product.product_name?.match(/(\d{2,3})\s*$/)
  const fromPanel = product.panel_format?.match(/(\d{2,3})/)
  const n = parseInt(fromName?.[1] || fromPanel?.[1] || '120', 10)
  if (n <= 80) return 120
  if (n <= 120) return 180
  if (n <= 160) return 240
  return 300
}

export function formatPanelPriceEur(value: number): string {
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })
}
