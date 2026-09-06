import { SEOMeta } from '../components/SEOMeta';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressSteps } from '../components/ProgressSteps';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowRight, Loader2, Truck } from 'lucide-react';
import { DeliveryAddressForm, DeliveryAddress } from '../components/DeliveryAddressForm';
import { useCart } from '../context/CartContext';
import {
  MASSIF_INSTALLATION_EUR,
  MASSIF_PER_TON_EXTRA_EUR,
  TOTEM_INSTALLATION_EUR,
  computeMassifShippingBySupplier,
  isMassifInstallationSelected,
  isTotemInstallationSelected,
} from '../lib/massifShipping';
import {
  TOTEM_ORIGIN_COORDS,
  TOTEM_ORIGIN_LABEL,
  TOTEM_PER_KM_EUR,
  TOTEM_TRUCK_BASE_EUR,
  TOTEM_TRUCK_CAPACITY,
  computeTotemShipping,
  countTotemUnits,
} from '../lib/totemShipping';
import {
  totemVolumeDiscountAmount,
  totemVolumeDiscountPercentLabel,
} from '../lib/totemDiscount';

// Paris — point de départ pour panneaux seuls (hors totems / massifs)
const PARIS = { lat: 48.8603, lng: 2.3477 };
const PANEL_BASE_FEE = 485;
const PANEL_PER_KM = 1.15;
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

async function getRoadDistanceKm(
  origin: { lat: number; lng: number },
  dest: { lat: number; lng: number },
): Promise<number> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM unavailable');
    const data = await res.json();
    if (data?.routes?.[0]?.distance) return data.routes[0].distance / 1000;
    throw new Error('No route');
  } catch {
    return haversineKm(origin, dest) * 1.3;
  }
}

