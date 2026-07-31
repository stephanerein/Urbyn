import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trash2, ArrowRight, Info, ChevronLeft, ChevronRight, Check, ShoppingCart, Truck } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { cn } from './ui/utils';
import { useCart } from '../context/CartContext';
import massifImg from 'figma:asset/massif-beton-cubique.png';
import massifLegoImg from 'figma:asset/massif-beton-lego.png';

const TRUCK_CAPACITY = 24000;

const POSTAL_RULES: Record<string, { pattern: RegExp; example: string }> = {
  France:     { pattern: /^\d{5}$/, example: '75011' },
  Belgique:   { pattern: /^\d{4}$/, example: '1000' },
  Luxembourg: { pattern: /^\d{4}$/, example: '1009' },
  Allemagne:  { pattern: /^\d{5}$/, example: '10115' },
  Suisse:     { pattern: /^\d{4}$/, example: '1003' },
  Italie:     { pattern: /^\d{5}$/, example: '00100' },
  Monaco:     { pattern: /^980\d{2}$/, example: '98000' },
  Andorre:    { pattern: /^AD\d{3}$/i, example: 'AD100' },
  Espagne:    { pattern: /^\d{5}$/, example: '28001' },
};

export type MassifType = 'cubique' | 'lego' | 'cylindrique' | 'stabilize' | 'candelabre';
export type MassifDimension = string;
export type MassifOption = 'reservation' | 'tiges' | 'tiges-300' | 'aucun';

export type MassifItem = {
  id: string;
  type: MassifType;
  dimension: MassifDimension;
  option: MassifOption;
  quantity: number;
};

export interface MassifConfig {
  items: MassifItem[];
}

interface MassifCalculatorProps {
  initialConfig?: MassifConfig;
  onCalculate: (config: MassifConfig) => void;
}

interface MassifDef {
  label: string;
  weight: number;
  prices: Partial<Record<MassifOption, number>>;
  specs: Partial<Record<MassifOption, string>>;
}

const MASSIF_DATA_CUBIQUE: Record<string, MassifDef> = {
  '500x500x500': { label: '500 × 500 × 500 mm', weight: 300, prices: { reservation: 0, tiges: 0, 'tiges-300': 0 }, specs: { tiges: 'Tige de 16/18 mm — Entraxe : 200 mm', 'tiges-300': 'Tige de 16/18 mm — Entraxe : 300 mm', reservation: 'Ouverture : sur demande' } },
  '600x600x600': { label: '600 × 600 × 600 mm', weight: 518, prices: { reservation: 0, tiges: 0, 'tiges-300': 0 }, specs: { tiges: 'Tige de 16/18 mm — Entraxe : 200 mm', 'tiges-300': 'Tige de 16/18 mm — Entraxe : 300 mm', reservation: 'Ouverture : 140 mm ou sur demande' } },
  '800x800x800': { label: '800 × 800 × 800 mm', weight: 1228, prices: { reservation: 217.30, tiges: 231.40, 'tiges-300': 231.40 }, specs: { tiges: 'Tige de 18/24 mm — Entraxe : 200 mm', 'tiges-300': 'Tige de 18/24 mm — Entraxe : 300 mm', reservation: 'Ouverture : 280/320 mm' } },
  '1000x1000x800': { label: '1000 × 1000 × 800 mm', weight: 1920, prices: { reservation: 0, tiges: 0, 'tiges-300': 0 }, specs: { tiges: 'Tige de 18/24 mm — Entraxe : 200 mm', 'tiges-300': 'Tige de 18/24 mm — Entraxe : 300 mm', reservation: 'Ouverture : 280/320 mm' } },
  '1000x1000x1000': { label: '1000 × 1000 × 1000 mm', weight: 2400, prices: { reservation: 317.00, tiges: 335.00, 'tiges-300': 335.00 }, specs: { tiges: 'Tige de 18/24 mm — Entraxe : 200 mm', 'tiges-300': 'Tige de 18/24 mm — Entraxe : 300 mm', reservation: 'Ouverture : 280/320 mm' } },
  '1200x1200x800': { label: '1200 × 1200 × 800 mm', weight: 2765, prices: { reservation: 0, tiges: 0, 'tiges-300': 0 }, specs: { tiges: 'Tige de 18/24 mm — Entraxe : 200 mm', 'tiges-300': 'Tige de 18/24 mm — Entraxe : 300 mm', reservation: 'Ouverture : 280/320 mm' } },
};

