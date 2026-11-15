import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Camera, Check, Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { SEOMeta } from '../../components/SEOMeta';
import { ProgressSteps } from '../../components/ProgressSteps';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { PlanPatio, formePatio } from '../../components/ombrage/PlanPatio';
import {
  MAX_PATIOS,
  cotesDuPatio,
  decalerPhotosApresSuppression,
  deposerPhoto,
  ecrireSaisie,
  erreurCote,
  erreurNom,
  lirePhoto,
  lireSaisie,
  patioComplet,
  patioVide,
  retirerPhoto,
  type OmbrageSaisie,
  type PatioSaisie,
} from '../../lib/patioOmbrage';

const PRESTATIONS_MISE_EN_PLACE = [
  'Étude thermique',
  "Étude de bureau d'études",
  'Repérage et prise de mesure',
];

type CoteKey = 'largeur1' | 'largeur2' | 'longueur1' | 'longueur2';

// Chaque côté porte une lettre, reprise sur le schéma : c'est elle qui fait le
// lien entre un champ et le côté qu'il mesure.
const COTES: Array<{ key: CoteKey; lettre: string; label: string; aide?: string }> = [
  { key: 'largeur1', lettre: 'A', label: 'Largeur', aide: "Côté d'installation du dispositif" },
  { key: 'largeur2', lettre: 'B', label: 'Largeur' },
  { key: 'longueur1', lettre: 'C', label: 'Longueur' },
  { key: 'longueur2', lettre: 'D', label: 'Longueur' },
];

