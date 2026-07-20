import { SEOMeta } from '../components/SEOMeta';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export function CGVPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEOMeta title="Conditions générales de vente" url="/cgv" noIndex />
    <div className="max-w-4xl mx-auto pt-20 px-4 pb-16">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="border-2 border-black"
        >
          ← Retour à l'accueil
        </Button>
      </div>

      <h1 className="text-4xl font-bold mb-6 text-black">Conditions Générales de Vente</h1>
      <p className="text-sm text-gray-600 mb-8">Dernière mise à jour : 27 avril 2026</p>

      <div className="space-y-8 text-black">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Objet</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Urbyn by Atelier Urbanize 
            et ses clients dans le cadre de la vente de totems, clôtures et stores urbains.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. Prix</h2>
          <p>
            Les prix sont indiqués en euros hors taxes (HT). La TVA applicable est de 20%. 
            Les prix peuvent être modifiés à tout moment mais les commandes sont facturées sur la base des tarifs en vigueur au moment de la validation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. Commande</h2>
          <p>
            La commande est considérée comme définitive après validation du paiement. 
            Un email de confirmation est envoyé au client contenant le récapitulatif de la commande et les détails de livraison.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Livraison et Installation</h2>
          <p>
            Les délais de livraison sont communiqués à titre indicatif. En cas de retard, le client en sera informé dans les meilleurs délais.
            Pour les options d'installation complète, un rendez-vous sera fixé avec le client dans un délai de 15 jours ouvrés après la livraison.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. Garanties</h2>
          <p>
            Tous nos produits bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés. 
            Une garantie commerciale spécifique peut s'appliquer selon les produits (voir documentation technique).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. Droit de rétractation</h2>
          <p>
            Conformément à la législation en vigueur, le client dispose d'un délai de 14 jours pour exercer son droit de rétractation 
            sans avoir à justifier de motifs ni à payer de pénalités, sauf les frais de retour.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">7. Contact</h2>
          <p>
            Pour toute question relative aux présentes CGV, vous pouvez nous contacter à l'adresse : info@urbanize.site
          </p>
        </section>
      </div>
    </div>
    </>
  );
}
