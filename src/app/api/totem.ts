import { apiFetch } from './client'

export type TotemOffer = 'Acquisition' | 'Location'

export interface TotemFamily {
  family_catalog_id: number
  leaf_catalog_id: number
  name: string
  display_name: string
  description: string | null
  min_price: number
  currency: string
  product_count: number
  breadcrumb: string[]
}

export interface TotemFamiliesResponse {
  root_id: number
  root_name: string
  offer: string
  count: number
  families: TotemFamily[]
}

export interface TotemProductDimensions {
  longueur: number | null
  largeur: number | null
  hauteur: number | null
  profondeur: number | null
  volume: number | null
}

export interface TotemProduct {
  product_id: number
  product_name: string
  client_sku: string | null
  price: number
  currency: string
  dimensions_label: string | null
  dimensions: TotemProductDimensions
  poids: number | null
  attributes: Record<string, string>
}

export interface TotemProductsResponse {
  family_catalog_id: number
  leaf_catalog_id: number
  family_name: string
  offer: string
  count: number
  products: TotemProduct[]
}

export interface TotemProductDetail {
  product_id: number
  product_name: string
  client_sku: string | null
  price: number
  currency: string
  description: string | null
  dimensions_label: string | null
  dimensions: TotemProductDimensions
  poids: number | null
  footprint: string | null
  panel_format: string | null
  attributes: Record<string, string>
  detail_bullets: string[]
  fiche_document_key: string | null
  fiche_available: boolean
}

export function fetchTotemFamilies(offer: TotemOffer = 'Acquisition'): Promise<TotemFamiliesResponse> {
  const params = new URLSearchParams({ offer, root_name: 'Totem' })
  return apiFetch(`/api/v1/client-portal/totem/families?${params}`)
}

export function fetchTotemFamilyProducts(
  familyCatalogId: number,
  offer: TotemOffer = 'Acquisition',
): Promise<TotemProductsResponse> {
  const params = new URLSearchParams({ offer })
  return apiFetch(
    `/api/v1/client-portal/totem/families/${familyCatalogId}/products?${params}`,
  )
}

export function fetchTotemProductDetail(productId: number): Promise<TotemProductDetail> {
  return apiFetch(`/api/v1/client-portal/totem/products/${productId}`)
}

export function formatPriceEur(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(Math.round(value))
}
