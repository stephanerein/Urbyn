import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Loader2,
  Minus,
  Plus,
  Wrench,
} from 'lucide-react';
import { SEOMeta } from '../../components/SEOMeta';
import { ProgressSteps } from '../../components/ProgressSteps';
import { Button } from '../../components/ui/button';
import { Slider } from '../../components/ui/slider';
import { PlanPatio } from '../../components/ombrage/PlanPatio';
import { longueurVelum, modeliserPatio } from '../../components/ombrage/modelisation';
import type { PatioQuote, PatioQuoteLine } from '../../api/ombrage';
import {
  DUREE_ANNEES_MAX,
  DUREE_ANNEES_MIN,
  ecrireSaisie,
  euros,
  metres,
} from '../../lib/patioOmbrage';
import { usePatioDevis } from '../../lib/usePatioDevis';

// Chiffrage : l'aspect financier du projet, distinct du calibrage technique de
// la page précédente. Une page de synthèse : les deux solutions côte à côte, avec
// leurs totaux ; le détail par patio, couverture modélisée comprise, se déplie
// à la demande. Peu d'encadrés : deux colonnes, le reste est séparé par des filets.

function Ligne({ label, valeur, fort = false }: { label: string; valeur: string; fort?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={fort ? 'text-xl font-bold text-black' : 'text-sm font-semibold text-black'}>
        {valeur}
      </span>
    </div>
  );
}

/** Rubrique d'une colonne : un filet au-dessus, pas d'encadré. */
function Rubrique({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-slate-200 pt-4 space-y-2">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{titre}</p>
      {children}
    </div>
  );
}

type Modele = ReturnType<typeof modeliserPatio>;

