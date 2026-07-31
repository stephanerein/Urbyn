import { apiFetch } from './client'
import type { PortalSessionPayload } from '../types/supplierPortal'

function qs(session: PortalSessionPayload) {
  return new URLSearchParams({
    user_id: String(session.user_id),
    email: session.email,
  }).toString()
}

export interface ShippingRateListEntry {
  id: number
  carrier_name: string | null
  zone_from: string | null
  zone_to: string | null
  is_active: boolean
}

export interface ShippingRateRecord {
  id: number
  carrier_name: string
  zone_from: string
  zone_to: string
  is_active: boolean
  weight_min_kg: number
  weight_max_kg: number
  volume_max_m3: number
  rate_per_kg: number
  base_rate: number
  currency: string
}

export interface PaymentMethodListEntry {
  id: number
  methode: string
  has_bank_info: boolean
}

export interface PaymentMethodRecord {
  id: number
  methode: string
  iban_number: string
  bic: string
  bank_name: string
  is_primary: boolean
}

export function fetchShippingRates(session: PortalSessionPayload) {
  return apiFetch<ShippingRateListEntry[]>(
    `/api/v1/supplier-portal/shipping-rates?${qs(session)}`,
  )
}

export function fetchShippingRate(session: PortalSessionPayload, rateId: number) {
  return apiFetch<ShippingRateRecord>(
    `/api/v1/supplier-portal/shipping-rates/${rateId}?${qs(session)}`,
  )
}

export function createShippingRateZone(
  session: PortalSessionPayload,
  body: {
    carrier_name: string
    zone_from: string
    zone_to: string
    is_active: boolean
  },
) {
  return apiFetch<ShippingRateRecord>('/api/v1/supplier-portal/shipping-rates', {
    method: 'POST',
    body: JSON.stringify({ session, ...body }),
  })
}

export function updateShippingRateZone(
  session: PortalSessionPayload,
  rateId: number,
  body: {
    carrier_name: string
    zone_from: string
    zone_to: string
    is_active: boolean
  },
) {
  return apiFetch<ShippingRateRecord>(
    `/api/v1/supplier-portal/shipping-rates/${rateId}/zones`,
    { method: 'PUT', body: JSON.stringify({ session, ...body }) },
  )
}

export function updateShippingRatePricing(
  session: PortalSessionPayload,
  rateId: number,
  body: {
    weight_min_kg: number
    weight_max_kg: number
    volume_max_m3: number
    rate_per_kg: number
    base_rate: number
    currency: string
  },
) {
  return apiFetch<ShippingRateRecord>(
    `/api/v1/supplier-portal/shipping-rates/${rateId}/pricing`,
    { method: 'PUT', body: JSON.stringify({ session, ...body }) },
  )
}

export function fetchPaymentMethods(session: PortalSessionPayload) {
  return apiFetch<PaymentMethodListEntry[]>(
    `/api/v1/supplier-portal/payment-methods?${qs(session)}`,
  )
}

export function fetchPaymentMethod(session: PortalSessionPayload, methodId: number) {
  return apiFetch<PaymentMethodRecord>(
    `/api/v1/supplier-portal/payment-methods/${methodId}?${qs(session)}`,
  )
}

export function createPaymentMethodStep1(
  session: PortalSessionPayload,
  methode: string,
) {
  return apiFetch<PaymentMethodRecord>('/api/v1/supplier-portal/payment-methods', {
    method: 'POST',
    body: JSON.stringify({ session, methode }),
  })
}

export function updatePaymentMethodStep1(
  session: PortalSessionPayload,
  methodId: number,
  methode: string,
) {
  return apiFetch<PaymentMethodRecord>(
    `/api/v1/supplier-portal/payment-methods/${methodId}/methode`,
    { method: 'PUT', body: JSON.stringify({ session, methode }) },
  )
}

export function updatePaymentMethodBank(
  session: PortalSessionPayload,
  methodId: number,
  body: {
    iban_number: string
    bic: string
    bank_name: string
    is_primary: boolean
  },
) {
  return apiFetch<PaymentMethodRecord>(
    `/api/v1/supplier-portal/payment-methods/${methodId}/bank`,
    { method: 'PUT', body: JSON.stringify({ session, ...body }) },
  )
}
