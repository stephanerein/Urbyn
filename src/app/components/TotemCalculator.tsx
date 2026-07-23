import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ArrowRight, Check, Info, Package } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import totemCaissonBoisImg from '../../imports/totem-caisson-bois.jpg';

export type TotemType = 'caisson_bois' | 'gabion' | 'liz';
export type CaissonBoisFormat = '80' | '120' | '160' | '200';

export type PanelOption = {
  enabled: boolean;
  quantity: number;
};

export type TotemItem = {
  id: string;
  totemType: TotemType;
  caissonBoisFormat?: CaissonBoisFormat;
  quantity: number;
  panels?: PanelOption;
  installation?: boolean;
};

export interface TotemConfig {
  items: TotemItem[];
}

interface TotemCalculatorProps {
  onCalculate: (config: TotemConfig) => void;
}

const TOTEM_DATA = {
  caisson_bois: {
    name: 'Totem Caisson Bois',
    description: 'Totem en structure bois avec panneaux interchangeables',
    image: totemCaissonBoisImg,
    formats: {
      '80': {
        label: 'Caisson Bois 80',
        price: 2650,
        dimensions: 'L 88,4 cm x H 210,5 cm x P 90 cm',
        weight: '215 kg',
        footprint: '<1 m²',
        panelSize: '80 x 150 cm',
        panelPrice: 120,
        features: [
          'Structure en bois Douglas classe 4',
          'Panneaux amovibles 80x150cm',
          'Traitement autoclave',
          'Base lestable (à remplir sur site)',
          'Compatible impression UV'
        ]
      },
      '120': {
        label: 'Caisson Bois 120',
        price: 3200,
        dimensions: 'L 128,8 cm x H 210,5 cm x P 90 cm',
        weight: '325 kg',
        footprint: '1,16 m²',
        panelSize: '120 x 150 cm',
        panelPrice: 180,
        features: [
          'Structure en bois Douglas classe 4',
          'Panneaux amovibles 120x150cm',
          'Traitement autoclave',
          'Base lestable (à remplir sur site)',
          'Compatible impression UV'
        ]
      },
      '160': {
        label: 'Caisson Bois 160',
        price: 3960,
        dimensions: 'L 169,2 cm x H 210,5 cm x P 90 cm',
        weight: '432 kg',
        footprint: '1,5 m²',
        panelSize: '160 x 150 cm',
        panelPrice: 240,
        features: [
          'Structure en bois Douglas classe 4',
          'Panneaux amovibles 160x150cm',
          'Traitement autoclave renforcé',
          'Base lestable (à remplir sur site)',
          'Compatible impression UV'
        ]
      },
      '200': {
        label: 'Caisson Bois 200',
        price: 4730,
        dimensions: 'L 209,8 cm x H 210,5 cm x P 90 cm',
        weight: '495 kg',
        footprint: '1,9 m²',
        panelSize: '200 x 150 cm',
        panelPrice: 300,
        features: [
          'Structure en bois Douglas classe 4',
          'Panneaux amovibles 200x150cm',
          'Traitement autoclave renforcé',
          'Base lestable renforcée',
          'Compatible impression UV'
        ]
      }
    }
  },
  gabion: {
    name: 'Totem Gabion',
    description: 'Totem design en gabion métallique avec remplissage minéral',
    image: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&q=80',
    price: 1800,
    dimensions: '100 x 50 x 200 cm',
    weight: '280 kg (rempli)',
    panelSize: '90 x 180 cm',
    features: [
      'Structure gabion en acier galvanisé',
      'Maille 10x10cm',
      'Panneau central amovible 90x180cm',
      'Remplissage galets inclus (200kg)',
      'Résistance vent jusqu\'à 120 km/h',
      'Compatible impression dibond'
    ],
    panelPrice: 180
  },
  liz: {
    name: 'Totem Triptyque LIZ',
    description: 'Totem triptyque haut de gamme avec panneaux orientables',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    price: 2600,
    dimensions: '150 x 60 x 220 cm',
    weight: '95 kg',
    panelSize: '3 x (45 x 200 cm)',
    features: [
      'Structure aluminium laqué RAL au choix',
      '3 panneaux orientables 45x200cm',
      'Socle béton préfabriqué inclus',
      'Système de rotation 180°',
      'Éclairage LED en option',
      'Finition premium'
    ],
    panelPrice: 250
  }
};

