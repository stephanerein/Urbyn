import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ProgressSteps } from '../components/ProgressSteps';
import { FileText, Calculator, Lightbulb, ClipboardList, Palette, HardHat, FileCheck, Check, Wrench, Users, Truck, Image, AlertTriangle, Shield, Scale, PackageOpen } from 'lucide-react';
import { toast } from 'sonner';

const productTitles: Record<string, string> = {
  'totem': 'Totem',
  'palissade': 'Palissade',
  'facade-echafaudage': 'Façade et Échafaudage',
  'massif-beton': 'Massif béton',
  'panneau-chantier': 'Panneau de chantier'
};

export function ServicesAdditionnelsPage() {
  const navigate = useNavigate();
  const { product } = useParams<{ product: string }>();
  // Transport sélectionné par défaut pour Palissade ; Pack complet de déploiement sélectionné par défaut pour Palissade
  const [selectedToolkit, setSelectedToolkit] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState(product === 'palissade' || product === 'panneau-chantier');
  const [selectedEnlevement, setSelectedEnlevement] = useState(false);
  const [selectedConseil, setSelectedConseil] = useState(product === 'palissade' || product === 'panneau-chantier');
  const [selectedExpertises, setSelectedExpertises] = useState<string[]>([]);

  const productTitle = product ? productTitles[product] : 'Solution';

  const toggleExpertise = (expertiseId: string) => {
    setSelectedExpertises(prev =>
      prev.includes(expertiseId)
        ? prev.filter(id => id !== expertiseId)
        : [...prev, expertiseId]
    );
  };

  // Vérifier si un service graphisme est sélectionné
  const hasGraphismeService = selectedExpertises.some(id =>
    ['validation-graphisme', 'direction-artistique', 'execution-graphique'].includes(id)
  );
  const shouldShowAutorisationAlert = hasGraphismeService && !selectedExpertises.includes('autorisation-cerfa');

  // Vérifier si Exécution Graphique est sélectionné sans Direction Artistique
  const needsDirectionArtistique = selectedExpertises.includes('execution-graphique') && !selectedExpertises.includes('direction-artistique');

  const handleContinue = () => {
    const servicesAccompagnement: any = {};

    if (selectedToolkit) {
      servicesAccompagnement.toolkit = true;
    }

    if (selectedTransport) {
      servicesAccompagnement.transport = true;
    }

    if (selectedEnlevement) {
      servicesAccompagnement.enlevement = true;
    }

    if (selectedConseil) {
      servicesAccompagnement.conseil = ['etude-complete', 'preparation-deploiement', 'deploiement-terrain'];
    }

    if (selectedExpertises.length > 0) {
      servicesAccompagnement.expertises = selectedExpertises;
    }

    if (Object.keys(servicesAccompagnement).length > 0) {
      sessionStorage.setItem('servicesAccompagnement', JSON.stringify(servicesAccompagnement));
    }

    navigate(`/select-service/${product}`);
  };

  const handleSkip = () => {
    sessionStorage.removeItem('servicesAccompagnement');
    navigate(`/select-service/${product}`);
  };

  const totalSelected = (selectedToolkit ? 1 : 0) + (selectedTransport ? 1 : 0) + (selectedEnlevement ? 1 : 0) + (selectedConseil ? 1 : 0) + selectedExpertises.length;

  return (
    <div className="bg-white min-h-screen pt-[var(--header-height)]">
      <ProgressSteps currentStep={2} />

      <section className="pt-8 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => navigate(product === 'palissade' ? '/definir-besoin' : `/services-specifiques/${product}`)}
              className="border-2 border-black"
            >
              ← Retour
            </Button>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black text-center">
            Services d'accompagnement pour {productTitle}
          </h1>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Sélectionnez les services pour accompagner votre projet (optionnel)
          </p>

          {/* TRANSPORT */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-black">TRANSPORT</h2>
            <div className={`grid gap-6 ${product === 'palissade' || product === 'panneau-chantier' ? 'max-w-lg' : 'md:grid-cols-2'}`}>
              {/* Livraison (label simplifié pour Palissade — obligatoire) */}
              <Card
                onClick={() => {
                  if (product === 'palissade' || product === 'panneau-chantier') return;
                  const next = !selectedTransport;
                  setSelectedTransport(next);
                  if (!next) setSelectedToolkit(false);
                }}
                className={`transition-all ${
                  product === 'palissade' || product === 'panneau-chantier'
                    ? 'border-2 border-black bg-slate-50 shadow-xl cursor-default ring-2 ring-black'
                    : selectedTransport
                    ? 'cursor-pointer border-2 border-black bg-slate-50 shadow-xl'
                    : 'cursor-pointer border-2 border-slate-200 hover:border-black hover:shadow-xl'
                }`}
              >
                <CardContent className="p-6 relative">
                  {product === 'palissade' || product === 'panneau-chantier' && (
                    <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1 rounded-full">
                      Obligatoire
                    </div>
                  )}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 bg-black">
                      <Truck className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2 text-black">
                        {product === 'palissade' || product === 'panneau-chantier' ? 'Livraison' : 'Transport et livraison'}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Acheminement sécurisé de votre matériel sur site
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enlèvement — masqué pour Palissade */}
              {product !== 'palissade' && product !== 'panneau-chantier' && (
                <Card
                  onClick={() => {
                    const next = !selectedEnlevement;
                    setSelectedEnlevement(next);
                    if (next) {
                      setSelectedToolkit(false);
                    }
                  }}
                  className={`cursor-pointer transition-all ${
                    selectedEnlevement
                      ? 'border-2 border-black bg-slate-50 shadow-xl'
                      : 'border-2 border-slate-200 hover:border-black hover:shadow-xl'
                  }`}
                >
                  <CardContent className="p-6 relative">
                    {selectedEnlevement && (
                      <div className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        selectedEnlevement ? 'bg-black' : 'bg-slate-100'
                      }`}>
                        <PackageOpen className={`w-7 h-7 transition-colors ${
                          selectedEnlevement ? 'text-white' : 'text-slate-700'
                        }`} strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2 text-black">
                          Enlèvement
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Enlèvement de la marchandise sur site
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* DÉPLOIEMENT — Pour Palissade et Panneau de chantier */}
          {product === 'palissade' || product === 'panneau-chantier' ? (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-2 text-black">DÉPLOIEMENT</h2>
              <p className="text-sm text-gray-500 mb-6">Sélectionnez l'un des deux services</p>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Option 1 : Fiche d'installation & liste d'approvisionnement */}
                <Card
                  onClick={() => {
                    setSelectedToolkit(true);
                    setSelectedConseil(false);
                  }}
                  className={`cursor-pointer transition-all ${
                    selectedToolkit
                      ? 'border-2 border-black bg-slate-50 shadow-xl'
                      : 'border-2 border-slate-200 hover:border-black hover:shadow-xl'
                  }`}
                >
                  <CardContent className="p-6 relative">
                    {selectedToolkit && (
                      <div className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        selectedToolkit ? 'bg-black' : 'bg-slate-100'
                      }`}>
                        <Wrench className={`w-7 h-7 transition-colors ${
                          selectedToolkit ? 'text-white' : 'text-slate-700'
                        }`} strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2 text-black">
                          La fiche d'installation et la liste d'approvisionnement
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Documentation complète pour l'installation de votre solution
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Option 2 : Pack complet de déploiement */}
                <Card
                  onClick={() => {
                    setSelectedConseil(true);
                    setSelectedToolkit(false);
                  }}
                  className={`cursor-pointer transition-all ${
                    selectedConseil
                      ? 'border-2 border-black bg-slate-50 shadow-xl'
                      : 'border-2 border-slate-200 hover:border-black hover:shadow-xl'
                  }`}
                >
                  <CardContent className="p-6 relative">
                    {selectedConseil && (
                      <div className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        selectedConseil ? 'bg-black' : 'bg-slate-100'
                      }`}>
                        <Users className={`w-7 h-7 transition-colors ${
                          selectedConseil ? 'text-white' : 'text-slate-700'
                        }`} strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-3 text-black">
                          Pack complet de déploiement
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
                            <div>
                              <strong>Étude complète (BPF)</strong> : Proposition de plusieurs alternatives suivant la configuration du site, Simulation, Plan d'exécution, Calepinage des visuels. Livrable : Bon Pour Fabrication
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <ClipboardList className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
                            <div>
                              <strong>Préparation du déploiement et Cahier de Pose (CDP)</strong> : Règles de sécurité d'intervention, Contraintes d'intervention, Liste d'approvisionnement matériels et moyens d'exécution. Livrable : Devis prestataires et fournisseurs
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <HardHat className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
                            <div>
                              <strong>Installation et déploiement terrain (BDR)</strong> : Prestation de pose par Urbyn, Coordination des intervenants, suivi de chantier, Présence sur site (complète ou fractionnée), Vérification conformité installation. Livrable : Bon de Réception
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : product !== 'panneau-chantier' ? (
            <>
              {/* TOOL KIT — disponible uniquement avec Transport (sans Enlèvement) — autres produits */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-black">TOOL KIT</h2>
                {selectedEnlevement ? (
                  <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg flex items-center gap-3 text-slate-500">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-slate-400" />
                    <p className="text-sm">
                      La fiche d'installation n'est pas disponible avec le service Enlèvement.
                    </p>
                  </div>
                ) : (
                  <Card
                    onClick={() => {
                      if (!selectedTransport) return;
                      setSelectedToolkit(!selectedToolkit);
                    }}
                    className={`transition-all ${
                      !selectedTransport
                        ? 'border-2 border-slate-200 opacity-50 cursor-not-allowed'
                        : selectedToolkit
                        ? 'cursor-pointer border-2 border-black bg-slate-50 shadow-xl'
                        : 'cursor-pointer border-2 border-slate-200 hover:border-black hover:shadow-xl'
                    }`}
                  >
                    <CardContent className="p-6 relative">
                      {selectedToolkit && (
                        <div className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          selectedToolkit ? 'bg-black' : 'bg-slate-100'
                        }`}>
                          <Wrench className={`w-7 h-7 transition-colors ${
                            selectedToolkit ? 'text-white' : 'text-slate-700'
                          }`} strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-2 text-black">
                            Fiche d'installation & liste d'approvisionnement
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            Documentation complète pour l'installation de votre solution
                          </p>
                          {!selectedTransport && (
                            <p className="text-xs text-slate-400 mt-2">
                              Nécessite le service Transport et livraison
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* CONSEIL & ORGANISATION — autres produits */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-black">CONSEIL & ORGANISATION</h2>
                <Card
                  onClick={() => setSelectedConseil(!selectedConseil)}
                  className={`cursor-pointer transition-all ${
                    selectedConseil
                      ? 'border-2 border-black bg-slate-50 shadow-xl'
                      : 'border-2 border-slate-200 hover:border-black hover:shadow-xl'
                  }`}
                >
                  <CardContent className="p-6 relative">
                    {selectedConseil && (
                      <div className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        selectedConseil ? 'bg-black' : 'bg-slate-100 hover:bg-black group-hover:bg-black'
                      }`}>
                        <Users className={`w-7 h-7 transition-colors ${
                          selectedConseil ? 'text-white' : 'text-slate-700 group-hover:text-white'
                        }`} strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-3 text-black">
                          Pack complet de déploiement
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
                            <div>
                              <strong>Étude complète (BPF)</strong> : Proposition de plusieurs alternatives suivant la configuration du site, Simulation, Plan d'exécution, Calepinage des visuels. Livrable : Bon Pour Fabrication
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <ClipboardList className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
                            <div>
                              <strong>Préparation du déploiement et Cahier de Pose (CDP)</strong> : Règles de sécurité d'intervention, Contraintes d'intervention, Liste d'approvisionnement matériels et moyens d'exécution. Livrable : Devis prestataires et fournisseurs
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <HardHat className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
                            <div>
                              <strong>Installation et déploiement terrain (BDR)</strong> : Prestation de pose par Urbyn, Coordination des intervenants, suivi de chantier, Présence sur site (complète ou fractionnée), Vérification conformité installation. Livrable : Bon de Réception
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}

          {/* EXPERTISES */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-8 text-black">EXPERTISES</h2>
            <p className="text-sm text-gray-600 mb-8">Sélectionnez les expertises dont vous avez besoin individuellement</p>

            {/* SÉCURITÉ */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-black" />
                <h3 className="text-xl font-bold text-black">Sécurité</h3>
              </div>
                {/* BET */}
                <Card
                  onClick={() => toggleExpertise('bet')}
                  className={`cursor-pointer transition-all ${
                    selectedExpertises.includes('bet')
                      ? 'border-2 border-black bg-slate-50 shadow-xl'
                      : 'border-2 border-slate-200 hover:border-black hover:shadow-xl'
                  }`}
                >
                  <CardContent className="p-6 relative">
                    {selectedExpertises.includes('bet') && (
                      <div className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        selectedExpertises.includes('bet') ? 'bg-black' : 'bg-slate-100 hover:bg-black group-hover:bg-black'
                      }`}>
                        <Calculator className={`w-7 h-7 transition-colors ${
                          selectedExpertises.includes('bet') ? 'text-white' : 'text-slate-700 group-hover:text-white'
                        }`} strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold mb-2 text-black">Bureau d'étude BET</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Étude technique incluant une note de calcul
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            {/* GRAPHISME */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-black" />
                <h3 className="text-xl font-bold text-black">Graphisme</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Validation graphisme */}
              <Card
                onClick={() => toggleExpertise('validation-graphisme')}
                className={`cursor-pointer transition-all ${
                  selectedExpertises.includes('validation-graphisme')
                    ? 'border-2 border-black bg-slate-50 shadow-xl'
                    : 'border-2 border-slate-200 hover:border-black hover:shadow-xl'
                }`}
              >
                <CardContent className="p-6 relative">
                  {selectedExpertises.includes('validation-graphisme') && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedExpertises.includes('validation-graphisme') ? 'bg-black' : 'bg-slate-100 hover:bg-black group-hover:bg-black'
                    }`}>
                      <Check className={`w-7 h-7 transition-colors ${
                        selectedExpertises.includes('validation-graphisme') ? 'text-white' : 'text-slate-700 group-hover:text-white'
                      }`} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold mb-2 text-black">Validation du graphisme</h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-2">
                        Validation de vos créations graphiques existantes
                      </p>
                      {selectedExpertises.includes('validation-graphisme') && (
                        <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded space-y-2">
                          <p className="text-xs font-bold text-blue-900">Vérification du visuel (qualité, dimensions)</p>
                          <div className="text-xs text-blue-800">
                            <p className="font-semibold mb-1">Caractéristiques requises :</p>
                            <ul className="list-disc list-inside space-y-0.5 ml-2">
                              <li>Format PDF à l'échelle 1/10ème de la taille réelle</li>
                              <li>Photo en 300 dpi</li>
                              <li>Texte vectorisé</li>
                              <li>Mode colorimétrique CMJN</li>
                            </ul>
                            <p className="mt-2 italic text-blue-700">
                              ⚠️ Toute modification nécessaire du fichier initial transmis fera l'objet d'un devis complémentaire.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Direction Artistique */}
              <Card
                onClick={() => toggleExpertise('direction-artistique')}
                className={`cursor-pointer transition-all ${
                  selectedExpertises.includes('direction-artistique')
                    ? 'border-2 border-black bg-slate-50 shadow-xl'
                    : 'border-2 border-slate-200 hover:border-black hover:shadow-xl'
                }`}
              >
                <CardContent className="p-6 relative">
                  {selectedExpertises.includes('direction-artistique') && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedExpertises.includes('direction-artistique') ? 'bg-black' : 'bg-slate-100 hover:bg-black group-hover:bg-black'
                    }`}>
                      <Palette className={`w-7 h-7 transition-colors ${
                        selectedExpertises.includes('direction-artistique') ? 'text-white' : 'text-slate-700 group-hover:text-white'
                      }`} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold mb-2 text-black">Direction Artistique</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Définition du projet créatif et conception design et/ou graphique
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exécution Graphique */}
              <Card
                onClick={() => toggleExpertise('execution-graphique')}
                className={`cursor-pointer transition-all ${
                  selectedExpertises.includes('execution-graphique')
                    ? 'border-2 border-black bg-slate-50 shadow-xl'
                    : 'border-2 border-slate-200 hover:border-black hover:shadow-xl'
                }`}
              >
                <CardContent className="p-6 relative">
                  {selectedExpertises.includes('execution-graphique') && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedExpertises.includes('execution-graphique') ? 'bg-black' : 'bg-slate-100 hover:bg-black group-hover:bg-black'
                    }`}>
                      <Image className={`w-7 h-7 transition-colors ${
                        selectedExpertises.includes('execution-graphique') ? 'text-white' : 'text-slate-700 group-hover:text-white'
                      }`} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold mb-2 text-black">Exécution Graphique</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Production graphique avec 3 Aller/Retour. Documents fournis par le client : Logo, Perspectives 3D
                      </p>
                      {needsDirectionArtistique && (
                        <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                          <p className="text-xs font-bold text-blue-900 mb-1">Information importante</p>
                          <p className="text-xs text-blue-800">
                            Vous devrez transmettre à l'équipe Urbyn les éléments correspondant à la Direction Artistique (charte graphique, logo, couleurs, typographie, etc.)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>

            {/* LÉGAL */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-black" />
                <h3 className="text-xl font-bold text-black">Légal</h3>
              </div>

              {shouldShowAutorisationAlert && (
                <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-500 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-900">Autorisation recommandée</p>
                    <p className="text-sm text-amber-800">
                      Vous avez sélectionné un service graphisme. Il est fortement recommandé d'ajouter la demande d'autorisation pré-enseigne.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
              {/* Autorisation CERFA */}
              <Card
                onClick={() => toggleExpertise('autorisation-cerfa')}
                className={`cursor-pointer transition-all ${
                  selectedExpertises.includes('autorisation-cerfa')
                    ? 'border-2 border-black bg-slate-50 shadow-xl'
                    : 'border-2 border-slate-200 hover:border-black hover:shadow-xl'
                }`}
              >
                <CardContent className="p-6 relative">
                  {selectedExpertises.includes('autorisation-cerfa') && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedExpertises.includes('autorisation-cerfa') ? 'bg-black' : 'bg-slate-100 hover:bg-black group-hover:bg-black'
                    }`}>
                      <FileCheck className={`w-7 h-7 transition-colors ${
                        selectedExpertises.includes('autorisation-cerfa') ? 'text-white' : 'text-slate-700 group-hover:text-white'
                      }`} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold mb-2 text-black">Demande d'autorisation pré-enseigne</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Gestion administrative pour l'obtention des autorisations CERFA
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Déclaration de voirie */}
              <Card
                onClick={() => toggleExpertise('declaration-voirie')}
                className={`cursor-pointer transition-all ${
                  selectedExpertises.includes('declaration-voirie')
                    ? 'border-2 border-black bg-slate-50 shadow-xl'
                    : 'border-2 border-slate-200 hover:border-black hover:shadow-xl'
                }`}
              >
                <CardContent className="p-6 relative">
                  {selectedExpertises.includes('declaration-voirie') && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedExpertises.includes('declaration-voirie') ? 'bg-black' : 'bg-slate-100 hover:bg-black group-hover:bg-black'
                    }`}>
                      <FileText className={`w-7 h-7 transition-colors ${
                        selectedExpertises.includes('declaration-voirie') ? 'text-white' : 'text-slate-700 group-hover:text-white'
                      }`} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold mb-2 text-black">Déclaration de voirie</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Gestion administrative des déclarations de voirie et d'occupation du domaine public
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleContinue}
              className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg font-bold"
            >
              Continuer
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