function calcPanelShipping(distanceKm: number): number {
  return Math.ceil(PANEL_BASE_FEE + PANEL_PER_KM * distanceKm) + PANEL_SURCHARGE;
}

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

  const [totemRoadKm, setTotemRoadKm] = useState<number | null>(null);
  const [panelShippingCost, setPanelShippingCost] = useState<number | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  const massifItems = useMemo(
    () => items.filter((i) => i.type === 'massif' || i.details?.itemType === 'massif'),
    [items],
  );
  const totemQty = useMemo(() => countTotemUnits(items), [items]);
  const hasMassif = massifItems.length > 0;
  const hasTotem = totemQty > 0;
  const hasPanels = items.some((i) => i.details?.itemType === 'panels');

  const massifShipping = useMemo(
    () =>
      computeMassifShippingBySupplier(
        massifItems,
        deliveryAddress.postalCode,
        deliveryAddress.country || 'France',
      ),
    [massifItems, deliveryAddress.postalCode, deliveryAddress.country],
  );

  const totemShipping = useMemo(
    () =>
      computeTotemShipping(
        totemQty,
        deliveryAddress.postalCode,
        deliveryAddress.country || 'France',
        totemRoadKm,
      ),
    [totemQty, deliveryAddress.postalCode, deliveryAddress.country, totemRoadKm],
  );

  const massifInstallFee =
    hasMassif && isMassifInstallationSelected() ? MASSIF_INSTALLATION_EUR : 0;
  const totemInstallFee =
    hasTotem && isTotemInstallationSelected() ? TOTEM_INSTALLATION_EUR : 0;

  useEffect(() => {
    const savedAddress = localStorage.getItem('deliveryAddress');
    if (savedAddress) {
      setDeliveryAddress(JSON.parse(savedAddress));
      return;
    }
    const savedInfo = localStorage.getItem('deliveryInfo');
    if (savedInfo) {
      const { postalCode, country } = JSON.parse(savedInfo);
      setDeliveryAddress((prev) => ({ ...prev, postalCode, country }));
    }
  }, []);

  // Distance route Rouen → livraison (totems) + Paris → livraison (panneaux seuls)
  useEffect(() => {
    if (!deliveryAddress.coordinates) {
      setTotemRoadKm(null);
      setPanelShippingCost(hasPanels ? null : 0);
      return;
    }
    const dest = deliveryAddress.coordinates;
    setShippingLoading(true);
    const tasks: Promise<void>[] = [];

    if (hasTotem) {
      tasks.push(
        getRoadDistanceKm(TOTEM_ORIGIN_COORDS, dest).then((km) => {
          setTotemRoadKm(km);
        }),
      );
    } else {
      setTotemRoadKm(null);
    }

    if (hasPanels) {
      tasks.push(
        getRoadDistanceKm(PARIS, dest).then((km) => {
          setPanelShippingCost(calcPanelShipping(km));
        }),
      );
    } else {
      setPanelShippingCost(0);
    }

    Promise.all(tasks).finally(() => setShippingLoading(false));
  }, [deliveryAddress.coordinates, hasTotem, hasPanels]);

  const massifShipAmount = hasMassif ? massifShipping.shippingTotal : 0;
  const totemShipAmount = hasTotem ? totemShipping.shippingTotal : 0;
  const panelShipAmount = hasPanels ? panelShippingCost ?? 0 : 0;
  const shippingCost = massifShipAmount + totemShipAmount + panelShipAmount;
  const installFees = massifInstallFee + totemInstallFee;

  const shippingReady =
    (!hasMassif || !!deliveryAddress.postalCode) &&
    (!hasTotem || (!!deliveryAddress.postalCode && (totemRoadKm !== null || !!deliveryAddress.postalCode))) &&
    (!hasPanels || panelShippingCost !== null);

  useEffect(() => {
    if (!shippingReady && !hasMassif && !hasTotem) return;
    localStorage.setItem('shippingCostMassif', String(massifShipAmount));
    localStorage.setItem('shippingCostTotem', String(totemShipAmount));
    localStorage.setItem('shippingCostOther', String(panelShipAmount));
    localStorage.setItem('massifInstallFee', String(massifInstallFee));
    localStorage.setItem('totemInstallFee', String(totemInstallFee));
    localStorage.setItem('shippingCost', String(shippingCost + installFees));
    localStorage.setItem(
      'massifShippingBreakdown',
      JSON.stringify({
        groups: massifShipping.groups,
        tonnageFeeTotal: massifShipping.tonnageFeeTotal,
        installFee: massifInstallFee,
      }),
    );
    localStorage.setItem(
      'totemShippingBreakdown',
      JSON.stringify({
        ...totemShipping,
        installFee: totemInstallFee,
      }),
    );
  }, [
    shippingReady,
    shippingCost,
    massifShipAmount,
    totemShipAmount,
    panelShipAmount,
    massifShipping,
    totemShipping,
    massifInstallFee,
    totemInstallFee,
    installFees,
    hasMassif,
    hasTotem,
  ]);

  const handleContinue = () => {
    if (!deliveryAddress.street || !deliveryAddress.postalCode || !deliveryAddress.city) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    localStorage.setItem('deliveryAddress', JSON.stringify(deliveryAddress));
    localStorage.setItem('shippingCostMassif', String(massifShipAmount));
    localStorage.setItem('shippingCostTotem', String(totemShipAmount));
    localStorage.setItem('shippingCostOther', String(panelShipAmount));
    localStorage.setItem('massifInstallFee', String(massifInstallFee));
    localStorage.setItem('totemInstallFee', String(totemInstallFee));
    localStorage.setItem('shippingCost', String(shippingCost + installFees));
    navigate('/chiffrage-final');
  };

  useEffect(() => {
    if (items.length === 0) navigate('/panier');
  }, [items.length, navigate]);

  if (items.length === 0) return null;

  const totemSubtotal = items
    .filter((i) => i.details?.itemType === 'totem')
    .reduce((s, i) => s + i.price * i.quantity, 0);
  const totalTotemQty = totemQty;
  const totemDiscount = totemVolumeDiscountAmount(totemSubtotal, totalTotemQty);
  const totemDiscountPct = totemVolumeDiscountPercentLabel(totalTotemQty);
  const productsHT = getTotalPrice() - totemDiscount;
  const shipping = shippingCost;
  const totalHT = productsHT + shipping + installFees;
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
          <p className="text-black mb-8">Renseignez l&apos;adresse de livraison de votre commande</p>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h2 className="font-bold mb-6 text-black">Informations de livraison</h2>
                <DeliveryAddressForm address={deliveryAddress} onChange={setDeliveryAddress} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 text-black">Récapitulatif de la commande</h3>

                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-black">Prix des produits</span>
                    <span className="font-bold text-black">
                      {productsHT.toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      € HT
                    </span>
                  </div>

                  {hasMassif && massifShipping.groups.length > 0 && (
                    <div className="mb-3 space-y-1.5 text-xs text-gray-600 border border-gray-100 rounded-lg p-3 bg-gray-50">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Transport massifs (séparé)
                      </p>
                      {massifShipping.groups.map((g) => (
                        <div key={g.supplierKey} className="flex justify-between gap-2">
                          <span>
                            {g.supplierName} ({g.trucksCount} camion
                            {g.trucksCount > 1 ? 's' : ''} · {g.distanceKm} km)
                          </span>
                          <span className="font-semibold text-black shrink-0">
                            {g.shippingTotal.toLocaleString('fr-FR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                            €
                          </span>
                        </div>
                      ))}
                      {massifShipping.tonnageFeeTotal > 0 && (
                        <p className="text-[11px] text-gray-400 pt-1">
                          Dont coût exceptionnel {MASSIF_PER_TON_EXTRA_EUR} €/t :{' '}
                          {massifShipping.tonnageFeeTotal.toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                          })}
                          €
                        </p>
                      )}
                    </div>
                  )}

                  {hasTotem && totemShipping.trucksCount > 0 && (
                    <div className="mb-3 space-y-2 text-xs text-gray-600 border border-blue-100 rounded-lg p-3 bg-blue-50/60">
                      <p className="text-[11px] font-semibold text-blue-800 uppercase tracking-wide flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" /> Transport totems depuis {TOTEM_ORIGIN_LABEL}
                      </p>
                      <div className="flex justify-between gap-2">
                        <span>
                          {totemShipping.trucksCount} camion
                          {totemShipping.trucksCount > 1 ? 's' : ''} · {totemQty} totem
                          {totemQty > 1 ? 's' : ''} (max {TOTEM_TRUCK_CAPACITY}/camion) ·{' '}
                          {totemShipping.distanceKm} km
                        </span>
                        <span className="font-semibold text-black shrink-0">
                          {totemShipAmount.toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          €
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        {totemShipping.trucksCount} × ({TOTEM_TRUCK_BASE_EUR} € +{' '}
                        {totemShipping.distanceKm} km × {TOTEM_PER_KM_EUR} €)
                      </p>
                      <div className="space-y-1.5 pt-1">
                        {totemShipping.truckFills.map((fill, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between text-[10px] mb-0.5">
                              <span>
                                Camion {idx + 1}
                                {totemShipping.truckLoads[idx] != null
                                  ? ` · ${totemShipping.truckLoads[idx]}/${TOTEM_TRUCK_CAPACITY}`
                                  : ''}
                              </span>
                              <span>{Math.round(fill)}%</span>
                            </div>
                            <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 transition-all"
                                style={{ width: `${Math.min(100, fill)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasPanels && panelShipAmount > 0 && (
                    <div className="mb-3 flex justify-between gap-2 text-xs text-gray-600 border border-gray-100 rounded-lg p-3 bg-gray-50">
                      <span>Transport panneaux</span>
                      <span className="font-semibold text-black">
                        {panelShipAmount.toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        €
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm pb-2">
                    <span className="text-black">Frais de livraison</span>
                    {shippingLoading ? (
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <Loader2 className="w-3 h-3 animate-spin" /> Calcul…
                      </span>
                    ) : shippingReady || hasMassif || (hasTotem && deliveryAddress.postalCode) ? (
                      <span className="font-bold text-black">
                        {shipping.toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        €
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Sélectionnez une ville</span>
                    )}
                  </div>

                  {totemInstallFee > 0 && (
                    <div className="flex justify-between text-sm pb-2">
                      <span className="text-black">Installation totems</span>
                      <span className="font-bold text-black">
                        {totemInstallFee.toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        €
                      </span>
                    </div>
                  )}

                  {massifInstallFee > 0 && (
                    <div className="flex justify-between text-sm pb-4 border-b border-gray-200">
                      <span className="text-black">Installation massifs</span>
                      <span className="font-bold text-black">
                        {massifInstallFee.toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        €
                      </span>
                    </div>
                  )}

                  {!massifInstallFee && !totemInstallFee && (
                    <div className="border-b border-gray-200 pb-4" />
                  )}
                  {totemInstallFee > 0 && !massifInstallFee && (
                    <div className="border-b border-gray-200 pb-2" />
                  )}

                  <div className="space-y-2 pt-4">
                    {totemDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-700 font-medium">
                        <span>Remise totems ({totemDiscountPct})</span>
                        <span>
                          −
                          {totemDiscount.toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          €
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-black">
                      <span>Total HT</span>
                      <span className="font-bold">
                        {totalHT.toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        €
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>TVA (20%)</span>
                      <span>
                        {(totalHT * 0.2).toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        €
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-black pt-2 border-t border-gray-200">
                      <span>Total TTC</span>
                      <span>
                        {totalTTC.toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
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
