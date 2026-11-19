import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { SEOMeta } from '../../components/SEOMeta';
import { ProgressSteps } from '../../components/ProgressSteps';
import { Button } from '../../components/ui/button';
import { PlanPatio, type VelumPlan } from '../../components/ombrage/PlanPatio';
import { SimulationPhoto } from '../../components/ombrage/SimulationPhoto';
import { CoupeCouverture, HAUTEUR_REPLIABLE_M } from '../../components/ombrage/CoupeCouverture';
import type { PatioQuoteLine } from '../../api/ombrage';
import { longueurVelum, modeliserPatio } from '../../components/ombrage/modelisation';
import {
  coinsParDefaut,
  coinsValides,
  ecrireCoins,
  lireCoins,
  lirePhoto,
  metres,
  type PatioSaisie,
  type Point,
} from '../../lib/patioOmbrage';
import { usePatioDevis } from '../../lib/usePatioDevis';

// Calibrage : l'aspect technique du projet. Pour chaque patio, les deux
// solutions dimensionnées d'après les mesures du client, avec leur simulation.
// Aucun montant ici : le chiffrage fait l'objet de la page suivante.
//
// Le patio est toujours dessiné d'après les quatre côtés saisis à l'étape
// précédente. Les vélums ne sont simulés sur photo que pour un patio dont le
// client a déposé la photo.

function LegendeVelums() {
  return (
    <p className="flex items-center gap-2 text-xs text-gray-600">
      <span
        aria-hidden="true"
        className="inline-block h-3 w-6 shrink-0 rounded-sm border border-pink-600"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #ec4899 0 2px, #fce7f3 2px 5px)',
        }}
      />
      Vélums
    </p>
  );
}

