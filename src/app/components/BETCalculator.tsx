import { useState, useEffect } from 'react';
import { safeFetch } from '../lib/safe-fetch';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowRight, Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { TERRAIN_CATEGORIES, type TerrainCategory } from '../lib/wind-zones';

export type BardageType = 'dibond' | 'tole_acier' | 'panneau_bois';

export interface BETConfig {
  street: string;
  street2: string;
  postalCode: string;
  city: string;
  country: string;
  terrainCategory: TerrainCategory;
  // Nouveaux champs pour l'étude de résistance au vent
  palissadeHeight?: number; // Hauteur de la palissade en mètres (2 à 4,5m)
  bardageType?: BardageType; // Type de bardage
  windZone?: number; // Zone de vent (1, 2, 3, 4)
  windSpeed?: number; // Vitesse de base Vb en m/s
}

interface BETCalculatorProps {
  onCalculate: (config: BETConfig) => void;
}

// Configuration des formats de code postal par pays
const POSTAL_CODE_FORMATS: Record<string, { pattern: RegExp; length: number; placeholder: string }> = {
  France: { pattern: /^\d{5}$/, length: 5, placeholder: '75001' },
  Belgique: { pattern: /^\d{4}$/, length: 4, placeholder: '1000' },
  Luxembourg: { pattern: /^\d{4}$/, length: 4, placeholder: '1234' },
  Allemagne: { pattern: /^\d{5}$/, length: 5, placeholder: '10115' },
  Suisse: { pattern: /^\d{4}$/, length: 4, placeholder: '1200' },
  Italie: { pattern: /^\d{5}$/, length: 5, placeholder: '00118' },
  Monaco: { pattern: /^980\d{2}$/, length: 5, placeholder: '98000' },
  Andorre: { pattern: /^AD\d{3}$/i, length: 5, placeholder: 'AD500' },
  Espagne: { pattern: /^\d{5}$/, length: 5, placeholder: '28001' },
};

const MONACO_CITIES: Record<string, string> = {
  '98000': 'Monaco',
};

const ANDORRA_CITIES: Record<string, string> = {
  'AD100': 'Canillo',
  'AD200': 'Encamp',
  'AD300': 'Ordino',
  'AD400': 'La Massana',
  'AD500': 'Andorra la Vella',
  'AD600': 'Sant Julià de Lòria',
  'AD700': 'Escaldes-Engordany',
};

interface CitySuggestion {
  nom: string;
  code: string;
  codesPostaux: string[];
}

