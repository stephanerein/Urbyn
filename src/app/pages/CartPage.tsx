import { SEOMeta } from '../components/SEOMeta';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressSteps } from '../components/ProgressSteps';
import { Button } from '../components/ui/button';
import { ArrowRight, Trash2, ShoppingBag, MapPin, Plus, Minus, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import totemCaissonBoisImg from '../../imports/totem-caisson-bois.jpg';

const IMG: Record<string, string> = {
  totem:        'https://images.unsplash.com/photo-1663249226183-2d1052137f86?w=120&h=120&fit=crop&auto=format',
  'totem-caisson-bois': totemCaissonBoisImg,
  'totem-gabion': 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=120&h=120&fit=crop',
  'totem-liz': 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=120&h=120&fit=crop',
  panels:       'https://images.unsplash.com/photo-1762417420787-7bb3b737009d?w=120&h=120&fit=crop&auto=format',
  balast:       'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=120&h=120&fit=crop&auto=format',
  installation: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=120&h=120&fit=crop&auto=format',
};

function itemImg(itemType: string, itemId?: string) {
  // Pour les totems, déterminer l'image basée sur l'ID
  if (itemType === 'totem' && itemId) {
    if (itemId.includes('caisson-bois')) return IMG['totem-caisson-bois'];
    if (itemId.includes('gabion')) return IMG['totem-gabion'];
    if (itemId.includes('liz')) return IMG['totem-liz'];
  }
  return IMG[itemType] ?? IMG.totem;
}

function QuantityControl({
  value, min = 1, max, onChange,
}: { value: number; min?: number; max?: number; onChange: (v: number) => void }) {
  return (
    <>
      <SEOMeta noIndex />
      <div className="flex items-center gap-1 border border-gray-300 rounded-md overflow-hidden w-fit">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
          className="px-2 py-1 text-black hover:bg-gray-100 disabled:opacity-30 transition-colors">
          <Minus className="w-3 h-3" />
        </button>
        <span className="px-3 py-1 text-sm font-medium text-black min-w-[2rem] text-center">{value}</span>
        <button type="button" onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
          disabled={max !== undefined && value >= max}
          className="px-2 py-1 text-black hover:bg-gray-100 disabled:opacity-30 transition-colors">
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </>
  );
}

export function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [savedDeliveryAddress, setSavedDeliveryAddress] = useState<{
    street?: string; postalCode?: string; city?: string; country?: string;
  } | null>(null);

  useEffect(() => {
    const full = localStorage.getItem('deliveryAddress');
    if (full) { setSavedDeliveryAddress(JSON.parse(full)); return; }
    const partial = localStorage.getItem('deliveryInfo');
    if (partial) setSavedDeliveryAddress(JSON.parse(partial));
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto pt-20 px-4">
        <div className="text-center py-16">
          <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-gray-400" />
          <h2 className="text-3xl font-bold mb-4 text-black">Votre panier est vide</h2>
          <p className="text-black mb-8">Ajoutez des produits pour commencer votre commande</p>
          <Button onClick={() => navigate('/')} className="bg-black hover:bg-gray-800 text-white">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  // Group items by itemType for the summary panel
  const totemItems       = items.filter(i => i.details?.itemType === 'totem');
  const panelItems       = items.filter(i => i.details?.itemType === 'panels');
  const balastItems      = items.filter(i => i.details?.itemType === 'balast');
  const massifItems      = items.filter(i => i.type === 'massif');
  const installationItem = items.find(i => i.details?.itemType === 'installation');

  const totalTotemQty     = totemItems.reduce((s, i) => s + i.quantity, 0);
  const totemSubtotal     = totemItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totemDiscount     = totalTotemQty >= 5 ? totemSubtotal * 0.1 : 0;
  const totalHT           = getTotalPrice() - totemDiscount;
  const tva               = totalHT * 0.2;
  const totalTTC          = totalHT * 1.2;

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <ProgressSteps currentStep={3} />
      <div className="max-w-7xl mx-auto px-4 pb-16">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Mon panier</h1>
            <p className="text-gray-500 mt-1 text-sm">
              {[
                totemItems.reduce((s, i) => s + i.quantity, 0) > 0 &&
                  `${totemItems.reduce((s, i) => s + i.quantity, 0)} totem(s)`,
                panelItems.reduce((s, i) => s + i.quantity, 0) > 0 &&
                  `${panelItems.reduce((s, i) => s + i.quantity, 0)} panneau(x)`,
                balastItems.reduce((s, i) => s + i.quantity, 0) > 0 &&
                  `${balastItems.reduce((s, i) => s + i.quantity, 0)} lest(s)`,
                massifItems.reduce((s, i) => s + i.quantity, 0) > 0 &&
                  `${massifItems.reduce((s, i) => s + i.quantity, 0)} massif(s)`,
                installationItem && '1 installation',
              ].filter(Boolean).join(' · ')}
            </p>
          </div>
          <button onClick={clearCart}
            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
            Vider le panier
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* LEFT — product list */}
          <div className="space-y-4">

            {/* Totems */}
            {totemItems.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">Totems</p>
                <div className="space-y-3">
                  {totemItems.map(item => (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-300">
                          <img src={itemImg('totem', item.id)} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <h3 className="font-semibold text-black text-sm flex-1">{item.name}</h3>
                            {item.windComplianceChecked ? (
                              <div className="flex items-center gap-1 text-green-600" title="Conformité vent vérifiée">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">Vérifié</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-orange-600" title="Conformité vent à vérifier">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">À vérifier</span>
                              </div>
                            )}
                          </div>
                          {item.details?.format && (
                            <p className="text-xs text-gray-500 mt-0.5">Format : {item.details.format} cm</p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">{item.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ HT / unité</p>
                          <div className="mt-3">
                            <QuantityControl value={item.quantity} onChange={v => updateQuantity(item.id, v)} />
                          </div>
                        </div>
                        <div className="flex flex-col justify-between items-end">
                          <button onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <p className="font-bold text-black text-sm">
                            {(item.price * item.quantity).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ HT
                          </p>
                        </div>
                      </div>
                      {!item.windComplianceChecked && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <Button
                            onClick={() => navigate('/totem/conformite')}
                            variant="outline"
                            className="w-full border border-orange-400 text-orange-700 hover:bg-orange-50 text-sm"
                            size="sm"
                          >
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Vérifier la conformité vent
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Panneaux */}
            {panelItems.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">Panneaux</p>
                <div className="space-y-3">
                  {panelItems.map(item => {
                    // Max panels = sum of totem quantities × 2 for matching format
                    const matchingTotems = totemItems.filter(t => t.details?.format === item.details?.format);
                    const maxPanels = matchingTotems.reduce((s, t) => s + t.quantity * 2, 0) || undefined;
                    return (
                      <div key={item.id} className="bg-white rounded-xl border border-gray-200 flex gap-4 p-5">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          <img src={itemImg('panels')} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-black text-sm">{item.name}</h3>
                          {item.details?.format && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Format : {item.details.format} × 150 cm
                              {maxPanels && <span className="text-gray-400"> — max {maxPanels}</span>}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">{item.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ HT / unité</p>
                          <div className="mt-3">
                            <QuantityControl value={item.quantity} min={1} max={maxPanels}
                              onChange={v => updateQuantity(item.id, v)} />
                          </div>
                        </div>
                        <div className="flex flex-col justify-between items-end">
                          <button onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <p className="font-bold text-black text-sm">
                            {(item.price * item.quantity).toLocaleString('fr-FR')}€ HT
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lests */}
            {balastItems.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">Lestage et sécurité</p>
                <div className="space-y-3">
                  {balastItems.map(item => (
                    <div key={item.id} className="bg-white rounded-xl border border-green-200 flex gap-4 p-5">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                        <ShieldCheck className="w-10 h-10 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <h3 className="font-semibold text-black text-sm flex-1">{item.name}</h3>
                          <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded text-green-700">
                            <CheckCircle className="w-3 h-3" />
                            <span className="text-xs font-medium">Conformité vent</span>
                          </div>
                        </div>
                        {item.details?.weight && (
                          <p className="text-xs text-gray-500 mt-0.5">Poids unitaire : {item.details.weight} kg</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">{item.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ HT / unité</p>
                        <div className="mt-3">
                          <QuantityControl value={item.quantity} onChange={v => updateQuantity(item.id, v)} />
                        </div>
                      </div>
                      <div className="flex flex-col justify-between items-end">
                        <button onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <p className="font-bold text-black text-sm">
                          {(item.price * item.quantity).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ HT
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Massifs */}
            {massifItems.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">Massifs béton</p>
                <div className="space-y-3">
                  {massifItems.map(item => (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 border border-gray-200 flex items-center justify-center">
                          <span className="text-2xl">🪨</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-black text-sm">{item.name}</h3>
                          {item.details?.weight && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.details.weight.toLocaleString('fr-FR')} kg/u
                              {' · '}{(item.details.weight * item.quantity).toLocaleString('fr-FR')} kg total
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ HT / unité
                          </p>
                          <div className="mt-3">
                            <QuantityControl value={item.quantity} onChange={v => updateQuantity(item.id, v)} />
                          </div>
                        </div>
                        <div className="flex flex-col justify-between items-end">
                          <button onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <p className="font-bold text-black text-sm">
                            {(item.price * item.quantity).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ HT
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Installation */}
            {installationItem && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">Services</p>
                <div className="bg-white rounded-xl border border-gray-200 flex gap-4 p-5">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={itemImg('installation')} alt="Installation complète" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-black text-sm">{installationItem.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Pilotage, scénographie et installation pour tous les totems</p>
                    <p className="text-xs text-gray-400 mt-1">Service forfaitaire</p>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <button onClick={() => removeItem(installationItem.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Supprimer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="font-bold text-black text-sm">
                      {installationItem.price.toLocaleString('fr-FR')}€ HT
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery info */}
            {savedDeliveryAddress && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium text-black">Adresse de livraison</p>
                    {savedDeliveryAddress.street
                      ? <>
                          <p className="mt-0.5">{savedDeliveryAddress.street}</p>
                          <p>{savedDeliveryAddress.postalCode} {savedDeliveryAddress.city}</p>
                          <p className="text-gray-400">{savedDeliveryAddress.country}</p>
                        </>
                      : <p className="text-gray-500 mt-0.5">
                          {savedDeliveryAddress.postalCode}{savedDeliveryAddress.city ? ` ${savedDeliveryAddress.city}` : ''}, {savedDeliveryAddress.country}
                          <span className="text-gray-400 ml-1 text-xs">— adresse complète à l'étape suivante</span>
                        </p>
                    }
                  </div>
                </div>
                <button
                  onClick={() => navigate('/livraison')}
                  className="text-xs text-primary hover:text-primary/70 underline underline-offset-2 shrink-0 transition-colors"
                >
                  Modifier
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — sticky summary */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-black text-base mb-5">Récapitulatif</h2>

              <div className="space-y-2 text-sm">
                {totemItems.map(item => (
                  <div key={item.id} className="flex justify-between text-gray-700">
                    <span className="truncate pr-2">{item.name} ×{item.quantity}</span>
                    <span className="flex-shrink-0">{(item.price * item.quantity).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                  </div>
                ))}
                {panelItems.map(item => (
                  <div key={item.id} className="flex justify-between text-gray-600">
                    <span className="truncate pr-2">Panneaux ×{item.quantity}</span>
                    <span className="flex-shrink-0">{(item.price * item.quantity).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                  </div>
                ))}
                {balastItems.map(item => (
                  <div key={item.id} className="flex justify-between text-green-700 font-medium">
                    <span className="truncate pr-2">Lests 25 kg ×{item.quantity}</span>
                    <span className="flex-shrink-0">{(item.price * item.quantity).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                  </div>
                ))}
                {massifItems.map(item => (
                  <div key={item.id} className="flex justify-between text-gray-700">
                    <span className="truncate pr-2">{item.name} ×{item.quantity}</span>
                    <span className="flex-shrink-0">{(item.price * item.quantity).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                  </div>
                ))}
                {installationItem && (
                  <div className="flex justify-between text-gray-600">
                    <span>Installation</span>
                    <span>{installationItem.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
                {totemDiscount > 0 && (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Remise totems (−10%)</span>
                    <span>−{totemDiscount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Total HT</span>
                  <span>{totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>TVA (20%)</span>
                  <span>{tva.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                </div>
                <div className="flex justify-between font-bold text-black text-base pt-1 border-t border-gray-100">
                  <span>Total TTC</span>
                  <span>{totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button onClick={() => navigate('/livraison')}
                  className="w-full bg-black hover:bg-gray-800 text-white py-5">
                  Passer commande
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button variant="outline" onClick={() => navigate('/')}
                  className="w-full border border-gray-300 text-gray-700">
                  Continuer mes achats
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
