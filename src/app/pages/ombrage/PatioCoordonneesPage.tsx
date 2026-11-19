import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { SEOMeta } from '../../components/SEOMeta';
import { ProgressSteps } from '../../components/ProgressSteps';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ExempleSimulationCompact } from '../../components/ombrage/ExempleSimulation';
import { submitPatioDemande, type PatioChantier, type PatioContact } from '../../api/ombrage';
import { lirePhotos, lireSaisie, patioComplet, versDimensions } from '../../lib/patioOmbrage';
import { PAYS, POSTAL_CODE_FORMATS, useVillesParCodePostal } from '../../lib/postalLookup';

// Dernière étape du parcours patio : les coordonnées du client et l'adresse du
// chantier, pour établir le devis en bonne et due forme et le dossier complet.

const CONTACT_VIDE: PatioContact = {
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  societe: '',
  message: '',
};

const CHANTIER_VIDE: PatioChantier = { adresse: '', complement: '', code_postal: '', ville: '', pays: 'France' };

export function PatioCoordonneesPage() {
  const navigate = useNavigate();
  const saisie = useMemo(lireSaisie, []);
  const saisieValide = saisie.patios.every(patioComplet);
  const dimensions = useMemo(() => versDimensions(saisie.patios), [saisie]);

  const [contact, setContact] = useState<PatioContact>(CONTACT_VIDE);
  const [chantier, setChantier] = useState<PatioChantier>(CHANTIER_VIDE);
  const [envoi, setEnvoi] = useState<'idle' | 'en-cours' | 'envoye'>('idle');
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);

  // La ville se remplit d'après le code postal, comme pour l'adresse de livraison.
  const { suggestions, chargement } = useVillesParCodePostal(chantier.pays, chantier.code_postal);
  useEffect(() => {
    if (suggestions.length === 1) setChantier((c) => ({ ...c, ville: suggestions[0].nom }));
  }, [suggestions]);
  const plusieursVilles = suggestions.length > 1 && !suggestions.some((v) => v.nom === chantier.ville);
  const formatCodePostal = POSTAL_CODE_FORMATS[chantier.pays];

  if (!saisieValide) {
    return <Navigate to="/solutions-ombrage/patio/dimensions" replace />;
  }

  const photos = lirePhotos();
  const nbPhotos = photos.length;

  const envoyer = async (event: React.FormEvent) => {
    event.preventDefault();
    setEnvoi('en-cours');
    setErreurEnvoi(null);
    try {
      await submitPatioDemande({
        patios: dimensions,
        options: {
          verificationAnnuelle: saisie.verificationAnnuelle,
          interventionSaisonniere: saisie.interventionSaisonniere,
        },
        contact,
        chantier,
        dureeAnnees: saisie.dureeAnnees,
        photos,
      });
      setEnvoi('envoye');
      window.scrollTo({ top: 0 });
    } catch (e) {
      setEnvoi('idle');
      setErreurEnvoi(
        e instanceof Error && e.message
          ? e.message
          : "L'envoi de la demande a échoué. Réessayez dans un instant.",
      );
    }
  };

  const champContact = (cle: keyof PatioContact) => ({
    value: contact[cle],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setContact({ ...contact, [cle]: e.target.value }),
  });
  const champChantier = (cle: keyof PatioChantier) => ({
    value: chantier[cle],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setChantier({ ...chantier, [cle]: e.target.value }),
  });

  const nbPatios = saisie.patios.length;

  return (
    <>
      <SEOMeta title="Solution d'ombrage pour patio — Vos coordonnées" noIndex />
      <div className="bg-white min-h-screen pt-[var(--header-height)]">
        <ProgressSteps currentStep={4} />

        <section className="pt-8 pb-20 px-6">
          <div className="max-w-3xl mx-auto">
            {envoi === 'envoye' ? (
              <div className="flex items-start gap-4 rounded-xl bg-gray-50 p-6 md:p-8" role="status">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black">
                  <Check className="h-5 w-5 text-white" />
                </span>
                <div>
                  <h1 className="text-2xl font-bold text-black">Votre demande de devis officiel est enregistrée</h1>
                  <p className="text-gray-600 mt-2">
                    Nous préparons votre devis et le dossier complet de votre projet
                    {nbPhotos > 0 ? ', avec la simulation réaliste de vos patios' : ''}.
                  </p>
                  <p className="font-bold text-black mt-2">
                    Un représentant d'Urbanize vous contactera sous 48 h pour affiner votre demande.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Chantier : {chantier.adresse}{chantier.complement ? `, ${chantier.complement}` : ''}, {chantier.code_postal} {chantier.ville}{chantier.pays !== 'France' ? `, ${chantier.pays}` : ''}.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <Button variant="outline" onClick={() => navigate('/solutions-ombrage/patio/chiffrage')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour au chiffrage
                  </Button>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-3 text-black">Vos coordonnées et le chantier</h1>
                <p className="text-lg text-gray-600 mb-3 max-w-[65ch]">
                  Ces informations nous permettent d'établir votre devis en bonne et due forme, et de constituer le
                  dossier complet de votre projet.
                </p>
                <p className="text-base font-bold text-black mb-8 max-w-[65ch]">
                  Votre demande correspond à une demande de devis officiel.
                </p>

                <div className="rounded-lg bg-slate-50 p-5 mb-8 text-sm text-black">
                  <p className="font-bold">Votre projet</p>
                  <ul className="mt-2 space-y-1">
                    <li>
                      • {nbPatios} patio{nbPatios > 1 ? 's' : ''} :{' '}
                      {saisie.patios.map((patio) => patio.nom.trim()).join(', ')}
                    </li>
                    <li>• Mise en place : étude thermique, étude de bureau d'études, repérage et prise de mesure</li>
                    <li>• Mise à disposition de la couverture repliable : {saisie.dureeAnnees} ans</li>
                    {saisie.verificationAnnuelle && <li>• Vérification annuelle de la couverture repliable</li>}
                    {saisie.interventionSaisonniere && (
                      <li>• Installation en avril et démontage en octobre de la couverture fixe</li>
                    )}
                    {nbPhotos > 0 && (
                      <li>
                        • {nbPhotos === 1 ? 'Une photo jointe' : `${nbPhotos} photos jointes`} pour la simulation
                      </li>
                    )}
                  </ul>
                </div>

                <form onSubmit={envoyer} className="space-y-8">
                  <fieldset className="space-y-4">
                    <legend className="text-xl font-bold text-black mb-1">Vos coordonnées</legend>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact-prenom" className="text-black font-bold">Prénom</Label>
                        <Input id="contact-prenom" autoComplete="given-name" required maxLength={80} className="border-gray-300 mt-1" {...champContact('prenom')} />
                      </div>
                      <div>
                        <Label htmlFor="contact-nom" className="text-black font-bold">Nom</Label>
                        <Input id="contact-nom" autoComplete="family-name" required maxLength={80} className="border-gray-300 mt-1" {...champContact('nom')} />
                      </div>
                      <div>
                        <Label htmlFor="contact-email" className="text-black font-bold">Email</Label>
                        <Input id="contact-email" type="email" autoComplete="email" required className="border-gray-300 mt-1" {...champContact('email')} />
                      </div>
                      <div>
                        <Label htmlFor="contact-telephone" className="text-black font-bold">Téléphone</Label>
                        <Input id="contact-telephone" type="tel" autoComplete="tel" required minLength={6} maxLength={30} className="border-gray-300 mt-1" {...champContact('telephone')} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="contact-societe" className="text-black font-bold">
                          Établissement <span className="font-normal text-gray-500">(facultatif)</span>
                        </Label>
                        <Input id="contact-societe" autoComplete="organization" maxLength={120} className="border-gray-300 mt-1" {...champContact('societe')} />
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-4">
                    <legend className="text-xl font-bold text-black mb-1">Adresse du chantier</legend>
                    <p className="text-sm text-gray-600">
                      {nbPatios > 1
                        ? "L'adresse où les dispositifs seront installés."
                        : "L'adresse où le dispositif sera installé."}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="chantier-adresse" className="text-black font-bold">Adresse</Label>
                        <Input id="chantier-adresse" autoComplete="address-line1" required minLength={3} maxLength={200} className="border-gray-300 mt-1" {...champChantier('adresse')} />
                      </div>
                      <div>
                        <Label htmlFor="chantier-complement" className="text-black font-bold">
                          Adresse, ligne 2 <span className="font-normal text-gray-500">(facultatif)</span>
                        </Label>
                        <Input
                          id="chantier-complement"
                          autoComplete="address-line2"
                          maxLength={200}
                          placeholder="Bâtiment, étage, accès…"
                          className="border-gray-300 mt-1"
                          {...champChantier('complement')}
                        />
                      </div>
                      <div className="grid sm:grid-cols-[1fr_1fr_2fr] gap-4">
                        <div>
                          <Label htmlFor="chantier-pays" className="text-black font-bold">Pays</Label>
                          <Select
                            value={chantier.pays}
                            onValueChange={(pays) => setChantier({ ...chantier, pays, code_postal: '', ville: '' })}
                          >
                            <SelectTrigger id="chantier-pays" className="border-gray-300 mt-1 w-full">
                              <SelectValue placeholder="Sélectionnez un pays" />
                            </SelectTrigger>
                            <SelectContent>
                              {PAYS.map((pays) => (
                                <SelectItem key={pays} value={pays}>
                                  {pays}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="chantier-code-postal" className="text-black font-bold">Code postal</Label>
                          <Input
                            id="chantier-code-postal"
                            autoComplete="postal-code"
                            required
                            minLength={4}
                            maxLength={formatCodePostal?.length ?? 12}
                            placeholder={formatCodePostal?.placeholder}
                            className="border-gray-300 mt-1"
                            {...champChantier('code_postal')}
                          />
                        </div>
                        <div className="relative">
                          <Label htmlFor="chantier-ville" className="text-black font-bold">
                            Ville
                            {chargement && <Loader2 className="w-3 h-3 ml-2 inline animate-spin text-gray-400" aria-label="Recherche de la ville" />}
                          </Label>
                          <Input id="chantier-ville" autoComplete="address-level2" required maxLength={80} className="border-gray-300 mt-1" {...champChantier('ville')} />
                          {!chargement && !chantier.ville && (
                            <p className="text-xs text-gray-500 mt-1">La ville se remplit d'après le code postal.</p>
                          )}
                          {plusieursVilles && (
                            <ul
                              role="listbox"
                              aria-label="Villes correspondant à ce code postal"
                              className="absolute z-20 mt-1 left-0 min-w-[240px] w-max max-w-sm bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                            >
                              {suggestions.map((ville) => (
                                <li key={`${ville.code}-${ville.nom}`} role="option" aria-selected={false}>
                                  <button
                                    type="button"
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    onClick={() => setChantier({ ...chantier, ville: ville.nom })}
                                  >
                                    {ville.nom}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  <div>
                    <Label htmlFor="contact-message" className="text-black font-bold">
                      Précisions sur le projet <span className="font-normal text-gray-500">(facultatif)</span>
                    </Label>
                    <Textarea
                      id="contact-message"
                      rows={4}
                      maxLength={2000}
                      className="border-gray-300 mt-1"
                      {...champContact('message')}
                    />
                  </div>

                  {nbPhotos > 0 && <ExempleSimulationCompact />}

                  {erreurEnvoi && (
                    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                      {erreurEnvoi}
                    </p>
                  )}
                  <p className="text-sm text-gray-700 max-w-[65ch]">
                    Un représentant d'Urbanize vous contactera sous 48 h pour affiner votre demande.
                  </p>
                  <Button type="submit" disabled={envoi === 'en-cours'} className="bg-black text-white hover:bg-gray-800" size="lg">
                    {envoi === 'en-cours' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Envoyer ma demande de devis officiel
                  </Button>
                </form>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