function CarteCalibrage({
  patio,
  saisie,
  index,
}: {
  patio: PatioQuoteLine;
  saisie: PatioSaisie;
  index: number;
}) {
  const r = patio.retractable;
  const f = patio.fixe;
  const photo = lirePhoto(index);
  // Coins du patio placés par le client sur sa photo ; gardés en mémoire pour
  // survivre à un aller-retour vers la page de saisie.
  const [coins, setCoins] = useState<Point[]>(() => lireCoins(index));
  const placerCoins = (suivants: Point[]) => {
    setCoins(suivants);
    ecrireCoins(index, suivants);
  };
  // Forme et vélums viennent du serveur : ce qui est dessiné est ce qui est chiffré.
  const { forme, velumsRepliables, velumsFixes, couvertRepliable, couvertFixe } = modeliserPatio(patio);
  const descriptionPlan = `Vue de dessus de ${patio.nom} : côté A ${saisie.largeur1} m, côté B ${saisie.largeur2} m, côté C ${saisie.longueur1} m, côté D ${saisie.longueur2} m`;

  return (
    <article className="rounded-xl border-2 border-slate-200 p-6">
      <header className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-black">{patio.nom}</h2>
          {/* Les quatre côtés saisis à l'étape précédente */}
          <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-black mt-2">
            {(
              [
                ['A', 'Largeur A', saisie.largeur1],
                ['B', 'Largeur B', saisie.largeur2],
                ['C', 'Longueur C', saisie.longueur1],
                ['D', 'Longueur D', saisie.longueur2],
              ] as const
            ).map(([lettre, libelle, valeur]) => (
              <div key={lettre} className="flex items-center gap-1.5">
                <dt>
                  <span className="sr-only">{libelle}</span>
                  <span
                    aria-hidden="true"
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-900 text-xs font-bold ${
                      lettre === 'A' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                    }`}
                  >
                    {lettre}
                  </span>
                </dt>
                <dd>{valeur.trim().replace('.', ',')} m</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-gray-600 mt-2">
            Surface du patio :{' '}
            {patio.surface_m2.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} m²
          </p>
        </div>
      </header>

      {photo && (
        <div className="border-t border-slate-200 pt-6 mb-6">
          <h3 className="text-base font-bold text-black">Simulation sur votre photo</h3>
          <p className="text-sm text-gray-600 mt-1 mb-4 max-w-[70ch]">
            Faites glisser les quatre points sur les coins de votre patio, en faisant correspondre
            les lettres avec celles du plan. Les deux solutions se dessinent aussitôt sur la photo,
            sous forme d'aperçu schématique.
          </p>
          <div className="grid sm:grid-cols-[1fr_minmax(0,220px)] gap-5 items-start">
            <SimulationPhoto
              photo={photo.apercu}
              forme={forme}
              coins={coins}
              onCoinsChange={placerCoins}
              description={`Photo de ${patio.nom} : placez les quatre coins du patio`}
            />
            <div>
              <PlanPatio forme={forme} fleche description={descriptionPlan} />
              <p className="text-xs text-gray-600 mt-1">
                Le côté A est celui où le dispositif sera installé.
              </p>
              <button
                type="button"
                className="mt-3 text-sm font-bold underline underline-offset-4"
                onClick={() => placerCoins(coinsParDefaut())}
              >
                Replacer les points
              </button>
            </div>
          </div>
          {!coinsValides(coins) && (
            <p role="alert" className="text-sm text-red-700 mt-3">
              Les quatre points doivent suivre le contour du patio, sans se croiser.
            </p>
          )}
        </div>
      )}

      {!photo && (
        <div className="border-t border-slate-200 pt-6 mb-6 grid sm:grid-cols-[minmax(0,260px)_1fr] gap-5 items-center">
          <PlanPatio forme={forme} fleche description={descriptionPlan} />
          <div>
            <p className="text-sm font-bold text-black">Votre patio, d'après vos dimensions</p>
            <p className="text-sm text-gray-600 mt-1">
              Déposez une photo de ce patio depuis le toit pour visualiser les deux solutions directement dessus.
            </p>
            <Link
              to="/solutions-ombrage/patio/dimensions"
              className="inline-block mt-3 text-sm font-bold underline underline-offset-4"
            >
              Ajouter une photo
            </Link>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Solution 1 — repliable */}
        <section className="border-t border-slate-200 pt-6">
          <h3 className="text-base font-bold text-black">Couverture repliable</h3>
          <p className="text-xs text-gray-600 mt-1 mb-4">
            {r.nb_velums} vélum{r.nb_velums > 1 ? 's' : ''} de {metres(r.largeur_velum_mm)} de large :{' '}
            {r.velums.map((velum) => longueurVelum(velum.longueur_mm)).join(', ')} de long
          </p>
          {photo && (
            <>
              <SimulationPhoto
                photo={photo.apercu}
                forme={forme}
                coins={coins}
                velums={velumsRepliables.map((velum) => velum.polygone)}
                rehaussement={HAUTEUR_REPLIABLE_M}
                description={`Simulation de la couverture repliable sur la photo de ${patio.nom} : la toile est relevée d'environ ${HAUTEUR_REPLIABLE_M.toLocaleString('fr-FR')} m au-dessus du toit`}
              />
              <PlanPatio forme={forme} velums={velumsRepliables} description={`${descriptionPlan}, avec ${r.nb_velums} vélums repliables`} />
              <LegendeVelums />
              <p className="text-xs text-gray-600 mt-1">
                Sur la photo, la toile est relevée d'environ{' '}
                {HAUTEUR_REPLIABLE_M.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} m au-dessus du
                toit, soutenue par ses supports. Hauteur indicative.
              </p>
            </>
          )}
          <p className="text-xs text-gray-600 mt-2">
            Les vélums sont parallèles au plus grand côté du patio ; chacun est dimensionné pour couvrir
            toute sa bande — environ {couvertRepliable} % du patio couvert.
          </p>
        </section>

        {/* Solution 2 — fixe */}
        <section className="border-t border-slate-200 pt-6">
          <h3 className="text-base font-bold text-black">Couverture fixe</h3>
          <p className="text-xs text-gray-600 mt-1 mb-4">
            Toiles jointives de {metres(f.largeur_velum_mm)} de large, déposées l'hiver
          </p>
          {photo && (
            <>
              <SimulationPhoto
                photo={photo.apercu}
                forme={forme}
                coins={coins}
                velums={velumsFixes.map((velum) => velum.polygone)}
                description={`Simulation de la couverture fixe sur la photo de ${patio.nom}`}
              />
              <PlanPatio forme={forme} velums={velumsFixes} description={`${descriptionPlan}, avec les toiles de la couverture fixe`} />
              <LegendeVelums />
            </>
          )}
          <p className="text-xs text-gray-600 mt-2">
            Couvre tout le patio, à 15 cm de sa périphérie — environ {couvertFixe} % du patio couvert.
          </p>
        </section>
      </div>
    </article>
  );
}

export function PatioCalibragePage() {
  const navigate = useNavigate();
  const { saisie, saisieValide, devis, erreur } = usePatioDevis();

  if (!saisieValide) {
    return <Navigate to="/solutions-ombrage/patio/dimensions" replace />;
  }

  return (
    <>
      <SEOMeta title="Solution d'ombrage pour patio — Calibrage de vos patios" noIndex />
      <div className="bg-white min-h-screen pt-[var(--header-height)]">
        <ProgressSteps currentStep={3} />

        <section className="pt-8 pb-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" onClick={() => navigate('/solutions-ombrage/patio/dimensions')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Modifiez vos patios
              </Button>
              <Button
                onClick={() => navigate('/solutions-ombrage/patio/chiffrage')}
                className="bg-black text-white hover:bg-gray-800"
              >
                Voir le chiffrage
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-black">Calibrage de vos patios</h1>
            <p className="text-lg text-gray-600 mb-10 max-w-[65ch]">
              Les deux solutions dimensionnées d'après vos mesures, patio par patio. Le chiffrage vous est
              présenté à l'étape suivante.
            </p>

            {erreur && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {erreur}
              </p>
            )}

            {!devis && !erreur && (
              <p className="flex items-center gap-3 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                Calibrage de vos patios…
              </p>
            )}

            {devis && (
              <>
                {/* Schéma de principe : une seule fois, valable pour tous les patios */}
                <section aria-labelledby="titre-principe" className="mb-8">
                  <h2 id="titre-principe" className="text-xl font-bold text-black mb-4">
                    Le principe des deux solutions
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-base font-bold text-black mb-2">Couverture repliable</h3>
                      <CoupeCouverture solution="repliable" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-black mb-2">Couverture fixe</h3>
                      <CoupeCouverture solution="fixe" />
                    </div>
                  </div>
                </section>

                <div className="space-y-8">
                  {devis.patios.map((patio, index) => (
                    <CarteCalibrage key={index} patio={patio} saisie={saisie.patios[index]} index={index} />
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-8 mt-12 flex flex-wrap items-center justify-between gap-6">
                  <div className="max-w-[60ch]">
                    <h2 className="text-xl font-bold text-black">Le calibrage vous convient ?</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Passez au chiffrage : mise en place, acquisition ou mise à disposition de la couverture
                      repliable, acquisition de la couverture fixe.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate('/solutions-ombrage/patio/chiffrage')}
                    className="bg-black text-white hover:bg-gray-800"
                    size="lg"
                  >
                    Voir le chiffrage
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Avertissements : en bas de page, en petit */}
                {devis.patios.some((patio) => patio.retractable.hors_tolerance) && (
                  <aside aria-label="Avertissements" className="mt-12 border-t border-slate-200 pt-4 text-xs text-gray-500 max-w-[90ch]">
                    <p>
                      Largeur atypique pour des vélums de 3 m (
                      {devis.patios
                        .filter((patio) => patio.retractable.hors_tolerance)
                        .map((patio) => patio.nom)
                        .join(', ')}
                      ) : une étude spécifique affinera ce calibrage.
                    </p>
                  </aside>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