const MASSIF_DATA_LEGO: Record<string, MassifDef> = {
  '800x400x400': { label: '80 × 40 × 40 cm', weight: 300, prices: { aucun: 85.00 }, specs: { aucun: 'Lego emboîtable — 0,3 T' } },
  '800x400x800': { label: '80 × 40 × 80 cm', weight: 600, prices: { aucun: 145.00 }, specs: { aucun: 'Lego emboîtable — 0,6 T' } },
  '800x400x1200': { label: '80 × 40 × 120 cm', weight: 900, prices: { aucun: 195.00 }, specs: { aucun: 'Lego emboîtable — 0,9 T' } },
  '800x400x1600': { label: '80 × 40 × 160 cm', weight: 1200, prices: { aucun: 245.00 }, specs: { aucun: 'Lego emboîtable — 1,2 T' } },
  '800x800x400': { label: '80 × 80 × 40 cm', weight: 600, prices: { aucun: 155.00 }, specs: { aucun: 'Lego emboîtable — 0,6 T' } },
  '800x800x800_lego': { label: '80 × 80 × 80 cm', weight: 1200, prices: { aucun: 265.00 }, specs: { aucun: 'Lego emboîtable — 1,2 T' } },
  '800x800x1200': { label: '80 × 80 × 120 cm', weight: 1800, prices: { aucun: 375.00 }, specs: { aucun: 'Lego emboîtable — 1,8 T' } },
  '800x800x1600': { label: '80 × 80 × 160 cm', weight: 2400, prices: { aucun: 495.00 }, specs: { aucun: 'Lego emboîtable — 2,4 T' } },
  '600x600x600_lego': { label: '60 × 60 × 60 cm', weight: 500, prices: { aucun: 125.00 }, specs: { aucun: 'Lego emboîtable — 0,5 T' } },
  '600x600x1200': { label: '60 × 60 × 120 cm', weight: 1000, prices: { aucun: 215.00 }, specs: { aucun: 'Lego emboîtable — 1 T' } },
  '600x600x1800': { label: '60 × 60 × 180 cm', weight: 1500, prices: { aucun: 325.00 }, specs: { aucun: 'Lego emboîtable — 1,5 T' } },
  '600x600x2400': { label: '60 × 60 × 240 cm', weight: 2000, prices: { aucun: 425.00 }, specs: { aucun: 'Lego emboîtable — 2 T' } },
  '400x400x1600': { label: '40 × 40 × 160 cm', weight: 600, prices: { aucun: 165.00 }, specs: { aucun: 'Lego emboîtable — 0,6 T' } },
  '400x800x800_lego': { label: '40 × 80 × 80 cm', weight: 300, prices: { aucun: 95.00 }, specs: { aucun: 'Lego emboîtable — 0,3 T' } },
  '400x800x1600': { label: '40 × 80 × 160 cm', weight: 1200, prices: { aucun: 255.00 }, specs: { aucun: 'Lego emboîtable — 1,2 T' } },
};

const MASSIF_DATA_CYLINDRIQUE: Record<string, MassifDef> = {
  'cyl-300x500': { label: 'Ø 300 × H 500 mm', weight: 280, prices: { aucun: 0 }, specs: { aucun: 'Massif cylindrique — 0,28 T' } },
  'cyl-400x600': { label: 'Ø 400 × H 600 mm', weight: 560, prices: { aucun: 0 }, specs: { aucun: 'Massif cylindrique — 0,56 T' } },
  'cyl-500x700': { label: 'Ø 500 × H 700 mm', weight: 1050, prices: { aucun: 0 }, specs: { aucun: 'Massif cylindrique — 1,05 T' } },
  'cyl-600x800': { label: 'Ø 600 × H 800 mm', weight: 1700, prices: { aucun: 0 }, specs: { aucun: 'Massif cylindrique — 1,7 T' } },
  'cyl-700x900': { label: 'Ø 700 × H 900 mm', weight: 2450, prices: { aucun: 0 }, specs: { aucun: 'Massif cylindrique — 2,45 T' } },
};

