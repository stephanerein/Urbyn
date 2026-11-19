import type { PatioDimensions } from '../api/ombrage'

// État partagé entre la page de saisie des patios et la page de chiffrage.
//
// Les dimensions sont conservées en sessionStorage (elles survivent à un
// rechargement). Les photos sont des fichiers : elles ne peuvent vivre qu'en
// mémoire, et sont donc perdues si l'onglet est rechargé.

export const MAX_PATIOS = 10
export const COTE_MIN_M = 1
export const COTE_MAX_M = 50

const STORAGE_KEY = 'ombragePatioSaisie'

/** Saisie d'un patio : les côtés sont des chaînes, telles que tapées, en mètres. */
export interface PatioSaisie {
  nom: string
  largeur1: string
  largeur2: string
  longueur1: string
  longueur2: string
}

export interface OmbrageSaisie {
  miseEnPlace: boolean
  /** Option de la couverture repliable (acquisition) : visite annuelle de vérification. */
  verificationAnnuelle: boolean
  /** Option de la couverture fixe : installation en avril, démontage en octobre. */
  interventionSaisonniere: boolean
  patios: PatioSaisie[]
}

export function patioVide(): PatioSaisie {
  return { nom: '', largeur1: '', largeur2: '', longueur1: '', longueur2: '' }
}

export function saisieParDefaut(): OmbrageSaisie {
  // « Mise en place » est présélectionnée.
  return {
    miseEnPlace: true,
    verificationAnnuelle: false,
    interventionSaisonniere: false,
    patios: [patioVide()],
  }
}

export function lireSaisie(): OmbrageSaisie {
  if (typeof window === 'undefined') return saisieParDefaut()
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return saisieParDefaut()
    const parsed = JSON.parse(raw) as OmbrageSaisie
    if (!Array.isArray(parsed.patios) || parsed.patios.length === 0) return saisieParDefaut()
    return {
      miseEnPlace: parsed.miseEnPlace !== false,
      verificationAnnuelle: parsed.verificationAnnuelle === true,
      interventionSaisonniere: parsed.interventionSaisonniere === true,
      patios: parsed.patios.slice(0, MAX_PATIOS).map((p) => ({ ...patioVide(), ...p })),
    }
  } catch {
    return saisieParDefaut()
  }
}

export function ecrireSaisie(saisie: OmbrageSaisie) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saisie))
  } catch {
    /* stockage indisponible : la saisie reste valable pour la page courante */
  }
}

/** Convertit « 12,5 » ou « 12.5 » (mètres) en nombre, ou null si illisible. */
export function lireMetres(value: string): number | null {
  const normalise = value.trim().replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(normalise)) return null
  return Number(normalise)
}

export function erreurCote(value: string): string | null {
  if (!value.trim()) return 'À renseigner'
  const metres = lireMetres(value)
  if (metres === null) return 'Nombre attendu, en mètres'
  if (metres < COTE_MIN_M) return `${COTE_MIN_M} m au minimum`
  if (metres > COTE_MAX_M) return `${COTE_MAX_M} m au maximum`
  return null
}

/** Les quatre côtés d'un patio en mètres ; null pour un côté illisible. */
export function cotesDuPatio(patio: PatioSaisie) {
  return {
    largeur1: lireMetres(patio.largeur1),
    largeur2: lireMetres(patio.largeur2),
    longueur1: lireMetres(patio.longueur1),
    longueur2: lireMetres(patio.longueur2),
  }
}

export function erreurNom(value: string): string | null {
  return value.trim() ? null : 'À renseigner'
}

export function patioComplet(patio: PatioSaisie): boolean {
  return (
    erreurNom(patio.nom) === null &&
    [patio.largeur1, patio.largeur2, patio.longueur1, patio.longueur2].every(
      (cote) => erreurCote(cote) === null,
    ) &&
    construireQuadrilatere(
      lireMetres(patio.largeur1)!,
      lireMetres(patio.largeur2)!,
      lireMetres(patio.longueur1)!,
      lireMetres(patio.longueur2)!,
    ) !== null
  )
}

// ── Géométrie du patio ─────────────────────────────────────────────────────

export interface Point {
  x: number
  y: number
}

/** Sommets dans l'ordre : haut-gauche, haut-droit, bas-droit, bas-gauche. */
export type Quadrilatere = [Point, Point, Point, Point]

