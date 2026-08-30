import { apiFetch } from './client'

export const MASSIF_ROOT_NAME = 'Massif Type'

export interface MassifLeafCatalog {
  id: number
  name: string | null
  description: string | null
  parent_id: number | null
  breadcrumb: string[]
}

export interface MassifLeafCatalogsResponse {
  root_id: number
  root_name: string
  count: number
  catalogs: MassifLeafCatalog[]
}

export interface MassifWeightBandAvailability {
  poids_min: number
  poids_max: number
  product_count: number
  available: boolean
}

export interface MassifWeightBandsResponse {
  root_id: number
  root_name: string
  bands: MassifWeightBandAvailability[]
}

export interface MassifProductDimensions {
  longueur: number | null
  largeur: number | null
  hauteur: number | null
  volume: number | null
}

export interface MassifAttribute {
  id?: number
  definition_id?: number
  catalog_id?: number
  attribute_name?: string
  name?: string
  value: string | null
}

export interface MassifProduct {
  product_id: number
  product_name: string
  admin_sku: string
  poids: number
  dimensions: MassifProductDimensions
  price: number
  currency: string
  company_name: string | null
  catalog_id: number
  catalog_name: string | null
  mandatory_attributes: Array<{
    definition_id: number
    catalog_id: number
    attribute_name: string
    value: string | null
  }>
  free_attributes: Array<{
    id: number
    name: string
    value: string | null
  }>
}

export interface MassifProductsResponse {
  catalog_id: number
  catalog_name: string | null
  poids_min: number
  poids_max: number
  count: number
  products: MassifProduct[]
}

export function fetchMassifLeafCatalogs(options?: {
  rootName?: string
  poids_min?: number
  poids_max?: number
}): Promise<MassifLeafCatalogsResponse> {
  const rootName = options?.rootName ?? MASSIF_ROOT_NAME
  const params = new URLSearchParams({ root_name: rootName })
  if (options?.poids_min != null) params.set('poids_min', String(options.poids_min))
  if (options?.poids_max != null) params.set('poids_max', String(options.poids_max))
  return apiFetch(`/api/v1/client-portal/massif/leaf-catalogs?${params}`)
}

export function fetchMassifWeightBands(
  rootName: string = MASSIF_ROOT_NAME,
): Promise<MassifWeightBandsResponse> {
  const params = new URLSearchParams({ root_name: rootName })
  return apiFetch(`/api/v1/client-portal/massif/weight-bands?${params}`)
}

export function fetchMassifProducts(payload: {
  catalog_id: number
  poids?: number
  poids_min?: number
  poids_max?: number
  rootName?: string
}): Promise<MassifProductsResponse> {
  const rootName = payload.rootName ?? MASSIF_ROOT_NAME
  const params = new URLSearchParams({ root_name: rootName })
  const body: Record<string, number> = { catalog_id: payload.catalog_id }
  if (payload.poids != null) {
    body.poids = payload.poids
  } else {
    if (payload.poids_min != null) body.poids_min = payload.poids_min
    if (payload.poids_max != null) body.poids_max = payload.poids_max
  }
  return apiFetch(`/api/v1/client-portal/massif/products?${params}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
