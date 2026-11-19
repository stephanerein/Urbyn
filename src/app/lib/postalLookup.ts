import { useEffect, useState } from 'react'
import { safeFetch } from './safe-fetch'

// Recherche de la ville d'après le code postal, partagée par les adresses de
// livraison (totems, massifs béton) et par l'adresse du chantier patio : elle
// facilite la saisie.

export interface CitySuggestion {
  nom: string
  code: string
  codesPostaux: string[]
  coordinates?: { lat: number; lng: number }
}

/** Pays proposés, dans l'ordre du menu déroulant. */
export const PAYS = [
  'France',
  'Belgique',
  'Luxembourg',
  'Allemagne',
  'Suisse',
  'Italie',
  'Monaco',
  'Andorre',
  'Espagne',
] as const

// Configuration des formats de code postal par pays
export const POSTAL_CODE_FORMATS: Record<string, { pattern: RegExp; length: number; placeholder: string }> = {
  France: { pattern: /^\d{5}$/, length: 5, placeholder: '75001' },
  Belgique: { pattern: /^\d{4}$/, length: 4, placeholder: '1000' },
  Luxembourg: { pattern: /^\d{4}$/, length: 4, placeholder: '1234' },
  Allemagne: { pattern: /^\d{5}$/, length: 5, placeholder: '10115' },
  Suisse: { pattern: /^\d{4}$/, length: 4, placeholder: '1200' },
  Italie: { pattern: /^\d{5}$/, length: 5, placeholder: '00118' },
  Monaco: { pattern: /^980\d{2}$/, length: 5, placeholder: '98000' },
  Andorre: { pattern: /^AD\d{3}$/i, length: 5, placeholder: 'AD500' },
  Espagne: { pattern: /^\d{5}$/, length: 5, placeholder: '28001' },
}

// Codes postaux pour petits pays (Monaco et Andorre)
const MONACO_CITIES: Record<string, string> = {
  '98000': 'Monaco',
}

const ANDORRA_CITIES: Record<string, string> = {
  AD100: 'Canillo',
  AD200: 'Encamp',
  AD300: 'Ordino',
  AD400: 'La Massana',
  AD500: 'Andorra la Vella',
  AD600: 'Sant Julià de Lòria',
  AD700: 'Escaldes-Engordany',
}

/** Zippopotam : Belgique, Luxembourg, Italie, Espagne. */
async function parZippopotam(pays: string, codePostal: string): Promise<CitySuggestion[]> {
  const reponse = await safeFetch(`https://api.zippopotam.us/${pays}/${encodeURIComponent(codePostal)}`)
  if (!reponse || !reponse.ok) return []
  const data = await reponse.json()
  if (!data || !Array.isArray(data.places)) return []
  return data.places.map((place: any) => ({
    nom: place['place name'],
    code: codePostal,
    codesPostaux: [codePostal],
    coordinates: { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) },
  }))
}

/**
 * Villes correspondant à un code postal. Renvoie une liste vide tant que le
 * code n'a pas le format du pays.
 */
export async function rechercherVilles(pays: string, codePostal: string): Promise<CitySuggestion[]> {
  const format = POSTAL_CODE_FORMATS[pays]
  if (!format || codePostal.length !== format.length || !format.pattern.test(codePostal)) return []
  const encode = encodeURIComponent(codePostal)

  switch (pays) {
    case 'France': {
      // API du gouvernement français (avec coordonnées du centre)
      const reponse = await safeFetch(
        `https://geo.api.gouv.fr/communes?codePostal=${encode}&fields=nom,code,codesPostaux,centre&format=json`,
      )
      if (!reponse || !reponse.ok) return []
      const data = await reponse.json()
      if (!Array.isArray(data)) return []
      return data.map((item: any) => ({
        nom: item.nom,
        code: item.code,
        codesPostaux: item.codesPostaux,
        coordinates: item.centre
          ? { lng: item.centre.coordinates[0], lat: item.centre.coordinates[1] }
          : undefined,
      }))
    }
    case 'Monaco': {
      const ville = MONACO_CITIES[codePostal]
      return ville ? [{ nom: ville, code: codePostal, codesPostaux: [codePostal] }] : []
    }
    case 'Andorre': {
      const ville = ANDORRA_CITIES[codePostal.toUpperCase()]
      return ville ? [{ nom: ville, code: codePostal, codesPostaux: [codePostal] }] : []
    }
    case 'Belgique':
      return parZippopotam('be', codePostal)
    case 'Luxembourg':
      return parZippopotam('lu', codePostal)
    case 'Italie':
      return parZippopotam('it', codePostal)
    case 'Espagne':
      return parZippopotam('es', codePostal)
    case 'Suisse': {
      // geo.admin.ch - API officielle suisse
      const reponse = await safeFetch(
        `https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=${encode}&type=locations&origins=zipcode`,
      )
      if (!reponse || !reponse.ok) return []
      const data = await reponse.json()
      if (!data || !Array.isArray(data.results)) return []
      return data.results.map((item: any) => {
        // Le label est au format "1003 - Lausanne"
        const label = item.attrs?.label?.match(/<b>(\d+)\s*-\s*(.+?)<\/b>/)
        const nom = label ? label[2] : item.attrs?.label || ''
        return {
          nom: nom.replace(/<\/?b>/g, '').trim(),
          code: codePostal,
          codesPostaux: [codePostal],
          coordinates:
            item.attrs?.lat && item.attrs?.lon ? { lat: item.attrs.lat, lng: item.attrs.lon } : undefined,
        }
      })
    }
    case 'Allemagne': {
      // OpenPLZ API pour l'Allemagne
      const reponse = await safeFetch(`https://openplzapi.org/de/Localities?PostalCode=${encode}`)
      if (!reponse || !reponse.ok) return []
      const data = await reponse.json()
      if (!Array.isArray(data)) return []
      return data.map((item: any) => ({ nom: item.name, code: codePostal, codesPostaux: [codePostal] }))
    }
    default:
      return []
  }
}

/** Villes du code postal saisi, avec un délai de 300 ms pour limiter les appels. */
export function useVillesParCodePostal(pays: string, codePostal: string) {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([])
  const [chargement, setChargement] = useState(false)

  useEffect(() => {
    let annule = false
    const timer = setTimeout(async () => {
      const format = POSTAL_CODE_FORMATS[pays]
      if (!format || !format.pattern.test(codePostal)) {
        setSuggestions([])
        return
      }
      setChargement(true)
      try {
        const villes = await rechercherVilles(pays, codePostal)
        if (!annule) setSuggestions(villes)
      } catch {
        if (!annule) setSuggestions([])
      } finally {
        if (!annule) setChargement(false)
      }
    }, 300)
    return () => {
      annule = true
      clearTimeout(timer)
    }
  }, [pays, codePostal])

  return { suggestions, chargement }
}
