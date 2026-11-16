import { differenceInCalendarDays, format, parseISO, startOfToday } from 'date-fns'

// Période de location choisie par le client, par produit (totem, massif béton…).
// Conservée en sessionStorage pour suivre le client d'une étape à l'autre.

const STORAGE_KEY = 'locationPeriode'

/** Préférence de moment de la journée ; absente = pas de préférence. */
export type Creneau = 'matin' | 'apres-midi'

// Plages horaires proposées au client (à confirmer côté exploitation).
export const CRENEAUX: Record<Creneau, { libelle: string; plage: string }> = {
  matin: { libelle: 'Matin', plage: '8h – 12h' },
  'apres-midi': { libelle: 'Après-midi', plage: '14h – 18h' },
}

/** Délai minimal, en jours, entre la demande et le début de la période. */
export const DELAI_MINIMAL_JOURS = 28

export interface PeriodeLocation {
  /** Date de livraison souhaitée. */
  debut?: Date
  /** Date d'enlèvement souhaitée. */
  fin?: Date
  creneauLivraison?: Creneau
  creneauEnlevement?: Creneau
}

type PeriodesStockees = Record<
  string,
  { debut?: string; fin?: string; creneauLivraison?: Creneau; creneauEnlevement?: Creneau }
>

const creneauValide = (valeur: unknown): Creneau | undefined =>
  valeur === 'matin' || valeur === 'apres-midi' ? valeur : undefined

function lireToutes(): PeriodesStockees {
  if (typeof window === 'undefined') return {}
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? '{}')
    return parsed && typeof parsed === 'object' ? (parsed as PeriodesStockees) : {}
  } catch {
    return {}
  }
}

export function lirePeriodeLocation(produit: string): PeriodeLocation {
  const stockee = lireToutes()[produit]
  if (!stockee) return {}
  const date = (iso?: string) => {
    if (!iso) return undefined
    const parsed = parseISO(iso)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }
  return {
    debut: date(stockee.debut),
    fin: date(stockee.fin),
    creneauLivraison: creneauValide(stockee.creneauLivraison),
    creneauEnlevement: creneauValide(stockee.creneauEnlevement),
  }
}

export function ecrirePeriodeLocation(produit: string, periode: PeriodeLocation) {
  try {
    const toutes = lireToutes()
    // Date locale, sans heure : c'est un jour de calendrier, pas un instant.
    const iso = (d?: Date) => (d ? format(d, 'yyyy-MM-dd') : undefined)
    toutes[produit] = {
      debut: iso(periode.debut),
      fin: iso(periode.fin),
      creneauLivraison: periode.creneauLivraison,
      creneauEnlevement: periode.creneauEnlevement,
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toutes))
  } catch {
    /* stockage indisponible : la période reste valable pour la page courante */
  }
}

export function periodeComplete(periode: PeriodeLocation): boolean {
  return Boolean(periode.debut && periode.fin)
}

/** Durée de la location en jours, premier et dernier jour compris. */
export function dureeEnJours(periode: PeriodeLocation): number | null {
  if (!periode.debut || !periode.fin) return null
  return differenceInCalendarDays(periode.fin, periode.debut) + 1
}

/** Le début est trop proche de la demande : le client doit nous contacter. */
export function delaiTropCourt(periode: PeriodeLocation): boolean {
  if (!periode.debut) return false
  return differenceInCalendarDays(periode.debut, startOfToday()) < DELAI_MINIMAL_JOURS
}
