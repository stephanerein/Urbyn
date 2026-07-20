// Utilitaire centralisé pour résoudre l'image d'un totem à partir de son ID
// de panier et/ou de son format. Utilisé dans les pages de conformité vent,
// le panier, et tout affichage en vignette de totem.

import {
  imgTotemSignIzNoir,
  imgCaissonBois80,
  imgCaissonBois120,
  imgCaissonBois160,
  imgCaissonBois200,
  imgCaissonBoisVignette,
} from './images';

const FALLBACK_GABION = 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=200&h=200&fit=crop';
const FALLBACK_LIZ    = 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=200&h=200&fit=crop';
const FALLBACK_DEFAULT = imgCaissonBoisVignette;

/**
 * Renvoie l'image correcte pour un totem en fonction de son ID de panier
 * et de son format technique.
 *
 * @param totemId  — valeur de `item.id` ou `req.totemId` (ex. "totem-sign-iz-acquisition")
 * @param format   — valeur de `item.details?.format` (ex. "sign-iz", "80", "120", …)
 */
export function getTotemImage(totemId: string, format?: string): string {
  const id = totemId.toLowerCase();
  const fmt = (format ?? '').toLowerCase();

  // ── Sign-IZ ──────────────────────────────────────────────────────────────
  if (id.includes('sign-iz') || fmt === 'sign-iz') return imgTotemSignIzNoir;

  // ── Caisson Bois — format précis ─────────────────────────────────────────
  if (id.includes('caisson-bois') || fmt.match(/^\d+$/)) {
    if (fmt === '80')  return imgCaissonBois80;
    if (fmt === '120') return imgCaissonBois120;
    if (fmt === '160') return imgCaissonBois160;
    if (fmt === '200') return imgCaissonBois200;
    // format inconnu → vignette générique caisson bois
    return imgCaissonBoisVignette;
  }

  // ── Gabion ────────────────────────────────────────────────────────────────
  if (id.includes('gabion') || fmt === 'gabion') return FALLBACK_GABION;

  // ── LIZ ───────────────────────────────────────────────────────────────────
  if (id.includes('liz') || fmt === 'liz') return FALLBACK_LIZ;

  return FALLBACK_DEFAULT;
}
