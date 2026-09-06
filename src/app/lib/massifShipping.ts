/**
 * Livraison massifs béton — mutualisée par fournisseur.
 *
 * - Capacité camion : 24 T
 * - 200 € / camion entamé
 * - 1 € / km (distance fournisseur → livraison)
 * - 3,4 € / tonne transportée (coût exceptionnel)
 * - Installation massif : 490 €
 */

export const MASSIF_TRUCK_CAPACITY_KG = 24_000
export const MASSIF_TRUCK_BASE_EUR = 200
export const MASSIF_PER_KM_EUR = 1
export const MASSIF_PER_TON_EXTRA_EUR = 3.4
export const MASSIF_INSTALLATION_EUR = 490
export const TOTEM_INSTALLATION_EUR = 1690

/** Lit le mapping servicesSpecifiques (legacy array → totem). */
export function readServicesByProduct(): Record<string, string[]> {
  try {
    const raw = sessionStorage.getItem('servicesSpecifiques')
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return { totem: parsed }
    if (parsed && typeof parsed === 'object') return parsed as Record<string, string[]>
  } catch {
    /* ignore */
  }
  return {}
}

function writeServicesByProduct(map: Record<string, string[]>) {
  sessionStorage.setItem('servicesSpecifiques', JSON.stringify(map))
}

export function isMassifInstallationSelected(): boolean {
  const map = readServicesByProduct()
  return (map['massif-beton'] ?? []).includes('installation')
}

export function isTotemInstallationSelected(): boolean {
  const map = readServicesByProduct()
  return (map.totem ?? []).includes('installation')
}

/** Persiste le choix installation totem (frais de facturation, pas un produit panier). */
export function setTotemInstallationSelected(enabled: boolean) {
  const map = readServicesByProduct()
  const current = new Set(map.totem ?? [])
  if (enabled) current.add('installation')
  else current.delete('installation')
  map.totem = [...current]
  writeServicesByProduct(map)
  localStorage.setItem('totemInstallFee', enabled ? String(TOTEM_INSTALLATION_EUR) : '0')
}

export type MassifCartLike = {
  quantity: number
  details?: {
    itemType?: string
    weight?: number
    totalWeight?: number
    companyName?: string | null
    company_name?: string | null
    companyTva?: string | null
    company_tva?: string | null
    companyZip?: string | null
    company_zip?: string | null
  }
}

function isMassifProductLine(item: MassifCartLike): boolean {
  const t = item.details?.itemType
  if (t === 'manille' || t === 'installation') return false
  return t === 'massif' || (item as { type?: string }).type === 'massif'
}