/**
 * Reconstitue la forme du patio à partir de ses quatre côtés.
 *
 * Quatre longueurs ne fixent pas un quadrilatère unique : il reste un angle
 * libre. On retient la forme d'aire maximale, c'est-à-dire la plus régulière :
 * un rectangle si les côtés opposés sont égaux, un trapèze symétrique si seules
 * les longueurs le sont, et une forme proche du rectangle quand les côtés
 * diffèrent peu. Le côté A (première largeur) est posé à l'horizontale, en haut.
 *
 * Renvoie null si aucun quadrilatère n'a ces côtés (un côté plus long que la
 * somme des trois autres), ce qui signale une faute de saisie.
 */
export function construireQuadrilatere(
  largeur1: number,
  largeur2: number,
  longueur1: number,
  longueur2: number,
): Quadrilatere | null {
  const cotes = [largeur1, largeur2, longueur1, longueur2]
  if (cotes.some((c) => !(c > 0))) return null
  const plusGrand = Math.max(...cotes)
  if (plusGrand >= cotes.reduce((a, b) => a + b, 0) - plusGrand) return null

  const hautGauche: Point = { x: 0, y: 0 }
  const hautDroit: Point = { x: largeur1, y: 0 }
  let meilleur: { points: Quadrilatere; aire: number } | null = null

  // Balayage de l'angle au sommet haut-gauche ; le sommet bas-droit est à
  // l'intersection de deux cercles (largeur B et longueur D).
  for (let degres = 5; degres <= 175; degres += 0.25) {
    const angle = (degres * Math.PI) / 180
    const basGauche: Point = { x: longueur1 * Math.cos(angle), y: longueur1 * Math.sin(angle) }
    const dx = hautDroit.x - basGauche.x
    const dy = hautDroit.y - basGauche.y
    const distance = Math.hypot(dx, dy)
    if (distance > largeur2 + longueur2 || distance < Math.abs(largeur2 - longueur2) || distance === 0) {
      continue
    }
    const a = (largeur2 ** 2 - longueur2 ** 2 + distance ** 2) / (2 * distance)
    const h = Math.sqrt(Math.max(0, largeur2 ** 2 - a ** 2))
    const milieu = { x: basGauche.x + (a * dx) / distance, y: basGauche.y + (a * dy) / distance }
    // Des deux intersections, on garde celle située sous le côté A.
    const candidats: Point[] = [
      { x: milieu.x + (h * dy) / distance, y: milieu.y - (h * dx) / distance },
      { x: milieu.x - (h * dy) / distance, y: milieu.y + (h * dx) / distance },
    ]
    for (const basDroit of candidats) {
      if (basDroit.y <= 0 || basDroit.x <= basGauche.x) continue
      const points: Quadrilatere = [hautGauche, hautDroit, basDroit, basGauche]
      if (!estConvexe(points)) continue
      const aire = aireQuadrilatere(points)
      if (!meilleur || aire > meilleur.aire) meilleur = { points, aire }
    }
  }
  return meilleur ? meilleur.points : null
}

function aireQuadrilatere(points: Quadrilatere): number {
  let somme = 0
  for (let i = 0; i < 4; i++) {
    const a = points[i]
    const b = points[(i + 1) % 4]
    somme += a.x * b.y - b.x * a.y
  }
  return Math.abs(somme) / 2
}

function estConvexe(points: Quadrilatere): boolean {
  let signe = 0
  for (let i = 0; i < 4; i++) {
    const a = points[i]
    const b = points[(i + 1) % 4]
    const c = points[(i + 2) % 4]
    const produit = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x)
    if (Math.abs(produit) < 1e-9) continue
    if (signe === 0) signe = Math.sign(produit)
    else if (Math.sign(produit) !== signe) return false
  }
  return true
}

export function versDimensions(patios: PatioSaisie[]): PatioDimensions[] {
  return patios.map((patio) => ({
    nom: patio.nom.trim(),
    largeur_1_mm: Math.round((lireMetres(patio.largeur1) ?? 0) * 1000),
    largeur_2_mm: Math.round((lireMetres(patio.largeur2) ?? 0) * 1000),
    longueur_1_mm: Math.round((lireMetres(patio.longueur1) ?? 0) * 1000),
    longueur_2_mm: Math.round((lireMetres(patio.longueur2) ?? 0) * 1000),
  }))
}

