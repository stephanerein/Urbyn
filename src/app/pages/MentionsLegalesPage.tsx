import { SEOMeta } from '../components/SEOMeta';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export function MentionsLegalesPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEOMeta title="Mentions légales" url="/mentions-legales" noIndex />
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

      <h1 className="text-4xl font-bold mb-6 text-black">Mentions Légales</h1>

      <div className="space-y-8 text-black">
        <section>
          <h2 className="text-2xl font-bold mb-4">Éditeur du site</h2>
          <p>
            <strong>Raison sociale :</strong> Atelier Urbanize<br />
            <strong>Nom commercial :</strong> Urbyn<br />
            <strong>Email :</strong> info@urbanize.site<br />
            <strong>Téléphone :</strong> +33 (0)1 XX XX XX XX
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Hébergeur</h2>
          <p>
            Ce site est hébergé par :<br />
            [Nom de l'hébergeur]<br />
            [Adresse]<br />
            [Téléphone]
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Propriété intellectuelle</h2>
          <p>
            L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
            Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Données personnelles</h2>
          <p>
            Les informations recueillies font l'objet d'un traitement informatique destiné à la gestion des commandes. 
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant.
          </p>
        </section>
      </div>
    </div>
    </>
  );
}
