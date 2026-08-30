import type { CatalogRecord } from '../types/supplierPortal'

/** Fil d'Ariane lisible, ex. « Lestage — 1000 kg » */
export function catalogPathLabel(c: CatalogRecord, separator = ' — '): string {
  if (c.breadcrumb?.length) return c.breadcrumb.join(separator)
  return c.name ?? `Catalogue #${c.id}`
}
