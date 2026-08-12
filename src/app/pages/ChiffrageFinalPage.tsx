import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressSteps } from '../components/ProgressSteps';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  MapPin, ShoppingBag, Package, Truck, CheckCircle,
  Phone, Mail, User, Layers, AlertTriangle, Send, ArrowLeft, Building2
} from 'lucide-react';
import { useCart } from '../context/CartContext';

interface DeliveryAddress {
  company?: string;
  street: string;
  street2?: string;
  postalCode: string;
  city: string;
  country: string;
  specialInstructions?: string;
}

interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const TRUCK_CAPACITY_KG = 24_000;

const TYPE_LABELS: Record<string, string> = {
  totem: 'Totem',
  cloture: 'Clôture / Palissade',
  store: 'Store',
  massif: 'Massif béton',
};

interface Partner {
  name: string;
  role: string;
  note: string;
  accentClass: string; // bg color token for the badge
}

const PARTNERS: Record<string, Partner> = {
  totem: {
    name: 'Urbanize',
    role: 'Conseiller Urbanize',
    note: 'Un conseiller Urbanize vous rappellera sous 48h pour finaliser votre commande de totems.',
    accentClass: 'bg-sky-700',
  },
  cloture: {
    name: 'Notre équipe',
    role: 'Notre équipe',
    note: 'Notre équipe vous contactera pour votre commande de clôture / palissade.',
    accentClass: 'bg-secondary',
  },
  store: {
    name: 'Notre équipe',
    role: 'Notre équipe',
    note: 'Notre équipe vous contactera pour votre commande de store.',
    accentClass: 'bg-secondary',
  },
  massif: {
    name: 'Alkern',
    role: 'Consultant Alkern',
    note: 'Un consultant Alkern vous rappellera sous 48h pour valider les détails et organiser la livraison des massifs.',
    accentClass: 'bg-amber-600',
  },
};

// Label affiché dans l'en-tête de chaque section produit
const SUPPLIER_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(PARTNERS).map(([k, v]) => [k, v.name])
);

const SERVICE_LABELS: Record<string, string> = {
  acquisition: 'Acquisition',
  location: 'Location',
  transport: 'Transport',
  enlevement: 'Enlèvement',
  installation: 'Installation',
  'note-calcul': 'Note de calcul',
  'conception-graphique': 'Conception graphique',
  'production-graphique': 'Production graphique',
  'reportage-photo': 'Reportage Photo',
  survey: 'Survey',
};

// Mapping type de panier → clé produit de ServicesSpecifiquesPage
const TYPE_TO_PRODUCT_PARAM: Record<string, string> = {
  totem: 'totem',
  cloture: 'palissade',
  massif: 'massif-beton',
};

