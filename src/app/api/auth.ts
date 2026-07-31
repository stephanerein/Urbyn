import { apiFetch } from './client'
import type {
  AccountSide,
  CredentialsDraft,
  OnboardingProfilePayload,
  SessionUser,
} from '../types/auth'

export function checkEmail(
  email: string,
  accountType: AccountSide,
): Promise<{
  exists: boolean
  available: boolean
  email_verified: boolean | null
}> {
  const params = new URLSearchParams({ email, account_type: accountType })
  return apiFetch(`/api/v1/auth/check-email?${params}`)
}

export function login(
  credentials: CredentialsDraft,
  accountType: AccountSide,
): Promise<SessionUser> {
  return apiFetch<SessionUser>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
      account_type: accountType,
    }),
  })
}

export function signupStart(
  credentials: CredentialsDraft,
  accountType: AccountSide,
): Promise<{
  user_id: number
  email: string
  expires_in_seconds: number
  message: string
}> {
  return apiFetch('/api/v1/auth/signup/start', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
      account_type: accountType,
    }),
  })
}

export function signupVerify(
  email: string,
  code: string,
  accountType: AccountSide,
): Promise<SessionUser> {
  return apiFetch<SessionUser>('/api/v1/auth/signup/verify', {
    method: 'POST',
    body: JSON.stringify({ email, code, account_type: accountType }),
  })
}

export function completeOnboardingProfile(
  payload: OnboardingProfilePayload,
): Promise<SessionUser> {
  return apiFetch<SessionUser>('/api/v1/auth/onboarding/profile', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      mobile_phone: payload.mobile_phone?.trim() || null,
      language_id: payload.language_id ?? 1,
    }),
  })
}

export function signupResendCode(
  credentials: CredentialsDraft,
  accountType: AccountSide,
): Promise<{ expires_in_seconds: number; message: string }> {
  return apiFetch('/api/v1/auth/signup/resend-code', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
      account_type: accountType,
    }),
  })
}

export interface SiblingOnboardingPrefill {
  has_sibling: boolean
  profile?: {
    title: string | null
    first_name: string | null
    last_name: string | null
    mobile_phone: string | null
    language_id: number | null
  } | null
  company?: {
    affiliation_mode: string | null
    tva_intra_com: string | null
    company_name: string | null
    code_naf: string | null
    email: string | null
    phone_number: string | null
    website: string | null
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
  } | null
}

export function fetchSiblingOnboardingPrefill(
  userId: number,
  email: string,
): Promise<SiblingOnboardingPrefill> {
  const params = new URLSearchParams({
    user_id: String(userId),
    email,
  })
  return apiFetch(`/api/v1/auth/onboarding/sibling-prefill?${params}`)
}

const SESSION_KEY = 'urbyn_session'

export function saveSession(user: SessionUser): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function loadSession(): SessionUser | null {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    const user = JSON.parse(raw) as SessionUser
    if (user.role_name === 'Fournisseur' && user.account_type !== 'partner') {
      return { ...user, account_type: 'partner' }
    }
    if (user.role_name === 'Client' && user.account_type !== 'buyer') {
      return { ...user, account_type: 'buyer' }
    }
    return user
  } catch {
    return null
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function passwordResetStart(payload: {
  email: string
  first_name: string
  last_name: string
  account_type: AccountSide
}): Promise<{ email: string; expires_in_seconds: number; message: string }> {
  return apiFetch('/api/v1/auth/password-reset/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function passwordResetResend(payload: {
  email: string
  first_name: string
  last_name: string
  account_type: AccountSide
}): Promise<{ email: string; expires_in_seconds: number; message: string }> {
  return apiFetch('/api/v1/auth/password-reset/resend-code', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function passwordResetConfirm(payload: {
  email: string
  code: string
  account_type: AccountSide
  new_password: string
}): Promise<{ message: string }> {
  return apiFetch('/api/v1/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