/** Pastille portant la lettre d'un côté ; pleine pour le côté d'installation. */
function Pastille({ lettre, pleine = false }: { lettre: string; pleine?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
        pleine ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-900 bg-white text-slate-900'
      }`}
    >
      {lettre}
    </span>
  );
}

/**
 * Vue de dessus du patio, redessinée à l'échelle à chaque saisie. Le côté A —
 * celui qui reçoit le dispositif — est à gauche, en trait épais, et le plus
 * grand côté à l'horizontale ; la flèche indique le déploiement sur la longueur.
 */
function SchemaPatio({ patio }: { patio: PatioSaisie }) {
  const complet = COTES.every(({ key }) => erreurCote(patio[key]) === null);
  const cotes = cotesDuPatio(patio);
  const forme = complet ? formePatio(cotes) : null;
  const impossible = complet && forme === null;

  return (
    <figure className="w-full">
      <PlanPatio
        forme={forme}
        fleche
        description={
          complet && !impossible
            ? `Vue de dessus du patio. Largeur A : ${patio.largeur1} m. Largeur B : ${patio.largeur2} m. Longueur C : ${patio.longueur1} m. Longueur D : ${patio.longueur2} m. Le dispositif est installé sur le côté A, à gauche, et se déploie vers la droite.`
            : 'Repère des quatre côtés du patio : A et B sont les largeurs, C et D les longueurs. Le dispositif est installé sur le côté A, à gauche, et se déploie vers la droite.'
        }
      />

      <figcaption className="mt-2 space-y-1 text-xs text-gray-600">
        <p className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-6 shrink-0 rounded-full bg-slate-900" aria-hidden="true" />
          Côté A : installation du dispositif
        </p>
        <p className="flex items-center gap-2">
          <span className="inline-block w-6 shrink-0 border-t-2 border-dashed border-slate-500" aria-hidden="true" />
          Déploiement sur la longueur
        </p>
        {impossible && (
          <p role="alert" className="text-red-700 font-medium pt-1">
            Ces quatre côtés ne peuvent pas former un patio : vérifiez vos dimensions.
          </p>
        )}
        {!complet && <p className="pt-1">Le schéma se met à l'échelle une fois les quatre côtés renseignés.</p>}
      </figcaption>
    </figure>
  );
}

export function PatioConfigPage() {
  const navigate = useNavigate();
  const [saisie, setSaisie] = useState<OmbrageSaisie>(lireSaisie);
  const [tentative, setTentative] = useState(false);
  // Les photos vivent hors du state React : ce compteur force le rafraîchissement.
  const [, setVersionPhotos] = useState(0);
  const inputsPhoto = useRef<Array<HTMLInputElement | null>>([]);

  const appliquer = (suivante: OmbrageSaisie) => {
    setSaisie(suivante);
    ecrireSaisie(suivante);
  };

  const changerNombre = (delta: number) => {
    const cible = Math.min(MAX_PATIOS, Math.max(1, saisie.patios.length + delta));
    if (cible === saisie.patios.length) return;
    if (cible > saisie.patios.length) {
      appliquer({ ...saisie, patios: [...saisie.patios, patioVide()] });
    } else {
      supprimerPatio(saisie.patios.length - 1);
    }
  };

  const supprimerPatio = (index: number) => {
    if (saisie.patios.length <= 1) return;
    decalerPhotosApresSuppression(index);
    appliquer({ ...saisie, patios: saisie.patios.filter((_, i) => i !== index) });
    setVersionPhotos((v) => v + 1);
  };

  const modifierPatio = (index: number, champ: keyof PatioSaisie, valeur: string) => {
    appliquer({
      ...saisie,
      patios: saisie.patios.map((patio, i) => (i === index ? { ...patio, [champ]: valeur } : patio)),
    });
  };

  const choisirPhoto = async (index: number, fichier: File | undefined) => {
    if (!fichier) return;
    try {
      await deposerPhoto(index, fichier);
      setVersionPhotos((v) => v + 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cette image n'a pas pu être lue.");
    }
  };

  const continuer = () => {
    setTentative(true);
    if (!saisie.patios.every(patioComplet)) {
      toast.error('Renseignez le nom et les quatre côtés de chaque patio pour obtenir votre estimation.');
      return;
    }
    ecrireSaisie(saisie);
    navigate('/solutions-ombrage/patio/estimation');
  };

  return (
    <>
      <SEOMeta title="Solution d'ombrage pour patio — Vos patios" noIndex />
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
              Décrivez vos patios : nous chiffrons pour chacun une couverture repliable et une
              couverture fixe, en acquisition ou en mise à disposition.
            </p>

            {/* Mise en place — prestation forfaitaire, présélectionnée */}
            <button
              type="button"
              role="checkbox"
              aria-checked={saisie.miseEnPlace}
              onClick={() => appliquer({ ...saisie, miseEnPlace: !saisie.miseEnPlace })}
              className={`w-full text-left rounded-xl border-2 p-6 mb-10 transition-all ${
                saisie.miseEnPlace
                  ? 'border-black bg-slate-50 shadow-md'
                  : 'border-slate-200 hover:border-black'
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
                    saisie.miseEnPlace ? 'border-black bg-black' : 'border-slate-300 bg-white'
                  }`}
                >
                  {saisie.miseEnPlace && <Check className="h-4 w-4 text-white" />}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-black">Mise en place</h2>
                  <p className="text-sm text-gray-600 mt-1 mb-3">
                    Prestation forfaitaire, réglée une seule fois quel que soit le nombre de patios.
                  </p>
                  <ul className="text-sm text-black space-y-1">
                    {PRESTATIONS_MISE_EN_PLACE.map((prestation) => (
                      <li key={prestation}>• {prestation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>

            {/* Nombre de patios */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-black">Combien de patios souhaitez-vous équiper ?</h2>
                <p className="text-sm text-gray-600 mt-1">De 1 à {MAX_PATIOS} patios par demande.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changerNombre(-1)}
                  disabled={saisie.patios.length <= 1}
                  aria-label="Retirer un patio"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-10 text-center text-2xl font-bold text-black" aria-live="polite">
                  {saisie.patios.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changerNombre(1)}
                  disabled={saisie.patios.length >= MAX_PATIOS}
                  aria-label="Ajouter un patio"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {saisie.patios.map((patio, index) => {
                const photo = lirePhoto(index);
                return (
                  <div key={index} className="rounded-xl border-2 border-slate-200 p-6">
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <h3 className={`text-lg font-bold ${patio.nom.trim() ? 'text-black' : 'text-gray-400'}`}>
                        {patio.nom.trim() || 'Nouveau patio'}
                      </h3>
                      {saisie.patios.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => supprimerPatio(index)}
                          className="text-gray-500 hover:text-black"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Retirer
                        </Button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-[1fr_280px] gap-6">
                      <div>
                        <div className="mb-4">
                          <Label htmlFor={`patio-${index}-nom`} className="text-black font-bold">
                            Nom du patio
                          </Label>
                          <Input
                            id={`patio-${index}-nom`}
                            value={patio.nom}
                            maxLength={80}
                            required
                            placeholder="Ex. : Patio nord"
                            aria-invalid={tentative && erreurNom(patio.nom) ? true : undefined}
                            aria-describedby={tentative && erreurNom(patio.nom) ? `patio-${index}-nom-erreur` : undefined}
                            onChange={(e) => modifierPatio(index, 'nom', e.target.value)}
                            className="border-gray-300 mt-1"
                          />
                          {tentative && erreurNom(patio.nom) && (
                            <p id={`patio-${index}-nom-erreur`} className="text-xs text-red-700 mt-1">
                              {erreurNom(patio.nom)}
                            </p>
                          )}
                        </div>

                        <p className="text-sm font-bold text-black mb-2">Dimensions de chaque côté, en mètres</p>
                        <div className="grid grid-cols-2 gap-4">
                          {COTES.map(({ key, lettre, label, aide }) => {
                            const erreur = tentative ? erreurCote(patio[key]) : null;
                            const id = `patio-${index}-${key}`;
                            return (
                              <div key={key}>
                                <Label htmlFor={id} className="text-black text-sm flex items-center gap-2">
                                  <Pastille lettre={lettre} pleine={key === 'largeur1'} />
                                  <span>
                                    {label}
                                    <span className="sr-only"> du côté {lettre}</span>
                                  </span>
                                </Label>
                                <div className="relative mt-1">
                                  <Input
                                    id={id}
                                    inputMode="decimal"
                                    value={patio[key]}
                                    placeholder="0,00"
                                    aria-invalid={erreur ? true : undefined}
                                    aria-describedby={erreur ? `${id}-erreur` : undefined}
                                    onChange={(e) => modifierPatio(index, key, e.target.value)}
                                    className="border-gray-300 pr-8"
                                  />
                                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                    m
                                  </span>
                                </div>
                                {erreur && (
                                  <p id={`${id}-erreur`} className="text-xs text-red-700 mt-1">
                                    {erreur}
                                  </p>
                                )}
                                {aide && !erreur && <p className="text-xs text-gray-500 mt-1">{aide}</p>}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-start justify-center">
                        <SchemaPatio patio={patio} />
                      </div>
                    </div>

                    {/* Photo depuis le toit, pour la simulation */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <p className="text-sm font-bold text-black">
                        Photo du patio depuis le toit <span className="font-normal text-gray-500">(facultatif)</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1 mb-3">
                        Avec une photo, vous visualisez les deux solutions directement sur votre patio.
                      </p>
                      <input
                        ref={(el) => {
                          inputsPhoto.current[index] = el;
                        }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          void choisirPhoto(index, e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />
                      {photo ? (
                        <div className="flex items-center gap-4">
                          <img
                            src={photo.apercu}
                            alt={`Photo déposée pour ${patio.nom.trim() || 'ce patio'}`}
                            className="h-20 w-28 rounded-lg object-cover border border-slate-200"
                          />
                          <div className="min-w-0">
                            <p className="text-sm text-black truncate">{photo.nomOrigine}</p>
                            <div className="flex gap-3 mt-1">
                              <button
                                type="button"
                                className="text-sm font-bold underline underline-offset-4"
                                onClick={() => inputsPhoto.current[index]?.click()}
                              >
                                Remplacer
                              </button>
                              <button
                                type="button"
                                className="text-sm text-gray-600 underline underline-offset-4"
                                onClick={() => {
                                  retirerPhoto(index);
                                  setVersionPhotos((v) => v + 1);
                                }}
                              >
                                Retirer
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Button variant="outline" onClick={() => inputsPhoto.current[index]?.click()}>
                          <Camera className="w-4 h-4 mr-2" />
                          Déposer une photo
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex justify-end">
              <Button onClick={continuer} className="bg-black text-white hover:bg-gray-800" size="lg">
                Obtenir mon estimation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
