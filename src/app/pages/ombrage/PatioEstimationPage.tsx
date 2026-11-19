import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { SEOMeta } from '../../components/SEOMeta';
import { ProgressSteps } from '../../components/ProgressSteps';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { PlanPatio, type VelumPlan } from '../../components/ombrage/PlanPatio';
import { SimulationPhoto } from '../../components/ombrage/SimulationPhoto';
import { ExempleSimulationCompact } from '../../components/ombrage/ExempleSimulation';
import {
  fetchPatioQuote,
  submitPatioDemande,
  type PatioContact,
  type PatioOptions,
  type PatioQuote,
  type PatioQuoteLine,
  type PointPlan,
} from '../../api/ombrage';
import {
  coinsParDefaut,
  coinsValides,
  ecrireCoins,
  euros,
  lireCoins,
  lirePhoto,
  lirePhotos,
  lireSaisie,
  metres,
  partCouverte,
  patioComplet,
  versDimensions,
  type PatioSaisie,
  type Point,
  type Quadrilatere,
} from '../../lib/patioOmbrage';

// ── Modélisation ───────────────────────────────────────────────────────────
// Le patio est toujours dessiné d'après les quatre côtés saisis à l'étape
// précédente. Les vélums ne sont modélisés que pour un patio dont le client a
// déposé la photo.

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

