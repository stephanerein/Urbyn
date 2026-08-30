import { apiFetch } from './client'
import type { SessionUser } from '../types/auth'

export interface CartSnapshot {
  cart_id: number
  items: Record<string, unknown>[]
  updated_at: string | null
}

export function fetchCartSnapshot(user: SessionUser) {
  const params = new URLSearchParams({
    user_id: String(user.user_id),
    email: user.email,
  })
  return apiFetch<CartSnapshot>(`/api/v1/client-portal/cart/snapshot?${params}`)
}

export function saveCartSnapshot(user: SessionUser, items: unknown[]) {
  return apiFetch<CartSnapshot>('/api/v1/client-portal/cart/snapshot', {
    method: 'PUT',
    body: JSON.stringify({
      user_id: user.user_id,
      email: user.email,
      items,
    }),
  })
}
