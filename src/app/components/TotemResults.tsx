import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { RefreshCcw, CheckCircle, Package, Truck, Wrench } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { DeliveryAddressForm, DeliveryAddress } from './DeliveryAddressForm';
import { StripeCheckout } from './StripeCheckout';
import type { TotemConfig, TotemItem } from './TotemCalculator';
import { TOTEM_PRICES } from './TotemCalculator';

interface TotemResultsProps {
  config: TotemConfig;
  onReset: () => void;
}

const TOTEM_LABELS = {
  caisson_bois: 'Totem Caisson Bois',
  gabion: 'Totem Gabion',
  liz: 'Totem Triptyque LIZ'
};

const CAISSON_FORMAT_LABELS = {
  '80': 'Format 80cm',
  '120': 'Format 120cm',
  '160': 'Format 160cm',
  '200': 'Format 200cm'
};

const PANEL_PRICES = {
  caisson_bois: {
    '80': 120,
    '120': 180,
    '160': 240,
    '200': 300
  },
  gabion: 180,
  liz: 250
};

const INSTALLATION_PRICE = 1690;

// Helper function to get panel price
const getPanelPrice = (item: TotemItem) => {
  if (item.totemType === 'caisson_bois' && item.caissonBoisFormat) {
    return PANEL_PRICES.caisson_bois[item.caissonBoisFormat];
  }
  return PANEL_PRICES[item.totemType] as number;
};

