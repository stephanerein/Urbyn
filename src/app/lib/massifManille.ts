/** Helpers Manille — mutualisation par attribut « Manille Type ». */

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

/** Extrait « Manille Type » depuis attributs massif (mandatory/free/label-value). */
export function extractManilleType(sources: {
  attributes?: Array<{ label?: string; name?: string; attribute_name?: string; value?: string | null }>
  free_attributes?: Array<{ name?: string; value?: string | null }>
  mandatory_attributes?: Array<{ attribute_name?: string; value?: string | null }>
}): string | null {
  const bags: Array<{ name: string; value: string }> = []
  for (const a of sources.attributes ?? []) {
    const name = (a.label || a.name || a.attribute_name || '').trim()
    const value = (a.value || '').trim()
    if (name && value) bags.push({ name, value })
  }
  for (const a of sources.free_attributes ?? []) {
    const name = (a.name || '').trim()
    const value = (a.value || '').trim()
    if (name && value) bags.push({ name, value })
  }
  for (const a of sources.mandatory_attributes ?? []) {
    const name = (a.attribute_name || '').trim()
    const value = (a.value || '').trim()
    if (name && value) bags.push({ name, value })
  }
  for (const { name, value } of bags) {
    const n = name.toLowerCase().replace(/\s+/g, '')
    if (n === 'manilletype' || (n.includes('manille') && n.includes('type'))) {
      return value
    }
  }
  return null
}
