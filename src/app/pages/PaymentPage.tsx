import { SEOMeta } from '../components/SEOMeta';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle } from 'lucide-react';
import { StripeCheckout } from '../components/StripeCheckout';
import { useCart } from '../context/CartContext';

export function PaymentPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    clearCart();
  };

  const handleCancel = () => {
    navigate('/livraison');
  };

  useEffect(() => {
    if (items.length === 0 && !paymentSuccess) {
      navigate('/panier');
    }
  }, [items.length, paymentSuccess, navigate]);

  if (items.length === 0 && !paymentSuccess) {
    return null;
  }

  const totemSubtotal = items
    .filter(i => i.details?.itemType === 'totem')
    .reduce((s, i) => s + i.price * i.quantity, 0);
  const totalTotemQty = items
    .filter(i => i.details?.itemType === 'totem')
    .reduce((s, i) => s + i.quantity, 0);
  const totemDiscount = totalTotemQty >= 5 ? totemSubtotal * 0.1 : 0;
  const totalHT = getTotalPrice() - totemDiscount;
  const shippingCost = Number(localStorage.getItem('shippingCost') ?? 0);
  const totalTTC = (totalHT + shippingCost) * 1.2;

  // Écran de confirmation
  if (paymentSuccess) {
    return (
      <>
      <SEOMeta noIndex />
      <div className="max-w-4xl mx-auto pt-20 px-4 pb-16">
        <Card className="border-2 border-green-500 shadow-lg">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-24 h-24 mx-auto mb-6 text-green-600" />
            <h1 className="text-4xl font-bold mb-4 text-black">Commande confirmée !</h1>
            <p className="text-lg text-black mb-4">
              Merci pour votre commande. Vous recevrez une confirmation par email avec tous les détails.
            </p>
            <p className="text-black mb-8">
              Numéro de commande : <strong>#{Date.now().toString().slice(-8)}</strong>
            </p>

            <div className="bg-gray-50 border-2 border-black rounded-lg p-6 mb-8 text-left">
              <h3 className="font-bold text-black mb-4">Prochaines étapes</h3>
              <ul className="space-y-2 text-sm text-black">
                <li>✓ Vous allez recevoir un email de confirmation</li>
                <li>✓ Notre équipe prépare votre commande</li>
                <li>✓ Vous serez contacté pour organiser la livraison</li>
                <li>✓ Suivi disponible dans votre espace client</li>
              </ul>
            </div>

            <Button
              onClick={() => navigate('/')}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
      </>
    );
  }

  // Page de paiement
  return (
    <div className="max-w-2xl mx-auto pt-20 px-4 pb-16">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={handleCancel}
          className="border-2 border-black"
        >
          ← Retour à l'adresse de livraison
        </Button>
      </div>

      <h1 className="text-4xl font-bold mb-2 text-black">Paiement sécurisé</h1>
      <p className="text-black mb-8">Finalisez votre commande en toute sécurité</p>

      <StripeCheckout
        amount={totalTTC}
        onSuccess={handlePaymentSuccess}
        onCancel={handleCancel}
        orderDetails={{
          type: 'Commande Urbyn',
          description: `${items.length} produit(s)`
        }}
      />
    </div>
  );
}
