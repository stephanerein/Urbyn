import { useState, useEffect } from 'react';
import { PAYS, POSTAL_CODE_FORMATS, rechercherVilles, type CitySuggestion } from '../lib/postalLookup';
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
        const cities = await rechercherVilles(address.country, address.postalCode);
        setCitySuggestions(cities);

        // Si une seule ville trouvée, la remplir automatiquement
        if (cities.length === 1) {
          onChange({
            ...address,
            city: cities[0].nom,
            coordinates: cities[0].coordinates,
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
                {PAYS.map((pays) => (
                  <SelectItem key={pays} value={pays}>
                    {pays}
                  </SelectItem>
                ))}
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