function fmt(n: number): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function TruckGauge({ fillPct, truckIndex, totalTrucks }: { fillPct: number; truckIndex: number; totalTrucks: number }) {
  const capped = Math.min(fillPct, 100);
  const barColor = capped > 90 ? 'bg-amber-500' : 'bg-primary';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          Camion {truckIndex + 1}{totalTrucks > 1 ? ` / ${totalTrucks}` : ''}
        </span>
        <span className="text-xs font-semibold text-foreground">{Math.round(capped)} %</span>
      </div>
      <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${capped}%` }}
        />
      </div>
    </div>
  );
}

export function ChiffrageFinalPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice } = useCart();

  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [servicesByProduct, setServicesByProduct] = useState<Record<string, string[]>>({});
  const [contactForm, setContactForm] = useState<ContactForm>({ firstName: '', lastName: '', email: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const addr = localStorage.getItem('deliveryAddress');
    if (addr) setDeliveryAddress(JSON.parse(addr));
    // v1 : frais de livraison exclus du total (module conservé ailleurs)
    setShippingCost(0);
    localStorage.setItem('shippingCost', '0');
    const services = sessionStorage.getItem('servicesSpecifiques');
    if (services) {
      const parsed = JSON.parse(services);
      if (Array.isArray(parsed)) {
        // legacy format — impossible de connaître le produit, on ignore
      } else {
        setServicesByProduct(parsed);
      }
    }
  }, []);

  useEffect(() => {
    if (items.length === 0) navigate('/panier');
  }, [items, navigate]);

  /* ---- Groupement par type ---- */
  const itemsByType = items.reduce<Record<string, typeof items>>((acc, item) => {
    const t = item.type;
    if (!acc[t]) acc[t] = [];
    acc[t].push(item);
    return acc;
  }, {});
  const productTypes = Object.keys(itemsByType);

  /* ---- Massifs & camions ---- */
  const massifItems = itemsByType['massif'] ?? [];
  const hasMassif = massifItems.length > 0;
  const totalMassifWeight = massifItems.reduce((s, i) => s + (i.details?.weight ?? 0) * i.quantity, 0);
  const trucksCount = totalMassifWeight > 0 ? Math.ceil(totalMassifWeight / TRUCK_CAPACITY_KG) : 0;
  const truckFills: number[] = [];
  if (trucksCount > 0) {
    let remaining = totalMassifWeight;
    for (let i = 0; i < trucksCount; i++) {
      const load = Math.min(remaining, TRUCK_CAPACITY_KG);
      truckFills.push(Math.round((load / TRUCK_CAPACITY_KG) * 100));
      remaining -= load;
    }
  }

  /* ---- Totaux ---- */
  const totalProductsHT = getTotalPrice();
  const totemItems = itemsByType['totem'] ?? [];
  const totemSubtotal = totemItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalTotemQty = totemItems.reduce((s, i) => s + i.quantity, 0);
  const totemDiscount = totalTotemQty >= 5 ? totemSubtotal * 0.1 : 0;

  /* Répartition des frais de livraison proportionnelle au prix par type */
  const shippingByType: Record<string, number> = {};
  if (totalProductsHT > 0) {
    productTypes.forEach(t => {
      const typeTotal = itemsByType[t].reduce((s, i) => s + i.price * i.quantity, 0);
      shippingByType[t] = (typeTotal / totalProductsHT) * shippingCost;
    });
  }

  const totalHT = totalProductsHT - totemDiscount + shippingCost;
  const totalTTC = totalHT * 1.2;

  // Partenaires uniques actifs dans le panier (dédupliqués par nom)
  const activePartners: Partner[] = [];
  const seenNames = new Set<string>();
  productTypes.forEach(type => {
    const partner = PARTNERS[type];
    if (partner && !seenNames.has(partner.name)) {
      seenNames.add(partner.name);
      activePartners.push(partner);
    }
  });

  const handleContact = (field: keyof ContactForm, value: string) =>
    setContactForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.firstName || !contactForm.lastName || !contactForm.email || !contactForm.phone) {
      alert('Veuillez remplir tous les champs pour être recontacté.');
      return;
    }
    setSubmitted(true);
  };

  /* ---- Succès ---- */
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-2xl shadow-lg p-10 max-w-md w-full text-center border border-border">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Demande envoyée !</h2>
          <div className="space-y-2 mb-6">
            {activePartners.map(p => (
              <p key={p.name} className="text-muted-foreground text-sm">{p.note}</p>
            ))}
          </div>
          <Button onClick={() => navigate('/')} className="bg-foreground hover:bg-secondary text-white w-full">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ProgressSteps currentStep={4} />
      <div className="max-w-7xl mx-auto pt-20 px-4 pb-20">

        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/livraison')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la livraison
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <h1 className="text-foreground">Récapitulatif de votre demande</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-12">
            Vérifiez votre commande. Un conseiller vous contactera pour confirmer les détails et tarifs.
          </p>
        </div>

        {/* Layout 2 colonnes */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ─── Colonne gauche (scrollable) ─── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Produits groupés par type */}
            {productTypes.map(type => {
              const typeItems = itemsByType[type];
              const typeTotal = typeItems.reduce((s, i) => s + i.price * i.quantity, 0);
              const typeShipping = shippingByType[type] ?? 0;
              return (
                <div key={type} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  {/* En-tête section */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-primary" />
                      <h2 className="text-foreground">{TYPE_LABELS[type] ?? type}</h2>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Fournisseur :</span>
                      <span className="font-semibold text-foreground">{SUPPLIER_LABELS[type] ?? 'Notre équipe'}</span>
                    </div>
                  </div>

                  {/* Liste des items */}
                  <div className="divide-y divide-border">
                    {typeItems.map(item => (
                      <div key={item.id} className="flex items-start justify-between px-6 py-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Qté : {item.quantity}</p>
                          {item.type === 'massif' && item.details?.weight && (
                            <p className="text-xs text-muted-foreground">
                              {item.details.weight.toLocaleString('fr-FR')} kg/u
                              {' · '}{(item.details.weight * item.quantity).toLocaleString('fr-FR')} kg total
                            </p>
                          )}
                          {item.type === 'massif' && (
                            <button
                              onClick={() => navigate('/panier')}
                              className="mt-2 text-xs text-primary hover:text-primary/70 underline underline-offset-2 transition-colors"
                            >
                              Modifier la quantité
                            </button>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          {item.price > 0
                            ? <p className="text-sm font-semibold text-foreground">{fmt(item.price * item.quantity)} € HT</p>
                            : <p className="text-sm text-muted-foreground">Sur devis</p>
                          }
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Services sélectionnés pour ce produit */}
                  {(() => {
                    const param = TYPE_TO_PRODUCT_PARAM[type];
                    const svc = param ? (servicesByProduct[param] ?? []) : [];
                    if (svc.length === 0) return null;
                    return (
                      <div className="px-6 py-3 border-t border-border bg-muted/20">
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5" /> Services inclus
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {svc.map(s => (
                            <span key={s} className="flex items-center gap-1 text-xs bg-primary text-white px-2.5 py-1 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              {SERVICE_LABELS[s] ?? s}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Pied de section : remise + transport */}
                  <div className="px-6 py-3 bg-muted/30 border-t border-border space-y-2">
                    {type === 'totem' && totemDiscount > 0 && (
                      <div className="flex justify-between text-xs text-emerald-700">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Remise volume (5+ totems)
                        </span>
                        <span className="font-semibold">−{fmt(totemDiscount)} €</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" /> Transport {TYPE_LABELS[type]}
                      </span>
                      <span className="font-medium text-foreground">
                        {shippingCost > 0 ? `${fmt(typeShipping)} € HT` : 'Sur devis'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Jauge camion — massifs */}
            {hasMassif && totalMassifWeight > 0 && (
              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <h2 className="text-foreground">Remplissage du camion</h2>
                  </div>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {trucksCount} camion{trucksCount > 1 ? 's' : ''} nécessaire{trucksCount > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="px-6 py-5 space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Poids total', value: `${(totalMassifWeight / 1000).toFixed(2)} t` },
                      { label: 'Capacité / camion', value: `${(TRUCK_CAPACITY_KG / 1000).toFixed(0)} t` },
                      { label: 'Nb. camions', value: String(trucksCount) },
                    ].map(stat => (
                      <div key={stat.label} className="bg-muted rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="font-semibold text-foreground mt-0.5">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {truckFills.map((pct, i) => (
                      <TruckGauge key={i} fillPct={pct} truckIndex={i} totalTrucks={trucksCount} />
                    ))}
                  </div>

                  {trucksCount > 1 && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                      <p>
                        Votre commande nécessite <strong>{trucksCount} camions</strong>.
                        Les frais de transport seront ajustés par votre consultant Alkern.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* Adresse de livraison */}
            <div className="bg-card rounded-xl shadow-sm border border-border px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h2 className="text-foreground">Adresse de livraison</h2>
                </div>
                <button
                  onClick={() => navigate('/livraison')}
                  className="text-xs text-primary hover:text-primary/70 underline underline-offset-2 transition-colors"
                >
                  Modifier
                </button>
              </div>
              {deliveryAddress ? (
                <div className="text-sm text-muted-foreground space-y-0.5">
                  {deliveryAddress.company && (
                    <p className="font-semibold text-foreground">{deliveryAddress.company}</p>
                  )}
                  <p className="font-medium text-foreground">{deliveryAddress.street}</p>
                  {deliveryAddress.street2 && <p>{deliveryAddress.street2}</p>}
                  <p>{deliveryAddress.postalCode} {deliveryAddress.city}</p>
                  <p>{deliveryAddress.country}</p>
                  {deliveryAddress.specialInstructions && (
                    <p className="mt-2 italic text-xs">{deliveryAddress.specialInstructions}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground italic">Adresse non renseignée</p>
                  <button
                    onClick={() => navigate('/livraison')}
                    className="text-xs text-primary hover:text-primary/70 underline underline-offset-2 transition-colors"
                  >
                    Saisir une adresse
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* ─── Colonne droite sticky ─── */}
          <div className="w-full lg:w-[340px] shrink-0 sticky top-24 self-start space-y-4">

            {/* Chiffrage estimatif */}
            <div className="bg-card rounded-xl shadow-sm border border-border px-5 py-5">
              <h3 className="text-foreground mb-4">Chiffrage estimatif</h3>
              <div className="space-y-2.5 text-sm">
                {productTypes.map(type => {
                  const typeTotal = itemsByType[type].reduce((s, i) => s + i.price * i.quantity, 0);
                  if (typeTotal === 0) return null;
                  return (
                    <div key={type} className="flex justify-between text-muted-foreground">
                      <span>{TYPE_LABELS[type]}</span>
                      <span className="font-medium text-foreground">{fmt(typeTotal)} €</span>
                    </div>
                  );
                })}
                {totemDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 text-xs">
                    <span>Remise volume</span>
                    <span className="font-medium">−{fmt(totemDiscount)} €</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Transport</span>
                  <span className="font-medium text-foreground">
                    {shippingCost > 0 ? `${fmt(shippingCost)} €` : '—'}
                  </span>
                </div>
                <div className="border-t border-border pt-2.5 mt-1 space-y-1.5">
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>Total HT</span><span>{fmt(totalHT)} €</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>TVA 20%</span><span>{fmt(totalHT * 0.2)} €</span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground border-t border-border pt-2 mt-1">
                    <span>Total TTC</span><span>{fmt(totalTTC)} €</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 italic">
                Chiffrage indicatif — les tarifs seront confirmés lors de l'échange.
              </p>
            </div>

            {/* Finaliser votre commande */}
            <div className="bg-foreground rounded-xl shadow-lg px-5 py-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-4 h-4 opacity-80" />
                <h3 className="text-white">Finaliser votre demande</h3>
              </div>

              {/* Un badge par partenaire */}
              <div className="space-y-2 mb-4">
                {activePartners.map(p => (
                  <div key={p.name} className="rounded-lg overflow-hidden">
                    <div className={`flex items-center gap-2 px-3 py-1.5 ${p.accentClass}`}>
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs font-semibold">{p.name}</span>
                    </div>
                    <div className="bg-white/10 px-3 py-2">
                      <p className="text-xs opacity-75 leading-relaxed">{p.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="fn" className="text-xs text-white/70 mb-1 block">Prénom *</Label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-white/40" />
                      <Input
                        id="fn"
                        value={contactForm.firstName}
                        onChange={e => handleContact('firstName', e.target.value)}
                        className="pl-8 h-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/60"
                        placeholder="Jean"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ln" className="text-xs text-white/70 mb-1 block">Nom *</Label>
                    <Input
                      id="ln"
                      value={contactForm.lastName}
                      onChange={e => handleContact('lastName', e.target.value)}
                      className="h-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/60"
                      placeholder="Dupont"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-xs text-white/70 mb-1 block">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-white/40" />
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={e => handleContact('email', e.target.value)}
                      className="pl-8 h-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/60"
                      placeholder="jean.dupont@email.fr"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-xs text-white/70 mb-1 block">Téléphone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-white/40" />
                    <Input
                      id="phone"
                      type="tel"
                      value={contactForm.phone}
                      onChange={e => handleContact('phone', e.target.value)}
                      className="pl-8 h-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/60"
                      placeholder="06 00 00 00 00"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-white text-foreground hover:bg-white/90 h-10 text-sm font-semibold mt-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer ma demande
                </Button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
