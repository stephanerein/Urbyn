import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ProgressSteps } from '../../components/ProgressSteps';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { useCart } from '../../context/CartContext';
import { Check, ShoppingCart, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

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

const SIGN_IZ_FEATURES = [
  'Structure acier thermolaqué RAL au choix',
  'Panneau face unique ou double face',
  'Format compact et léger — installation simplifiée',
  'Lestage intégré sans ancrage au sol',
  'Compatible toutes conditions météo',
];

export function TotemSignIzPage() {
  const navigate = useNavigate();
  const { addItems } = useCart();
  const totemMode = (sessionStorage.getItem('totemMode') ?? 'acquisition') as 'acquisition' | 'location';

  const [quantity, setQuantity] = useState(1);
  const [deliveryFormOpen, setDeliveryFormOpen] = useState(false);
  const [deliveryPostalCode, setDeliveryPostalCode] = useState('');
  const [deliveryCountry, setDeliveryCountry] = useState('France');
  const [deliveryInfoValidated, setDeliveryInfoValidated] = useState(false);
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

  const handleAddToCart = () => {
    const deliveryData = { postalCode: deliveryPostalCode, country: deliveryCountry };
    localStorage.setItem('deliveryInfo', JSON.stringify(deliveryData));
    const existing = localStorage.getItem('deliveryAddress');
    const existingAddr = existing ? JSON.parse(existing) : {};
    localStorage.setItem('deliveryAddress', JSON.stringify({ ...existingAddr, ...deliveryData }));

    addItems([{
      id: `totem-sign-iz-${totemMode}`,
      type: 'totem' as const,
      name: `Totem SIGN-IZ${totemMode === 'location' ? ' (Location)' : ''}`,
      price: 0,
      quantity,
      details: {
        itemType: 'totem',
        format: 'sign-iz',
        mode: totemMode,
      },
    }]);

    navigate('/totem/resultats');
  };

  return (
    <div className="bg-white min-h-screen pt-[73px]">
      <ProgressSteps currentStep={3} />

      <div className="max-w-4xl mx-auto pt-8 px-4 pb-20">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/totem')}
            className="border-2 border-black"
          >
            ← Retour aux modèles
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image + infos produit */}
          <div>
            <div className="rounded-xl overflow-hidden bg-gray-100 aspect-square mb-4">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80"
                alt="Totem SIGN-IZ"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              {SIGN_IZ_FEATURES.map((feat, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Configurateur */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-black mb-1">Totem SIGN-IZ</h1>
              <p className="text-gray-500 text-sm">
                Modèle unique — {totemMode === 'location' ? 'Location' : 'Acquisition'}
              </p>
              <p className="text-lg font-semibold text-black mt-2">Prix sur devis</p>
            </div>

            {/* Quantité */}
            <div>
              <Label className="text-sm font-semibold text-black mb-2 block">Quantité</Label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 border-2 border-black rounded-lg flex items-center justify-center font-bold hover:bg-black hover:text-white transition-colors"
                >
                  −
                </button>
                <span className="text-xl font-bold text-black w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 border-2 border-black rounded-lg flex items-center justify-center font-bold hover:bg-black hover:text-white transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Localisation de livraison */}
            <Card className={`border-2 ${deliveryInfoValidated ? 'border-black' : 'border-slate-200'}`}>
              <CardContent className="p-5">
                <button
                  className="w-full flex items-center justify-between"
                  onClick={() => setDeliveryFormOpen(o => !o)}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-black" />
                    <span className="font-semibold text-black text-sm">Localisation de livraison</span>
                    {deliveryInfoValidated && (
                      <span className="text-xs text-gray-500 ml-1">
                        — {deliveryPostalCode}, {deliveryCountry}
                      </span>
                    )}
                  </div>
                  {deliveryFormOpen ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
                </button>

                {deliveryFormOpen && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <Label className="text-black text-sm mb-1 block">Code postal</Label>
                      <Input
                        value={deliveryPostalCode}
                        onChange={e => { setDeliveryPostalCode(e.target.value); setPostalCodeError(false); }}
                        placeholder={POSTAL_RULES[deliveryCountry]?.example ?? ''}
                        className={`border text-black ${postalCodeError ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {postalCodeError && (
                        <p className="text-red-600 text-xs mt-1">
                          Code postal invalide (ex. : {POSTAL_RULES[deliveryCountry]?.example ?? ''})
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-black text-sm mb-1 block">Pays</Label>
                      <Select value={deliveryCountry} onValueChange={v => { setDeliveryCountry(v); setPostalCodeError(false); }}>
                        <SelectTrigger className="border border-gray-300 bg-white">
                          <SelectValue />
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
                      onClick={() => {
                        if (!validatePostalCode(deliveryPostalCode, deliveryCountry)) {
                          setPostalCodeError(true);
                          return;
                        }
                        setDeliveryInfoValidated(true);
                        setDeliveryFormOpen(false);
                        localStorage.setItem('deliveryInfo', JSON.stringify({ postalCode: deliveryPostalCode, country: deliveryCountry }));
                      }}
                      disabled={!deliveryPostalCode}
                      className="w-full bg-black hover:bg-gray-800 text-white"
                    >
                      Valider
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {!deliveryInfoValidated && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-center">
                Veuillez renseigner votre code postal avant d'ajouter au panier.
              </p>
            )}

            <Button
              onClick={handleAddToCart}
              disabled={!deliveryInfoValidated}
              className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Ajouter au panier — sur devis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