export const TOTEM_PRICES = {
  caisson_bois: {
    '80': 2650,
    '120': 3200,
    '160': 3960,
    '200': 4730
  },
  gabion: 1800,
  liz: 2600
};

const INSTALLATION_PRICE = 1690; // Prix installation complète

type FormatConfig = {
  format: CaissonBoisFormat;
  quantity: number;
  panelsEnabled: boolean;
  panelsQuantity: number;
  installationEnabled: boolean;
};

type NavigationStep = 'model' | 'format' | 'config';

export function TotemCalculator({ onCalculate }: TotemCalculatorProps) {
  const [currentStep, setCurrentStep] = useState<NavigationStep>('model');
  const [selectedTotem, setSelectedTotem] = useState<TotemType | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<CaissonBoisFormat | null>(null);
  const [configurations, setConfigurations] = useState<FormatConfig[]>([]);

  const handleModelSelect = (type: TotemType) => {
    setSelectedTotem(type);
    if (type === 'caisson_bois') {
      setCurrentStep('format');
    } else {
      // Pour gabion et liz, aller directement à la config (un seul format)
      setCurrentStep('config');
    }
  };

  const handleFormatSelect = (format: CaissonBoisFormat) => {
    setSelectedFormat(format);
    setCurrentStep('config');
  };

  const getCurrentConfig = (): FormatConfig => {
    if (!selectedFormat) {
      return {
        format: '120',
        quantity: 1,
        panelsEnabled: false,
        panelsQuantity: 1,
        installationEnabled: false
      };
    }

    const existing = configurations.find(c => c.format === selectedFormat);
    return existing || {
      format: selectedFormat,
      quantity: 1,
      panelsEnabled: false,
      panelsQuantity: 1,
      installationEnabled: false
    };
  };

  const updateCurrentConfig = (updates: Partial<FormatConfig>) => {
    if (!selectedFormat) return;

    const existingIndex = configurations.findIndex(c => c.format === selectedFormat);
    if (existingIndex >= 0) {
      const newConfigs = [...configurations];
      newConfigs[existingIndex] = { ...newConfigs[existingIndex], ...updates };
      setConfigurations(newConfigs);
    } else {
      setConfigurations([...configurations, { ...getCurrentConfig(), ...updates }]);
    }
  };

  const handleAddConfiguration = () => {
    if (!selectedFormat) return;

    const config = getCurrentConfig();
    const existingIndex = configurations.findIndex(c => c.format === selectedFormat);

    if (existingIndex >= 0) {
      const newConfigs = [...configurations];
      newConfigs[existingIndex] = config;
      setConfigurations(newConfigs);
    } else {
      setConfigurations([...configurations, config]);
    }

    // Retour à la sélection de format pour ajouter d'autres formats
    setSelectedFormat(null);
    setCurrentStep('format');
  };

  const handleValidateAll = () => {
    if (!selectedTotem) return;

    const items: TotemItem[] = configurations.map(config => ({
      id: Date.now().toString() + config.format,
      totemType: selectedTotem,
      caissonBoisFormat: config.format,
      quantity: config.quantity,
      panels: config.panelsEnabled ? { enabled: true, quantity: config.panelsQuantity } : undefined,
      installation: config.installationEnabled
    }));

    if (items.length === 0) return;

    onCalculate({ items });
  };

  const handleBackToModel = () => {
    setSelectedTotem(null);
    setSelectedFormat(null);
    setConfigurations([]);
    setCurrentStep('model');
  };

  const handleBackToFormat = () => {
    setSelectedFormat(null);
    setCurrentStep('format');
  };

  const calculateTotal = () => {
    if (configurations.length === 0) return 0;

    let totemTotal = 0;
    let total = 0;
    let totalQuantity = 0;

    configurations.forEach(config => {
      totalQuantity += config.quantity;
      totemTotal += TOTEM_PRICES.caisson_bois[config.format] * config.quantity;

      // Prix des panneaux (sans remise)
      if (config.panelsEnabled) {
        const formatData = TOTEM_DATA.caisson_bois.formats[config.format];
        total += formatData.panelPrice * config.panelsQuantity;
      }

      // Prix de l'installation (sans remise)
      if (config.installationEnabled) {
        total += INSTALLATION_PRICE;
      }
    });

    // Remise de 10% sur les totems uniquement si 5 totems ou plus
    if (totalQuantity >= 5) {
      totemTotal = totemTotal * 0.9;
    }

    total += totemTotal;

    return total;
  };

  const getTotalQuantity = () => {
    return configurations.reduce((sum, config) => sum + config.quantity, 0);
  };

  const currentConfig = getCurrentConfig();

  return (
    <div className="max-w-6xl mx-auto pt-12 px-4">
      <ProgressBar
        currentStep={currentStep === 'model' ? 1 : currentStep === 'format' ? 2 : 3}
        totalSteps={3}
        steps={['Modèle', 'Format', 'Configuration']}
      />

      <div className="mt-8">
        {/* ÉTAPE 1: Sélection du modèle */}
        {currentStep === 'model' && (
          <>
            <h2 className="text-3xl font-bold mb-2 text-black">Choisissez votre modèle de Totem</h2>
            <p className="text-black mb-8">Sélectionnez le modèle qui correspond à vos besoins</p>

            <div className="grid md:grid-cols-3 gap-6">
              {(Object.keys(TOTEM_DATA) as TotemType[]).map((type) => {
                const data = TOTEM_DATA[type];
                const baseData = type === 'caisson_bois' ? data.formats['120'] : data;

                return (
                  <Card
                    key={type}
                    className="border-2 border-black cursor-pointer hover:shadow-2xl transition-all group overflow-hidden"
                    onClick={() => handleModelSelect(type)}
                  >
                    <CardContent className="p-0">
                      <div className="relative h-64 overflow-hidden">
                        <ImageWithFallback
                          src={data.image}
                          alt={data.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full border-2 border-black">
                          <span className="font-bold text-sm text-black">
                            {type === 'caisson_bois' ? 'Dès 2650€' : `${baseData.price}€`} HT
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 text-black">{data.name}</h3>
                        <p className="text-sm text-black mb-4">{data.description}</p>
                        <Button className="w-full bg-black hover:bg-gray-800 text-white">
                          Sélectionner
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* ÉTAPE 2: Sélection du format */}
        {currentStep === 'format' && selectedTotem === 'caisson_bois' && (
          <>
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={handleBackToModel}
                className="border-2 border-black"
              >
                ← Changer de modèle
              </Button>
            </div>

            <h2 className="text-3xl font-bold mb-2 text-black">Choisissez votre format</h2>
            <p className="text-black mb-8">Sélectionnez le format de {TOTEM_DATA.caisson_bois.name}</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(Object.keys(TOTEM_DATA.caisson_bois.formats) as CaissonBoisFormat[]).map((format) => {
                const formatData = TOTEM_DATA.caisson_bois.formats[format];
                const isConfigured = configurations.some(c => c.format === format);

                return (
                  <Card
                    key={format}
                    className="border-2 border-black cursor-pointer hover:shadow-2xl transition-all group overflow-hidden"
                    onClick={() => handleFormatSelect(format)}
                  >
                    <CardContent className="p-0">
                      <div className="relative h-80 overflow-hidden bg-gray-100">
                        <ImageWithFallback
                          src={`https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=600&fit=crop`}
                          alt={formatData.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full border-2 border-black">
                          <span className="font-bold text-sm text-black">{formatData.price}€ HT</span>
                        </div>
                        {isConfigured && (
                          <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-full">
                            <Check className="w-4 h-4 inline" /> Configuré
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-black flex items-center gap-2">
                          {formatData.label}
                          {format === '120' && (
                            <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">Populaire</span>
                          )}
                        </h3>
                        <p className="text-xs text-black mt-1">{formatData.dimensions}</p>
                        <Button className="w-full bg-black hover:bg-gray-800 text-white mt-3">
                          {isConfigured ? 'Modifier' : 'Configurer'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Bouton pour valider si au moins un format est configuré */}
            {configurations.length > 0 && (
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleValidateAll}
                  className="bg-black hover:bg-gray-800 text-white py-6 px-8 text-lg"
                >
                  Valider la commande ({configurations.length} format{configurations.length > 1 ? 's' : ''})
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}


        {/* ÉTAPE 3: Configuration détaillée */}
        {currentStep === 'config' && selectedFormat && selectedTotem === 'caisson_bois' && (
          <>
            <div className="mb-6 flex gap-4">
              <Button
                variant="outline"
                onClick={handleBackToFormat}
                className="border-2 border-black"
              >
                ← Retour aux formats
              </Button>
            </div>

            {(() => {
              const formatData = TOTEM_DATA.caisson_bois.formats[selectedFormat];

              return (
                <div className="space-y-6">
                  <Card className="border-2 border-black overflow-hidden">
                    <CardContent className="p-0">
                      {/* Image du produit */}
                      <div className="relative h-96 overflow-hidden bg-gray-100">
                        <ImageWithFallback
                          src={`https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop`}
                          alt={formatData.label}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full border-2 border-black">
                          <span className="font-bold text-sm text-black">{formatData.price}€ HT</span>
                        </div>
                      </div>

                      <div className="p-8">
                        <h2 className="text-3xl font-bold mb-6 text-black">{formatData.label}</h2>

                        <div className="grid md:grid-cols-2 gap-8">
                          {/* Caractéristiques */}
                          <div>
                            <h4 className="font-bold mb-4 text-black text-xl">Caractéristiques techniques</h4>
                            <div className="space-y-3 mb-6">
                              <div className="flex justify-between">
                                <span className="text-black font-medium">Dimensions:</span>
                                <span className="text-black">{formatData.dimensions}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-black font-medium">Poids:</span>
                                <span className="text-black">{formatData.weight}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-black font-medium">Encombrement au sol:</span>
                                <span className="text-black">{formatData.footprint}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-black font-medium">Format panneau:</span>
                                <span className="text-black">{formatData.panelSize}</span>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-bold mb-3 text-black flex items-center gap-2">
                                <Check className="w-5 h-5" />
                                Détails
                              </h4>
                              <ul className="space-y-2">
                                {formatData.features.map((feature, idx) => (
                                  <li key={idx} className="text-sm text-black flex items-start gap-2">
                                    <span className="text-black mt-1">•</span>
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Options de configuration */}
                          <div className="space-y-6">
                            <h4 className="font-bold text-black text-xl">Configuration</h4>

                            {/* Quantité */}
                            <div>
                              <Label className="text-black font-bold mb-2 block">Quantité</Label>
                              <Input
                                type="number"
                                min="1"
                                value={currentConfig.quantity}
                                onChange={(e) => updateCurrentConfig({
                                  quantity: Math.max(1, parseInt(e.target.value) || 1)
                                })}
                                className="border-2 border-black text-black"
                              />
                              <div className={`mt-2 text-xs p-2 rounded border-2 ${
                                getTotalQuantity() + currentConfig.quantity >= 5
                                  ? 'bg-green-50 border-green-500 text-green-900'
                                  : 'bg-gray-50 border-gray-300 text-black'
                              }`}>
                                <Info className="w-3 h-3 inline mr-1" />
                                {getTotalQuantity() + currentConfig.quantity >= 5 ? (
                                  <strong>Remise de 10% appliquée sur les totems !</strong>
                                ) : (
                                  <>Commandez 5 totems ou plus et bénéficiez de 10% de remise sur les totems</>
                                )}
                              </div>
                            </div>

                            {/* Panneaux imprimés */}
                            <Card className="border-2 border-black bg-gray-50">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3 mb-3">
                                  <Checkbox
                                    id="panels"
                                    checked={currentConfig.panelsEnabled}
                                    onCheckedChange={(checked) => updateCurrentConfig({
                                      panelsEnabled: checked as boolean
                                    })}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <Label htmlFor="panels" className="text-black font-bold cursor-pointer flex items-center gap-2">
                                      Panneaux imprimés laminé anti-UV dibond 3mm
                                      <Package className="w-4 h-4" />
                                    </Label>
                                    <p className="text-xs text-black mt-1">
                                      Panneaux personnalisés format {formatData.panelSize}
                                    </p>
                                    <p className="text-sm font-bold text-black mt-2">
                                      {formatData.panelPrice}€ HT par panneau
                                    </p>
                                  </div>
                                </div>

                                {currentConfig.panelsEnabled && (
                                  <div className="mt-3 pl-7">
                                    <Label className="text-black text-sm mb-2 block">
                                      Nombre de panneaux (max {currentConfig.quantity * 2})
                                    </Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max={currentConfig.quantity * 2}
                                      value={currentConfig.panelsQuantity}
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value) || 1;
                                        updateCurrentConfig({
                                          panelsQuantity: Math.max(1, Math.min(currentConfig.quantity * 2, value))
                                        });
                                      }}
                                      className="border-2 border-black text-black"
                                    />
                                    <p className="text-xs text-black mt-2">
                                      <Info className="w-3 h-3 inline mr-1" />
                                      Maximum 2 panneaux par totem - Impression UV haute qualité
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            {/* Installation */}
                            <Card className="border-2 border-black bg-gray-50">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <Label className="text-black font-bold block">Mode de réception</Label>
                                  <RadioGroup
                                    value={currentConfig.installationEnabled ? 'installation' : 'delivery'}
                                    onValueChange={(v) => updateCurrentConfig({
                                      installationEnabled: v === 'installation'
                                    })}
                                  >
                                    <div className="flex items-start space-x-2 p-3 border-2 border-black rounded-lg bg-white">
                                      <RadioGroupItem value="delivery" id="delivery" className="border-2 border-black" />
                                      <Label htmlFor="delivery" className="flex-1 cursor-pointer text-black">
                                        <div className="font-bold">Livraison simple</div>
                                        <div className="text-sm">Frais de livraison précisés après validation</div>
                                      </Label>
                                    </div>
                                    <div className="flex items-start space-x-2 p-3 border-2 border-black rounded-lg bg-white">
                                      <RadioGroupItem value="installation" id="installation" className="border-2 border-black" />
                                      <Label htmlFor="installation" className="flex-1 cursor-pointer text-black">
                                        <div className="font-bold">Installation complète</div>
                                        <div className="text-sm">+ {INSTALLATION_PRICE}€ HT</div>
                                      </Label>
                                    </div>
                                  </RadioGroup>
                                  {currentConfig.installationEnabled && (
                                    <div className="bg-gray-50 border-2 border-black rounded-lg p-3 mt-3">
                                      <p className="text-xs text-black mb-2">
                                        <strong>L'installation complète comprend :</strong>
                                      </p>
                                      <ul className="text-xs text-black space-y-1 ml-4">
                                        <li>• <strong>Pilotage / Scénographie :</strong> établissement des plans d'intervention, coordination des intervenants, suivi de chantier</li>
                                        <li>• <strong>Installation :</strong> mise en place, nivellement, fixation sécurisée et tests de stabilité</li>
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                            <Button
                              onClick={handleAddConfiguration}
                              className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg"
                            >
                              Ajouter cette configuration
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

