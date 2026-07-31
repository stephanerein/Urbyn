import { apiFetch } from './client'
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
