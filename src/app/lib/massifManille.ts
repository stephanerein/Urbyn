/** Helpers Manille — mutualisation par « Manille Type » + max de « Manille Nombre ». */

export function normalizeManilleType(value: string | null | undefined): string {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/,/g, ',')
}

export function manilleCartId(manilleType: string): string {
  return `massif-manille-${normalizeManilleType(manilleType)}`
}

export function manilleTypesMatch(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const na = normalizeManilleType(a)
  const nb = normalizeManilleType(b)
  return Boolean(na && nb && na === nb)
}

type AttrBag = { name: string; value: string }

function collectAttrBags(sources: {
  attributes?: Array<{ label?: string; name?: string; attribute_name?: string; value?: string | null }>
  free_attributes?: Array<{ name?: string; value?: string | null }>
  mandatory_attributes?: Array<{ attribute_name?: string; value?: string | null }>
}): AttrBag[] {
  const bags: AttrBag[] = []
  for (const a of sources.attributes ?? []) {
    const name = (a.label || a.name || a.attribute_name || '').trim()
    // garder "0" (valeur valide)
    if (!name || a.value == null || String(a.value).trim() === '') continue
    bags.push({ name, value: String(a.value).trim() })
  }
  for (const a of sources.free_attributes ?? []) {
    const name = (a.name || '').trim()
    if (!name || a.value == null || String(a.value).trim() === '') continue
    bags.push({ name, value: String(a.value).trim() })
  }
  for (const a of sources.mandatory_attributes ?? []) {
    const name = (a.attribute_name || '').trim()
    if (!name || a.value == null || String(a.value).trim() === '') continue
    bags.push({ name, value: String(a.value).trim() })
  }
  return bags
}

/** Normalise un nom d'attribut : espaces / retours ligne / ponctuation → alphanum. */
function normalizeAttrName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '')
}

function isManilleTypeAttrName(n: string): boolean {
  return n === 'manilletype' || (n.includes('manille') && n.includes('type'))
}

/**
 * Attribut produit « Manille Nombre » (parfois affiché sur 2 lignes).
 * Ex. Manille Nombre, Manille\nNombre, Nb de manille…
 */
function isManilleNombreAttrName(n: string): boolean {
  if (isManilleTypeAttrName(n)) return false
  return (
    n === 'manillenombre' ||
    n === 'nbmanille' ||
    n === 'nbdemanille' ||
    n === 'nbdemanilles' ||
    n === 'nombremanille' ||
    n === 'nombredemanille' ||
    n === 'nombredemanilles' ||
    (n.includes('manille') &&
      (n.includes('nombre') ||
        n.includes('nb') ||
        n.includes('qty') ||
        n.includes('quantite') ||
        n.includes('quantity')))
  )
}

/** Extrait « Manille Type » depuis attributs massif (mandatory/free/label-value). */
export function extractManilleType(sources: {
  attributes?: Array<{ label?: string; name?: string; attribute_name?: string; value?: string | null }>
  free_attributes?: Array<{ name?: string; value?: string | null }>
  mandatory_attributes?: Array<{ attribute_name?: string; value?: string | null }>
}): string | null {
  for (const { name, value } of collectAttrBags(sources)) {
    if (isManilleTypeAttrName(normalizeAttrName(name))) return value
  }
  return null
}

/**
 * Extrait « Manille Nombre » (nb de manilles nécessaires pour CE massif).
 * Retourne null si l'attribut est absent.
 */
export function extractManilleNombre(sources: {
  attributes?: Array<{ label?: string; name?: string; attribute_name?: string; value?: string | null }>
  free_attributes?: Array<{ name?: string; value?: string | null }>
  mandatory_attributes?: Array<{ attribute_name?: string; value?: string | null }>
}): number | null {
  for (const { name, value } of collectAttrBags(sources)) {
    if (!isManilleNombreAttrName(normalizeAttrName(name))) continue
    const parsed = Number(String(value).replace(',', '.').trim())
    if (!Number.isFinite(parsed)) return 0
    return Math.max(0, Math.floor(parsed))
  }
  return null
}

/**
 * Besoin manille d'un massif : type + qty issu de « Manille Nombre ».
 * Si type présent sans nombre → qty 1. Si nombre ≤ 0 → pas de besoin.
 */
export function resolveManilleNeed(sources: {
  attributes?: Array<{ label?: string; name?: string; attribute_name?: string; value?: string | null }>
  free_attributes?: Array<{ name?: string; value?: string | null }>
  mandatory_attributes?: Array<{ attribute_name?: string; value?: string | null }>
  manilleType?: string | null
  manilleNombre?: number | null
}): { type: string; qty: number } | null {
  const type =
    (sources.manilleType && String(sources.manilleType).trim()) ||
    extractManilleType(sources)
  if (!type) return null

  // Priorité : champ explicite, sinon attribut « Manille Nombre »
  let qty: number
  if (sources.manilleNombre != null && Number.isFinite(Number(sources.manilleNombre))) {
    qty = Math.max(0, Math.floor(Number(sources.manilleNombre)))
  } else {
    const raw = extractManilleNombre(sources)
    qty = raw == null ? 1 : raw
  }
  if (qty <= 0) return null
  return { type, qty }
}

/**
 * Qty mutualisée par type = max(Manille Nombre) parmi les massifs (pas de somme, pas × qty massif).
 * Clé = type normalisé.
 */
export function maxManilleQtyByType(
  lines: Array<{
    type?: string | null
    qty?: number | null
    attributes?: Array<{ label?: string; name?: string; attribute_name?: string; value?: string | null }>
    free_attributes?: Array<{ name?: string; value?: string | null }>
    mandatory_attributes?: Array<{ attribute_name?: string; value?: string | null }>
    manilleType?: string | null
    manilleNombre?: number | null
  }>,
): Map<string, { type: string; qty: number }> {
  const map = new Map<string, { type: string; qty: number }>()
  for (const line of lines) {
    const need =
      line.type && line.qty != null && Number(line.qty) > 0
        ? { type: String(line.type), qty: Math.floor(Number(line.qty)) }
        : resolveManilleNeed(line)
    if (!need || need.qty <= 0) continue
    const key = normalizeManilleType(need.type)
    if (!key) continue
    const prev = map.get(key)
    if (!prev || need.qty > prev.qty) {
      map.set(key, { type: need.type, qty: need.qty })
    }
  }
  return map
}
