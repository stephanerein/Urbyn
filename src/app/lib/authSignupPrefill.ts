/**
 * Cache des infos saisies au chiffrage → préremplissage signup / onboarding.
 * Conservé en sessionStorage jusqu'à fin d'inscription ou envoi de la demande.
 */

import { emptyAddress, type AddressDraft } from '../types/company'

export const AUTH_SIGNUP_PREFILL_KEY = 'authSignupPrefill'

export type CheckoutDeliveryAddress = {
  company?: string
  street?: string
  street2?: string
  postalCode?: string
  city?: string
  country?: string
  specialInstructions?: string
}

export type AuthSignupPrefill = {
  email?: string
  first_name?: string
  last_name?: string
  mobile_phone?: string
  company_name?: string
  deliveryAddress?: CheckoutDeliveryAddress | null
}

const COUNTRY_TO_CODE: Record<string, string> = {
  France: 'FR',
  FR: 'FR',
  Belgique: 'BE',
  BE: 'BE',
  Luxembourg: 'LU',
  LU: 'LU',
  Allemagne: 'DE',
  DE: 'DE',
  Suisse: 'CH',
  CH: 'CH',
  Italie: 'IT',
  IT: 'IT',
  Monaco: 'MC',
  MC: 'MC',
  Andorre: 'AD',
  AD: 'AD',
  Espagne: 'ES',
  ES: 'ES',
}

export function countryToCode(country: string | null | undefined): string {
  if (!country) return 'FR'
  const key = country.trim()
  return COUNTRY_TO_CODE[key] || COUNTRY_TO_CODE[key.toUpperCase()] || 'FR'
}

export function readAuthSignupPrefill(): AuthSignupPrefill | null {
  try {
    const raw = sessionStorage.getItem(AUTH_SIGNUP_PREFILL_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthSignupPrefill
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

export function writeAuthSignupPrefill(data: AuthSignupPrefill): void {
  sessionStorage.setItem(AUTH_SIGNUP_PREFILL_KEY, JSON.stringify(data))
}

export function clearAuthSignupPrefill(): void {
  sessionStorage.removeItem(AUTH_SIGNUP_PREFILL_KEY)
}

function nonEmpty(...vals: Array<string | null | undefined>): string {
  for (const v of vals) {
    if (v != null && String(v).trim() !== '') return String(v).trim()
  }
  return ''
}

/** Fusionne profil onboarding : sibling > cache chiffrage > user session. */
export function mergeProfileFromPrefill(opts: {
  sibling?: {
    title?: string | null
    first_name?: string | null
    last_name?: string | null
    mobile_phone?: string | null
    language_id?: number | null
  } | null
  checkout?: AuthSignupPrefill | null
  user?: {
    first_name?: string | null
    last_name?: string | null
    mobile_phone?: string | null
  } | null
}): {
  title: string
  first_name: string
  last_name: string
  mobile_phone: string
  language_id: number
} {
  const s = opts.sibling
  const c = opts.checkout
  const u = opts.user
  return {
    title: nonEmpty(s?.title) || '',
    first_name: nonEmpty(s?.first_name, c?.first_name, u?.first_name),
    last_name: nonEmpty(s?.last_name, c?.last_name, u?.last_name),
    mobile_phone: nonEmpty(s?.mobile_phone, c?.mobile_phone, u?.mobile_phone),
    language_id: s?.language_id ?? 1,
  }
}

export function deliveryAddressToDrafts(
  addr: CheckoutDeliveryAddress | null | undefined,
): AddressDraft[] {
  if (!addr) return [emptyAddress('addr-1')]
  const street = nonEmpty(addr.street, addr.street2)
  const city = nonEmpty(addr.city)
  const zip = nonEmpty(addr.postalCode)
  if (!street && !city && !zip) return [emptyAddress('addr-1')]

  const draft = emptyAddress('addr-checkout-1')
  draft.typePreset = 'Siège social'
  draft.street = street
  draft.city = city
  draft.zip_code = zip
  draft.country_code = countryToCode(addr.country)
  draft.expanded = true
  return [draft]
}

export function checkoutToNewCompanySeed(checkout: AuthSignupPrefill | null): {
  company_name: string
  email: string
  phone_number: string
  addresses: AddressDraft[]
} | null {
  if (!checkout) return null
  const company_name = nonEmpty(checkout.company_name, checkout.deliveryAddress?.company)
  const email = nonEmpty(checkout.email)
  const phone_number = nonEmpty(checkout.mobile_phone)
  const addresses = deliveryAddressToDrafts(checkout.deliveryAddress)
  const hasAddress = addresses.some((a) => a.street || a.city || a.zip_code)
  if (!company_name && !email && !phone_number && !hasAddress) return null
  return { company_name, email, phone_number, addresses }
}
