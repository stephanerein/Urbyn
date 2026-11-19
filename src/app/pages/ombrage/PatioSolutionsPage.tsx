import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Minus, Sun, Wind } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SEOMeta, breadcrumbSchema, faqSchema } from '../../components/SEOMeta';
import { ProgressSteps } from '../../components/ProgressSteps';
import { Button } from '../../components/ui/button';
import { ExempleSimulation } from '../../components/ombrage/ExempleSimulation';
import { ComparatifEconomique } from '../../components/ombrage/ComparatifEconomique';
import { SectionDepliable } from '../../components/ombrage/SectionDepliable';
import {
  GlossaireCouverture,
  GLOSSAIRE_AUTRES_LANGUES,
  GLOSSAIRE_FRANCAIS,
} from '../../components/ombrage/GlossaireCouverture';

// Page intermédiaire du parcours patio : les deux solutions, leurs bénéfices et
// leurs limites, avant la saisie des patios.
//
// Les arguments viennent du catalogue « Solutions d'ombrage 2027 » d'Urbanize
// (pages 3 à 6), des précisions de Stéphane Rein (motorisation, durées
// d'intervention, renouvellement de la toile fixe) et de la présentation
// commerciale Fontenay (comparatif financier). Ne rien ajouter ici qui n'y figure
// pas : cette page porte le référencement de la solution (SEO et GEO).

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
      "Store repliable sur câbles. La toile se déploie en période chaude et se replie par vent fort ou hors saison, sans dépose ni intervention extérieure.",
    benefices: [
      'Patio entièrement dégagé une fois la toile repliée',
      'Sans dépose ni intervention extérieure : la toile se replie hors saison',
      'Sans emprise au sol, étanchéité des toitures-terrasses préservée',
      'Modules de 3 m juxtaposés, adaptés à toutes les formes de patio',
      'Plus économique que la solution fixe à partir de la cinquième année',
      'Motorisable et connectable au système d’information du bâtiment',
      'Pilotage automatique possible : déployée au-dessus de 25 °C, repliée en dessous ou par vent fort et rafales',
      'Beaucoup plus de flexibilité d’usage',
      'En mise à disposition : ombrage garanti à 98 %',
    ],
    limites: [
      'Plus chère en acquisition que la solution fixe',
      'Une vérification annuelle à prévoir',
    ],
    formules: ['Acquisition', 'Mise à disposition'],
    reperes: [
      ['Module', '3 m de large, longueur sur mesure'],
      ['Manœuvre', 'Manuelle, ou motorisée et connectable au système d’information du bâtiment'],
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
      'Rapidement déployable',
      'Plusieurs toiles côte à côte pour couvrir les grands patios',
      'Une référence : 19 patios ombragés au CHRU de Tours – Bretonneau',
    ],
    limites: [
      'Pose en avril et dépose en octobre, à prévoir chaque année',
      'Chaque intervention mobilise une équipe de cordistes, d’une demi-journée à une journée selon la taille du patio',
      'Elle suppose les filins déjà installés : leur installation demande de 1 à 3 jours selon les dimensions du patio',
      'Manipuler la toile impose généralement de la renouveler tous les 5 ans : davantage un consommable qu’un investissement',
      'Disponible en acquisition uniquement',
      'Plus coûteuse que la solution repliable sur le long terme',
      'Solution moins flexible face aux évolutions climatiques',
    ],
    formules: ['Acquisition'],
    reperes: [
      ['Toiles', 'Dimension des toiles suivant la configuration du patio et les points d’ancrage de sécurité'],
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

const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: 'Quelle différence entre une couverture de patio repliable et une couverture fixe ?',
    answer:
      "La couverture repliable est un store sur câbles : il se déploie à la demande et se replie par vent fort ou hors saison, sans dépose. La couverture fixe est une toile microperforée tendue au-dessus du patio, posée en avril et déposée en octobre par une équipe de cordistes. L'ombre produite est la même ; le choix dépend de l'usage attendu et du budget sur la durée.",
  },
  {
    question: 'Une couverture de patio repliable peut-elle être automatisée ?',
    answer:
      "Oui. La couverture repliable peut être motorisée et connectée au système d'information du bâtiment. Elle se déplie alors lorsque la température dépasse 25 °C, et se replie lorsqu'elle est plus basse ou en cas de vent fort et de rafales. Elle offre beaucoup plus de flexibilité.",
  },
  {
    question: 'Quelle solution est la plus économique, repliable ou fixe ?',
    answer:
      "La couverture fixe coûte moins cher à l'acquisition. La couverture repliable devient moins coûteuse à partir de la cinquième année : sur un patio de 10 m × 10 m, mise en place comprise, 40 147 € HT contre 42 068 € HT sur 5 ans, et 49 351 € HT contre 61 742 € HT sur 10 ans.",
  },
  {
    question: 'Combien de temps faut-il pour installer une couverture fixe ?',
    answer:
      "L'installation de la toile mobilise une équipe de cordistes entre une demi-journée et une journée selon la taille du patio. Elle suppose que le dispositif de filins est déjà installé, ce qui demande de 1 à 3 jours selon les dimensions du patio.",
  },
  {
    question: 'Faut-il renouveler la toile d’une couverture fixe ?',
    answer:
      "Manipuler la toile (pose et dépose saisonnières) impose généralement de la renouveler tous les 5 ans. La couverture fixe relève ainsi davantage du consommable que de l'investissement. Son bénéfice : elle est rapidement déployable.",
  },
  {
    question: 'Peut-on obtenir une couverture de patio sans immobiliser de trésorerie ?',
    answer:
      "Oui, avec la mise à disposition de la couverture repliable, sur une durée de 5 à 10 ans : vérification annuelle, assurance du dispositif, pièces d'usure et toile sont compris dans la mensualité, avec un ombrage garanti à 98 %. Le chiffrage dépend de la note de crédit de l'entité qui choisit cette solution.",
  },
];

