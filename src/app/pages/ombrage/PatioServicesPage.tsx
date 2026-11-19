import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SEOMeta } from '../../components/SEOMeta';
import { ProgressSteps } from '../../components/ProgressSteps';
import { Button } from '../../components/ui/button';
import { CarteChoix } from '../../components/ombrage/CarteChoix';
import { ecrireSaisie, lireSaisie, type OmbrageSaisie } from '../../lib/patioOmbrage';

const PRESTATIONS_MISE_EN_PLACE = [
  'Étude thermique',
  "Étude de bureau d'études",
  'Repérage et prise de mesure',
];

// Première étape : les services souhaités. Le nombre de patios et leurs
// dimensions sont demandés sur la page suivante.
export function PatioServicesPage() {
  const navigate = useNavigate();
  const [saisie, setSaisie] = useState<OmbrageSaisie>(lireSaisie);

  const appliquer = (suivante: OmbrageSaisie) => {
    setSaisie(suivante);
    ecrireSaisie(suivante);
  };

  return (
    <>
      <SEOMeta title="Solution d'ombrage pour patio — Vos services" noIndex />
      <div className="bg-white min-h-screen pt-[var(--header-height)]">
        <ProgressSteps currentStep={2} />

        <section className="pt-8 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Button variant="outline" onClick={() => navigate('/solutions-ombrage/patio/solutions')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Repliable ou fixe : les deux solutions
              </Button>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-black">
              Solution d'ombrage pour patio
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-[65ch]">
              Choisissez les services dont vous avez besoin. Vous indiquerez ensuite le nombre de
              patios et leurs dimensions.
            </p>

            {/* Mise en place — prestation forfaitaire, obligatoire */}
            <CarteChoix
              coche
              obligatoire
              onChange={() => {}}
              titre="Mise en place"
              className="mb-4"
            >
              <p className="text-sm text-gray-600 mt-1 mb-3">
                Prestation forfaitaire obligatoire, réglée une seule fois quel que soit le nombre
                de patios.
              </p>
              <ul className="text-sm text-black space-y-1">
                {PRESTATIONS_MISE_EN_PLACE.map((prestation) => (
                  <li key={prestation}>• {prestation}</li>
                ))}
              </ul>
            </CarteChoix>

            {/* Options propres à chaque solution, chiffrées par patio à l'étape d'estimation */}
            <CarteChoix
              coche={saisie.verificationAnnuelle}
              onChange={(verificationAnnuelle) => appliquer({ ...saisie, verificationAnnuelle })}
              titre="Vérification annuelle"
              etiquette="Couverture repliable"
              className="mb-4"
            >
              <p className="text-sm text-gray-600 mt-1">
                Une visite chaque année pour contrôler votre couverture repliable. Proposée en
                acquisition uniquement : elle est déjà comprise en mise à disposition.
              </p>
            </CarteChoix>

            <CarteChoix
              coche={saisie.interventionSaisonniere}
              onChange={(interventionSaisonniere) => appliquer({ ...saisie, interventionSaisonniere })}
              titre="Installation en avril et démontage en octobre"
              etiquette="Couverture fixe"
              className="mb-10"
            >
              <p className="text-sm text-gray-600 mt-1">
                Souhaitez-vous que nos équipes interviennent chaque année pour installer vos
                toiles en avril, puis les démonter en octobre ?
              </p>
            </CarteChoix>

            <div className="flex justify-end">
              <Button
                onClick={() => navigate('/solutions-ombrage/patio')}
                className="bg-black text-white hover:bg-gray-800"
                size="lg"
              >
                Continuer : mes patios
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
