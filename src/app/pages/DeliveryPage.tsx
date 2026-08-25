import { SEOMeta } from '../components/SEOMeta';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressSteps } from '../components/ProgressSteps';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { DeliveryAddressForm, DeliveryAddress } from '../components/DeliveryAddressForm';
import { useCart } from '../context/CartContext';

// Paris 75001 — point de départ fixe pour le calcul
const PARIS = { lat: 48.8603, lng: 2.3477 };
const BASE_FEE = 485;
const PER_KM = 1.15;
const PANEL_SURCHARGE = 300;

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

async function getRoadDistanceKm(dest: { lat: number; lng: number }): Promise<number> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${PARIS.lng},${PARIS.lat};${dest.lng},${dest.lat}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM unavailable');
    const data = await res.json();
    if (data?.routes?.[0]?.distance) return data.routes[0].distance / 1000;
    throw new Error('No route');
  } catch {
    // Fallback : vol d'oiseau × facteur de détour 1.3
    return haversineKm(PARIS, dest) * 1.3;
  }
}

function calcShipping(distanceKm: number, hasPanels: boolean): number {
  const base = Math.ceil(BASE_FEE + PER_KM * distanceKm);
  return hasPanels ? base + PANEL_SURCHARGE : base;
}

/** v1 : le module de calcul reste disponible, mais les frais ne rentrent pas dans le total. */
const V1_INCLUDE_SHIPPING_IN_TOTAL = false;

export function DeliveryPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice } = useCart();

  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: '',
    street2: '',
    postalCode: '',
    city: '',
    country: 'France',
    specialInstructions: '',
  });

  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  // Pré-remplir depuis localStorage (adresse complète si déjà saisie)
  useEffect(() => {
    const savedAddress = localStorage.getItem('deliveryAddress');
    if (savedAddress) {
      setDeliveryAddress(JSON.parse(savedAddress));
      return;
    }
    const savedInfo = localStorage.getItem('deliveryInfo');
    if (savedInfo) {
      const { postalCode, country } = JSON.parse(savedInfo);
      setDeliveryAddress(prev => ({ ...prev, postalCode, country }));
    }
  }, []);

  // Recalculer dès que les coordonnées de la ville sont disponibles
  useEffect(() => {
    if (!deliveryAddress.coordinates) {
      setShippingCost(null);
      return;
    }
    const hasPanels = items.some(i => i.details?.itemType === 'panels');

    setShippingLoading(true);
    getRoadDistanceKm(deliveryAddress.coordinates)
      .then(km => {
        const cost = calcShipping(km, hasPanels);
        const applied = V1_INCLUDE_SHIPPING_IN_TOTAL ? cost : 0;
        setShippingCost(applied);
        localStorage.setItem('shippingCost', String(applied));
      })
      .finally(() => setShippingLoading(false));
  }, [deliveryAddress.coordinates, items]);

  const handleContinue = () => {
    if (!deliveryAddress.street || !deliveryAddress.postalCode || !deliveryAddress.city) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    localStorage.setItem('deliveryAddress', JSON.stringify(deliveryAddress));
    navigate('/chiffrage-final');
  };

  useEffect(() => {
    if (items.length === 0) navigate('/panier');
  }, [items.length, navigate]);

  if (items.length === 0) return null;

  const totemSubtotal = items
    .filter(i => i.details?.itemType === 'totem')
    .reduce((s, i) => s + i.price * i.quantity, 0);
  const totalTotemQty = items
    .filter(i => i.details?.itemType === 'totem')
    .reduce((s, i) => s + i.quantity, 0);
  const totemDiscount = totalTotemQty >= 5 ? totemSubtotal * 0.1 : 0;
  const productsHT = getTotalPrice() - totemDiscount;
  const shipping = shippingCost ?? 0;
  const totalHT = productsHT + shipping;
  const totalTTC = totalHT * 1.2;

  return (
    <>
      <SEOMeta noIndex />
      <div className="min-h-screen bg-gray-50">
      <ProgressSteps currentStep={3} />
    <div className="max-w-4xl mx-auto pt-[var(--header-height)] px-4 pb-16">
      <div className="mb-8">
        <Button variant="outline" onClick={() => navigate('/panier')} className="border border-black">
          ← Retour au panier
        </Button>
      </div>

      <h1 className="font-bold mb-2 text-black">Adresse de livraison</h1>
      <p className="text-black mb-8">Renseignez l'adresse de livraison de votre commande</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Formulaire */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h2 className="font-bold mb-6 text-black">Informations de livraison</h2>
            <DeliveryAddressForm address={deliveryAddress} onChange={setDeliveryAddress} />
          </CardContent>
        </Card>

        {/* Récapitulatif */}
        <div className="space-y-4">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4 text-black">Récapitulatif de la commande</h3>

              {/* Produits */}
              <div className="flex justify-between text-sm mb-3">
                <span className="text-black">Prix des produits</span>
                <span className="font-bold text-black">{productsHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ HT</span>
              </div>

              {/* Livraison */}
              <div className="flex justify-between text-sm pb-4 border-b border-gray-200">
                <span className="text-black">Frais de livraison</span>
                {!V1_INCLUDE_SHIPPING_IN_TOTAL ? (
                  <span className="text-gray-500 text-xs italic">Non facturés (v1)</span>
                ) : shippingLoading ? (
                  <span className="flex items-center gap-1 text-gray-400 text-xs">
                    <Loader2 className="w-3 h-3 animate-spin" /> Calcul en cours…
                  </span>
                ) : shippingCost !== null ? (
                  <span className="font-bold text-black">{shippingCost.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                ) : (
                  <span className="text-gray-400 text-xs italic">Sélectionnez une ville</span>
                )}
              </div>

              {/* HT / TVA / TTC */}
              <div className="space-y-2 pt-4">
                {totemDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-700 font-medium">
                    <span>Remise totems (−10%)</span>
                    <span>−{totemDiscount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-black">
                  <span>Total HT</span>
                  <span className="font-bold">{totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>TVA (20%)</span>
                  <span>{(totalHT * 0.2).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                </div>
                <div className="flex justify-between font-bold text-black pt-2 border-t border-gray-200">
                  <span>Total TTC</span>
                  <span>
                    {shippingCost !== null
                      ? totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : (totalHT * 1.2).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    €
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleContinue}
            disabled={!deliveryAddress.street || !deliveryAddress.postalCode || !deliveryAddress.city}
            className="w-full bg-black hover:bg-gray-800 text-white py-6"
          >
            Continuer vers le chiffrage final
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
    </div>
  </>
  );
}