export function BETCalculator({ onCalculate }: BETCalculatorProps) {
  const [street, setStreet] = useState('');
  const [street2, setStreet2] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('France');
  const [terrainCategory, setTerrainCategory] = useState<TerrainCategory>('zone_urbaine');
  const [bardageType, setBardageType] = useState<BardageType>('dibond');
  const [palissadeHeight, setPalissadeHeight] = useState<number>(2);
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load existing config if available
  useEffect(() => {
    const storedConfig = sessionStorage.getItem('betConfig');
    if (storedConfig) {
      try {
        const config = JSON.parse(storedConfig);
        if (config.street) setStreet(config.street);
        if (config.street2) setStreet2(config.street2);
        if (config.postalCode) setPostalCode(config.postalCode);
        if (config.city) setCity(config.city);
        if (config.country) setCountry(config.country);
        if (config.terrainCategory) setTerrainCategory(config.terrainCategory);
        if (config.bardageType) setBardageType(config.bardageType);
        if (config.palissadeHeight) setPalissadeHeight(config.palissadeHeight);
      } catch (e) {
        console.error('Failed to parse betConfig', e);
      }
    }
  }, []);

  // Auto-complétion de ville basée sur le code postal
  useEffect(() => {
    const fetchCities = async () => {
      const format = POSTAL_CODE_FORMATS[country];
      
      if (!format || postalCode.length !== format.length || !format.pattern.test(postalCode)) {
        setCitySuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoadingCities(true);
      
      try {
        let cities: CitySuggestion[] = [];
        const encodedPostalCode = encodeURIComponent(postalCode);

        switch (country) {
          case 'France':
            const frResponse = await safeFetch(
              `https://geo.api.gouv.fr/communes?codePostal=${encodedPostalCode}&fields=nom,code,codesPostaux&format=json`
            );
            if (frResponse && frResponse.ok) {
              const data = await frResponse.json();
              cities = Array.isArray(data) ? data : [];
            }
            break;

          case 'Monaco':
            const monacoCity = MONACO_CITIES[postalCode];
            if (monacoCity) {
              cities = [{ nom: monacoCity, code: postalCode, codesPostaux: [postalCode] }];
            }
            break;

          case 'Andorre':
            const andorraCity = ANDORRA_CITIES[postalCode.toUpperCase()];
            if (andorraCity) {
              cities = [{ nom: andorraCity, code: postalCode, codesPostaux: [postalCode] }];
            }
            break;

          case 'Belgique':
          case 'Luxembourg':
          case 'Allemagne':
          case 'Suisse':
          case 'Italie':
          case 'Espagne':
            const countryCode = {
              'Belgique': 'be',
              'Luxembourg': 'lu',
              'Allemagne': 'de',
              'Suisse': 'ch',
              'Italie': 'it',
              'Espagne': 'es',
            }[country];

            if (countryCode) {
              const zipResponse = await safeFetch(
                `https://api.zippopotam.us/${countryCode}/${encodedPostalCode}`
              );
              
              if (zipResponse && zipResponse.ok) {
                const zipData = await zipResponse.json();
                if (zipData && zipData.places && Array.isArray(zipData.places)) {
                  cities = zipData.places.map((place: any) => ({
                    nom: place['place name'],
                    code: postalCode,
                    codesPostaux: [postalCode]
                  }));
                }
              }
            }
            break;
        }

        setCitySuggestions(cities);
        
        if (cities.length === 1) {
          setCity(cities[0].nom);
          setShowSuggestions(false);
        } else if (cities.length > 1) {
          setShowSuggestions(true);
        } else {
          setShowSuggestions(false);
        }
        
      } catch (error) {
        setCitySuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingCities(false);
      }
    };

    const timer = setTimeout(fetchCities, 300);
    return () => clearTimeout(timer);
  }, [postalCode, country]);

  const handleCitySelect = (cityName: string) => {
    setCity(cityName);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!street || !postalCode || !city || !country) {
      alert('Veuillez renseigner l\'adresse complète du chantier');
      return;
    }

    const config: BETConfig = {
      street,
      street2,
      postalCode,
      city,
      country,
      terrainCategory,
      palissadeHeight,
      bardageType
    };

    onCalculate(config);
  };

  const selectedCategory = TERRAIN_CATEGORIES[terrainCategory];

  return (
    <div className="max-w-3xl mx-auto pt-12">
      <ProgressBar 
        currentStep={1} 
        totalSteps={4}
        steps={['Configuration', 'Analyse', 'Validation', 'Confirmation']}
      />
      
      <Card className="border-2 border-slate-200 shadow-lg mt-8">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold mb-2">Étude BET - Résistance au vent</h3>
          <p className="text-slate-600 mb-6">Étude certifiée selon Eurocode EN 1991-1-4</p>

          {/* Présentation du service */}
          <div className="space-y-4 mb-8">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-12 h-12 text-blue-700 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg mb-2 text-blue-900">Service agréé et certifié</h4>
                    <p className="text-sm text-blue-800 mb-3">
                      Notre bureau d'études est agréé pour réaliser des études de résistance au vent 
                      prenant en compte le renversement et le glissement des structures extérieures.
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Calculs selon Eurocode EN 1991-1-4</li>
                      <li>Analyse des efforts de renversement</li>
                      <li>Analyse des efforts de glissement</li>
                      <li>Recommandations de lestage et fixation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-10 h-10 text-orange-700 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg mb-2 text-orange-900">Élément de sécurité essentiel</h4>
                    <p className="text-sm text-orange-800 mb-2">
                      Le rapport d'étude BET est un document crucial qui :
                    </p>
                    <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                      <li><strong>Garantit la sécurité</strong> de vos installations extérieures</li>
                      <li><strong>Protège votre responsabilité</strong> en cas d'accident</li>
                      <li><strong>Couvre vos obligations</strong> vis-à-vis de votre assurance</li>
                      <li><strong>Valide la conformité</strong> en cas de forte tempête</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-6 border-2 border-slate-200">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Localisation du chantier
              </h4>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="street" className="text-sm mb-2 block">
                    Adresse <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="border-2 bg-white"
                    placeholder="123 Rue de la République"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="street2" className="text-sm mb-2 block">
                    Complément d'adresse (optionnel)
                  </Label>
                  <Input
                    id="street2"
                    value={street2}
                    onChange={(e) => setStreet2(e.target.value)}
                    className="border-2 bg-white"
                    placeholder="Bâtiment A, Zone industrielle..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode" className="text-sm mb-2 block">
                      Code postal <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="border-2 bg-white"
                      placeholder={POSTAL_CODE_FORMATS[country]?.placeholder || '75001'}
                      required
                    />
                    {country && POSTAL_CODE_FORMATS[country] && (
                      <p className="text-xs text-slate-500 mt-1">
                        Format : {POSTAL_CODE_FORMATS[country].length} caractères
                        {country === 'Andorre' && ' (ex: AD500)'}
                        {country === 'Monaco' && ' (980XX)'}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <Label htmlFor="city" className="text-sm mb-2 block">
                      Ville <span className="text-red-500">*</span>
                      {isLoadingCities && (
                        <Loader2 className="w-3 h-3 ml-2 inline animate-spin text-slate-400" />
                      )}
                    </Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="border-2 bg-white"
                      placeholder="Paris"
                      required
                    />
                    {!isLoadingCities && !city && country && (
                      <p className="text-xs text-slate-500 mt-1">
                        💡 La ville se remplit automatiquement
                      </p>
                    )}
                    {showSuggestions && citySuggestions.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white border-2 border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {citySuggestions.map((city) => (
                          <div
                            key={city.code}
                            className="cursor-pointer px-4 py-2 hover:bg-slate-100 transition-colors border-b border-slate-100 last:border-b-0"
                            onClick={() => handleCitySelect(city.nom)}
                          >
                            <span className="font-medium">{city.nom}</span>
                            <span className="text-xs text-slate-500 ml-2">({city.codesPostaux.join(', ')})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="country" className="text-sm mb-2 block">
                    Pays <span className="text-red-500">*</span>
                  </Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="border-2 bg-white">
                      <SelectValue placeholder="Sélectionnez un pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Belgique">Belgique</SelectItem>
                      <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                      <SelectItem value="Allemagne">Allemagne</SelectItem>
                      <SelectItem value="Suisse">Suisse</SelectItem>
                      <SelectItem value="Italie">Italie</SelectItem>
                      <SelectItem value="Monaco">Monaco</SelectItem>
                      <SelectItem value="Andorre">Andorre</SelectItem>
                      <SelectItem value="Espagne">Espagne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 border-2 border-slate-200">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Catégorie de terrain
              </h4>

              <div>
                <Label htmlFor="terrain" className="text-sm mb-2 block">
                  Type d'environnement <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={terrainCategory} 
                  onValueChange={(value) => setTerrainCategory(value as TerrainCategory)}
                >
                  <SelectTrigger className="border-2 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TERRAIN_CATEGORIES).map(([key, data]) => (
                      <SelectItem key={key} value={key}>
                        {data.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">{selectedCategory.description}</p>
              </div>

              {/* Classification Eurocode */}
              <div className="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Classification Eurocode
                </h5>
                <div className="space-y-1 text-sm text-green-800">
                  <p><strong>Environnement sélectionné :</strong> {selectedCategory.label}</p>
                  <p><strong>Catégorie Eurocode :</strong> {selectedCategory.eurocodeCategory}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 border-2 border-slate-200">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Caractéristiques de la palissade
              </h4>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="palissadeHeight" className="text-sm mb-2 block">
                    Hauteur de la palissade <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="palissadeHeight"
                    type="number"
                    value={palissadeHeight}
                    onChange={(e) => setPalissadeHeight(Number(e.target.value))}
                    className="border-2 bg-white"
                    placeholder="2"
                    min="2"
                    max="4.5"
                    step="0.1"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Hauteur comprise entre 2,0 m et 4,5 m (incréments de 0,1 m)
                  </p>
                </div>

                <div>
                  <Label htmlFor="bardageType" className="text-sm mb-2 block">
                    Type de bardage <span className="text-red-500">*</span>
                  </Label>
                  <Select value={bardageType} onValueChange={(value) => setBardageType(value as BardageType)}>
                    <SelectTrigger className="border-2 bg-white">
                      <SelectValue placeholder="Sélectionnez un type de bardage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dibond">Dibond (aluminium composite)</SelectItem>
                      <SelectItem value="tole_acier">Tôle acier (panneau métallique)</SelectItem>
                      <SelectItem value="panneau_bois">Panneau bois (bardage naturel)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">
                    Le type de bardage influence la pression du vent et les calculs de résistance
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Prix de l'étude :</strong> 480 € HT - Rapport certifié personnalisé avec calculs détaillés
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-black hover:bg-slate-800 text-white py-6 text-lg"
            >
              Voir le récapitulatif
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}