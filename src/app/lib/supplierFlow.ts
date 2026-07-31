export type SupplierFlowMode = 'create' | 'edit'

export interface ShippingFlowDraft {
  mode: SupplierFlowMode
  rateId?: number
}

export interface PaymentFlowDraft {
  mode: SupplierFlowMode
  methodId?: number
}

const SHIPPING_KEY = 'urbyn_shipping_flow'
const PAYMENT_KEY = 'urbyn_payment_flow'

export function loadShippingFlow(): ShippingFlowDraft | null {
  const raw = sessionStorage.getItem(SHIPPING_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ShippingFlowDraft
  } catch {
    return null
  }
}

export function saveShippingFlow(draft: ShippingFlowDraft): void {
  sessionStorage.setItem(SHIPPING_KEY, JSON.stringify(draft))
}

export function clearShippingFlow(): void {
  sessionStorage.removeItem(SHIPPING_KEY)
}

export function loadPaymentFlow(): PaymentFlowDraft | null {
  const raw = sessionStorage.getItem(PAYMENT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PaymentFlowDraft
  } catch {
    return null
  }
}

export function savePaymentFlow(draft: PaymentFlowDraft): void {
  sessionStorage.setItem(PAYMENT_KEY, JSON.stringify(draft))
}

export function clearPaymentFlow(): void {
  sessionStorage.removeItem(PAYMENT_KEY)
}
