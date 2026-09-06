/**
 * Livraison totems — séparée des massifs.
 *
 * - Départ fixe : Rouen (76000), indépendant du fournisseur DB
 * - Capacité : 6 totems / camion (tous types confondus)
 * - Par camion : 250 € + 1 €/km
 * - n camions : n × (250 € + 1 €/km)
 * - Les lests / panneaux ne comptent pas dans le remplissage camion
 */

import { estimateDistanceKm } from './massifShipping'

export const TOTEM_ORIGIN_ZIP = '76000'
export const TOTEM_ORIGIN_LABEL = 'Rouen'
/** Coordonnées centre Rouen (OSRM / haversine). */
export const TOTEM_ORIGIN_COORDS = { lat: 49.4432, lng: 1.0993 } as const

export const TOTEM_TRUCK_CAPACITY = 6
/** Forfait fixe par camion (tous les camions au même tarif). */
export const TOTEM_TRUCK_BASE_EUR = 250
export const TOTEM_PER_KM_EUR = 1

export type TotemShippingResult = {
  totemQty: number
  trucksCount: number
  /** Remplissage % de chaque camion (0–100), basé sur 6 slots. */
  truckFills: number[]
  /** Nombre de totems dans chaque camion. */
  truckLoads: number[]
  distanceKm: number
  truckFee: number
  distanceFee: number
  shippingTotal: number
  originZip: string
  originLabel: string
}

export function trucksForTotemQty(totemQty: number): {
  trucksCount: number
  truckFills: number[]
  truckLoads: number[]
} {
  const qty = Math.max(0, Math.floor(totemQty))
  if (qty <= 0) return { trucksCount: 0, truckFills: [], truckLoads: [] }

  const trucksCount = Math.ceil(qty / TOTEM_TRUCK_CAPACITY)
  const truckLoads: number[] = []
  const truckFills: number[] = []
  let remaining = qty
  for (let i = 0; i < trucksCount; i++) {
    const load = Math.min(remaining, TOTEM_TRUCK_CAPACITY)
    truckLoads.push(load)
    truckFills.push((load / TOTEM_TRUCK_CAPACITY) * 100)
    remaining -= load
  }
  return { trucksCount, truckFills, truckLoads }
}

/** n × 250 € */
export function totemTruckFixedFee(trucksCount: number): number {
  if (trucksCount <= 0) return 0
  return trucksCount * TOTEM_TRUCK_BASE_EUR
}

/**
 * Calcule le transport totems depuis Rouen.
 * Formule : n × (250 € + 1 €/km)
 * `distanceKmOverride` : distance route (OSRM) si déjà connue.
 */
export function computeTotemShipping(
  totemQty: number,
  deliveryPostalCode: string | null | undefined,
  deliveryCountry = 'France',
  distanceKmOverride?: number | null,
): TotemShippingResult {
  const { trucksCount, truckFills, truckLoads } = trucksForTotemQty(totemQty)
  const distanceKm =
    typeof distanceKmOverride === 'number' && Number.isFinite(distanceKmOverride)
      ? Math.max(0, Math.round(distanceKmOverride))
      : estimateDistanceKm(TOTEM_ORIGIN_ZIP, deliveryPostalCode, deliveryCountry)

  const truckFee = totemTruckFixedFee(trucksCount)
  const distanceFee = trucksCount * distanceKm * TOTEM_PER_KM_EUR
  const shippingTotal = Math.round((truckFee + distanceFee) * 100) / 100

  return {
    totemQty: Math.max(0, Math.floor(totemQty)),
    trucksCount,
    truckFills,
    truckLoads,
    distanceKm,
    truckFee,
    distanceFee,
    shippingTotal,
    originZip: TOTEM_ORIGIN_ZIP,
    originLabel: TOTEM_ORIGIN_LABEL,
  }
}

export function countTotemUnits(
  items: Array<{ quantity: number; details?: { itemType?: string }; type?: string }>,
): number {
  return items
    .filter((i) => i.details?.itemType === 'totem' || i.type === 'totem')
    .reduce((s, i) => s + (i.quantity || 0), 0)
}