const MASSIF_DATA_STABILIZE: Record<string, MassifDef> = {
  'stab-600x600x200': { label: '600 × 600 × 200 mm', weight: 170, prices: { aucun: 0 }, specs: { aucun: 'Dalle stabilisatrice — 0,17 T' } },
  'stab-800x800x200': { label: '800 × 800 × 200 mm', weight: 300, prices: { aucun: 0 }, specs: { aucun: 'Dalle stabilisatrice — 0,3 T' } },
  'stab-1000x600x250': { label: '1000 × 600 × 250 mm', weight: 450, prices: { aucun: 0 }, specs: { aucun: 'Dalle stabilisatrice — 0,45 T' } },
  'stab-1200x800x250': { label: '1200 × 800 × 250 mm', weight: 720, prices: { aucun: 0 }, specs: { aucun: 'Dalle stabilisatrice — 0,72 T' } },
  'stab-1500x1000x300': { label: '1500 × 1000 × 300 mm', weight: 1350, prices: { aucun: 0 }, specs: { aucun: 'Dalle stabilisatrice — 1,35 T' } },
  'stab-2000x1000x300': { label: '2000 × 1000 × 300 mm', weight: 1800, prices: { aucun: 0 }, specs: { aucun: 'Dalle stabilisatrice — 1,8 T' } },
};

const MASSIF_DATA_CANDELABRE: Record<string, MassifDef> = {
  'cand-500x500x800': { label: '500 × 500 × 800 mm', weight: 470, prices: { aucun: 0 }, specs: { aucun: 'Socle candélabre — Ø platine : sur demande' } },
  'cand-600x600x900': { label: '600 × 600 × 900 mm', weight: 780, prices: { aucun: 0 }, specs: { aucun: 'Socle candélabre — Ø platine : sur demande' } },
  'cand-700x700x1000': { label: '700 × 700 × 1000 mm', weight: 1200, prices: { aucun: 0 }, specs: { aucun: 'Socle candélabre — Ø platine : sur demande' } },
  'cand-800x800x1000': { label: '800 × 800 × 1000 mm', weight: 1900, prices: { aucun: 0 }, specs: { aucun: 'Socle candélabre — Ø platine : sur demande' } },
  'cand-900x900x1100': { label: '900 × 900 × 1100 mm', weight: 2650, prices: { aucun: 0 }, specs: { aucun: 'Socle candélabre — Ø platine : sur demande' } },
};

export const ALL_FAMILIES: { type: MassifType; label: string; description: string }[] = [
  { type: 'cubique', label: 'Cubique', description: 'Avec réservation ou tiges filetées' },
  { type: 'lego', label: 'Lego', description: 'Emboîtable modulaire' },
  { type: 'cylindrique', label: 'Cylindrique', description: 'Massif de fondation cylindrique' },
  { type: 'stabilize', label: 'Stabilize', description: 'Dalle stabilisatrice de surface' },
  { type: 'candelabre', label: 'Candélabre', description: 'Socle pour mât ou candélabre' },
];

export interface WeightBand { id: string; label: string; sublabel: string; min: number; max: number; }

export const WEIGHT_BANDS: WeightBand[] = [
  { id: 'w1', label: '< 300 kg', sublabel: 'Moins de 0,3 tonne', min: 0, max: 299 },
  { id: 'w2', label: '300 – 750 kg', sublabel: '0,3 à 0,75 tonne', min: 300, max: 750 },
  { id: 'w3', label: '750 kg – 1,5 T', sublabel: '0,75 à 1,5 tonne', min: 751, max: 1500 },
  { id: 'w4', label: '1,5 T – 2,5 T', sublabel: '1,5 à 2,5 tonnes', min: 1501, max: 2500 },
  { id: 'w5', label: '> 2,5 T', sublabel: 'Plus de 2,5 tonnes', min: 2501, max: Infinity },
];

