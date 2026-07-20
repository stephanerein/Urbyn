import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Wrench, Truck, Users, Calculator as CalculatorIcon, Palette, Shield, Scale } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowRight, Plus, X, Info, HelpCircle, Trash2, TrendingUp, ChevronLeft } from 'lucide-react';
import { ProgressSteps } from './ProgressSteps';
import { RALSelector } from './RALSelector';
import { MATERIAL_PRICES, INSTALLATION_PRICE_PER_M2, INSTALLATION_MINIMUM } from '../lib/pricing';
import type {
  HoardingConfig,
  MaterialType,
  MaterialSelection,
  RALColor,
  PortailSelection,
  PortillonSelection,
  PortailType,
  PortillonType,
  ServicesAccompagnement,
  DibondLamination
} from '../types';

interface CalculatorProps {
  projectType: 'habillage' | 'montage';
  onCalculate: (config: HoardingConfig) => void;
}

const MATERIAL_CO2 = {
  dibond: 10.38,
  tole: 1.33,
  bois: 0.45,
  vegetal: 2.1
} as const;

const MATERIAL_CO2_LABELS = {
  dibond: '10,38 kgCO2e/m²',
  tole: '1,33 kgCO2e/m²',
  bois: '0,45 kgCO2e/m²',
  vegetal: '2,1 kgCO2e/m²'
};

const DIBOND_LAMINATION_LABELS: Record<DibondLamination, string> = {
  'mate': 'Lamination mate',
  'satin': 'Lamination satin',
  'brillante': 'Lamination brillante',
  'brillante-antigraffiti': 'Lamination brillante anti-graffiti'
};

const PORTAIL_LABELS: Record<PortailType, string> = {
  galvanise_4m_battant: 'Battant 4m (Galvanisé)',
  galvanise_5m_battant: 'Battant 5m (Galvanisé)',
  galvanise_6m_battant: 'Battant 6m (Galvanisé)',
  galvanise_4m_coulissant: 'Coulissant 4m (Galvanisé)',
  galvanise_5m_coulissant: 'Coulissant 5m (Galvanisé)',
  galvanise_6m_coulissant: 'Coulissant 6m (Galvanisé)',
  galvanise_7m_coulissant: 'Coulissant 7m (Galvanisé)'
};

const PORTILLON_LABELS: Record<PortillonType, string> = {
  bois_0_9m: 'Bois 0.9m',
  bois_1_4m: 'Bois 1.4m',
  galvanise_0_9m: 'Galvanisé 0.9m',
  galvanise_1_4m: 'Galvanisé 1.4m'
};

const VEGETAL_OPTIONS = {
  feuillage: [
    { value: 'buis', label: 'Buis' },
    { value: 'fougere', label: 'Fougère' },
    { value: 'primevere', label: 'Primevère' },
    { value: 'cypres_vert', label: 'Cyprès vert' },
    { value: 'buisson_intense', label: 'Buisson intense' },
    { value: 'laurier_rouge', label: 'Laurier rouge' },
    { value: 'lierre', label: 'Lierre' },
    { value: 'laurier_cerise', label: 'Laurier cerise' }
  ],
  mur: [
    { value: 'jasmin', label: 'Jasmin' },
    { value: 'oxygene', label: 'Oxygène' },
    { value: 'serenite', label: 'Sérénité' },
    { value: 'harmonie', label: 'Harmonie' },
    { value: 'mango_green', label: 'Mango green' },
    { value: 'tropical', label: 'Tropical' },
    { value: 'savane', label: 'Savane' },
    { value: 'liseron_blanc', label: 'Liseron blanc' },
    { value: 'bougainvillier', label: 'Bougainvillier' }
  ]
} as const;

const SATURATOR_COVERAGE = 40; // m² par pot de 5L

const EXPERTISE_LABELS: Record<string, string> = {
  'bet': 'Bureau d\'étude BET',
  'validation-graphisme': 'Validation graphisme',
  'direction-artistique': 'Direction artistique',
  'execution-graphique': 'Exécution graphique',
  'autorisation-cerfa': 'Demande d\'autorisation pré-enseigne',
  'declaration-voirie': 'Déclaration de voirie'
};