// ── Photos (en mémoire) ─────────────────────────────────────────────────────

export interface PhotoPatio {
  blob: Blob
  apercu: string
  nomOrigine: string
}

const photos = new Map<number, PhotoPatio>()

export function lirePhoto(index: number): PhotoPatio | undefined {
  return photos.get(index)
}

export function lirePhotos(): Array<{ patioIndex: number; blob: Blob }> {
  return [...photos.entries()].map(([patioIndex, photo]) => ({ patioIndex, blob: photo.blob }))
}

export function retirerPhoto(index: number) {
  const photo = photos.get(index)
  if (photo) URL.revokeObjectURL(photo.apercu)
  photos.delete(index)
  coinsPhotos.delete(index)
}

/** Après suppression d'un patio, les photos des suivants remontent d'un rang. */
export function decalerPhotosApresSuppression(indexSupprime: number) {
  retirerPhoto(indexSupprime)
  const suivants = [...photos.keys()].filter((k) => k > indexSupprime).sort((a, b) => a - b)
  for (const k of suivants) {
    photos.set(k - 1, photos.get(k)!)
    photos.delete(k)
    const coins = coinsPhotos.get(k)
    coinsPhotos.delete(k)
    if (coins) coinsPhotos.set(k - 1, coins)
  }
}

const COTE_MAX_PHOTO_PX = 2000

/**
 * Prépare une photo pour l'envoi : réduite à 2000 px de côté et recompressée en
 * JPEG. Une photo de smartphone passe ainsi de plusieurs Mo à quelques
 * centaines de Ko, sans perte utile pour une simulation.
 */
export async function deposerPhoto(index: number, fichier: File): Promise<PhotoPatio> {
  if (!fichier.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image (JPEG, PNG ou WebP).')
  }
  const url = URL.createObjectURL(fichier)
  try {
    const image = new Image()
    image.src = url
    await image.decode()

    const echelle = Math.min(1, COTE_MAX_PHOTO_PX / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(image.naturalWidth * echelle)
    canvas.height = Math.round(image.naturalHeight * echelle)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error("Impossible de préparer l'image.")
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85),
    )
    if (!blob) throw new Error("Impossible de préparer l'image.")

    retirerPhoto(index)
    const photo: PhotoPatio = {
      blob,
      apercu: URL.createObjectURL(blob),
      nomOrigine: fichier.name,
    }
    photos.set(index, photo)
    return photo
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Impossible')) throw error
    throw new Error("Cette image n'a pas pu être lue. Essayez un fichier JPEG ou PNG.")
  } finally {
    URL.revokeObjectURL(url)
  }
}

// ── Affichage ──────────────────────────────────────────────────────────────

export function euros(value: number): string {
  return `${Math.round(value).toLocaleString('fr-FR')} €`
}

export function metres(mm: number): string {
  return `${(mm / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} m`
}

// ── Couverture ─────────────────────────────────────────────────────────────
// L'implantation des vélums est calculée par le serveur, avec le chiffrage :
// le site dessine les polygones qu'il reçoit et n'en recalcule aucun.

function aireSignee(points: Point[]): number {
  let somme = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    somme += a.x * b.y - b.x * a.y
  }
  return somme / 2
}

export function airePolygone(points: Point[]): number {
  return Math.abs(aireSignee(points))
}

/** Découpe d'un polygone convexe par un autre (Sutherland–Hodgman). */
function intersectionConvexe(sujet: Point[], masque: Point[]): Point[] {
  const sens = aireSignee(masque) >= 0 ? 1 : -1
  let resultat = sujet
  for (let i = 0; i < masque.length && resultat.length > 0; i++) {
    const p = masque[i]
    const q = masque[(i + 1) % masque.length]
    const dedans = (pt: Point) =>
      ((q.x - p.x) * (pt.y - p.y) - (q.y - p.y) * (pt.x - p.x)) * sens >= -1e-9
    const entree = resultat
    resultat = []
    for (let j = 0; j < entree.length; j++) {
      const courant = entree[j]
      const precedent = entree[(j + entree.length - 1) % entree.length]
      const coupe = () => {
        const dx = courant.x - precedent.x
        const dy = courant.y - precedent.y
        const det = (q.x - p.x) * dy - (q.y - p.y) * dx
        const k = ((q.x - p.x) * (p.y - precedent.y) - (q.y - p.y) * (p.x - precedent.x)) / det
        return { x: precedent.x + k * dx, y: precedent.y + k * dy }
      }
      if (dedans(courant)) {
        if (!dedans(precedent)) resultat.push(coupe())
        resultat.push(courant)
      } else if (dedans(precedent)) {
        resultat.push(coupe())
      }
    }
  }
  return resultat
}

