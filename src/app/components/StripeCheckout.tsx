import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Loader2 } from 'lucide-react';

interface StripeCheckoutProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  orderDetails: {
    type: string;
    description: string;
  };
}

export function StripeCheckout({ amount, onSuccess, onCancel, orderDetails }: StripeCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulation pour la démo Urbyn
    setTimeout(() => {
      onSuccess();
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <Card className="border-2 border-slate-200 shadow-lg">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Paiement sécurisé</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-50 rounded-lg p-6 border-2 border-slate-200">
            <h3 className="font-semibold mb-2">Récapitulatif de commande</h3>
            <div className="flex justify-between mb-1">
              <span className="text-slate-600">{orderDetails.type}</span>
            </div>
            <p className="text-sm text-slate-600 mb-3">{orderDetails.description}</p>
            <div className="flex justify-between pt-3 border-t border-slate-300">
              <span className="font-bold text-lg">Total à payer</span>
              <span className="font-bold text-2xl text-slate-900">{amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € TTC</span>
            </div>
          </div>

          <div className="border-2 border-slate-200 rounded-lg p-6 bg-white">
            <div className="text-center text-slate-600">
              <p className="mb-2 font-medium">💳 Simulation de paiement Stripe</p>
              <p className="text-sm text-slate-500 italic">
                En environnement de test, cliquez sur le bouton ci-dessous pour valider la transaction.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 h-12 border-2"
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-black hover:bg-slate-800 text-white shadow-md transition-all"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                `Confirmer l'achat`
              )}
            </Button>
          </div>

          <div className="text-xs text-center text-slate-500 flex flex-col gap-1">
            <p>🔒 Transaction 100% sécurisée</p>
            <p>Urbyn ne stocke aucune information bancaire.</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
