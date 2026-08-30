import { getApiBase } from './apiBase'
import { apiFetch, ApiError } from './client'
import { loadAdminToken } from '../lib/adminSession'

export interface AdminAttributeDefinition {
  id: number
  attribute_name: string
  default_value?: string
}

export interface AdminCatalogAttributeIn {
  attribute_name: string
  default_value: string
}

export interface AdminCatalogNode {
  id: number
  name: string | null
  description: string | null
  is_active: boolean
  parent_id: number | null
  child_count: number
  product_count: number
  children: AdminCatalogNode[]
}

export interface AdminCatalogDetail {
  id: number
  name: string | null
  description: string | null
  is_active: boolean
  parent_id: number | null
  child_count: number
  product_count: number
  breadcrumb: string[]
  attribute_definitions: AdminAttributeDefinition[]
}

export interface AdminCatalogTreeResponse {
  roots: AdminCatalogNode[]
  total: number
}

export interface AdminCatalogProductEntry {
  product_id: number
  admin_sku: string
  product_name: string
  company_name: string
  price: number
  currency: string
  is_active: boolean
}

export interface AdminProductAttribute {
  name: string
  value: string | null
  catalog_id?: number | null
  catalog_name?: string | null
  definition_id?: number | null
}

export interface AdminProductDetail {
  id: number
  admin_sku: string
  client_sku: string
  product_name: string
  company_name: string
  company_tva: string
  price: number
  currency: string
  is_active: boolean
  catalog_names: string[]
  mandatory_attributes: AdminProductAttribute[]
  free_attributes: AdminProductAttribute[]
}

function adminHeaders(): Record<string, string> {
  const token = loadAdminToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    headers: {
      ...adminHeaders(),
      ...options.headers,
    },
  })
}

export function adminLogin(login: string, password: string) {
  return adminFetch<{ token: string; expires_at: number }>('/api/v1/admin/login', {
    method: 'POST',
    body: JSON.stringify({ login, password }),
  })
}

export function fetchAdminCatalogTree() {
  return adminFetch<AdminCatalogTreeResponse>('/api/v1/admin/catalogs/tree')
}

export function fetchAdminCatalog(id: number) {
  return adminFetch<AdminCatalogDetail>(`/api/v1/admin/catalogs/${id}`)
}

export function createAdminCatalog(body: {
  name: string
  description: string
  is_active: boolean
  parent_id?: number | null
  attributes?: AdminCatalogAttributeIn[]
  attribute_names?: string[]
}) {
  return adminFetch<AdminCatalogDetail>('/api/v1/admin/catalogs', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function fetchAdminCatalogProducts(catalogId: number) {
  return adminFetch<AdminCatalogProductEntry[]>(`/api/v1/admin/catalogs/${catalogId}/products`)
}

export function fetchAdminProduct(productId: number) {
  return adminFetch<AdminProductDetail>(`/api/v1/admin/products/${productId}`)
}

export function updateAdminCatalog(
  id: number,
  body: {
    name: string
    description: string
    is_active: boolean
    attributes?: AdminCatalogAttributeIn[]
    attribute_names?: string[]
  },
) {
  return adminFetch<AdminCatalogDetail>(`/api/v1/admin/catalogs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export type CatalogCsvImportMode = 'additive' | 'destructive'

export interface CatalogCsvImportResult {
  mode: CatalogCsvImportMode
  products_created: number
  products_updated: number
  catalogs_created: number
  catalogs_cleared: number
  links_created: number
  rows_processed: number
  errors: { line: number; message: string }[]
}

export interface CatalogProductAttribute {
  attribute_name: string
  product_count: number
  is_mandatory: boolean
  definition_id: number | null
}

export function fetchAdminCatalogProductAttributes(catalogId: number) {
  return adminFetch<CatalogProductAttribute[]>(
    `/api/v1/admin/catalogs/${catalogId}/product-attributes`,
  )
}

export function setAdminCatalogAttributeMandatory(
  catalogId: number,
  attributeName: string,
  isMandatory: boolean,
) {
  return adminFetch<CatalogProductAttribute>(
    `/api/v1/admin/catalogs/${catalogId}/product-attributes/${encodeURIComponent(attributeName)}/mandatory`,
    {
      method: 'PUT',
      body: JSON.stringify({ is_mandatory: isMandatory }),
    },
  )
}

export async function importAdminCatalogCsv(params: {
  file: File
  mode: CatalogCsvImportMode
  companyTva: string
}): Promise<CatalogCsvImportResult> {
  const token = loadAdminToken()
  const form = new FormData()
  form.append('file', params.file)
  form.append('mode', params.mode)
  form.append('company_tva_intra_com', params.companyTva)

  const response = await fetch(`${getApiBase()}/api/v1/admin/catalogs/import-csv`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })

  if (!response.ok) {
    let message = response.statusText
    let code: string | undefined
    try {
      const body = await response.json()
      if (body.detail?.message) {
        message = body.detail.message
        code = body.detail.code
      } else if (typeof body.detail === 'string') {
        message = body.detail
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(message, response.status, code)
  }

  return response.json() as Promise<CatalogCsvImportResult>
}
