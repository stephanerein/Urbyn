export type AccountSide = 'buyer' | 'partner'
export type AuthMode = 'login' | 'signup' | 'reset'

export interface SessionUser {
  user_id: number
  email: string
  role_id: number | null
  role_name: string | null
  account_type: AccountSide
  first_name: string | null
  last_name: string | null
  mobile_phone: string | null
  fixe_phone: string | null
  is_active: boolean
  email_verified: boolean
}

export type AuthStep = 'credentials' | 'verify' | 'profile' | 'company' | 'reset_password'

export interface CredentialsDraft {
  email: string
  password: string
}

export interface ProfileDraft {
  title: string
  first_name: string
  last_name: string
  mobile_phone: string
  language_id: number
}

export interface OnboardingProfilePayload {
  user_id: number
  email: string
  title: string
  first_name: string
  last_name: string
  mobile_phone?: string | null
  language_id?: number
}