export function TotemResults({ config, onReset }: TotemResultsProps) {
  const [currentStep, setCurrentStep] = useState<'summary' | 'delivery' | 'payment'>('summary');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: '',
    street2: '',
    postalCode: '',
    city: '',
    country: 'France',
    specialInstructions: ''
  });

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
  };

  const calculateTotal = () => {
    let total = 0;
    let totalQuantity = 0;
    let totemTotal = 0;

    config.items.forEach(item => {
      totalQuantity += item.quantity;

      // Prix du totem
      if (item.totemType === 'caisson_bois') {
        totemTotal += TOTEM_PRICES.caisson_bois[item.caissonBoisFormat!] * item.quantity;
      } else {
        totemTotal += TOTEM_PRICES[item.totemType] * item.quantity;
      }

      // Prix des panneaux (sans remise)
      if (item.panels?.enabled) {
        total += getPanelPrice(item) * item.panels.quantity;
      }

      // Prix de l'installation (sans remise)
      if (item.installation) {
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

  const totalHT = calculateTotal();
  const totalTTC = totalHT * 1.2;

  // Calculer le total de quantité pour vérifier la remise
  const totalQuantity = config.items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculer le montant de la remise (seulement sur les totems)
  const calculateDiscountAmount = () => {
    let totemTotal = 0;
    config.items.forEach(item => {
      if (item.totemType === 'caisson_bois') {
        totemTotal += TOTEM_PRICES.caisson_bois[item.caissonBoisFormat!] * item.quantity;
      } else {
        totemTotal += TOTEM_PRICES[item.totemType] * item.quantity;
      }
    });
    return totemTotal * 0.1;
  };

  // Écran de confirmation de paiement
  if (paymentSuccess) {
    return (
      <div className="max-w-4xl mx-auto pt-12 px-4">
        <ProgressBar
          currentStep={3}
          totalSteps={3}
          steps={['Sélection', 'Options', 'Validation']}
        />
        <Card className="border-2 border-green-500 shadow-lg mt-8">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-24 h-24 mx-auto mb-6 text-green-600" />
            <h2 className="text-3xl font-bold mb-4 text-black">Commande confirmée !</h2>
            <p className="text-lg text-black mb-6">
              Votre commande de totem(s) a été enregistrée. Vous recevrez une confirmation par email avec les détails de livraison.
            </p>
            <Button
              onClick={onReset}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Étape paiement
  if (currentStep === 'payment') {
    return (
      <div className="max-w-2xl mx-auto pt-12 px-4">
        <ProgressBar
          currentStep={3}
          totalSteps={3}
          steps={['Sélection', 'Options', 'Validation']}
        />
        <div className="mt-8">
          <StripeCheckout
            amount={totalHT}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setCurrentStep('delivery')}
            orderDetails={{
              type: 'Totem(s)',
              description: `${config.items.length} totem(s) avec options`
            }}
          />
        </div>
      </div>
    );
  }

  // Étape adresse de livraison
  if (currentStep === 'delivery') {
    return (
      <div className="max-w-4xl mx-auto pt-12 px-4">
        <ProgressBar
          currentStep={2}
          totalSteps={3}
          steps={['Sélection', 'Options', 'Validation']}
        />

        <Card className="border-2 border-black shadow-lg mt-8">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-black">Adresse de livraison</h3>

            <DeliveryAddressForm
              address={deliveryAddress}
              onChange={setDeliveryAddress}
            />

            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('summary')}
                className="border-2 border-black"
              >
                ← Retour
              </Button>
              <Button
                onClick={() => setCurrentStep('payment')}
                disabled={!deliveryAddress.street || !deliveryAddress.postalCode || !deliveryAddress.city}
                className="flex-1 bg-black hover:bg-gray-800 text-white"
              >
                Continuer vers le paiement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Étape récapitulatif
  return (
    <div className="max-w-4xl mx-auto pt-12 px-4">
      <ProgressBar
        currentStep={2}
        totalSteps={3}
        steps={['Sélection', 'Options', 'Validation']}
      />

      <Card className="border-2 border-black shadow-lg mt-8">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold mb-2 text-black">Récapitulatif de votre commande</h3>
              <p className="text-black">Vérifiez les détails avant de continuer</p>
            </div>
            <Button onClick={onReset} variant="outline" className="border-2 border-black">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </div>

          {/* Liste des totems */}
          <div className="space-y-6 mb-8">
            {config.items.map((item, index) => {
              const totemPrice = item.totemType === 'caisson_bois'
                ? TOTEM_PRICES.caisson_bois[item.caissonBoisFormat!]
                : TOTEM_PRICES[item.totemType];

              return (
                <Card key={index} className="border-2 border-black bg-gray-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-black flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          {TOTEM_LABELS[item.totemType]}
                        </h4>
                        {item.totemType === 'caisson_bois' && (
                          <p className="text-sm text-black mt-1">{CAISSON_FORMAT_LABELS[item.caissonBoisFormat!]}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-black">{totemPrice}€ HT</div>
                        <div className="text-sm text-black">x {item.quantity}</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-black">
                        <span>Prix totem(s)</span>
                        <span className="font-bold">{totemPrice * item.quantity}€ HT</span>
                      </div>

                      {item.panels?.enabled && (
                        <div className="flex justify-between text-black">
                          <span className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            {item.panels.quantity} panneau(x) imprimé(s)
                          </span>
                          <span className="font-bold">{getPanelPrice(item) * item.panels.quantity}€ HT</span>
                        </div>
                      )}

                      {item.installation && (
                        <div className="flex justify-between text-black">
                          <span className="flex items-center gap-2">
                            <Wrench className="w-4 h-4" />
                            Installation complète
                          </span>
                          <span className="font-bold">{INSTALLATION_PRICE}€ HT</span>
                        </div>
                      )}

                      {!item.installation && (
                        <div className="flex items-center gap-2 text-black text-sm">
                          <Truck className="w-4 h-4" />
                          <span>Frais de livraison précisés après validation</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Total */}
          <div className="bg-black text-white p-6 rounded-lg mb-6">
            <div className="space-y-3">
              {totalQuantity >= 5 && (
                <div className="flex justify-between text-green-400">
                  <span>Remise -10% sur totems ({totalQuantity} totems)</span>
                  <span>-{calculateDiscountAmount().toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                </div>
              )}
              <div className="flex justify-between text-lg">
                <span>Total HT</span>
                <span className="font-bold">{totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
              </div>
              <div className="flex justify-between">
                <span>TVA (20%)</span>
                <span>{(totalHT * 0.2).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
              </div>
              <div className="border-t border-white pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Total TTC</span>
                  <span className="text-3xl font-bold">{totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Prochaine étape :</strong> Renseignez votre adresse de livraison puis procédez au paiement sécurisé.
              </p>
            </div>
            {!config.items.some(item => item.installation) && (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                <p className="text-sm text-black">
                  <strong>Note :</strong> Les frais de livraison seront précisés après validation de la configuration et saisie de l'adresse de livraison.
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={() => setCurrentStep('delivery')}
            className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg"
          >
            Continuer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
