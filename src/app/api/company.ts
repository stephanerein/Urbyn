import { apiFetch } from './client'
import type { CompanyOption, EntrepriseSearchHit, NewCompanyDraft } from '../types/company'
import { resolveAddressType } from '../types/company'

export function fetchCompanyOptions(): Promise<CompanyOption[]> {
  return apiFetch<CompanyOption[]>('/api/v1/auth/onboarding/companies')
}

export function searchFrenchCompanies(query: string): Promise<EntrepriseSearchHit[]> {
  const params = new URLSearchParams({ q: query })
  return apiFetch(`/api/v1/auth/onboarding/company-search?${params}`)
}

export function completeOnboardingCompany(payload: {
  user_id: number
  email: string
  existing_company?: { company_id: string; tva_verification: string }
  new_company?: {
    company_name: string
    tva_intra_com: string
    code_naf: string
    addresses: Array<{
      type: string
      street: string
      city: string
      zip_code: string
      state?: string | null
      country_code: string
      siret?: string | null
      is_primary?: boolean
    }>
    email?: string | null
    phone_number?: string | null
    website?: string | null
  }
}): Promise<{
  user_id: number
  company_id: string
  company_name: string
  company_created: boolean
  message: string
}> {
  return apiFetch('/api/v1/auth/onboarding/company', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function buildNewCompanyPayload(draft: NewCompanyDraft) {
  return {
    company_name: draft.company_name.trim(),
    tva_intra_com: draft.tva_intra_com.trim(),
    code_naf: draft.code_naf.trim(),
    email: draft.email.trim() || null,
    phone_number: draft.phone_number.trim() || null,
    website: draft.website.trim() || null,
    addresses: draft.addresses
      .filter((a) => a.expanded)
      .map((a, idx) => ({
        type: resolveAddressType(a),
        street: a.street.trim(),
        city: a.city.trim(),
        zip_code: a.zip_code.trim(),
        state: a.state.trim() || null,
        country_code: a.country_code.trim() || 'FR',
        is_primary: idx === 0,
      })),
  }
}