function CartePatio({
  patio,
  saisie,
  index,
  options,
}: {
  patio: PatioQuoteLine;
  saisie: PatioSaisie;
  index: number;
  options: PatioQuote['options'];
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
  // Forme et vélums viennent du devis : ce qui est dessiné est ce qui est chiffré.
  const enPoints = (polygone: PointPlan[]): Point[] => polygone.map(([x, y]) => ({ x, y }));
  const forme = enPoints(patio.forme) as Quadrilatere;
  const longueurVelum = (mm: number) =>
    `${(mm / 1000).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;
  const velumsRepliables: VelumPlan[] = r.velums.map((velum) => ({
    polygone: enPoints(velum.polygone),
    etiquette: longueurVelum(velum.longueur_mm),
  }));
  const velumsFixes: VelumPlan[] = f.velums.map((polygone) => ({ polygone: enPoints(polygone) }));
  const pourcent = (velums: VelumPlan[]) =>
    Math.round(partCouverte(forme, velums.map((velum) => velum.polygone)) * 100);
  const couvertRepliable = pourcent(velumsRepliables);
  const couvertFixe = pourcent(velumsFixes);
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
        <div className="rounded-lg border border-slate-200 p-5 mb-6">
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
          {photo && !coinsValides(coins) && (
            <p role="alert" className="text-sm text-red-700 mt-3">
              Les quatre points doivent suivre le contour du patio, sans se croiser.
            </p>
          )}
        </div>
      )}

      {!photo && (
        <div className="rounded-lg border border-dashed border-slate-300 p-5 mb-6 grid sm:grid-cols-[minmax(0,260px)_1fr] gap-5 items-center">
          <PlanPatio forme={forme} fleche description={descriptionPlan} />
          <div>
            <p className="text-sm font-bold text-black">Votre patio, d'après vos dimensions</p>
            <p className="text-sm text-gray-600 mt-1">
              Déposez une photo de ce patio depuis le toit pour visualiser les deux solutions directement dessus.
            </p>
            <Link
              to="/solutions-ombrage/patio"
              className="inline-block mt-3 text-sm font-bold underline underline-offset-4"
            >
              Ajouter une photo
            </Link>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Solution 1 — repliable */}
        <section className="rounded-lg bg-slate-50 p-5">
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
                description={`Simulation de la couverture repliable sur la photo de ${patio.nom}`}
              />
              <PlanPatio forme={forme} velums={velumsRepliables} description={`${descriptionPlan}, avec ${r.nb_velums} vélums repliables`} />
              <LegendeVelums />
            </>
          )}
          <p className="text-xs text-gray-600 mt-2 mb-5">
            Les vélums sont parallèles au plus grand côté du patio ; chacun est dimensionné pour couvrir
            toute sa bande — environ {couvertRepliable} % du patio couvert.
          </p>
          {r.hors_tolerance && (
            <p className="flex gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-2 mb-4">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Largeur atypique pour des vélums de 3 m : une étude spécifique affinera ce chiffrage.
            </p>
          )}

          <div className="space-y-4">
            <div className="rounded-md bg-white border border-slate-200 p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Acquisition</p>
              <Ligne label="Dispositif posé" valeur={`${euros(r.acquisition.prix_net)} HT`} fort />
              {options.verification_annuelle ? (
                <Ligne
                  label="Vérification annuelle (option retenue)"
                  valeur={`${euros(r.acquisition.verification_annuelle)} HT / an`}
                />
              ) : (
                <p className="text-xs text-gray-500">
                  Vérification annuelle : option non retenue.{' '}
                  <Link to="/solutions-ombrage/patio/services" className="font-bold underline underline-offset-2">
                    La choisir
                  </Link>
                </p>
              )}
            </div>
            <div className="rounded-md bg-white border border-slate-200 p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Mise à disposition</p>
              <Ligne label="Mensualité" valeur={`${euros(r.mise_a_disposition.loyer_mensuel)} HT / mois`} fort />
              <Ligne label="Durée" valeur={`${r.mise_a_disposition.duree_mois} mois`} />
              <p className="text-xs text-gray-600 pt-1">
                Pose, vérification, assurance, pièces d'usure et démontage final inclus. Aucun investissement.
              </p>
            </div>
          </div>
        </section>

        {/* Solution 2 — fixe */}
        <section className="rounded-lg bg-slate-50 p-5">
          <h3 className="text-base font-bold text-black">Couverture fixe</h3>
          <p className="text-xs text-gray-600 mt-1 mb-4">
            {f.nb_velums} toile{f.nb_velums > 1 ? 's' : ''} jointive{f.nb_velums > 1 ? 's' : ''} de {metres(f.largeur_velum_mm)} de large, déposée{f.nb_velums > 1 ? 's' : ''} l'hiver
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
              <PlanPatio forme={forme} velums={velumsFixes} description={`${descriptionPlan}, avec ${f.nb_velums} vélums fixes`} />
              <LegendeVelums />
            </>
          )}
          <p className="text-xs text-gray-600 mt-2 mb-5">
            Couvre tout le patio, à 15 cm de sa périphérie — environ {couvertFixe} % du patio couvert.
          </p>

          <div className="space-y-4">
            <div className="rounded-md bg-white border border-slate-200 p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Acquisition</p>
              <Ligne label="Dispositif posé" valeur={`${euros(f.acquisition.prix_net)} HT`} fort />
              {options.intervention_saisonniere ? (
                <>
                  <Ligne
                    label="Installation en avril, démontage en octobre"
                    valeur={`${euros(f.acquisition.saisonnier_annees_suivantes)} HT / an`}
                  />
                  <p className="text-xs text-gray-600 pt-1">
                    Option retenue : nos équipes installent les toiles en avril et les démontent en
                    octobre ({euros(f.acquisition.saisonnier_premiere_annee)} HT la première année).
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-500">
                  Intervention d'installation en avril et de démontage en octobre : option non retenue.{' '}
                  <Link to="/solutions-ombrage/patio/services" className="font-bold underline underline-offset-2">
                    La choisir
                  </Link>
                </p>
              )}
            </div>
            <div className="rounded-md border border-dashed border-slate-300 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Mise à disposition</p>
              <p className="text-sm text-gray-600 mt-1">Non proposée pour la couverture fixe.</p>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}

const CONTACT_VIDE: PatioContact = {
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  societe: '',
  message: '',
};

export function PatioEstimationPage() {
  const navigate = useNavigate();
  const saisie = useMemo(lireSaisie, []);
  const saisieValide = saisie.patios.every(patioComplet);
  const dimensions = useMemo(() => versDimensions(saisie.patios), [saisie]);
  const options: PatioOptions = useMemo(
    () => ({
      verificationAnnuelle: saisie.verificationAnnuelle,
      interventionSaisonniere: saisie.interventionSaisonniere,
    }),
    [saisie],
  );

  const [devis, setDevis] = useState<PatioQuote | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [contact, setContact] = useState<PatioContact>(CONTACT_VIDE);
  const [envoi, setEnvoi] = useState<'idle' | 'en-cours' | 'envoye'>('idle');
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);

  useEffect(() => {
    if (!saisieValide) return;
    let annule = false;
    fetchPatioQuote(dimensions, options)
      .then((resultat) => {
        if (!annule) setDevis(resultat);
      })
      .catch(() => {
        if (!annule) setErreur("Le chiffrage n'a pas pu être calculé. Réessayez dans un instant.");
      });
    return () => {
      annule = true;
    };
  }, [dimensions, options, saisieValide]);

  if (!saisieValide) {
    return <Navigate to="/solutions-ombrage/patio" replace />;
  }

  const nbPhotos = lirePhotos().length;

  const envoyer = async (event: React.FormEvent) => {
    event.preventDefault();
    setEnvoi('en-cours');
    setErreurEnvoi(null);
    try {
      await submitPatioDemande({
        patios: dimensions,
        options,
        contact,
        photos: lirePhotos(),
      });
      setEnvoi('envoye');
    } catch (e) {
      setEnvoi('idle');
      setErreurEnvoi(
        e instanceof Error && e.message
          ? e.message
          : "L'envoi de la demande a échoué. Réessayez dans un instant.",
      );
    }
  };

  const champ = (cle: keyof PatioContact) => ({
    value: contact[cle],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setContact({ ...contact, [cle]: e.target.value }),
  });

  return (
    <>
      <SEOMeta title="Solution d'ombrage pour patio — Votre estimation" noIndex />
      <div className="bg-white min-h-screen pt-[var(--header-height)]">
        <ProgressSteps currentStep={3} />

        <section className="pt-8 pb-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <Button variant="outline" onClick={() => navigate('/solutions-ombrage/patio')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Modifier mes patios
              </Button>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-black">Votre estimation</h1>
            <p className="text-lg text-gray-600 mb-10 max-w-[65ch]">
              Deux solutions chiffrées pour chaque patio. Montants hors taxes, à titre indicatif avant étude sur site.
            </p>

            {erreur && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {erreur}
              </p>
            )}

            {!devis && !erreur && (
              <p className="flex items-center gap-3 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                Calcul de votre estimation…
              </p>
            )}

            {devis && (
              <>
                {devis.mise_en_place.incluse && (
                  <div className="rounded-xl border-2 border-black bg-slate-50 p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-black">Mise en place</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {devis.mise_en_place.prestations.join(' · ')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Forfait unique, commun à tous les patios et aux deux solutions, réglé à la commande.
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-black">{euros(devis.mise_en_place.forfait)} HT</p>
                  </div>
                )}

                <div className="space-y-8">
                  {devis.patios.map((patio, index) => (
                    <CartePatio
                      key={index}
                      patio={patio}
                      saisie={saisie.patios[index]}
                      index={index}
                      options={devis.options}
                    />
                  ))}
                </div>

                {devis.patios.length > 1 && (
                  <div className="rounded-xl border-2 border-slate-200 p-6 mt-8">
                    <h2 className="text-lg font-bold text-black mb-4">
                      Ensemble des {devis.patios.length} patios —{' '}
                      {devis.totaux.surface_m2.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} m²
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Repliable — acquisition</p>
                        <p className="text-xl font-bold text-black mt-1">{euros(devis.totaux.retractable_acquisition)} HT</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Repliable — mise à disposition</p>
                        <p className="text-xl font-bold text-black mt-1">{euros(devis.totaux.retractable_loyer_mensuel)} HT / mois</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Fixe — acquisition</p>
                        <p className="text-xl font-bold text-black mt-1">{euros(devis.totaux.fixe_acquisition)} HT</p>
                      </div>
                    </div>
                    {(devis.options.verification_annuelle || devis.options.intervention_saisonniere) && (
                      <div className="grid sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-200">
                        {devis.options.verification_annuelle && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Repliable — vérification annuelle</p>
                            <p className="text-xl font-bold text-black mt-1">{euros(devis.totaux.retractable_verification_annuelle)} HT / an</p>
                          </div>
                        )}
                        {devis.options.intervention_saisonniere && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Fixe — installation et démontage</p>
                            <p className="text-xl font-bold text-black mt-1">{euros(devis.totaux.fixe_saisonnier_annees_suivantes)} HT / an</p>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-4">
                      Hors forfait de mise en place. Chaque patio peut être commandé seul, dans l'une ou l'autre solution.
                    </p>
                  </div>
                )}

                {/* Demande : transmet les dimensions, le chiffrage et les photos */}
                <div className="rounded-xl bg-gray-50 p-6 md:p-8 mt-12">
                  {envoi === 'envoye' ? (
                    <div className="flex items-start gap-4" role="status">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black">
                        <Check className="h-5 w-5 text-white" />
                      </span>
                      <div>
                        <h2 className="text-xl font-bold text-black">Votre demande est enregistrée</h2>
                        <p className="text-gray-600 mt-1">
                          {nbPhotos > 0
                            ? 'Nous préparons la simulation réaliste de vos patios et revenons vers vous.'
                            : 'Un spécialiste revient vers vous pour préciser votre projet.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={envoyer} className="space-y-4">
                      <div>
                        <h2 className="text-xl font-bold text-black">
                          {nbPhotos > 0 ? 'Recevoir une simulation réaliste' : 'Échanger avec un spécialiste'}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          {nbPhotos > 0
                            ? `Nous recevons vos dimensions, ce chiffrage et ${nbPhotos === 1 ? 'votre photo' : `vos ${nbPhotos} photos`}. Nos équipes réalisent ensuite une simulation réaliste des deux solutions, comme dans l'exemple ci-dessous.`
                            : 'Nous recevons vos dimensions et ce chiffrage pour étudier votre projet.'}
                        </p>
                      </div>
                      {nbPhotos > 0 && <ExempleSimulationCompact />}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contact-prenom" className="text-black font-bold">Prénom</Label>
                          <Input id="contact-prenom" autoComplete="given-name" required maxLength={80} className="border-gray-300 mt-1" {...champ('prenom')} />
                        </div>
                        <div>
                          <Label htmlFor="contact-nom" className="text-black font-bold">Nom</Label>
                          <Input id="contact-nom" autoComplete="family-name" required maxLength={80} className="border-gray-300 mt-1" {...champ('nom')} />
                        </div>
                        <div>
                          <Label htmlFor="contact-email" className="text-black font-bold">Email</Label>
                          <Input id="contact-email" type="email" autoComplete="email" required className="border-gray-300 mt-1" {...champ('email')} />
                        </div>
                        <div>
                          <Label htmlFor="contact-telephone" className="text-black font-bold">Téléphone</Label>
                          <Input id="contact-telephone" type="tel" autoComplete="tel" required minLength={6} maxLength={30} className="border-gray-300 mt-1" {...champ('telephone')} />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="contact-societe" className="text-black font-bold">
                            Établissement <span className="font-normal text-gray-500">(facultatif)</span>
                          </Label>
                          <Input id="contact-societe" autoComplete="organization" maxLength={120} className="border-gray-300 mt-1" {...champ('societe')} />
                        </div>
                      </div>
                      {erreurEnvoi && (
                        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                          {erreurEnvoi}
                        </p>
                      )}
                      <Button type="submit" disabled={envoi === 'en-cours'} className="bg-black text-white hover:bg-gray-800" size="lg">
                        {envoi === 'en-cours' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Envoyer ma demande
                      </Button>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