const getEncouragingMessage = (surfaceInM2: number): string => {
  if (surfaceInM2 >= 400) return "C'est un projet monumental ! Nous sommes honorés de vous accompagner.";
  if (surfaceInM2 >= 200) return "C'est un projet d'envergure ! Nous sommes ravis de pouvoir vous accompagner.";
  if (surfaceInM2 >= 80) return "C'est un beau projet ! Nous sommes ravis de pouvoir vous accompagner.";
  return "C'est un projet intéressant ! Nous sommes ravis de pouvoir vous accompagner.";
};

export function Calculator({ projectType, onCalculate }: CalculatorProps) {
  const navigate = useNavigate();
  const [height, setHeight] = useState<string>('2');
  const [length, setLength] = useState<string>('');
  const [materials, setMaterials] = useState<MaterialSelection[]>([
    { type: 'dibond', length: 0, surface: 0, dibondLamination: 'satin' }
  ]);

  // Récupérer les services depuis sessionStorage
  const [servicesAccompagnement, setServicesAccompagnement] = useState<ServicesAccompagnement>({});

  // includeInstaller est maintenant géré par le service conseil
  const includeInstaller = servicesAccompagnement?.conseil ? true : false;

  useEffect(() => {
    const stored = sessionStorage.getItem('servicesAccompagnement');
    if (stored) {
      setServicesAccompagnement(JSON.parse(stored));
    }
  }, []);

  // Fonction pour mettre à jour les services
  const toggleService = (serviceKey: keyof ServicesAccompagnement, value?: any) => {
    const updated = { ...servicesAccompagnement };

    if (serviceKey === 'toolkit' || serviceKey === 'transport') {
      if (updated[serviceKey]) {
        delete updated[serviceKey];
      } else {
        updated[serviceKey] = true;
      }
    } else if (serviceKey === 'conseil') {
      if (updated.conseil) {
        delete updated.conseil;
      } else {
        updated.conseil = ['etude-complete', 'preparation-deploiement', 'deploiement-terrain'];
      }
    } else if (serviceKey === 'expertises') {
      if (!updated.expertises) {
        updated.expertises = [];
      }
      const expertiseValue = value as string;
      const index = updated.expertises.indexOf(expertiseValue);
      if (index > -1) {
        updated.expertises.splice(index, 1);
        if (updated.expertises.length === 0) {
          delete updated.expertises;
        }
      } else {
        updated.expertises.push(expertiseValue);
      }
    }

    setServicesAccompagnement(updated);
    sessionStorage.setItem('servicesAccompagnement', JSON.stringify(updated));
  };

  // Montage specific states
  const [soilEnrobe, setSoilEnrobe] = useState<string>('');
  const [soilMeuble, setSoilMeuble] = useState<string>('');
  const [portailsSelections, setPortailsSelections] = useState<PortailSelection[]>([]);
  const [portillonsSelections, setPortillonsSelections] = useState<PortillonSelection[]>([]);

  const totalSoilLength = (parseFloat(soilEnrobe) || 0) + (parseFloat(soilMeuble) || 0);

  const calculateSaturatorPots = (materialIndex: number): number => {
    const mat = materials[materialIndex];
    if (mat.type !== 'bois') return 0;
    const surface = mat.surface || 0;
    return Math.ceil(surface / SATURATOR_COVERAGE);
  };

  const addPortail = () => {
    setPortailsSelections([...portailsSelections, { type: 'galvanise_4m_battant' }]);
  };

  const removePortail = (index: number) => {
    setPortailsSelections(portailsSelections.filter((_, i) => i !== index));
  };

  const updatePortail = (index: number, type: PortailType) => {
    const updated = [...portailsSelections];
    updated[index] = { type };
    setPortailsSelections(updated);
  };

  const addPortillon = () => {
    setPortillonsSelections([...portillonsSelections, { type: 'galvanise_0_9m' }]);
  };

  const removePortillon = (index: number) => {
    setPortillonsSelections(portillonsSelections.filter((_, i) => i !== index));
  };

  const updatePortillon = (index: number, type: PortillonType) => {
    const updated = [...portillonsSelections];
    updated[index] = { type };
    setPortillonsSelections(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const heightNum = parseFloat(height);
    if (!heightNum || heightNum < 2 || heightNum > 4.5) {
      alert('La hauteur doit être entre 2 et 4,5 mètres');
      return;
    }

    if (projectType === 'habillage') {
      const validMaterials = materials.filter(m => (m.surface || 0) > 0);
      if (validMaterials.length === 0) {
        alert('Veuillez spécifier au moins un type de bardage avec une surface');
        return;
      }

      onCalculate({
        projectType: 'habillage',
        height: heightNum,
        length: parseFloat(length) || 0,
        materials: validMaterials,
        includeInstaller,
        servicesAccompagnement
      });
    } else {
      const totalL = parseFloat(length) || totalSoilLength;
      if (totalL <= 0) {
        alert('Veuillez spécifier la longueur de la palissade');
        return;
      }

      onCalculate({
        projectType: 'montage',
        height: heightNum,
        length: totalL,
        soilEnrobe: parseFloat(soilEnrobe) || 0,
        soilMeuble: parseFloat(soilMeuble) || 0,
        portails: portailsSelections.length,
        portailsSelections,
        portillons: portillonsSelections.length,
        portillonsSelections,
        materials: materials.map(m => ({ ...m, length: m.length || totalL })),
        includeInstaller,
        servicesAccompagnement
      });
    }
  };

  const addMaterial = () => {
    if (materials.length < 3) {
      setMaterials([...materials, { type: 'dibond', length: 0, surface: 0, dibondLamination: 'satin' }]);
    }
  };

  const removeMaterial = (index: number) => {
    if (materials.length > 1) {
      setMaterials(materials.filter((_, i) => i !== index));
    }
  };

  const updateMaterial = (index: number, updates: Partial<MaterialSelection>) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], ...updates };
    setMaterials(updated);
  };

  const isHabillage = projectType === 'habillage';
  const heightNum = parseFloat(height) || 0;

  // Calcul du CO2 global dynamique pour l'affichage temps réel
  const globalCO2 = materials.reduce((acc, mat) => {
    return acc + (mat.surface || 0) * MATERIAL_CO2[mat.type];
  }, 0);

  return (
    <div className="bg-background min-h-screen pt-[73px]">
      <ProgressSteps currentStep={3} />

      <div className="max-w-3xl mx-auto pt-8 pb-12">
        {/* Bouton retour */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/services-additionnels/palissade')}
            className="border-2 border-primary text-primary"
          >
            ← Retour aux services
          </Button>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8 md:p-12">
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2 text-foreground">
                {isHabillage ? 'Habiller une palissade' : 'Monter + habiller une palissade'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Remplissez les informations ci-dessous pour obtenir votre estimation {isHabillage ? 'd\'habillage' : 'complète'}
              </p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-10 mt-8">
            {/* SECTION 1 - LES DIMENSIONS */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-foreground mb-1 pb-2 border-b-2 border-border">
                  1 - Les dimensions
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="length" className="text-sm font-medium text-foreground">
                    Longueur totale (mètres linéaires)
                  </Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="10"
                    value={isHabillage ? length : (length || totalSoilLength || '')}
                    onChange={(e) => setLength(e.target.value)}
                    className="h-14 text-lg border-border focus:border-primary focus:ring-primary"
                    required={isHabillage}
                    disabled={!isHabillage && totalSoilLength > 0}
                  />
                  {!isHabillage && totalSoilLength > 0 && (
                    <p className="text-[10px] text-muted-foreground italic">Calculée automatiquement selon le sol</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="height" className="text-sm font-medium text-foreground">
                    Hauteur (2 à 4,5 mètres)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    min="2"
                    max="4.5"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="h-14 text-lg border-border focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
              </div>

              {!isHabillage && (
                <div className="bg-muted rounded-xl p-6 border-2 border-border space-y-4">
                  <h5 className="font-bold text-foreground text-sm">Typologie du sol</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="soilEnrobe" className="text-xs font-semibold text-foreground">Sol enrobé / bitume (ml)</Label>
                      <Input id="soilEnrobe" type="number" value={soilEnrobe} onChange={(e) => setSoilEnrobe(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="soilMeuble" className="text-xs font-semibold text-foreground">Sol meuble / terre (ml)</Label>
                      <Input id="soilMeuble" type="number" value={soilMeuble} onChange={(e) => setSoilMeuble(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2 - TYPE DE BARDAGE */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-foreground mb-0 pb-2 border-b-2 border-border flex-1">
                  2 - Type de bardage
                </h4>
                {isHabillage && materials.length < 3 && (
                  <Button type="button" variant="outline" size="sm" onClick={addMaterial} className="ml-4">
                    <Plus className="w-4 h-4 mr-1" /> Ajouter
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {materials.map((mat, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-base">Bardage {index + 1}</h5>
                      {isHabillage && materials.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeMaterial(index)} className="h-8 w-8 p-0">
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <RadioGroup value={mat.type} onValueChange={(value) => updateMaterial(index, { type: value as MaterialType })}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Dibond avec options de lamination */}
                        <div className={`p-4 border-2 rounded-lg ${mat.type === 'dibond' ? 'border-primary bg-muted' : 'border-border'}`}>
                          <div className="flex items-start gap-2 mb-3 cursor-pointer" onClick={() => updateMaterial(index, { type: 'dibond' })}>
                            <RadioGroupItem value="dibond" id={`dibond-${index}`} />
                            <div className="flex-1">
                              <Label htmlFor={`dibond-${index}`} className="cursor-pointer font-medium block">Dibond imprimé anti-UV</Label>
                              <span className="text-[10px] text-green-600 font-semibold">{MATERIAL_CO2_LABELS.dibond}</span>
                            </div>
                          </div>

                          {mat.type === 'dibond' && (
                            <div className="ml-6 space-y-2 mt-3 pt-3 border-t border-slate-300">
                              <Label className="text-xs font-semibold text-slate-700">Type de lamination</Label>
                              <RadioGroup
                                value={mat.dibondLamination || 'satin'}
                                onValueChange={(val) => updateMaterial(index, { dibondLamination: val as DibondLamination })}
                              >
                                <div className="flex items-center gap-2">
                                  <RadioGroupItem value="mate" id={`lamination-mate-${index}`} className="h-4 w-4" />
                                  <Label htmlFor={`lamination-mate-${index}`} className="text-xs cursor-pointer">Mate</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <RadioGroupItem value="satin" id={`lamination-satin-${index}`} className="h-4 w-4" />
                                  <Label htmlFor={`lamination-satin-${index}`} className="text-xs cursor-pointer">Satin</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <RadioGroupItem value="brillante" id={`lamination-brillante-${index}`} className="h-4 w-4" />
                                  <Label htmlFor={`lamination-brillante-${index}`} className="text-xs cursor-pointer">Brillante</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <RadioGroupItem value="brillante-antigraffiti" id={`lamination-ag-${index}`} className="h-4 w-4" />
                                  <Label htmlFor={`lamination-ag-${index}`} className="text-xs cursor-pointer">Brillante anti-graffiti (+10€/m²)</Label>
                                </div>
                              </RadioGroup>
                            </div>
                          )}
                        </div>

                        <div className={`p-4 border-2 rounded-lg cursor-pointer ${mat.type === 'tole' ? 'border-primary bg-muted' : 'border-border'}`}>
                          <div className="flex items-start gap-2">
                            <RadioGroupItem value="tole" id={`tole-${index}`} />
                            <div className="flex-1">
                              <Label htmlFor={`tole-${index}`} className="cursor-pointer font-medium block">Tôle ondulée</Label>
                              <span className="text-[10px] text-green-600 font-semibold">{MATERIAL_CO2_LABELS.tole}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`p-4 border-2 rounded-lg cursor-pointer ${mat.type === 'bois' ? 'border-primary bg-muted' : 'border-border'}`}>
                          <div className="flex items-start gap-2">
                            <RadioGroupItem value="bois" id={`bois-${index}`} />
                            <div className="flex-1">
                              <Label htmlFor={`bois-${index}`} className="cursor-pointer font-medium block">Lames de sapin</Label>
                              <span className="text-[10px] text-green-600 font-semibold">{MATERIAL_CO2_LABELS.bois}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`p-4 border-2 rounded-lg cursor-pointer ${mat.type === 'vegetal' ? 'border-primary bg-muted' : 'border-border'}`}>
                          <div className="flex items-start gap-2">
                            <RadioGroupItem value="vegetal" id={`vegetal-${index}`} />
                            <div className="flex-1">
                              <Label htmlFor={`vegetal-${index}`} className="cursor-pointer font-medium block">Végétal synthétique</Label>
                              <span className="text-[10px] text-green-600 font-semibold">{MATERIAL_CO2_LABELS.vegetal}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>

                    {mat.type === 'tole' && (
                      <RALSelector value={mat.ralColor || '9006'} onChange={(val) => updateMaterial(index, { ralColor: val })} />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-foreground mb-2 block">
                          Surface de ce bardage (m²)
                        </Label>
                        <div className="flex flex-col gap-2">
                          <Input
                            type="number"
                            value={mat.surface || ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              updateMaterial(index, { surface: val, length: val / heightNum });
                            }}
                            className="w-32"
                          />
                          {!isHabillage && (
                            <p className="text-[10px] text-muted-foreground italic">
                              Rappel : {((totalSoilLength || parseFloat(length) || 0) * heightNum).toFixed(1)} m² disponibles au total
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-end items-end text-right">
                        <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                          <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">Impact Carbone</p>
                          <p className="text-sm font-bold text-green-900">
                            {(mat.surface ? (mat.surface * MATERIAL_CO2[mat.type]).toFixed(2) : '0.00')} kgCO2e
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3 - ACCÈS (MONTAGE SEULEMENT) */}
            {!isHabillage && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-foreground mb-1 pb-2 border-b-2 border-border">
                    3 - Accès et Ouvrants
                  </h4>
                  <p className="text-xs text-muted-foreground mt-2">Sélectionnez les types de portails et portillons nécessaires.</p>
                </div>

                <div className="space-y-8">
                  {/* Portails Véhicules */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-bold text-foreground">Portails (Véhicules)</Label>
                      <Button type="button" onClick={addPortail} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" /> Ajouter un portail
                      </Button>
                    </div>
                    
                    {portailsSelections.map((selection, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-muted p-4 rounded-lg border border-border">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground mb-1 block">Type de portail {idx + 1}</Label>
                          <Select value={selection.type} onValueChange={(val) => updatePortail(idx, val as PortailType)}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Choisir un type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PORTAIL_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removePortail(idx)} className="mt-5 text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {portailsSelections.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">Aucun portail sélectionné</p>
                    )}
                  </div>

                  {/* Portillons Piétons */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-bold text-foreground">Portillons (Piétons)</Label>
                      <Button type="button" onClick={addPortillon} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" /> Ajouter un portillon
                      </Button>
                    </div>

                    {portillonsSelections.map((selection, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-muted p-4 rounded-lg border border-border">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground mb-1 block">Type de portillon {idx + 1}</Label>
                          <Select value={selection.type} onValueChange={(val) => updatePortillon(idx, val as PortillonType)}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Choisir un type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PORTILLON_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removePortillon(idx)} className="mt-5 text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {portillonsSelections.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">Aucun portillon sélectionné</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION SERVICES */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-foreground mb-1 pb-2 border-b-2 border-border">
                {isHabillage ? '3' : '4'} - Services sélectionnés
              </h4>

              {servicesAccompagnement && Object.keys(servicesAccompagnement).length > 0 ? (
                <div className="space-y-3">
                  {servicesAccompagnement.toolkit && (
                    <div className="flex items-center gap-3 p-4 border-2 border-border rounded-lg bg-muted">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <Wrench className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Fiche d'installation & liste d'approvisionnement</p>
                        <p className="text-xs text-slate-600">Documentation complète pour l'installation</p>
                      </div>
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    </div>
                  )}

                  {servicesAccompagnement.transport && (
                    <div className="flex items-center gap-3 p-4 border-2 border-border rounded-lg bg-muted">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Transport et livraison</p>
                        <p className="text-xs text-slate-600">Acheminement sécurisé sur site</p>
                      </div>
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    </div>
                  )}

                  {servicesAccompagnement.conseil && (
                    <div className="flex items-center gap-3 p-4 border-2 border-border rounded-lg bg-muted">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Pack complet de déploiement</p>
                        <p className="text-xs text-slate-600">Étude, préparation, installation et suivi terrain</p>
                      </div>
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    </div>
                  )}

                  {servicesAccompagnement.expertises && servicesAccompagnement.expertises.length > 0 && (
                    <div className="p-4 border-2 border-slate-200 rounded-lg bg-slate-50">
                      <p className="font-semibold text-sm mb-2">Expertises sélectionnées</p>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {servicesAccompagnement.expertises.map((exp: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-black flex-shrink-0" />
                            <span>{EXPERTISE_LABELS[exp] || exp.replace(/-/g, ' ')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground italic">Aucun service d'accompagnement sélectionné</p>
                  <p className="text-xs text-muted-foreground mt-2">💡 Ajoutez le "Pack complet de déploiement" pour bénéficier de l'installation par Urbyn</p>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-6 border-t-2 border-border">
              <div className="flex items-center justify-between mb-6 bg-secondary text-secondary-foreground p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-secondary-foreground/70 uppercase font-bold tracking-widest">Impact Carbone Global</p>
                    <p className="text-xl font-black">{globalCO2.toFixed(2)} kgCO2e</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-secondary-foreground/70 uppercase font-bold tracking-widest">Surface Totale</p>
                  <p className="text-xl font-black">
                    {isHabillage
                      ? materials.reduce((acc, m) => acc + (m.surface || 0), 0).toFixed(1)
                      : (totalSoilLength || parseFloat(length) || 0).toFixed(1)
                    } {isHabillage ? 'm²' : 'ml'}
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                Continuer vers l'estimation <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Services non sélectionnés */}
      <Card className="border-2 border-border mt-8">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold mb-4 text-foreground">Services complémentaires disponibles</h3>
          <p className="text-sm text-muted-foreground mb-6">Ajoutez des services pour accompagner votre projet</p>

          <div className="space-y-4">
            {/* Toolkit */}
            {!servicesAccompagnement?.toolkit && (
              <div
                onClick={() => toggleService('toolkit')}
                className="flex items-start gap-4 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted transition-all"
              >
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base mb-1">Fiche d'installation & liste d'approvisionnement</h4>
                  <p className="text-sm text-slate-600">Documentation complète pour l'installation de votre solution</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Ajouter</span>
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Transport */}
            {!servicesAccompagnement?.transport && (
              <div
                onClick={() => toggleService('transport')}
                className="flex items-start gap-4 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted transition-all"
              >
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base mb-1">Transport et livraison</h4>
                  <p className="text-sm text-slate-600">Acheminement sécurisé de votre matériel sur site</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Ajouter</span>
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Conseil & Organisation */}
            {!servicesAccompagnement?.conseil && (
              <div
                onClick={() => toggleService('conseil')}
                className="flex items-start gap-4 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted transition-all"
              >
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base mb-1">Pack complet de déploiement</h4>
                  <p className="text-sm text-slate-600">Étude complète (BPF), Préparation du déploiement et Cahier de Pose (CDP), Installation et déploiement terrain (BDR)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Ajouter</span>
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Expertises individuelles */}
            <div className="pt-4 border-t-2 border-border">
              <h4 className="font-bold text-base mb-4 text-foreground">Expertises individuelles</h4>
              <div className="space-y-3">
                {/* BET - Uniquement pour montage */}
                {projectType === 'montage' && (!servicesAccompagnement?.expertises || !servicesAccompagnement.expertises.includes('bet')) && (
                  <div
                    onClick={() => toggleService('expertises', 'bet')}
                    className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted transition-all"
                  >
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <CalculatorIcon className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Bureau d'étude BET</p>
                      <p className="text-xs text-slate-600">Étude technique incluant une note de calcul</p>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                )}

                {/* Validation graphisme */}
                {(!servicesAccompagnement?.expertises || !servicesAccompagnement.expertises.includes('validation-graphisme')) && (
                  <div
                    onClick={() => toggleService('expertises', 'validation-graphisme')}
                    className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted transition-all"
                  >
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Palette className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Validation graphisme</p>
                      <p className="text-xs text-slate-600">Vérification et validation de vos fichiers graphiques</p>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                )}

                {/* Direction artistique */}
                {(!servicesAccompagnement?.expertises || !servicesAccompagnement.expertises.includes('direction-artistique')) && (
                  <div
                    onClick={() => toggleService('expertises', 'direction-artistique')}
                    className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted transition-all"
                  >
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Palette className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Direction artistique</p>
                      <p className="text-xs text-slate-600">Accompagnement créatif pour votre projet</p>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                )}

                {/* Demande d'autorisation pré-enseigne */}
                {(!servicesAccompagnement?.expertises || !servicesAccompagnement.expertises.includes('autorisation-cerfa')) && (
                  <div
                    onClick={() => toggleService('expertises', 'autorisation-cerfa')}
                    className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted transition-all"
                  >
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Demande d'autorisation pré-enseigne</p>
                      <p className="text-xs text-slate-600">Gestion administrative pour l'obtention des autorisations CERFA</p>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                )}

                {/* Déclaration de voirie */}
                {(!servicesAccompagnement?.expertises || !servicesAccompagnement.expertises.includes('declaration-voirie')) && (
                  <div
                    onClick={() => toggleService('expertises', 'declaration-voirie')}
                    className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted transition-all"
                  >
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Scale className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Déclaration de voirie</p>
                      <p className="text-xs text-slate-600">Gestion administrative des déclarations de voirie et d'occupation du domaine public</p>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
