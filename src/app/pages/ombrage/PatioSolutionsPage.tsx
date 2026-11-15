import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Minus, Sun, Wind } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SEOMeta, breadcrumbSchema } from '../../components/SEOMeta';
import { ProgressSteps } from '../../components/ProgressSteps';
import { Button } from '../../components/ui/button';
import { ExempleSimulation } from '../../components/ombrage/ExempleSimulation';

// Page intermédiaire du parcours patio : les deux solutions, leurs bénéfices et
// leurs limites, avant la saisie des patios.
//
// Tous les arguments viennent du catalogue « Solutions d'ombrage 2027 »
// d'Urbanize (pages 3 à 6). Ne rien ajouter ici qui n'y figure pas.

interface Solution {
  nom: string;
  accroche: string;
  icon: LucideIcon;
  description: string;
  benefices: string[];
  limites: string[];
  formules: string[];
  reperes: Array<[string, string]>;
}

const SOLUTIONS: Solution[] = [
  {
    nom: 'Couverture repliable',
    accroche: "L'ombre à la demande",
    icon: Wind,
    description:
      "Store repliable sur câbles, fixé sur les acrotères du patio. La toile se déploie en période chaude et se replie par vent fort ou hors saison, sans dépose ni intervention extérieure.",
    benefices: [
      'Patio entièrement dégagé une fois la toile repliée',
      'Sans dépose ni intervention extérieure : la toile se replie hors saison',
      'Sans emprise au sol, étanchéité des toitures-terrasses préservée',
      'Modules de 3 m juxtaposés, adaptés à toutes les formes de patio',
      'Plus économique que la solution fixe à partir de la cinquième année',
      'En mise à disposition : ombrage garanti à 98 %',
    ],
    limites: [
      'Plus chère à l’achat que la solution fixe',
      'Une vérification annuelle à prévoir',
    ],
    formules: ['Achat', 'Mise à disposition'],
    reperes: [
      ['Module', '3 m de large, longueur sur mesure'],
      ['Manœuvre', 'Manuelle, motorisation en option'],
      ['Hauteur', 'Toile à environ 1,10 m au-dessus de l’acrotère'],
      ['Fabrication', 'Environ 45 jours après validation des plans'],
    ],
  },
  {
    nom: 'Couverture fixe',
    accroche: "L'ombre toute la saison",
    icon: Sun,
    description:
      "Toile microperforée tendue au-dessus du patio, au niveau des toitures-terrasses. Posée au printemps et déposée à l'automne, elle ombrage le patio pendant toute la période chaude.",
    benefices: [
      'Investissement initial inférieur à la version repliable',
      'Ombrage continu pendant toute la période chaude',
      'Plusieurs toiles côte à côte pour couvrir les grands patios',
      'Une référence : 19 patios ombragés au CHRU de Tours – Bretonneau',
    ],
    limites: [
      'Pose en avril et dépose en octobre, à prévoir chaque année',
      'Chaque intervention mobilise une équipe de cordistes, une demi-journée',
      'Disponible à l’achat uniquement',
      'Plus coûteuse que la solution repliable au-delà de la cinquième année',
    ],
    formules: ['Achat'],
    reperes: [
      ['Toiles', '5 m de large maximum, posées côte à côte'],
      ['Fixation', 'Filin périphérique sur acrotères, toile reliée par sandows'],
      ['Saison', 'Pose en avril, dépose en octobre'],
    ],
  },
];

const POINTS_COMMUNS: Array<[string, string]> = [
  [
    'Une toile qui laisse passer l’air et la lumière',
    'Microperforée, avec 7,5 % d’ouverture : elle limite l’accumulation de chaleur et la prise au vent, et les locaux restent lumineux.',
  ],
  [
    'Une réaction au feu documentée',
    'Toile classée M1 et B-s2, d0 selon la norme EN 13501-1. Le procès-verbal est fourni avec chaque projet.',
  ],
  [
    'Une tenue au vent calculée',
    'Note de calcul par bureau d’études selon la norme NF EN 1991-1-4.',
  ],
  [
    'Une prestation clé en main',
    'Relevé sur site, étude thermique, fabrication en France et pose par nos équipes : deux jours par patio en moyenne.',
  ],
];

const MESURES: Array<[string, string, string]> = [
  ['Jusqu’à 86 %', 'de rayonnement solaire en moins sous la structure d’ombrage', 'Ville de Paris, mesures 2020'],
  ['Jusqu’à 13 °C', 'de moins à la surface du sol', 'Ville de Paris, mesures 2020'],
  ['8 à 12 °C', 'de moins dans l’air d’un patio clos qu’à l’extérieur, aux heures chaudes', 'Université de Séville, 2022'],
];