/** Part du patio réellement couverte par les vélums, de 0 à 1. */
export function partCouverte(forme: Quadrilatere, velums: Point[][]): number {
  const aire = airePolygone(forme)
  if (aire === 0) return 0
  const couverte = velums.reduce(
    (somme, velum) => somme + airePolygone(intersectionConvexe(velum, forme)),
    0,
  )
  return Math.min(1, couverte / aire)
}

// ── Simulation sur photo ───────────────────────────────────────────────────
// Le client place les quatre coins de son patio sur sa photo. Une homographie
// relie alors le plan du patio (en mètres) à l'image : tout ce qui est dessiné
// sur le plan — les vélums — peut être reporté sur la photo, en perspective.

/**
 * Coins du patio sur la photo, en coordonnées relatives (0 à 1), dans l'ordre
 * des sommets du modèle : A∩C, A∩D, B∩D, B∩C. Par défaut, un cadre centré que
 * le client ajuste ; le côté A est à gauche, comme sur le plan.
 */
export function coinsParDefaut(): Point[] {
  return [
    { x: 0.22, y: 0.78 },
    { x: 0.22, y: 0.22 },
    { x: 0.78, y: 0.22 },
    { x: 0.78, y: 0.78 },
  ]
}

const coinsPhotos = new Map<number, Point[]>()

export function lireCoins(index: number): Point[] {
  return coinsPhotos.get(index) ?? coinsParDefaut()
}

export function ecrireCoins(index: number, coins: Point[]) {
  coinsPhotos.set(index, coins)
}

/** Les quatre coins dessinent-ils un contour simple, sans croisement ni repli ? */
export function coinsValides(coins: Point[]): boolean {
  if (coins.length !== 4) return false
  let signe = 0
  for (let i = 0; i < 4; i++) {
    const a = coins[i]
    const b = coins[(i + 1) % 4]
    const c = coins[(i + 2) % 4]
    const produit = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x)
    if (Math.abs(produit) < 1e-9) return false
    if (signe === 0) signe = Math.sign(produit)
    else if (Math.sign(produit) !== signe) return false
  }
  return true
}

/**
 * Homographie envoyant quatre points source sur quatre points cible. Renvoie la
 * fonction de projection, ou null si les points sont dégénérés. La projection
 * elle-même renvoie null pour un point rejeté derrière la ligne d'horizon.
 */
export function homographie(
  source: Point[],
  cible: Point[],
): ((pt: Point) => Point | null) | null {
  // Système linéaire 8 × 8 sur les coefficients h11…h32 (h33 = 1).
  const m: number[][] = []
  for (let i = 0; i < 4; i++) {
    const { x, y } = source[i]
    const { x: u, y: v } = cible[i]
    m.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u])
    m.push([0, 0, 0, x, y, 1, -v * x, -v * y, v])
  }
  // Élimination de Gauss avec pivot partiel.
  for (let col = 0; col < 8; col++) {
    let pivot = col
    for (let ligne = col + 1; ligne < 8; ligne++) {
      if (Math.abs(m[ligne][col]) > Math.abs(m[pivot][col])) pivot = ligne
    }
    if (Math.abs(m[pivot][col]) < 1e-12) return null
    ;[m[col], m[pivot]] = [m[pivot], m[col]]
    for (let ligne = 0; ligne < 8; ligne++) {
      if (ligne === col) continue
      const facteur = m[ligne][col] / m[col][col]
      for (let k = col; k < 9; k++) m[ligne][k] -= facteur * m[col][k]
    }
  }
  const h = m.map((ligne, i) => ligne[8] / ligne[i])
  return (pt: Point) => {
    const w = h[6] * pt.x + h[7] * pt.y + 1
    if (w <= 1e-6) return null
    return {
      x: (h[0] * pt.x + h[1] * pt.y + h[2]) / w,
      y: (h[3] * pt.x + h[4] * pt.y + h[5]) / w,
    }
  }
}
