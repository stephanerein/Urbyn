import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { RefreshCcw, ShoppingCart, Shield, MapPin, CheckCircle, Wind, Ruler, Layers } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { StripeCheckout } from './StripeCheckout';
import type { BETConfig } from './BETCalculator';
import { getWindZone, TERRAIN_CATEGORIES } from '../lib/wind-zones';

interface BETResultsProps {
  config: BETConfig;
  onReset: () => void;
}

const BARDAGE_LABELS: Record<string, string> = {
  dibond: 'Dibond',
  tole_acier: 'Tôle acier',
  panneau_bois: 'Panneau bois'
};

const BET_PRICE = 480;


export function BETResults({ config, onReset }: BETResultsProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const categoryData = TERRAIN_CATEGORIES[config.terrainCategory as keyof typeof TERRAIN_CATEGORIES] || TERRAIN_CATEGORIES.zone_urbaine;
  const windData = getWindZone(config.postalCode, config.country, config.city);
  
  const handlePurchaseClick = () => {
    setShowCheckout(true);
  };

  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    setPaymentSuccess(true);
  };

  const handleCancelCheckout = () => {
    setShowCheckout(false);
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-4xl mx-auto pt-12">
        <Card className="border-2 border-green-500 shadow-lg">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-24 h-24 mx-auto mb-6 text-green-600" />
            <h2 className="text-3xl font-bold mb-4">Paiement réussi !</h2>
            <p className="text-lg text-slate-600 mb-6">
              Votre commande pour l'Étude BET a été confirmée.
            </p>
            <div className="bg-slate-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold mb-3">Prochaines étapes :</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Vous allez recevoir un email de confirmation à l'adresse fournie</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Notre bureau d'études prendra contact avec vous sous 48h</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>L'étude certifiée vous sera livrée dans un délai de 7 à 10 jours ouvrés</span>
                </li>
              </ul>
            </div>
            <Button 
              onClick={onReset}
              className="bg-black hover:bg-slate-800 text-white"
            >
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="max-w-2xl mx-auto pt-12">
        <StripeCheckout
          amount={BET_PRICE}
          onSuccess={handlePaymentSuccess}
          onCancel={handleCancelCheckout}
          orderDetails={{
            type: 'Étude BET - Résistance au vent',
            description: `Chantier : ${config.city} (${config.postalCode}) - Zone de vent ${windData.zone} - ${categoryData.label}`
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-12">
      <ProgressBar 
        currentStep={2} 
        totalSteps={4}
        steps={['Configuration', 'Analyse', 'Validation', 'Confirmation']}
      />
      
      <Card className="border-2 border-slate-200 shadow-lg mt-8">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold mb-2">Récapitulatif Étude BET</h3>
              <p className="text-slate-600">Étude de résistance au vent certifiée</p>
            </div>
            <Button onClick={onReset} variant="outline" className="border-2">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
            <div className="flex items-start gap-4">
              <Shield className="w-10 h-10 text-blue-700 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2 text-blue-900">Étude certifiée Eurocode EN 1991-1-4</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Calculs de résistance au vent (renversement et glissement)</li>
                  <li>Analyse personnalisée selon la localisation de votre chantier</li>
                  <li>Rapport certifié par notre bureau d'études agréé</li>
                  <li>Recommandations techniques de lestage et fixation</li>
                  <li>Document valide pour votre assurance</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-6 mb-6 border-2 border-slate-200">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Localisation du chantier
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 text-sm">
                <p className="font-medium">{config.street}</p>
                {config.street2 && <p className="text-slate-600">{config.street2}</p>}
                <p className="font-medium">{config.postalCode} {config.city}</p>
                <p className="text-slate-600">{config.country}</p>
              </div>
              <div className="h-48 rounded-lg overflow-hidden border-2 border-slate-300 bg-slate-100 flex items-center justify-center">
                <p className="text-slate-400 text-sm">Carte de localisation</p>
              </div>
            </div>
          </div>

          <div className="bg-cyan-50 rounded-lg p-6 mb-6 border-2 border-cyan-500">
            <h4 className="font-semibold mb-4 flex items-center gap-2 text-cyan-900">
              <Wind className="w-5 h-5" />
              Analyse de la zone de vent
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-cyan-700 mb-1">Zone de vent</p>
                  <p className="font-semibold text-cyan-900 text-2xl">Zone {windData.zone}</p>
                </div>
                <div>
                  <p className="text-xs text-cyan-700 mb-1">Vitesse de base Vb</p>
                  <p className="font-semibold text-cyan-900 text-2xl">{windData.vb} m/s</p>
                </div>
                <div>
                  <p className="text-xs text-cyan-700 mb-1">Équivalent</p>
                  <p className="font-semibold text-cyan-900">{Math.round(windData.vb * 3.6)} km/h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Caractéristiques de la palissade */}
          <div className="bg-purple-50 rounded-lg p-6 mb-6 border-2 border-purple-500">
            <h4 className="font-semibold mb-4 flex items-center gap-2 text-purple-900">
              <Ruler className="w-5 h-5" />
              Caractéristiques de la palissade
            </h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-purple-700 mb-1">Hauteur de la palissade</p>
                <p className="font-semibold text-purple-900 text-xl">{config.palissadeHeight || 2} m</p>
              </div>
              <div>
                <p className="text-xs text-purple-700 mb-1">Type de bardage</p>
                <p className="font-semibold text-purple-900 text-xl">
                  {config.bardageType ? BARDAGE_LABELS[config.bardageType] : 'Dibond'}
                </p>
              </div>
            </div>
          </div>

          {/* Catégorie de terrain */}
          <div className="bg-green-50 rounded-lg p-6 mb-6 border-2 border-green-500">
            <h4 className="font-semibold mb-4 flex items-center gap-2 text-green-900">
              <Layers className="w-5 h-5" />
              Environnement du chantier
            </h4>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-green-700 mb-1">Catégorie de terrain</p>
                <p className="font-semibold text-green-900">{categoryData.label}</p>
              </div>
              <div>
                <p className="text-xs text-green-700 mb-1">Classification Eurocode</p>
                <p className="font-semibold text-green-900">{categoryData.eurocodeCategory}</p>
              </div>
              <p className="text-sm text-green-800 mt-2">{categoryData.description}</p>
            </div>
          </div>

          <div className="border-2 border-black rounded-lg p-8 mb-8 bg-white">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Prix de l'étude certifiée</p>
              <p className="text-5xl font-bold mb-2">
                {BET_PRICE} €
              </p>
              <p className="text-slate-600">HT</p>
              <p className="text-sm text-slate-600 mt-4">
                Rapport personnalisé avec calculs détaillés
              </p>
            </div>
          </div>

          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-orange-900">
              <strong>Important :</strong> Cette étude est un élément de sécurité essentiel qui protège votre 
              responsabilité et vous couvre vis-à-vis de votre assurance.
            </p>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handlePurchaseClick}
              className="flex-1 bg-black hover:bg-slate-800 text-white py-6"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Acheter l'étude
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}