/** Position du bouton collé : juste sous l'en-tête et la barre d'étapes, dont la hauteur varie. */
function usePositionSousEtapes(defaut = 204) {
  const [top, setTop] = useState(defaut);
  useEffect(() => {
    const barre = document.querySelector<HTMLElement>('[data-progress-steps]');
    if (!barre) return;
    const mesurer = () => setTop(parseFloat(getComputedStyle(barre).top) + barre.offsetHeight + 8);
    mesurer();
    const observateur = new ResizeObserver(mesurer);
    observateur.observe(barre);
    return () => observateur.disconnect();
  }, []);
  return top;
}

export function PatioSolutionsPage() {
  const navigate = useNavigate();
  const topBouton = usePositionSousEtapes();
  const continuer = () => navigate('/solutions-ombrage/patio/services');

  return (
    <>
      <SEOMeta
        title="Couverture de patio repliable ou fixe : ombrage, motorisation, coût sur 5 et 10 ans"
        description="Ombrager un patio : couverture repliable (motorisable, connectable au système d'information du bâtiment, déployée au-dessus de 25 °C) ou couverture fixe (toile tendue saisonnière). Bénéfices, limites, installation et comparatif économique sur 5 et 10 ans."
        keywords="couverture de patio, voile d'ombrage patio, vélum patio, voilage, toldo patio, shade sail, Sonnensegel, ombrage patio, store repliable patio, store motorisé patio, toile tendue patio, couverture fixe patio, protection solaire patio, patio hôpital, canicule patio, mise à disposition ombrage, location longue durée ombrage, coût couverture patio, Atelier Urbanize"
        url="/solutions-ombrage/patio"
        jsonLd={[
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: "Solutions d'ombrage", url: '/solutions-ombrage' },
            { name: 'Couverture de patio', url: '/solutions-ombrage/patio' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Couverture de patio repliable ou fixe',
            serviceType: "Solution d'ombrage pour patio",
            description:
              "Couverture de patio repliable (motorisable, connectable au système d'information du bâtiment, en acquisition ou en mise à disposition) ou fixe (toile microperforée tendue, en acquisition), avec étude thermique, bureau d'études, fabrication en France et pose.",
            provider: { '@type': 'Organization', name: 'Atelier Urbanize', url: 'https://www.urbanize.site' },
            url: 'https://plateform.urbanize.site/solutions-ombrage/patio',
          },
          faqSchema(FAQ),
          {
            '@context': 'https://schema.org',
            '@type': 'DefinedTermSet',
            name: 'Glossaire de la couverture de patio',
            hasDefinedTerm: [...GLOSSAIRE_FRANCAIS, ...GLOSSAIRE_AUTRES_LANGUES].map((t) => ({
              '@type': 'DefinedTerm',
              name: t.terme,
              description: t.definition,
            })),
          },
        ]}
      />
      <div className="bg-white min-h-screen pt-[var(--header-height)]">
        <ProgressSteps currentStep={2} />

        <section className="pt-8 pb-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-4 sm:mb-8">
              <Button variant="outline" onClick={() => navigate('/configurateur')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux solutions
              </Button>
            </div>

            {/* Sur la même ligne que « Retour aux solutions » (dès que la largeur le permet), à droite,
                et toujours visible sous l'en-tête et les étapes, même en faisant défiler */}
            <div
              className="sticky z-30 mb-6 flex justify-end pointer-events-none sm:-mt-[68px] sm:mb-8"
              style={{ top: topBouton }}
            >
              <Button
                onClick={continuer}
                className="pointer-events-auto bg-black text-white hover:bg-gray-800 shadow-lg"
              >
                Décrivez vos patios
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Slogan */}
            <p className="text-lg md:text-xl font-bold text-black mb-3 max-w-[50ch]">
              Faire d'Urbanize votre partenaire de la performance énergétique de vos bâtiments
            </p>

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

            <section aria-labelledby="titre-pilotage" className="mt-14">
              <h2 id="titre-pilotage" className="text-2xl font-bold text-black mb-2">
                Une couverture repliable pilotable : motorisation et système d'information du bâtiment
              </h2>
              <p className="text-sm text-gray-700 mb-6 max-w-[75ch]">
                La couverture repliable peut être motorisée et connectée au système d'information du bâtiment.
                Elle s'adapte alors seule aux conditions du jour et offre beaucoup plus de flexibilité.
              </p>
              <dl className="grid sm:grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <dt className="font-bold text-black">Au-dessus de 25 °C</dt>
                  <dd className="text-sm text-gray-700 mt-1">La toile se déplie et ombrage le patio.</dd>
                </div>
                <div>
                  <dt className="font-bold text-black">Température plus basse</dt>
                  <dd className="text-sm text-gray-700 mt-1">La toile se replie : le patio retrouve toute sa lumière.</dd>
                </div>
                <div>
                  <dt className="font-bold text-black">Vent fort ou rafales</dt>
                  <dd className="text-sm text-gray-700 mt-1">La toile se replie pour protéger le dispositif.</dd>
                </div>
              </dl>
            </section>

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

            <ComparatifEconomique />

            <SectionDepliable id="titre-faq" titre="Questions fréquentes sur la couverture de patio">
              <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
                {FAQ.map((item) => (
                  <div key={item.question}>
                    <h3 className="text-base font-bold text-black mb-1">{item.question}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            </SectionDepliable>

            <GlossaireCouverture />

            <div className="mt-14 rounded-xl bg-gray-50 p-6 md:p-8 flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-[55ch]">
                <h2 className="text-xl font-bold text-black">Comparez les deux solutions sur vos patios</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Indiquez les dimensions de vos patios : l'estimation chiffre la couverture repliable
                  et la couverture fixe pour chacun d'eux.
                </p>
              </div>
              <Button onClick={continuer} className="bg-black text-white hover:bg-gray-800" size="lg">
                Décrivez vos patios
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
