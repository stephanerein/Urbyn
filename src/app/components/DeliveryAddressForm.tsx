import { useState, useEffect } from 'react';
import { safeFetch } from '../lib/safe-fetch';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Loader2 } from 'lucide-react';

export interface DeliveryAddress {
  company?: string;
  street: string;
  street2: string;
  postalCode: string;
  city: string;
  country: string;
  specialInstructions: string;
  coordinates?: { lat: number; lng: number };
}

interface DeliveryAddressFormProps {
  address: DeliveryAddress;
  onChange: (address: DeliveryAddress) => void;
}

interface CitySuggestion {
  nom: string;
  code: string;
  codesPostaux: string[];
  coordinates?: { lat: number; lng: number };
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

// Codes postaux pour petits pays (Monaco et Andorre)
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

export function DeliveryAddressForm({ address, onChange }: DeliveryAddressFormProps) {
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = (field: keyof DeliveryAddress, value: string) => {
    onChange({ ...address, [field]: value });
  };

  // Rechercher les villes quand le code postal change
  useEffect(() => {
    const fetchCities = async () => {
      const format = POSTAL_CODE_FORMATS[address.country];
      
      // Vérifier que le format du code postal est valide
      if (!format || address.postalCode.length !== format.length || !format.pattern.test(address.postalCode)) {
        setCitySuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoadingCities(true);
      
      try {
        let cities: CitySuggestion[] = [];
        const encodedPostalCode = encodeURIComponent(address.postalCode);

        switch (address.country) {
          case 'France':
            // API du gouvernement français (avec coordonnées du centre)
            const frResponse = await safeFetch(
              `https://geo.api.gouv.fr/communes?codePostal=${encodedPostalCode}&fields=nom,code,codesPostaux,centre&format=json`
            );
            if (frResponse && frResponse.ok) {
              const data = await frResponse.json();
              if (Array.isArray(data)) {
                cities = data.map((item: any) => ({
                  nom: item.nom,
                  code: item.code,
                  codesPostaux: item.codesPostaux,
                  coordinates: item.centre ? {
                    lng: item.centre.coordinates[0],
                    lat: item.centre.coordinates[1]
                  } : undefined
                }));
              }
            }
            break;

          case 'Monaco':
            // Monaco : données en dur (petit pays)
            const monacoCity = MONACO_CITIES[address.postalCode];
            if (monacoCity) {
              cities = [{ nom: monacoCity, code: address.postalCode, codesPostaux: [address.postalCode] }];
            }
            break;

          case 'Andorre':
            // Andorre : données en dur (petit pays)
            const andorraCity = ANDORRA_CITIES[address.postalCode.toUpperCase()];
            if (andorraCity) {
              cities = [{ nom: andorraCity, code: address.postalCode, codesPostaux: [address.postalCode] }];
            }
            break;

          case 'Belgique':
            // Zippopotam pour la Belgique (plus fiable que BeST Address)
            const beResponse = await safeFetch(
              `https://api.zippopotam.us/be/${encodedPostalCode}`
            );
            if (beResponse && beResponse.ok) {
              const beData = await beResponse.json();
              if (beData && beData.places && Array.isArray(beData.places)) {
                cities = beData.places.map((place: any) => ({
                  nom: place['place name'],
                  code: address.postalCode,
                  codesPostaux: [address.postalCode],
                  coordinates: {
                    lat: parseFloat(place.latitude),
                    lng: parseFloat(place.longitude)
                  }
                }));
              }
            }
            break;

          case 'Suisse':
            // geo.admin.ch - API officielle suisse
            const chResponse = await safeFetch(
              `https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=${encodedPostalCode}&type=locations&origins=zipcode`
            );
            if (chResponse && chResponse.ok) {
              const chData = await chResponse.json();
              if (chData && chData.results && Array.isArray(chData.results)) {
                cities = chData.results.map((item: any) => {
                  // Le label est au format "1003 - Lausanne"
                  const labelMatch = item.attrs?.label?.match(/<b>(\d+)\s*-\s*(.+?)<\/b>/);
                  const cityName = labelMatch ? labelMatch[2] : item.attrs?.label || '';
                  return {
                    nom: cityName.replace(/<\/?b>/g, '').trim(),
                    code: address.postalCode,
                    codesPostaux: [address.postalCode],
                    coordinates: item.attrs?.lat && item.attrs?.lon ? {
                      lat: item.attrs.lat,
                      lng: item.attrs.lon
                    } : undefined
                  };
                });
              }
            }
            break;

          case 'Allemagne':
            // OpenPLZ API pour l'Allemagne
            const deResponse = await safeFetch(
              `https://openplzapi.org/de/Localities?PostalCode=${encodedPostalCode}`
            );
            if (deResponse && deResponse.ok) {
              const deData = await deResponse.json();
              if (Array.isArray(deData)) {
                cities = deData.map((item: any) => ({
                  nom: item.name,
                  code: address.postalCode,
                  codesPostaux: [address.postalCode]
                }));
              }
            }
            break;

          case 'Luxembourg':
            // Zippopotam pour Luxembourg (en attendant une meilleure API)
            const luResponse = await safeFetch(
              `https://api.zippopotam.us/lu/${encodedPostalCode}`
            );
            if (luResponse && luResponse.ok) {
              const luData = await luResponse.json();
              if (luData && luData.places && Array.isArray(luData.places)) {
                cities = luData.places.map((place: any) => ({
                  nom: place['place name'],
                  code: address.postalCode,
                  codesPostaux: [address.postalCode],
                  coordinates: {
                    lat: parseFloat(place.latitude),
                    lng: parseFloat(place.longitude)
                  }
                }));
              }
            }
            break;

          case 'Italie':
            // Zippopotam pour Italie (OpenAPI.it nécessite une clé)
            const itResponse = await safeFetch(
              `https://api.zippopotam.us/it/${encodedPostalCode}`
            );
            if (itResponse && itResponse.ok) {
              const itData = await itResponse.json();
              if (itData && itData.places && Array.isArray(itData.places)) {
                cities = itData.places.map((place: any) => ({
                  nom: place['place name'],
                  code: address.postalCode,
                  codesPostaux: [address.postalCode],
                  coordinates: {
                    lat: parseFloat(place.latitude),
                    lng: parseFloat(place.longitude)
                  }
                }));
              }
            }
            break;

          case 'Espagne':
            // Zippopotam pour l'Espagne
            const esResponse = await safeFetch(
              `https://api.zippopotam.us/es/${encodedPostalCode}`
            );
            if (esResponse && esResponse.ok) {
              const esData = await esResponse.json();
              if (esData && esData.places && Array.isArray(esData.places)) {
                cities = esData.places.map((place: any) => ({
                  nom: place['place name'],
                  code: address.postalCode,
                  codesPostaux: [address.postalCode],
                  coordinates: {
                    lat: parseFloat(place.latitude),
                    lng: parseFloat(place.longitude)
                  }
                }));
              }
            }
            break;
        }

        setCitySuggestions(cities);
        
        // Si une seule ville trouvée, la remplir automatiquement
        if (cities.length === 1) {
          onChange({
             ...address,
             city: cities[0].nom,
             coordinates: cities[0].coordinates
          });
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

    // Délai de 300ms pour éviter trop d'appels API (debounce)
    const timer = setTimeout(fetchCities, 300);
    return () => clearTimeout(timer);
  }, [address.postalCode, address.country]);

  const handleCitySelect = (city: CitySuggestion) => {
    onChange({
       ...address,
       city: city.nom,
       coordinates: city.coordinates
    });
    setShowSuggestions(false);
  };

  return (
    <Card className="border-2 border-slate-200 bg-slate-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5" />
          <h4 className="font-semibold text-lg">Adresse de livraison</h4>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="company" className="text-sm mb-2 block">
              Société / Chantier (optionnel)
            </Label>
            <Input
              id="company"
              value={address.company || ''}
              onChange={(e) => handleChange('company', e.target.value)}
              className="border-2 bg-white"
              placeholder="Nom de l'entreprise ou du chantier"
            />
          </div>

          <div>
            <Label htmlFor="street" className="text-sm mb-2 block">
              Adresse <span className="text-red-500">*</span>
            </Label>
            <Input
              id="street"
              value={address.street}
              onChange={(e) => handleChange('street', e.target.value)}
              className="border-2 bg-white"
              placeholder="123 Rue de la République"
              required
            />
          </div>

          <div>
            <Label htmlFor="street2" className="text-sm mb-2 block">
              Adresse 2 (optionnel)
            </Label>
            <Input
              id="street2"
              value={address.street2}
              onChange={(e) => handleChange('street2', e.target.value)}
              className="border-2 bg-white"
              placeholder="Bâtiment, étage, porte..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postalCode" className="text-sm mb-2 block">
                Code postal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="postalCode"
                value={address.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                className="border-2 bg-white"
                placeholder={POSTAL_CODE_FORMATS[address.country]?.placeholder || '75001'}
                required
              />
              {address.country && POSTAL_CODE_FORMATS[address.country] && (
                <p className="text-xs text-slate-500 mt-1">
                  Format : {POSTAL_CODE_FORMATS[address.country].length} caractères
                  {address.country === 'Andorre' && ' (ex: AD500)'}
                  {address.country === 'Monaco' && ' (980XX)'}
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
                value={address.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="border-2 bg-white"
                placeholder="Paris"
                required
              />
              {!isLoadingCities && !address.city && address.country && (
                <p className="text-xs text-slate-500 mt-1">
                  💡 La ville se remplit automatiquement
                </p>
              )}
              {showSuggestions && citySuggestions.length > 0 && (
                <div className="absolute z-20 mt-1 left-0 min-w-[280px] w-max max-w-sm bg-white border-2 border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {citySuggestions.map((city) => (
                    <div
                      key={city.code}
                      className="cursor-pointer px-4 py-2.5 hover:bg-slate-100 transition-colors border-b border-slate-100 last:border-b-0"
                      onClick={() => handleCitySelect(city)}
                    >
                      <span className="font-medium text-sm block">{city.nom}</span>
                      <span className="text-xs text-slate-400">{city.codesPostaux[0]}</span>
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
            <Select
              value={address.country}
              onValueChange={(value) => handleChange('country', value)}
            >
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

          <div>
            <Label htmlFor="specialInstructions" className="text-sm mb-2 block">
              Instructions de livraison (optionnel)
            </Label>
            <Textarea
              id="specialInstructions"
              value={address.specialInstructions}
              onChange={(e) => handleChange('specialInstructions', e.target.value)}
              className="border-2 bg-white min-h-[100px]"
              placeholder="Horaires de livraison préférés, personne de contact, instructions d'accès..."
            />
            <p className="text-xs text-slate-500 mt-1">
              Précisez les horaires de livraison, le nom d'une personne de contact, ou toute information utile
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}