/** Détail par patio, replié par défaut : le « + » l'ouvre. */
function DetailParPatio({
  patios,
  decrire,
}: {
  patios: PatioQuoteLine[];
  decrire: (patio: PatioQuoteLine) => {
    resume: string;
    valeurs: Array<[string, string]>;
    velums: Modele['velumsFixes'];
    forme: Modele['forme'];
  };
}) {
  return (
    <details className="group border-t border-slate-200 pt-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-black [&::-webkit-details-marker]:hidden">
        <Plus className="h-4 w-4 group-open:hidden" aria-hidden="true" />
        <Minus className="hidden h-4 w-4 group-open:block" aria-hidden="true" />
        Détail par patio
      </summary>
      <ul className="mt-4 divide-y divide-slate-200">
        {patios.map((patio) => {
          const d = decrire(patio);
          return (
            <li key={patio.nom} className="flex gap-4 py-4 first:pt-0">
              <div className="w-32 shrink-0">
                <PlanPatio
                  forme={d.forme}
                  velums={d.velums}
                  description={`Couverture modélisée de ${patio.nom}`}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-bold text-black">{patio.nom}</p>
                <p className="text-xs text-gray-600">{d.resume}</p>
                <div className="space-y-1 pt-1">
                  {d.valeurs.map(([label, valeur]) => (
                    <Ligne key={label} label={label} valeur={valeur} />
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

// Mise à disposition de la couverture repliable : durée au choix, de 5 à 10 ans.
// Les mensualités de chaque durée viennent du serveur avec le devis ; le curseur
// ne fait que choisir celle qui s'affiche.
function SelecteurDuree({
  dureeAnnees,
  onChange,
}: {
  dureeAnnees: number;
  onChange: (annees: number) => void;
}) {
  const annees = Array.from({ length: DUREE_ANNEES_MAX - DUREE_ANNEES_MIN + 1 }, (_, i) => DUREE_ANNEES_MIN + i);
  return (
    <div className="pt-2">
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <label htmlFor="duree-mise-a-disposition" className="text-sm font-bold text-black">
          Durée de mise à disposition
        </label>
        <output htmlFor="duree-mise-a-disposition" className="text-sm font-bold text-black">
          {dureeAnnees} ans
        </output>
      </div>
      <Slider
        id="duree-mise-a-disposition"
        aria-label="Durée de mise à disposition, en années"
        min={DUREE_ANNEES_MIN}
        max={DUREE_ANNEES_MAX}
        step={1}
        value={[dureeAnnees]}
        onValueChange={([valeur]) => onChange(valeur)}
      />
      <div className="flex justify-between mt-2 text-xs text-gray-600" aria-hidden="true">
        {annees.map((a) => (
          <span key={a} className={a === dureeAnnees ? 'font-bold text-black' : undefined}>
            {a}
          </span>
        ))}
      </div>
    </div>
  );
}

function ColonneRepliable({
  devis,
  dureeAnnees,
  onDuree,
}: {
  devis: PatioQuote;
  dureeAnnees: number;
  onDuree: (annees: number) => void;
}) {
  const t = devis.totaux;
  const nbPatios = devis.patios.length;
  const mensualiteTotale =
    t.retractable_loyers_mensuels.find((m) => m.duree_annees === dureeAnnees)?.loyer_mensuel ??
    t.retractable_loyer_mensuel;
  const forfait = devis.mise_en_place.incluse ? devis.mise_en_place.forfait : 0;

  return (
    <section aria-labelledby="titre-repliable" className="rounded-xl border-2 border-slate-200 p-6 flex flex-col gap-4">
      <header>
        <h2 id="titre-repliable" className="text-xl font-bold text-black">
          Couverture repliable
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {nbPatios} patio{nbPatios > 1 ? 's' : ''} ·{' '}
          {t.surface_m2.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} m²
        </p>
      </header>

      <Rubrique titre="Acquisition">
        <Ligne label="Dispositif posé" valeur={`${euros(t.retractable_acquisition)} HT`} fort />
        {forfait > 0 && (
          <Ligne label="Avec la mise en place" valeur={`${euros(t.retractable_acquisition + forfait)} HT`} />
        )}
        {devis.options.verification_annuelle ? (
          <Ligne
            label="Vérification annuelle (option retenue)"
            valeur={`${euros(t.retractable_verification_annuelle)} HT / an`}
          />
        ) : (
          <p className="text-xs text-gray-500">
            Vérification annuelle : option non retenue.{' '}
            <Link to="/solutions-ombrage/patio/services" className="font-bold underline underline-offset-2">
              La choisir
            </Link>
          </p>
        )}
      </Rubrique>

      <Rubrique titre="Mise à disposition">
        <div aria-live="polite">
          <Ligne label="Mensualité" valeur={`${euros(mensualiteTotale)} HT / mois`} fort />
          <p className="text-xs text-gray-500 mt-1">
            sur {dureeAnnees} ans, soit {dureeAnnees * 12} mensualités
          </p>
          <p className="text-xs text-gray-500">
            Taux de financement retenu :{' '}
            <span className="font-bold text-black">
              {(devis.taux_financement * 100).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} % l'an
            </span>
          </p>
        </div>
        <SelecteurDuree dureeAnnees={dureeAnnees} onChange={onDuree} />
        <div className="pt-1 text-xs text-gray-600">
          <p className="font-bold text-black">La mise à disposition inclut :</p>
          <ul className="mt-1 space-y-0.5">
            <li>• Vérification annuelle</li>
            <li>• Assurance du dispositif</li>
            <li>• Pièces d'usure et toile</li>
          </ul>
        </div>
      </Rubrique>

      <DetailParPatio
        patios={devis.patios}
        decrire={(patio) => {
          const r = patio.retractable;
          const m = modeliserPatio(patio);
          const mensualite =
            r.mise_a_disposition.mensualites.find((x) => x.duree_annees === dureeAnnees)?.loyer_mensuel ??
            r.mise_a_disposition.loyer_mensuel;
          const valeurs: Array<[string, string]> = [['Acquisition', `${euros(r.acquisition.prix_net)} HT`]];
          if (devis.options.verification_annuelle) {
            valeurs.push(['Vérification annuelle', `${euros(r.acquisition.verification_annuelle)} HT / an`]);
          }
          valeurs.push([`Mise à disposition, ${dureeAnnees} ans`, `${euros(mensualite)} HT / mois`]);
          return {
            resume: `${r.nb_velums} vélum${r.nb_velums > 1 ? 's' : ''} de ${metres(r.largeur_velum_mm)} de large : ${r.velums
              .map((v) => longueurVelum(v.longueur_mm))
              .join(', ')} de long · environ ${m.couvertRepliable} % du patio couvert`,
            valeurs,
            velums: m.velumsRepliables,
            forme: m.forme,
          };
        }}
      />
    </section>
  );
}

function ColonneFixe({ devis }: { devis: PatioQuote }) {
  const t = devis.totaux;
  const nbPatios = devis.patios.length;
  const forfait = devis.mise_en_place.incluse ? devis.mise_en_place.forfait : 0;

  return (
    <section aria-labelledby="titre-fixe" className="rounded-xl border-2 border-slate-200 p-6 flex flex-col gap-4">
      <header>
        <h2 id="titre-fixe" className="text-xl font-bold text-black">
          Couverture fixe
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {nbPatios} patio{nbPatios > 1 ? 's' : ''} ·{' '}
          {t.surface_m2.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} m²
        </p>
      </header>

      <Rubrique titre="Acquisition">
        <Ligne label="Dispositif posé" valeur={`${euros(t.fixe_acquisition)} HT`} fort />
        {forfait > 0 && (
          <Ligne label="Avec la mise en place" valeur={`${euros(t.fixe_acquisition + forfait)} HT`} />
        )}
        {devis.options.intervention_saisonniere ? (
          <>
            <Ligne
              label="Installation en avril, démontage en octobre"
              valeur={`${euros(t.fixe_saisonnier_annees_suivantes)} HT / an`}
            />
            <p className="text-xs text-gray-600">
              Option retenue : nos équipes installent les toiles en avril et les démontent en octobre (
              {euros(t.fixe_saisonnier_premiere_annee)} HT la première année).
            </p>
          </>
        ) : (
          <p className="text-xs text-gray-500">
            Installation en avril et démontage en octobre : option non retenue.{' '}
            <Link to="/solutions-ombrage/patio/services" className="font-bold underline underline-offset-2">
              La choisir
            </Link>
          </p>
        )}
      </Rubrique>

      <DetailParPatio
        patios={devis.patios}
        decrire={(patio) => {
          const f = patio.fixe;
          const m = modeliserPatio(patio);
          const valeurs: Array<[string, string]> = [['Acquisition', `${euros(f.acquisition.prix_net)} HT`]];
          if (devis.options.intervention_saisonniere) {
            valeurs.push(['Installation et démontage', `${euros(f.acquisition.saisonnier_annees_suivantes)} HT / an`]);
          }
          return {
            resume: `Toiles jointives de ${metres(f.largeur_velum_mm)} de large, déposées l'hiver · environ ${m.couvertFixe} % du patio couvert`,
            valeurs,
            velums: m.velumsFixes,
            forme: m.forme,
          };
        }}
      />
    </section>
  );
}

function ArgumentMiseADisposition({ nbPatios }: { nbPatios: number }) {
  const patios = nbPatios > 1 ? 'vos patios' : 'votre patio';
  return (
    <section aria-labelledby="titre-mise-a-disposition" className="border-t border-slate-200 pt-8 mt-10">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
        Couverture repliable — mise à disposition
      </p>
      <h2 id="titre-mise-a-disposition" className="text-xl md:text-2xl font-bold text-black mt-1">
        Ombrager {patios} sans immobiliser de trésorerie
      </h2>
      <p className="text-gray-700 mt-3 max-w-[70ch]">
        Avant tout une solution d'investissement : vous équipez {patios} sans faire l'acquisition du dispositif ni mobiliser de
        trésorerie. Vous réglez une mensualité, sur la durée que vous choisissez.
      </p>

      <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6 mt-6">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-black">
            <CalendarCheck className="h-5 w-5" aria-hidden="true" />
            Engagement de disponibilité
          </p>
          <p className="text-sm text-gray-700 mt-2">
            Ombrage garanti à 98 %. Urbanize s'engage sur le résultat, une ombre disponible quand vous en avez
            besoin, et pas seulement sur la livraison d'un équipement.
          </p>
        </div>
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-black">
            <Wrench className="h-5 w-5" aria-hidden="true" />
            Engagement de maintenance
          </p>
          <p className="text-sm text-gray-700 mt-2">
            Vérification annuelle, assurance du dispositif, pièces d'usure et toile sont compris dans la
            mensualité : Urbanize reste responsable du bon fonctionnement du dispositif pendant toute la durée.
          </p>
        </div>
      </div>
      <p className="text-sm font-bold text-black mt-6 max-w-[70ch]">
        Avec la mise à disposition, Urbanize ne vous fournit pas seulement un dispositif d'ombrage : il devient le
        partenaire de la performance de vos bâtiments.
      </p>
    </section>
  );
}

/** Réserves sur le chiffrage : en bas de page, en petit. */
function Reserves() {
  return (
    <aside
      aria-label="Réserves sur le chiffrage"
      className="mt-12 border-t border-slate-200 pt-4 space-y-1 text-xs text-gray-500 max-w-[90ch]"
    >
      <p>
        Chiffrage indicatif, sous réserve de visite sur site : il est établi d'après les dimensions indiquées, et
        tant que nos équipes ne se sont pas rendues sur place, il n'est pas possible de s'engager sur un montant
        ferme. Montants hors taxes.
      </p>
      <p>
        Mise à disposition : le chiffrage dépend de la note de crédit de l'entité qui choisit cette solution. La
        mensualité affichée est donc indicative.
      </p>
    </aside>
  );
}

export function PatioChiffragePage() {
  const navigate = useNavigate();
  const { saisie, saisieValide, devis, erreur } = usePatioDevis();
  const [dureeAnnees, setDureeAnnees] = useState(saisie.dureeAnnees);
  const choisirDuree = (annees: number) => {
    setDureeAnnees(annees);
    ecrireSaisie({ ...saisie, dureeAnnees: annees });
  };

  if (!saisieValide) {
    return <Navigate to="/solutions-ombrage/patio/dimensions" replace />;
  }

  return (
    <>
      <SEOMeta title="Solution d'ombrage pour patio — Chiffrage" noIndex />
      <div className="bg-white min-h-screen pt-[var(--header-height)]">
        <ProgressSteps currentStep={3} />

        <section className="pt-8 pb-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" onClick={() => navigate('/solutions-ombrage/patio/calibrage')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au calibrage
              </Button>
              <Button
                onClick={() => navigate('/solutions-ombrage/patio/coordonnees')}
                className="bg-black text-white hover:bg-gray-800"
              >
                Indiquer mes coordonnées
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-black">Votre chiffrage</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-[65ch]">
              L'essentiel de votre budget, solution par solution. Montants hors taxes, à titre indicatif.
            </p>

            {erreur && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {erreur}
              </p>
            )}

            {!devis && !erreur && (
              <p className="flex items-center gap-3 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                Calcul de votre chiffrage…
              </p>
            )}

            {devis && (
              <>
                {devis.mise_en_place.incluse && (
                  <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
                    <div>
                      <h2 className="text-lg font-bold text-black">Mise en place</h2>
                      <p className="text-sm text-gray-600 mt-1">{devis.mise_en_place.prestations.join(' · ')}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Forfait unique, commun à tous les patios et aux deux solutions, réglé à la commande.
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-black">{euros(devis.mise_en_place.forfait)} HT</p>
                  </div>
                )}

                {/* Les deux solutions au même niveau */}
                <div className="grid md:grid-cols-2 gap-6">
                  <ColonneRepliable devis={devis} dureeAnnees={dureeAnnees} onDuree={choisirDuree} />
                  <ColonneFixe devis={devis} />
                </div>

                <ArgumentMiseADisposition nbPatios={devis.patios.length} />

                {/* Suite : coordonnées et adresse du chantier, en vue du devis et du dossier complet */}
                <div className="border-t border-slate-200 pt-8 mt-10 flex flex-wrap items-center justify-between gap-6">
                  <div className="max-w-[60ch]">
                    <h2 className="text-xl font-bold text-black">Obtenir mon devis et mon dossier complet</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Indiquez vos coordonnées et l'adresse du chantier : nous établissons votre devis en bonne et
                      due forme, avec le dossier complet de votre projet. Une visite sur site permettra de le
                      confirmer.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate('/solutions-ombrage/patio/coordonnees')}
                    className="bg-black text-white hover:bg-gray-800"
                    size="lg"
                  >
                    Indiquer mes coordonnées
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <Reserves />
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
