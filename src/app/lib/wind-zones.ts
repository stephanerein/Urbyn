// Catégories de terrain selon Eurocode EN 1991-1-4
export const TERRAIN_CATEGORIES = {
  bord_mer: {
    label: 'Bord de mer',
    eurocodeCategory: 'Catégorie 0',
    description: 'Mer ou zone côtière exposée aux vents de mer',
    roughness: 0.003,
    ce: 1.35
  },
  rase_campagne: {
    label: 'Rase campagne',
    eurocodeCategory: 'Catégorie II',
    description: 'Campagne avec haies basses, arbres isolés',
    roughness: 0.05,
    ce: 1.20
  },
  campagne_haies: {
    label: 'Campagne avec haies',
    eurocodeCategory: 'Catégorie IIIa',
    description: 'Campagne avec nombreuses haies ou arbres',
    roughness: 0.30,
    ce: 1.00
  },
  zone_urbanisee: {
    label: 'Zone urbanisée',
    eurocodeCategory: 'Catégorie IIIb',
    description: 'Zone avec bâtiments industriels ou habitations',
    roughness: 0.50,
    ce: 0.85
  },
  zone_urbaine: {
    label: 'Zone urbaine (>15% surface bâtie)',
    eurocodeCategory: 'Catégorie IV',
    description: 'Zone urbaine dense avec bâtiments de grande hauteur',
    roughness: 1.00,
    ce: 0.70
  }
};

export type TerrainCategory = keyof typeof TERRAIN_CATEGORIES;

// Fonction pour déterminer la zone de vent selon le département (2 premiers chiffres du code postal)
export function getWindZone(postalCode: string, country: string = 'France', city?: string): {
  zone: number;
  vb: number;
  description: string;
  critical: boolean;
} {
  if (country !== 'France') {
    return { zone: 2, vb: 24, description: 'Zone standard (hors France métropolitaine)', critical: false };
  }

  const dept = parseInt(postalCode.substring(0, 2));
  const cityLower = city?.toLowerCase().trim() || '';

  const normalizeCity = (str: string) => {
    return str.toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/['-]/g, ' ')
      .trim();
  };

  const cityNorm = normalizeCity(cityLower);

  // Zone 4 - Vent très fort (côtes exposées + Corse + montagne)
  if (postalCode.startsWith('2A') || dept === 20) {
    const zone4Cities = ['bonifacio', 'figari', 'levie', 'porto vecchio', 'serra di scopamene', 'sotta'];
    if (zone4Cities.some(c => cityNorm.includes(normalizeCity(c)))) {
      return { zone: 4, vb: 28, description: 'Corse-du-Sud (littoral exposé)', critical: true };
    }
    return { zone: 3, vb: 26, description: 'Corse-du-Sud', critical: true };
  }

  if (postalCode.startsWith('2B') || (dept === 20 && cityNorm.includes('bastia'))) {
    const zone4Cities = ['ile rousse', 'l ile rousse', 'calenzana', 'calvi', 'belgodere'];
    if (zone4Cities.some(c => cityNorm.includes(normalizeCity(c)))) {
      return { zone: 4, vb: 28, description: 'Haute-Corse (littoral exposé)', critical: true };
    }
    return { zone: 3, vb: 26, description: 'Haute-Corse', critical: true };
  }

  // Départements en zone 4
  if ([6, 11, 30, 34, 66, 83, 84].includes(dept)) {
    return { zone: 4, vb: 28, description: 'Zone méditerranéenne exposée - Vent très fort', critical: true };
  }

  // Zone 3 - Vent fort (littoral atlantique et Manche)
  if ([13, 14, 17, 22, 29, 33, 35, 44, 50, 56, 62, 64, 76, 80, 85].includes(dept)) {
    return { zone: 3, vb: 26, description: 'Zone littorale exposée - Vent fort', critical: true };
  }

  // Zone 2 - Vent modéré (zone normale)
  if ([2, 10, 21, 25, 38, 39, 42, 52, 54, 55, 57, 59, 60, 61, 67, 68, 70, 75, 77, 78, 88, 89, 90, 91, 92, 93, 94, 95].includes(dept)) {
    return { zone: 2, vb: 24, description: 'Zone normale - Vent modéré', critical: false };
  }

  // Zone 1 - Vent faible (intérieur protégé)
  if ([1, 3, 15, 18, 23, 36, 41, 45, 58, 63, 71, 87].includes(dept)) {
    return { zone: 1, vb: 22, description: 'Zone intérieure - Vent faible', critical: false };
  }

  // Par défaut, zone 2
  return { zone: 2, vb: 24, description: 'Zone standard', critical: false };
}
