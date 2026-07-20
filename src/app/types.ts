// Types Urbyn

export type MaterialType = 'dibond' | 'tole' | 'bois' | 'vegetal';

export type DibondLamination = 'mate' | 'satin' | 'brillante' | 'brillante-antigraffiti';

export type RALColor =
  | '1015' | '1018' | '1023' | '2004' | '2008' | '3000' | '3020'
  | '5001' | '5002' | '5011' | '5012' | '5017' | '5019'
  | '6001' | '6004' | '6005' | '6008' | '6009' | '6012' | '6018' | '6019' | '6024'
  | '7005' | '7011' | '7040' | '9002' | '9006' | '9010';

export interface MaterialSelection {
  type: MaterialType;
  length: number;
  surface?: number;
  ralColor?: RALColor;
  dibondLamination?: DibondLamination;
  includeProtectionFrame?: boolean;
  vegetalType?: 'feuillage' | 'mur';
  vegetalVariety?: string;
  boisTreatment?: 'classe2' | 'classe3';
}

export type PortailType = 
  | 'galvanise_4m_battant' | 'galvanise_5m_battant' | 'galvanise_6m_battant'
  | 'galvanise_4m_coulissant' | 'galvanise_5m_coulissant' | 'galvanise_6m_coulissant'
  | 'galvanise_7m_coulissant';

export type PortillonType = 'bois_0_9m' | 'bois_1_4m' | 'galvanise_0_9m' | 'galvanise_1_4m';

export interface PortailSelection {
  type: PortailType;
}

export interface PortillonSelection {
  type: PortillonType;
}

export interface ServicesAccompagnement {
  toolkit?: boolean;
  transport?: boolean;
  conseil?: string[];
  expertises?: string[];
}

export interface HoardingConfig {
  projectType: 'habillage' | 'montage';
  length?: number;
  height: number;
  material?: MaterialType;
  ralColor?: RALColor;
  includeWoodSaturator?: boolean;
  soilEnrobe?: number;
  soilMeuble?: number;
  portails?: number;
  portailsSelections?: PortailSelection[];
  portillons?: number;
  portillonsSelections?: PortillonSelection[];
  materials?: MaterialSelection[];
  includeInstaller: boolean;
  includeBET?: boolean;
  includeCERFA?: boolean;
  deliveryAddress?: string;
  deliveryInstructions?: string;
  deliveryDate?: string;
  servicesAccompagnement?: ServicesAccompagnement;
}

export interface PriceBreakdown {
  materialCost: number;
  foundationCost: number;
  gatesCost: number;
  laborCost: number;
  betCost: number;
  totalCost: number;
}
