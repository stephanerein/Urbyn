// Prix des matériaux au m²
export const MATERIAL_PRICES = {
  dibond_mate: 50,
  dibond_satin: 50,
  dibond_brillante: 50,
  dibond_brillante_antigraffiti: 60,
  tole: 12,
  bois_classe2: 11, // Sans traitement
  bois_classe3: 15, // Avec traitement autoclave
  vegetal_feuillage: 32.5,
  vegetal_mur: 45
} as const;

// Prix du montage (fondations) au ml
export const FOUNDATION_PRICES = {
  enrobe: 45,
  meuble: 65
} as const;

// Prix des accès (unité)
export const ACCESS_PRICES = {
  // Portails
  galvanise_4m_battant: 850,
  galvanise_5m_battant: 1050,
  galvanise_6m_battant: 1250,
  galvanise_4m_coulissant: 1050,
  galvanise_5m_coulissant: 1250,
  galvanise_6m_coulissant: 1450,
  galvanise_7m_coulissant: 1650,
  
  // Portillons
  bois_0_9m: 350,
  bois_1_4m: 450,
  galvanise_0_9m: 450,
  galvanise_1_4m: 550
} as const;

// Prix BET
export const BET_PRICE = 480;

// Installation : 8€/m² avec minimum de 600€
export const INSTALLATION_PRICE_PER_M2 = 8;
export const INSTALLATION_MINIMUM = 600;

// Accompagnement
export const SUPPORT_PRICES = {
  fiche: 280,
  pilotage_rate: 0.125, // 12.5%
  pilotage_suivi_rate: 0.175, // 17.5%
  minimum_pilotage: 960
} as const;

// Calcul du prix d'installation
export function calculateInstallationCost(totalSurface: number): number {
  const cost = totalSurface * INSTALLATION_PRICE_PER_M2;
  return Math.max(cost, INSTALLATION_MINIMUM);
}

// Calcul du prix d'accompagnement
export function calculateSupportCost(type: 'none' | 'fiche' | 'pilotage' | 'pilotage_suivi', baseValue: number): number {
  if (type === 'none') return 0;
  if (type === 'fiche') return SUPPORT_PRICES.fiche;
  
  const rate = type === 'pilotage' ? SUPPORT_PRICES.pilotage_rate : SUPPORT_PRICES.pilotage_suivi_rate;
  const price = baseValue * rate;
  
  // Arrondi à la centaine supérieure et respect du minimum
  const roundedPrice = Math.ceil(price / 100) * 100;
  return Math.max(roundedPrice, SUPPORT_PRICES.minimum_pilotage);
}
