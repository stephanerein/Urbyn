import { getApiBase } from './apiBase'
import { ApiError, apiFetch } from './client'

// Chiffrage « solution d'ombrage pour patio ». Le calcul est fait côté serveur :
// le site ne reçoit que des prix de vente, jamais les coûts ni les marges.

export interface PatioDimensions {
  nom: string
  largeur_1_mm: number
  largeur_2_mm: number
  longueur_1_mm: number
  longueur_2_mm: number
}

/** Point du plan du patio, en mètres : [x, y]. */
export type PointPlan = [number, number]

export interface PatioQuoteLine {
  nom: string
  surface_m2: number
  /** Profondeur du patio, perpendiculairement à son grand côté. */
  profondeur_mm: number
  grand_cote_mm: number
  /** Forme du patio, sommets dans l'ordre A∩C, A∩D, B∩D, B∩C. */
  forme: PointPlan[]
  retractable: {
    nb_velums: number
    largeur_velum_mm: number
    espacement_mm: number
    /** Vélums tels qu'ils sont chiffrés : chacun à sa propre longueur. */
    velums: Array<{ longueur_mm: number; polygone: PointPlan[] }>
    hors_tolerance: boolean
    acquisition: {
      prix_net: number
      verification_annuelle: number
      cout_complet_duree: number
    }
    mise_a_disposition: {
      loyer_mensuel: number
      duree_mois: number
      total_loyers: number
    }
  }
  fixe: {
    nb_velums: number
    largeur_velum_mm: number
    velums: PointPlan[][]
    acquisition: {
      prix_net: number
      saisonnier_premiere_annee: number
      saisonnier_annees_suivantes: number
      saisonnier_duree: number
      cout_complet_duree: number
    }
  }
}

/** Choix du client, transmis tels quels au chiffrage et à la demande. */
export interface PatioOptions {
  verificationAnnuelle: boolean
  interventionSaisonniere: boolean
}

export interface PatioQuote {
  devise: string
  montants: string
  duree_mois: number
  mise_en_place: { incluse: boolean; forfait: number; prestations: string[] }
  options: { verification_annuelle: boolean; intervention_saisonniere: boolean }
  patios: PatioQuoteLine[]
  totaux: {
    surface_m2: number
    retractable_acquisition: number
    retractable_loyer_mensuel: number
    fixe_acquisition: number
    retractable_verification_annuelle: number
    fixe_saisonnier_annees_suivantes: number
    fixe_saisonnier_premiere_annee: number
  }
}

export interface PatioContact {
  prenom: string
  nom: string
  email: string
  telephone: string
  societe: string
  message: string
}

function optionsPourApi(options: PatioOptions) {
  return {
    verification_annuelle: options.verificationAnnuelle,
    intervention_saisonniere: options.interventionSaisonniere,
  }
}

export function fetchPatioQuote(
  patios: PatioDimensions[],
  options: PatioOptions,
): Promise<PatioQuote> {
  return apiFetch('/api/v1/ombrage/patios/quote', {
    method: 'POST',
    body: JSON.stringify({ patios, ...optionsPourApi(options) }),
  })
}

/** Envoie la demande et les photos de patio (une au plus par patio). */
export async function submitPatioDemande(input: {
  patios: PatioDimensions[]
  options: PatioOptions
  contact: PatioContact
  photos: Array<{ patioIndex: number; blob: Blob }>
}): Promise<{ id: number; photos: number }> {
  const form = new FormData()
  form.append(
    'payload',
    JSON.stringify({
      patios: input.patios,
      ...optionsPourApi(input.options),
      contact: input.contact,
    }),
  )
  for (const photo of input.photos) {
    form.append('photos', photo.blob, `patio-${photo.patioIndex + 1}.jpg`)
    form.append('photo_patios', String(photo.patioIndex))
  }

  // Pas de Content-Type explicite : le navigateur pose lui-même la frontière
  // multipart, ce que apiFetch (JSON) empêcherait.
  const response = await fetch(`${getApiBase()}/api/v1/ombrage/patios/demandes`, {
    method: 'POST',
    body: form,
  })
  if (!response.ok) {
    let message = "L'envoi de la demande a échoué."
    let code: string | undefined
    try {
      const body = await response.json()
      if (body.detail?.message) message = body.detail.message
      code = body.detail?.code
    } catch {
      /* réponse non JSON */
    }
    throw new ApiError(message, response.status, code)
  }
  return response.json()
}
