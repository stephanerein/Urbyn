import { SEOMeta, productSchema, breadcrumbSchema } from '../../components/SEOMeta';
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
import { Check, ShoppingCart, MapPin, ChevronDown, ChevronUp, CalendarClock, ImageIcon, Info } from 'lucide-react';
import { imgTotemSignIzNoir } from '../../assets/images';

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

const DUREES_LOCATION = [
  { value: '1-semaine',  label: '1 semaine' },
  { value: '2-semaines', label: '2 semaines' },
  { value: '3-semaines', label: '3 semaines' },
  { value: '1-mois',     label: '1 mois' },
  { value: '2-mois',     label: '2 mois' },
  { value: '3-mois',     label: '3 mois' },
  { value: 'sur-devis',  label: 'Plus de 3 mois — sur devis' },
];

const FEATURES = [
  'Structure acier thermolaqué RAL au choix',
  'Panneau face unique ou double face',
  'Format compact et léger — installation simplifiée',
  'Lestage intégré sans ancrage au sol',
  'Compatible toutes conditions météo',
  'Livraison + reprise incluses dans la location',
];

export function TotemSignIzLocationPage() {
  const navigate = useNavigate();
  const { addItems, openSidebar } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [duree, setDuree] = useState('');
  const [visualConfirmed, setVisualConfirmed] = useState(false);
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

  const canSubmit = deliveryInfoValidated && duree && visualConfirmed;

  const handleAddToCart = () => {
    const deliveryData = { postalCode: deliveryPostalCode, country: deliveryCountry };
    localStorage.setItem('deliveryInfo', JSON.stringify(deliveryData));
    const existing = localStorage.getItem('deliveryAddress');
    localStorage.setItem('deliveryAddress', JSON.stringify({ ...(existing ? JSON.parse(existing) : {}), ...deliveryData }));

    const dureeLabel = DUREES_LOCATION.find(d => d.value === duree)?.label ?? duree;

    addItems([{
      id: 'totem-sign-iz-location',
      type: 'totem' as const,
      name: `Totem Sign-IZ (Location — ${dureeLabel})`,
      price: 0,
      quantity,
      details: { itemType: 'totem', format: 'sign-iz', mode: 'location', duree: dureeLabel },
    }]);
    openSidebar();
  };

  return (
    <>
      <SEOMeta
        title="Totem Sign-IZ — Location"
        description="Louez le Totem Sign-IZ pour vos événements et chantiers. À partir de 290 € HT. Livraison + reprise incluses. Visuel fourni par le client."
        keywords="location totem Sign-IZ, totem événementiel, totem chantier location, Urbyn location"
        url="/totem/sign-iz/location"
        type="product"
        jsonLd={[productSchema({ name: "Totem Sign-IZ (Location)", description: "Location de totem autolesté avec impression visuel. Livraison et reprise incluses.", price: 290, url: "/totem/sign-iz/location" }), breadcrumbSchema([{ name: "Accueil", url: "/" }, { name: "Totems location", url: "/totem/location" }, { name: "Sign-IZ", url: "/totem/sign-iz/location" }])]}
      />
    <div className="bg-white min-h-screen pt-[var(--header-height)]">
      <ProgressSteps currentStep={3} />

      <div className="max-w-4xl mx-auto pt-8 px-4 pb-20">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/totem/location')} className="border-2 border-black">
            ← Retour aux modèles
          </Button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <span className="bg-black text-white text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <CalendarClock className="w-3.5 h-3.5" /> Location
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Colonne gauche : image + caractéristiques */}
          <div>
            <div className="rounded-xl overflow-hidden bg-gray-100 aspect-square mb-4">
              <ImageWithFallback
                src={imgTotemSignIzNoir}
                alt="Totem Sign-IZ Location"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              {FEATURES.map((feat, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne droite : configurateur */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-black mb-1">Totem Sign-IZ</h1>
              <p className="text-gray-500 text-sm">Location — modèle unique</p>
              <p className="text-lg font-semibold text-black mt-2">À partir de 290€ HT</p>
              <p className="text-xs text-gray-500 mt-1">Tarif selon durée de location — devis personnalisé</p>
            </div>

            {/* Nombre de totems */}
            <div>
              <Label className="text-sm font-semibold text-black mb-2 block">Nombre de totems</Label>
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

            {/* Durée de location */}
            <div>
              <Label className="text-sm font-semibold text-black mb-2 block">
                Durée de location <span className="text-red-500">*</span>
              </Label>
              <Select value={duree} onValueChange={setDuree}>
                <SelectTrigger className={`border-2 bg-white ${duree ? 'border-black' : 'border-slate-200'}`}>
                  <SelectValue placeholder="Sélectionnez une durée" />
                </SelectTrigger>
                <SelectContent>
                  {DUREES_LOCATION.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Visuel à fournir */}
            <Card className={`border-2 transition-colors ${visualConfirmed ? 'border-black bg-slate-50' : 'border-amber-300 bg-amber-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <ImageIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${visualConfirmed ? 'text-black' : 'text-amber-600'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-black mb-1">Visuel à fournir par le client</p>
                    <p className="text-xs text-gray-600 mb-3">
                      Le tarif de location inclut l'impression et la pose d'un visuel sur le totem.
                      Ce visuel doit être fourni par vos soins au format PDF à l'échelle 1/10ème,
                      photo 300 dpi, textes vectorisés, mode colorimétrique CMJN.
                    </p>
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="visual-confirm"
                        checked={visualConfirmed}
                        onChange={e => setVisualConfirmed(e.target.checked)}
                        className="mt-0.5 accent-black cursor-pointer"
                      />
                      <label htmlFor="visual-confirm" className="text-xs font-semibold text-black cursor-pointer leading-relaxed">
                        Je m'engage à fournir mon visuel aux formats requis avant la mise en production
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inclus dans la location */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-black">Ce qui est inclus :</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex gap-2"><Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />Mise à disposition du totem pour la durée choisie</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />Impression et pose du visuel fourni par le client</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />Livraison sur site</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />Reprise après événement</li>
              </ul>
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
                      <span className="text-xs text-gray-500 ml-1">— {deliveryPostalCode}, {deliveryCountry}</span>
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
                        <p className="text-red-600 text-xs mt-1">Code postal invalide (ex. : {POSTAL_RULES[deliveryCountry]?.example ?? ''})</p>
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
                        if (!validatePostalCode(deliveryPostalCode, deliveryCountry)) { setPostalCodeError(true); return; }
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

            {!canSubmit && (
              <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Veuillez renseigner la durée, confirmer la fourniture du visuel et indiquer votre localisation.</span>
              </div>
            )}

            <Button
              onClick={handleAddToCart}
              disabled={!canSubmit}
              className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Demander un devis location
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