export type SupplierTruckGroup = {
  supplierKey: string
  supplierName: string
  companyZip: string | null
  totalWeightKg: number
  trucksCount: number
  truckFills: number[]
  distanceKm: number
  truckFee: number
  distanceFee: number
  tonnageFee: number
  shippingTotal: number
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Approximation FR : centroïde départemental grossier à partir du CP. */
function approxLatLngFromFrenchZip(zip: string): { lat: number; lng: number } | null {
  const digits = zip.replace(/\D/g, '')
  if (digits.length < 2) return null
  const dept = parseInt(digits.slice(0, 2), 10)
  // Approximation relative à Paris (48.86, 2.35)
  const lat = 48.86 + ((dept % 20) - 10) * 0.18
  const lng = 2.35 + ((Math.floor(dept / 5) % 20) - 10) * 0.22
  return { lat, lng }
}

export function estimateDistanceKm(
  fromZip: string | null | undefined,
  toZip: string | null | undefined,
  toCountry = 'France',
): number {
  const destZip = (toZip || '').trim()
  const originZip = (fromZip || '').trim()
  if (!destZip) return 80
  if (toCountry !== 'France' && toCountry !== 'FR') {
    return 250
  }
  const from = approxLatLngFromFrenchZip(originZip || '75001')
  const to = approxLatLngFromFrenchZip(destZip)
  if (!from || !to) return 80
  const km = haversineKm(from.lat, from.lng, to.lat, to.lng)
  return Math.max(20, Math.round(km))
}

export function trucksForWeight(totalWeightKg: number): {
  trucksCount: number
  truckFills: number[]
} {
  if (totalWeightKg <= 0) return { trucksCount: 0, truckFills: [] }
  if (totalWeightKg <= MASSIF_TRUCK_CAPACITY_KG * 1.02) {
    return {
      trucksCount: 1,
      truckFills: [Math.min(100, (totalWeightKg / MASSIF_TRUCK_CAPACITY_KG) * 100)],
    }
  }
  const trucksCount = Math.ceil(totalWeightKg / MASSIF_TRUCK_CAPACITY_KG)
  const truckFills: number[] = []
  let remaining = totalWeightKg
  for (let i = 0; i < trucksCount; i++) {
    const load = Math.min(remaining, MASSIF_TRUCK_CAPACITY_KG)
    truckFills.push((load / MASSIF_TRUCK_CAPACITY_KG) * 100)
    remaining -= load
  }
  return { trucksCount, truckFills }
}

function supplierKeyOf(item: MassifCartLike): string {
  const d = item.details || {}
  return (
    (d.companyTva || d.company_tva || d.companyName || d.company_name || 'unknown')
      .toString()
      .trim() || 'unknown'
  )
}

function supplierNameOf(item: MassifCartLike): string {
  const d = item.details || {}
  return (d.companyName || d.company_name || 'Fournisseur').toString()
}

function unitWeightKg(item: MassifCartLike): number {
  const d = item.details || {}
  if (typeof d.weight === 'number' && d.weight > 0) return d.weight
  if (typeof d.totalWeight === 'number' && item.quantity > 0) {
    return d.totalWeight / item.quantity
  }
  return 0
}

/** Groupe les massifs du panier par fournisseur et calcule camions + frais. */
export function computeMassifShippingBySupplier(
  items: MassifCartLike[],
  deliveryPostalCode: string | null | undefined,
  deliveryCountry = 'France',
  options?: { includeTonnageFee?: boolean },
): {
  groups: SupplierTruckGroup[]
  trucksTotal: number
  shippingTotal: number
  tonnageFeeTotal: number
  totalWeightKg: number
} {
  const includeTonnageFee = options?.includeTonnageFee !== false
  const massifs = items.filter(isMassifProductLine)
  const bySupplier = new Map<string, MassifCartLike[]>()
  for (const item of massifs) {
    const key = supplierKeyOf(item)
    const list = bySupplier.get(key) || []
    list.push(item)
    bySupplier.set(key, list)
  }

  const groups: SupplierTruckGroup[] = []
  for (const [key, list] of bySupplier) {
    const totalWeightKg = list.reduce(
      (sum, it) => sum + unitWeightKg(it) * it.quantity,
      0,
    )
    const { trucksCount, truckFills } = trucksForWeight(totalWeightKg)
    const zip =
      list.map((i) => i.details?.companyZip || i.details?.company_zip).find(Boolean) ||
      null
    const distanceKm = estimateDistanceKm(zip, deliveryPostalCode, deliveryCountry)
    const truckFee = trucksCount * MASSIF_TRUCK_BASE_EUR
    const distanceFee = trucksCount * distanceKm * MASSIF_PER_KM_EUR
    const tonnageFee = includeTonnageFee
      ? Math.round((totalWeightKg / 1000) * MASSIF_PER_TON_EXTRA_EUR * 100) / 100
      : 0
    const shippingTotal = Math.round((truckFee + distanceFee + tonnageFee) * 100) / 100
    groups.push({
      supplierKey: key,
      supplierName: supplierNameOf(list[0]),
      companyZip: zip,
      totalWeightKg,
      trucksCount,
      truckFills,
      distanceKm,
      truckFee,
      distanceFee,
      tonnageFee,
      shippingTotal,
    })
  }

  return {
    groups,
    trucksTotal: groups.reduce((s, g) => s + g.trucksCount, 0),
    shippingTotal: groups.reduce((s, g) => s + g.shippingTotal, 0),
    tonnageFeeTotal: groups.reduce((s, g) => s + g.tonnageFee, 0),
    totalWeightKg: groups.reduce((s, g) => s + g.totalWeightKg, 0),
  }
}

function massifLineKey(item: MassifCartLike & { id?: string }): string {
  const d = item.details || {}
  const productId = (d as { productId?: number }).productId
  if (productId != null) return `massif-api-${productId}`
  if (item.id) return item.id
  return `${supplierKeyOf(item)}-${d.weight ?? 0}-${item.quantity}`
}

/**
 * Fusionne panier + sélection en cours pour le calcul camion.
 * Même produit (même id) → quantités additionnées (aperçu après « Ajouter au panier »).
 */
export function mergeMassifCartAndDraft(
  cartItems: (MassifCartLike & { id?: string })[],
  draftItems: (MassifCartLike & { id?: string })[],
): MassifCartLike[] {
  const map = new Map<string, MassifCartLike & { id?: string }>()

  for (const item of cartItems) {
    if (item.details?.itemType !== 'massif' && (item as { type?: string }).type !== 'massif') {
      continue
    }
    const key = massifLineKey(item)
    map.set(key, { ...item, quantity: item.quantity })
  }

  for (const item of draftItems) {
    const key = massifLineKey(item)
    const prev = map.get(key)
    if (prev) {
      const qty = prev.quantity + item.quantity
      const unitW = unitWeightKg(item) || unitWeightKg(prev)
      map.set(key, {
        ...prev,
        ...item,
        quantity: qty,
        details: {
          ...prev.details,
          ...item.details,
          weight: unitW,
          totalWeight: unitW * qty,
        },
      })
    } else {
      map.set(key, { ...item })
    }
  }

  return [...map.values()]
}

export function uniqueSupplierNames(items: MassifCartLike[]): string[] {
  const names = new Set<string>()
  for (const item of items) {
    if (isMassifProductLine(item)) {
      names.add(supplierNameOf(item))
    }
  }
  return [...names]
}