export function PatioSolutionsPage() {
  const navigate = useNavigate();
  const continuer = () => navigate('/solutions-ombrage/patio');

  return (
    <>
      <SEOMeta
        title="Couverture de patio : repliable ou fixe ?"
        description="Deux solutions pour ombrager un patio : la couverture repliable, déployée à la demande, et la couverture fixe, posée pour la saison. Bénéfices, limites et formules de chacune."
        keywords="couverture de patio, ombrage patio, store repliable patio, toile tendue patio, vélum patio, protection solaire patio, Atelier Urbanize"
        url="/solutions-ombrage/patio/solutions"
        jsonLd={breadcrumbSchema([
          { name: 'Accueil', url: '/' },
          { name: "Solutions d'ombrage", url: '/solutions-ombrage' },
          { name: 'Couverture de patio', url: '/solutions-ombrage/patio/solutions' },
        ])}
      />
      <div className="bg-white min-h-screen pt-[var(--header-height)]">
        <ProgressSteps currentStep={2} />

        <section className="pt-8 pb-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <Button variant="outline" onClick={() => navigate('/definir-besoin')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux solutions
              </Button>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-black">
              Couverture de patio : repliable ou fixe ?
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-[65ch]">
              L'ombre produite est la même. Le choix dépend de l'usage attendu et du budget sur la
              durée.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {SOLUTIONS.map((solution) => {
                const Icon = solution.icon;
                return (
                  <article key={solution.nom} className="rounded-xl border-2 border-slate-200 p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        <Icon className="h-6 w-6 text-black" strokeWidth={2.5} />
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                          {solution.accroche}
                        </p>
                        <h2 className="text-xl font-bold text-black">{solution.nom}</h2>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-6">{solution.description}</p>

                    <h3 className="text-sm font-bold text-black mb-3">Bénéfices</h3>
                    <ul className="space-y-2 mb-6">
                      {solution.benefices.map((benefice) => (
                        <li key={benefice} className="flex gap-2 text-sm text-black">
                          <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-700" aria-hidden="true" />
                          <span>{benefice}</span>
                        </li>
                      ))}
                    </ul>

                    <h3 className="text-sm font-bold text-black mb-3">Limites</h3>
                    <ul className="space-y-2 mb-6">
                      {solution.limites.map((limite) => (
                        <li key={limite} className="flex gap-2 text-sm text-gray-700">
                          <Minus className="h-4 w-4 shrink-0 mt-0.5 text-gray-500" aria-hidden="true" />
                          <span>{limite}</span>
                        </li>
                      ))}
                    </ul>

                    <dl className="mt-auto border-t border-slate-200 pt-4 space-y-2 text-sm">
                      <div className="flex gap-2">
                        <dt className="w-24 shrink-0 text-gray-500">Formules</dt>
                        <dd className="font-bold text-black">{solution.formules.join(' ou ')}</dd>
                      </div>
                      {solution.reperes.map(([libelle, valeur]) => (
                        <div key={libelle} className="flex gap-2">
                          <dt className="w-24 shrink-0 text-gray-500">{libelle}</dt>
                          <dd className="text-black">{valeur}</dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                );
              })}
            </div>

            <div className="mt-14">
              <ExempleSimulation />
            </div>

            <section className="mt-14">
              <h2 className="text-2xl font-bold text-black mb-6">Ce que les deux solutions ont en commun</h2>
              <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
                {POINTS_COMMUNS.map(([titre, texte]) => (
                  <div key={titre}>
                    <h3 className="text-base font-bold text-black mb-1">{titre}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{texte}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-14">
              <h2 className="text-2xl font-bold text-black mb-2">Ce que l'ombre change</h2>
              <p className="text-sm text-gray-700 mb-6 max-w-[65ch]">
                L'ombre agit d'abord sur le rayonnement solaire : c'est la chaleur rayonnée par le
                soleil et par les surfaces qui baisse fortement.
              </p>
              <div className="grid sm:grid-cols-3 gap-6">
                {MESURES.map(([valeur, effet, source]) => (
                  <div key={valeur} className="rounded-xl bg-slate-50 p-5">
                    <p className="text-2xl font-bold text-black">{valeur}</p>
                    <p className="text-sm text-black mt-1">{effet}</p>
                    <p className="text-xs text-gray-500 mt-3">{source}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4 max-w-[75ch]">
                Mesures publiées. Les écarts varient selon l'exposition, la hauteur et la configuration
                du site : chaque projet fait l'objet d'une étude thermique.
              </p>
            </section>

            <div className="mt-14 rounded-xl bg-gray-50 p-6 md:p-8 flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-[55ch]">
                <h2 className="text-xl font-bold text-black">Comparez les deux solutions sur vos patios</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Indiquez les dimensions de vos patios : l'estimation chiffre la couverture repliable
                  et la couverture fixe pour chacun d'eux.
                </p>
              </div>
              <Button onClick={continuer} className="bg-black text-white hover:bg-gray-800" size="lg">
                Décrire mes patios
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