export function getDataSet(type: MassifType): Record<string, MassifDef> {
  switch (type) {
    case 'cubique': return MASSIF_DATA_CUBIQUE;
    case 'lego': return MASSIF_DATA_LEGO;
    case 'cylindrique': return MASSIF_DATA_CYLINDRIQUE;
    case 'stabilize': return MASSIF_DATA_STABILIZE;
    case 'candelabre': return MASSIF_DATA_CANDELABRE;
  }
}

function getFilteredDimensions(type: MassifType, band: WeightBand): string[] {
  return Object.entries(getDataSet(type))
    .filter(([, def]) => def.weight >= band.min && def.weight <= band.max)
    .map(([key]) => key);
}

function familyHasItems(type: MassifType, band: WeightBand): boolean {
  return getFilteredDimensions(type, band).length > 0;
}

export function familyImage(type: MassifType): any {
  return type === 'lego' ? massifLegoImg : massifImg;
}

type ItemStep = 1 | 2 | 3;

interface ItemState {
  id: string;
  step: ItemStep;
  weightBandId: string | null;
  type: MassifType | null;
  dimension: MassifDimension | null;
  option: MassifOption;
  quantity: number;
}

export function MassifCalculator({ initialConfig, onCalculate }: MassifCalculatorProps) {
  const navigate = useNavigate();
  const { addItems } = useCart();

  const [deliveryPostalCode, setDeliveryPostalCode] = useState('');
  const [deliveryCountry, setDeliveryCountry] = useState('France');
  const [deliveryInfoValidated, setDeliveryInfoValidated] = useState(false);
  const [deliveryFormOpen, setDeliveryFormOpen] = useState(false);
  const [postalCodeError, setPostalCodeError] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('deliveryInfo');
    if (saved) {
      const { postalCode, country } = JSON.parse(saved);
      setDeliveryPostalCode(postalCode ?? '');
      setDeliveryCountry(country ?? 'France');
      setDeliveryInfoValidated(true);
    }
  }, []);

  const validatePostalCode = (code: string, country: string) => {
    const rule = POSTAL_RULES[country];
    return rule ? rule.pattern.test(code.trim()) : code.trim().length > 0;
  };

  const buildInitialItems = (): ItemState[] => {
    if (initialConfig?.items?.length) {
      return initialConfig.items.map(item => {
        const data = getDataSet(item.type)[item.dimension];
        const band = data ? WEIGHT_BANDS.find(b => data.weight >= b.min && data.weight <= b.max) : null;
        return { id: item.id, step: 3 as ItemStep, weightBandId: band?.id ?? null, type: item.type, dimension: item.dimension, option: item.option, quantity: item.quantity };
      });
    }
    return [{ id: '1', step: 1, weightBandId: null, type: null, dimension: null, option: 'reservation', quantity: 1 }];
  };

  const [items, setItems] = useState<ItemState[]>(buildInitialItems);

  const update = (id: string, patch: Partial<ItemState>) =>
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it));

  const addItem = () => setItems(prev => [...prev, {
    id: Date.now().toString(), step: 1, weightBandId: null, type: null, dimension: null, option: 'reservation', quantity: 1,
  }]);

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(prev => prev.filter(it => it.id !== id));
  };

  const completedItems = items.filter(it => it.step === 3 && it.type && it.dimension);

  // Première famille configurée (pour le hero)
  const firstCompleted = completedItems[0];
  const heroType = firstCompleted?.type ?? items.find(it => it.type)?.type ?? null;

  const totalWeight = useMemo(() =>
    completedItems.reduce((sum, it) => {
      const data = getDataSet(it.type!)[it.dimension!];
      return data ? sum + data.weight * it.quantity : sum;
    }, 0), [completedItems]);

  const totalPrice = useMemo(() =>
    completedItems.reduce((sum, it) => {
      const data = getDataSet(it.type!)[it.dimension!];
      const price = data?.prices[it.option] ?? 0;
      return sum + price * it.quantity;
    }, 0), [completedItems]);

  const trucksCount = useMemo(() => {
    if (totalWeight === 0) return 1;
    if (totalWeight <= TRUCK_CAPACITY * 1.02) return 1;
    return Math.ceil(totalWeight / TRUCK_CAPACITY);
  }, [totalWeight]);

  const truckFills = useMemo(() => {
    if (totalWeight === 0) return [0];
    const fills = [];
    let remaining = totalWeight;
    for (let i = 0; i < trucksCount; i++) {
      const currentLoad = Math.min(remaining, TRUCK_CAPACITY);
      const displayLoad = (trucksCount === 1 && totalWeight > TRUCK_CAPACITY) ? totalWeight : currentLoad;
      fills.push(Math.round((displayLoad / TRUCK_CAPACITY) * 100));
      remaining -= currentLoad;
    }
    return fills;
  }, [totalWeight, trucksCount]);

  const handleAddToCart = () => {
    if (!completedItems.length) return;

    // Synchronise l'adresse de livraison avec le code postal saisi sur cette page,
    // en préservant rue/ville si une adresse complète existait déjà.
    const existingAddressRaw = localStorage.getItem('deliveryAddress');
    const existingAddress = existingAddressRaw ? JSON.parse(existingAddressRaw) : {};
    localStorage.setItem('deliveryAddress', JSON.stringify({
      ...existingAddress,
      postalCode: deliveryPostalCode,
      country: deliveryCountry,
    }));
    localStorage.setItem('deliveryInfo', JSON.stringify({ postalCode: deliveryPostalCode, country: deliveryCountry }));

    const cartItems = completedItems.map(it => {
      const data = getDataSet(it.type!)[it.dimension!];
      const familyMeta = ALL_FAMILIES.find(f => f.type === it.type)!;
      const price = data?.prices[it.option] ?? 0;
      const optionLabel = it.option === 'reservation' ? 'Avec réservation' : it.option === 'tiges' ? 'Tiges filetées — Entraxe 200 mm' : it.option === 'tiges-300' ? 'Tiges filetées — Entraxe 300 mm' : '';
      return {
        id: `massif-${it.type}-${it.dimension}-${it.option}`,
        type: 'massif' as const,
        name: `Massif ${familyMeta.label} — ${data?.label ?? ''}${optionLabel ? ` (${optionLabel})` : ''}`,
        price,
        quantity: it.quantity,
        details: {
          itemType: 'massif',
          family: it.type,
          dimension: it.dimension,
          option: it.option,
          weight: data?.weight ?? 0,
          totalWeight,
        },
      };
    });
    addItems(cartItems);
  };

  return (
    <div className="max-w-6xl mx-auto pt-20 px-4">
      <div className="mb-8">
        <Button variant="outline" onClick={() => navigate('/massif/selection')} className="border border-gray-300">
          ← Retour à la sélection
        </Button>
      </div>

      <div>
        {/* Hero image */}
        <div className="relative h-48 overflow-hidden bg-gray-100 rounded-t-xl">
          <ImageWithFallback
            src={heroType ? familyImage(heroType) : massifImg}
            alt="Massif béton"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-6">
            <span className="bg-white/90 backdrop-blur-sm text-black text-xs font-bold px-3 py-1 rounded-full">
              Massif béton
            </span>
          </div>
        </div>

        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-black">Massif béton</h1>

          <div className="grid md:grid-cols-2 gap-10">

            {/* ── COLONNE GAUCHE : Description & Caractéristiques ── */}
            <div>
              <p className="text-sm text-gray-700 leading-relaxed mb-6">
                Lestage béton permettant de stabiliser des dispositifs extérieurs. Disponible en 5 familles —
                Cubique, Lego, Cylindrique, Stabilize et Candélabre — pour répondre à toutes les configurations de chantier.
                Livraison par camion de 24 tonnes, installation possible sur devis.
              </p>

              <h4 className="font-bold mb-4 text-black text-lg">Caractéristiques</h4>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600 font-medium">Familles disponibles</span>
                  <span className="text-black font-semibold">5 gammes</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600 font-medium">Plage de poids</span>
                  <span className="text-black font-semibold">280 kg – 2 765 kg</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600 font-medium">Transport</span>
                  <span className="text-black font-semibold">Camion 24 T</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600 font-medium">Options cubique</span>
                  <span className="text-black font-semibold">Réservation / Tiges filetées</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Délai</span>
                  <span className="text-black font-semibold">À confirmer selon stock</span>
                </div>
              </div>

            </div>

            {/* ── COLONNE DROITE : Configuration ── */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-black text-lg">Configuration</h4>
              </div>

              <div className="space-y-4">
                {items.map((item, idx) => {
                  const band = item.weightBandId ? WEIGHT_BANDS.find(b => b.id === item.weightBandId) : null;
                  const dataSet = item.type ? getDataSet(item.type) : MASSIF_DATA_CUBIQUE;
                  const data = item.dimension ? dataSet[item.dimension] : null;
                  const price = data && item.option ? (data.prices[item.option] ?? 0) : 0;
                  const spec = data && item.option ? (data.specs[item.option] ?? '') : '';
                  const familyMeta = item.type ? ALL_FAMILIES.find(f => f.type === item.type) : null;

                  return (
                    <Card key={item.id} className="border border-gray-300 bg-gray-50">
                      <CardContent className="p-4">
                        {/* En-tête ligne */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</div>
                            <span className="font-semibold text-sm text-gray-800">
                              {item.step === 3 && familyMeta && data
                                ? `${familyMeta.label} — ${data.label}`
                                : item.step === 2 ? 'Famille de massif'
                                : 'Poids recherché'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3].map(s => (
                              <div key={s} className={cn(
                                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all',
                                item.step > s ? 'bg-black border-black text-white'
                                  : item.step === s ? 'bg-white border-black text-black'
                                  : 'bg-white border-gray-300 text-gray-400'
                              )}>
                                {item.step > s ? <Check className="w-2.5 h-2.5" /> : s}
                              </div>
                            ))}
                            {items.length > 1 && (
                              <button type="button" onClick={() => removeItem(item.id)} className="ml-1 text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* ÉTAPE 1 : Poids */}
                        {item.step === 1 && (
                          <div className="grid grid-cols-2 gap-2">
                            {WEIGHT_BANDS.map(wb => {
                              const available = ALL_FAMILIES.filter(f => familyHasItems(f.type, wb));
                              const hasAny = available.length > 0;
                              return (
                                <button
                                  key={wb.id}
                                  type="button"
                                  onClick={() => hasAny && update(item.id, { weightBandId: wb.id, step: 2, type: null, dimension: null })}
                                  className={cn(
                                    'flex flex-col items-start p-3 border rounded-lg transition-all text-left',
                                    hasAny
                                      ? 'border-gray-200 bg-white hover:border-black hover:shadow-sm cursor-pointer'
                                      : 'border-dashed border-gray-200 bg-white opacity-50 cursor-not-allowed'
                                  )}
                                >
                                  <span className="font-bold text-sm text-gray-900">{wb.label}</span>
                                  <span className="text-xs text-gray-500 mt-0.5">{wb.sublabel}</span>
                                  {!hasAny && <span className="text-[10px] text-gray-400 mt-1 italic">Bientôt disponible</span>}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* ÉTAPE 2 : Famille */}
                        {item.step === 2 && band && (
                          <div>
                            <button type="button" onClick={() => update(item.id, { step: 1, type: null, dimension: null })} className="flex items-center gap-1 text-xs text-gray-500 hover:text-black mb-3 transition-colors">
                              <ChevronLeft className="w-3 h-3" /> Retour au poids
                            </button>
                            <p className="text-xs text-gray-500 mb-3">Pour <strong className="text-gray-900">{band.label}</strong></p>
                            <div className="space-y-2">
                              {ALL_FAMILIES.map(({ type: fam, label: famLabel, description: famDesc }) => {
                                const dims = getFilteredDimensions(fam, band);
                                if (!dims.length) return null;
                                const ds = getDataSet(fam);
                                return (
                                  <button
                                    key={fam}
                                    type="button"
                                    onClick={() => update(item.id, { type: fam, dimension: dims[0], option: fam === 'cubique' ? 'reservation' : 'aucun', step: 3 })}
                                    className="flex items-center gap-3 p-3 border border-gray-200 bg-white rounded-lg hover:border-black hover:shadow-sm transition-all text-left w-full"
                                  >
                                    <div className="w-10 h-10 rounded overflow-hidden border border-gray-100 shrink-0">
                                      <ImageWithFallback src={familyImage(fam)} alt={famLabel} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-gray-900 text-sm">{famLabel}</p>
                                      <p className="text-xs text-gray-500">{famDesc}</p>
                                      <p className="text-xs text-gray-400 mt-0.5 truncate">{dims.map(d => ds[d].weight + ' kg').join(' · ')}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* ÉTAPE 3 : Options + quantité */}
                        {item.step === 3 && item.type && item.dimension && band && (
                          <div className="space-y-4">
                            <button type="button" onClick={() => update(item.id, { step: 2, dimension: null })} className="flex items-center gap-1 text-xs text-gray-500 hover:text-black transition-colors">
                              <ChevronLeft className="w-3 h-3" /> Retour à la famille
                            </button>

                            {/* Dimensions */}
                            <div>
                              <Label className="text-xs font-bold text-gray-700 mb-2 block">Dimensions</Label>
                              <div className="flex flex-wrap gap-1.5">
                                {getFilteredDimensions(item.type, band).map(dimKey => {
                                  const ds = getDataSet(item.type!);
                                  return (
                                    <button
                                      key={dimKey}
                                      type="button"
                                      onClick={() => update(item.id, { dimension: dimKey })}
                                      className={cn(
                                        'flex flex-col items-start px-3 py-2 rounded-lg border text-xs transition-all',
                                        item.dimension === dimKey ? 'bg-black border-black text-white' : 'border-gray-300 bg-white hover:border-black text-gray-700'
                                      )}
                                    >
                                      <span className="font-semibold">{ds[dimKey].label}</span>
                                      <span className={cn('mt-0.5', item.dimension === dimKey ? 'text-gray-300' : 'text-gray-500')}>{ds[dimKey].weight} kg</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Option technique (cubique uniquement) */}
                            {item.type === 'cubique' && (
                              <div>
                                <Label className="text-xs font-bold text-gray-700 mb-2 block">Option technique</Label>
                                <div className="grid grid-cols-1 gap-2">
                                  {([
                                    { value: 'reservation' as MassifOption, label: 'Avec réservation', sub: 'Ouverture dans le massif' },
                                    { value: 'tiges' as MassifOption, label: 'Avec tiges filetées', sub: 'Entraxe 200 mm' },
                                    { value: 'tiges-300' as MassifOption, label: 'Avec tiges filetées', sub: 'Entraxe 300 mm' },
                                  ]).map(opt => (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      onClick={() => update(item.id, { option: opt.value })}
                                      className={cn(
                                        'flex items-center justify-between p-3 rounded-lg border text-left transition-all',
                                        item.option === opt.value ? 'bg-black border-black text-white' : 'border-gray-300 bg-white hover:border-black text-gray-700'
                                      )}
                                    >
                                      <span className="font-semibold text-xs">{opt.label}</span>
                                      <span className={cn('text-[10px]', item.option === opt.value ? 'text-gray-300' : 'text-gray-500')}>{opt.sub}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Spec */}
                            {spec && (
                              <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-gray-200">
                                <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-gray-600">{spec}</p>
                              </div>
                            )}

                            {/* Quantité */}
                            <div className="pt-2 border-t border-gray-100">
                              <Label className="text-xs font-bold text-gray-700 mb-1.5 block">Quantité</Label>
                              <div className="flex items-center gap-3">
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={e => update(item.id, { quantity: parseInt(e.target.value) || 1 })}
                                  className="w-20 h-10 border-gray-300 font-bold text-center"
                                />
                                {data && (
                                  <span className="text-xs text-gray-500">{(data.weight * item.quantity / 1000).toFixed(2)} t</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Jauge camion */}
              {totalWeight > 0 && (
                <Card className="border border-gray-200 bg-gray-50">
                  <CardContent className="p-4">
                    <h4 className="font-bold text-black text-sm mb-3 flex items-center gap-2">
                      <Truck className="w-4 h-4" /> Remplissage camion ({trucksCount} camion{trucksCount > 1 ? 's' : ''} · 24 T)
                    </h4>
                    <div className="space-y-2">
                      {truckFills.map((fill, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold uppercase text-black">
                            <span>Camion {idx + 1}</span>
                            <span className={fill >= 95 ? 'text-emerald-600' : 'text-gray-500'}>{fill}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={cn('h-full transition-all duration-500 rounded-full', fill >= 95 ? 'bg-emerald-500' : 'bg-gray-400')}
                              style={{ width: `${Math.min(fill, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    {truckFills[truckFills.length - 1] < 90 && totalWeight > 0 && (
                      <p className="text-[11px] text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-2 mt-3">
                        <Info className="w-3 h-3 inline mr-1" />
                        Le camion n'est rempli qu'à <strong>{truckFills[truckFills.length - 1]}%</strong>. Optimisez le transport en complétant votre commande.
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Poids total : {(totalWeight / 1000).toFixed(2)} t</p>
                  </CardContent>
                </Card>
              )}

              {/* Livraison */}
              <Card className="border border-gray-300 bg-gray-50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Label className="text-black font-bold block">Localisation de livraison</Label>
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-bold text-black text-sm">Livraison</div>
                          {deliveryInfoValidated && (
                            <div className="text-sm mt-1 text-gray-600">{deliveryPostalCode}, {deliveryCountry}</div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeliveryFormOpen(!deliveryFormOpen)}
                          className="text-black hover:text-gray-700 transition-colors"
                        >
                          <ChevronRight className={cn('w-5 h-5 transition-transform', deliveryFormOpen ? 'rotate-90' : '')} />
                        </button>
                      </div>
                      {deliveryFormOpen && (
                        <div className="mt-3 space-y-3">
                          <div>
                            <Label className="text-black text-sm mb-1 block">Code postal <span className="text-red-500">*</span></Label>
                            <Input
                              type="text"
                              value={deliveryPostalCode}
                              onChange={e => { setDeliveryPostalCode(e.target.value); setPostalCodeError(false); }}
                              placeholder={POSTAL_RULES[deliveryCountry]?.example ?? ''}
                              className={cn('border text-black', postalCodeError ? 'border-red-500' : 'border-gray-300')}
                            />
                            {postalCodeError && (
                              <p className="text-red-600 text-xs mt-1">
                                Veuillez saisir un code postal valide (par ex. : {POSTAL_RULES[deliveryCountry]?.example ?? ''}).
                              </p>
                            )}
                          </div>
                          <div>
                            <Label className="text-black text-sm mb-1 block">Pays</Label>
                            <Select value={deliveryCountry} onValueChange={val => { setDeliveryCountry(val); setPostalCodeError(false); }}>
                              <SelectTrigger className="border border-gray-300 bg-white">
                                <SelectValue placeholder="Sélectionnez un pays" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(POSTAL_RULES).map(c => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <p className="text-xs text-gray-500 italic">L'adresse complète sera renseignée lors de la commande</p>
                          <Button
                            type="button"
                            onClick={() => {
                              if (!validatePostalCode(deliveryPostalCode, deliveryCountry)) {
                                setPostalCodeError(true);
                                return;
                              }
                              setPostalCodeError(false);
                              setDeliveryInfoValidated(true);
                              setDeliveryFormOpen(false);
                              localStorage.setItem('deliveryInfo', JSON.stringify({ postalCode: deliveryPostalCode, country: deliveryCountry }));
                            }}
                            disabled={!deliveryPostalCode || !deliveryCountry}
                            className="w-full bg-black hover:bg-gray-800 text-white"
                          >
                            Valider
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!deliveryInfoValidated && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-center">
                  Veuillez renseigner votre code postal et votre pays dans la section <strong>Localisation de livraison</strong> avant d'ajouter au panier.
                </p>
              )}

              {/* Bouton Ajouter au panier */}
              <Button
                onClick={handleAddToCart}
                disabled={completedItems.length === 0 || !deliveryInfoValidated}
                className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Ajouter au panier
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
