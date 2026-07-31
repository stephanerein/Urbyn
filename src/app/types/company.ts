export interface CompanyOption {
  tva_intra_com: string
  company_name: string
}

export interface EntrepriseSearchHit {
  company_name: string
  siren: string
  siret: string | null
  tva_intra_com: string | null
  code_naf: string | null
  street: string | null
  zip_code: string | null
  city: string | null
  state: string | null
  country_code: string
}

export interface AddressDraft {
  id: string
  expanded: boolean
  typePreset: string
  typeCustom: string
  street: string
  city: string
  zip_code: string
  state: string
  country_code: string
}

export interface NewCompanyDraft {
  company_name: string
  tva_intra_com: string
  code_naf: string
  email: string
  phone_number: string
  website: string
  addresses: AddressDraft[]
}

export const ADDRESS_TYPE_PRESETS = ['Siège social', 'Entrepôt', 'Local'] as const

export function emptyAddress(id: string): AddressDraft {
  return {
    id,
    expanded: true,
    typePreset: 'Siège social',
    typeCustom: '',
    street: '',
    city: '',
    zip_code: '',
    state: '',
    country_code: 'FR',
  }
}

export function resolveAddressType(addr: AddressDraft): string {
  if (addr.typePreset === 'Autre') {
    return addr.typeCustom.trim()
  }
  return addr.typePreset
}
