/**
 * Remise volume totems (uniquement sur le HT totems, pas panneaux / lests / livraison).
 * - ≥ 5 totems : −10 %
 * - ≥ 10 totems : −15 %
 *
 * Prix d’entrée catalogue (badges « À partir de ») : toujours liste × 0,85 (−15 %).
 */

export const TOTEM_DISCOUNT_QTY_10 = 5
export const TOTEM_DISCOUNT_QTY_15 = 10
export const TOTEM_DISCOUNT_RATE_10 = 0.1
export const TOTEM_DISCOUNT_RATE_15 = 0.15

export function totemVolumeDiscountRate(totemQty: number): number {
  const q = Math.max(0, Math.floor(totemQty))
  if (q >= TOTEM_DISCOUNT_QTY_15) return TOTEM_DISCOUNT_RATE_15
  if (q >= TOTEM_DISCOUNT_QTY_10) return TOTEM_DISCOUNT_RATE_10
  return 0
}

export function totemVolumeDiscountAmount(totemSubtotalHT: number, totemQty: number): number {
  const rate = totemVolumeDiscountRate(totemQty)
  if (rate <= 0 || totemSubtotalHT <= 0) return 0
  return Math.round(totemSubtotalHT * rate * 100) / 100
}

export function totemUnitPriceAfterDiscount(listPrice: number, totemQty: number): number {
  const rate = totemVolumeDiscountRate(totemQty)
  return Math.round(listPrice * (1 - rate))
}

/** Prix d’entrée affiché dans les catalogues (liste × 0,85). */
export function totemCatalogEntryPrice(listPrice: number): number {
  return Math.round(listPrice * (1 - TOTEM_DISCOUNT_RATE_15))
}

export function totemVolumeDiscountPercentLabel(totemQty: number): string {
  const rate = totemVolumeDiscountRate(totemQty)
  if (rate <= 0) return ''
  return `−${Math.round(rate * 100)}%`
}

export function totemVolumeDiscountBanner(totemQty: number): {
  applied: boolean
  classNameApplied: boolean
  message: string
} {
  const rate = totemVolumeDiscountRate(totemQty)
  if (rate >= TOTEM_DISCOUNT_RATE_15) {
    return {
      applied: true,
      classNameApplied: true,
      message: 'Remise de 15% appliquée sur les totems !',
    }
  }
  if (rate >= TOTEM_DISCOUNT_RATE_10) {
    return {
      applied: true,
      classNameApplied: true,
      message: 'Remise de 10% appliquée sur les totems !',
    }
  }
  return {
    applied: false,
    classNameApplied: false,
    message:
      'Commandez 5 totems ou plus (−10%), ou 10 totems ou plus (−15%) sur les totems',
  }
}
