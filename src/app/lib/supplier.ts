import { useMemo } from 'react'
import type { SessionUser } from '../types/auth'
import type { PortalSessionPayload, WizardDraft } from '../types/supplierPortal'

const WIZARD_KEY = 'urbyn_supplier_wizard'

export function isSupplier(session: SessionUser | null): boolean {
  if (!session) return false
  return session.role_name === 'Fournisseur' || session.account_type === 'partner'
}

export function toPortalSession(user: SessionUser): PortalSessionPayload {
  return { user_id: user.user_id, email: user.email }
}

/** Référence stable pour les deps React (évite les boucles useEffect). */
export function usePortalSession(user: SessionUser): PortalSessionPayload {
  return useMemo(
    () => ({ user_id: user.user_id, email: user.email }),
    [user.user_id, user.email],
  )
}

export function loadWizardDraft(): WizardDraft {
  const raw = sessionStorage.getItem(WIZARD_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as WizardDraft
  } catch {
    return {}
  }
}

export function saveWizardDraft(draft: WizardDraft): void {
  sessionStorage.setItem(WIZARD_KEY, JSON.stringify(draft))
}

export function patchWizardDraft(patch: Partial<WizardDraft>): WizardDraft {
  const next = { ...loadWizardDraft(), ...patch }
  saveWizardDraft(next)
  return next
}
