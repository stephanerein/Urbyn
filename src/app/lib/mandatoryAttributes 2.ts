interface MandatoryFieldLike {
  id: number
  catalog_id?: number
  attribute_name: string
}

/** Clé de rapprochement : minuscules, sans accents, espaces, tirets, quotes. */
export function normalizeAttributeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[''`´"«»]/g, '')
    .replace(/[\s\-–—_/\\.]+/g, '')
    .replace(/[^a-z0-9]/g, '')
}

/** Préremplit les attributs d'un nouveau catalogue si le nom normalisé existe déjà. */
export function mergeMandatoryPrefill(
  fields: MandatoryFieldLike[],
  current: Record<number, string>,
): Record<number, string> {
  const byNorm = new Map<string, string>()
  for (const field of fields) {
    const val = current[field.id]
    if (val?.trim()) {
      byNorm.set(normalizeAttributeName(field.attribute_name), val.trim())
    }
  }
  const next = { ...current }
  for (const field of fields) {
    if (next[field.id]?.trim()) continue
    const match = byNorm.get(normalizeAttributeName(field.attribute_name))
    if (match) next[field.id] = match
  }
  return next
}

/** Copie les valeurs du catalogue principal vers les attributs équivalents (cachés). */
export function syncMatchedFromPrimary(
  fields: MandatoryFieldLike[],
  primaryCatalogId: number,
  values: Record<number, string>,
): Record<number, string> {
  const primaryFields = fields.filter((f) => f.catalog_id === primaryCatalogId)
  const primaryByNorm = new Map<string, string>()
  for (const f of primaryFields) {
    const val = values[f.id]?.trim()
    if (val) primaryByNorm.set(normalizeAttributeName(f.attribute_name), val)
  }
  const next = { ...values }
  for (const f of fields) {
    if (f.catalog_id === primaryCatalogId) continue
    const norm = normalizeAttributeName(f.attribute_name)
    const matched = primaryByNorm.get(norm)
    if (matched) next[f.id] = matched
  }
  return next
}

export function splitMandatoryFields(
  fields: MandatoryFieldLike[],
  primaryCatalogId: number,
): { primary: MandatoryFieldLike[]; extraUnmatched: MandatoryFieldLike[] } {
  const primary = fields.filter((f) => f.catalog_id === primaryCatalogId)
  const primaryNorms = new Set(primary.map((f) => normalizeAttributeName(f.attribute_name)))
  const extraUnmatched = fields.filter(
    (f) =>
      f.catalog_id !== primaryCatalogId &&
      !primaryNorms.has(normalizeAttributeName(f.attribute_name)),
  )
  return { primary, extraUnmatched }
}

/** Retire les valeurs dont la définition n'est plus dans la liste active. */
export function pruneMandatoryValues(
  fields: MandatoryFieldLike[],
  current: Record<number, string>,
): Record<number, string> {
  const validIds = new Set(fields.map((f) => f.id))
  const next: Record<number, string> = {}
  for (const [idStr, val] of Object.entries(current)) {
    const id = Number(idStr)
    if (validIds.has(id) && val.trim()) next[id] = val
  }
  return next
}

/** Valide que tous les champs obligatoires (y compris auto-remplis) sont renseignés. */
export function findMissingMandatory(
  fields: MandatoryFieldLike[],
  values: Record<number, string>,
): MandatoryFieldLike[] {
  return fields.filter((f) => !values[f.id]?.trim())
}
