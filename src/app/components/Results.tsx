import { MessageSquare, Download, ArrowLeft, Check, FileText, FileCheck, ShoppingCart, CheckCircle, TrendingUp, Info, Wrench, Truck, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { ProgressSteps } from './ProgressSteps';
import { DeliveryAddressForm, DeliveryAddress } from './DeliveryAddressForm';
import { StripeCheckout } from './StripeCheckout';
import type { HoardingConfig, PriceBreakdown, PortailType, PortillonType } from '../types';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { calculateSupportCost, SUPPORT_PRICES } from '@/app/lib/pricing';

interface ResultsProps {
  config: HoardingConfig;
  priceBreakdown: PriceBreakdown;
  onReset: () => void;
  onAddToCart?: (cartData: CartData) => void;
}

export interface CartData {
  config: HoardingConfig;
  priceBreakdown: PriceBreakdown;
  subtotalMin: number;
  subtotalMax: number;
  services: {
    wantsBET: boolean;
    supportType: 'none' | 'fiche' | 'pilotage' | 'pilotage_suivi';
    cerfaType: 'none' | 'accompagnement' | 'complet';
  };
  supportPrice: number;
  servicesTotal: number;
  finalMin: number;
  finalMax: number;
}

const MATERIAL_LABELS = {
  dibond: 'Dibond imprimé anti-UV',
  tole: 'Tôle ondulée bac acier',
  bois: 'Lames de sapin Coffrage brut Avivé',
  vegetal: 'Végétal synthétique'
};

const MATERIAL_DESCRIPTIONS = {
  dibond: 'Épaisseur: 3mm • Impression HD 1200 dpi',
  tole: 'Format: 3m x 1m',
  bois: 'Lames de 27mm x 200mm x 4m',
  vegetal: 'Feuillage synthétique sur support maille'
};

const DIBOND_LAMINATION_LABELS = {
  'mate': 'Lamination mate',
  'satin': 'Lamination satin',
  'brillante': 'Lamination brillante',
  'brillante-antigraffiti': 'Lamination brillante anti-graffiti'
};

const INSTALLATION_LABELS = {
  fiche: 'Fiche d\'installation & Liste d\'approvisionnement',
  pilotage: 'Pilotage de l\'installation',
  pilotage_suivi: 'Pilotage + suivi sur site'
};

const CERFA_LABELS = {
  none: 'Pas d\'accompagnement CERFA',
  accompagnement: 'Accompagnement téléphonique CERFA',
  complet: 'Service complet CERFA avec mandat'
};

const PORTAIL_LABELS: Record<PortailType, string> = {
  galvanise_4m_battant: 'Portail galvanisé 4m battant',
  galvanise_5m_battant: 'Portail galvanisé 5m battant',
  galvanise_6m_battant: 'Portail galvanisé 6m battant',
  galvanise_4m_coulissant: 'Portail galvanisé 4m coulissant',
  galvanise_5m_coulissant: 'Portail galvanisé 5m coulissant',
  galvanise_6m_coulissant: 'Portail galvanisé 6m coulissant',
  galvanise_7m_coulissant: 'Portail galvanisé 7m coulissant'
};

const PORTILLON_LABELS: Record<PortillonType, string> = {
  bois_0_9m: 'Portillon en bois brut 0,9m x 2mh',
  bois_1_4m: 'Portillon en bois brut 1,4m x 2mh',
  galvanise_0_9m: 'Portillon galvanisé 0,9m x 2mh',
  galvanise_1_4m: 'Portillon galvanisé 1,4m x 2mh'
};

// Empreintes carbone par matériau en kgCO2e/m²
const MATERIAL_CO2 = {
  dibond: 10.38,
  dibond_antigraffiti: 10.38,
  tole: 1.33,
  bois: 0.45,
  vegetal: 2.1
};

// Labels pour les expertises
const EXPERTISE_LABELS: Record<string, string> = {
  'bet': 'Bureau d\'étude BET',
  'validation-graphisme': 'Validation graphisme',
  'direction-artistique': 'Direction artistique',
  'execution-graphique': 'Exécution graphique',
  'autorisation-cerfa': 'Demande d\'autorisation pré-enseigne',
  'declaration-voirie': 'Déclaration de voirie'
};

// Descriptions des couleurs RAL
const RAL_DESCRIPTIONS: Record<string, string> = {
  '9002': 'Blanc gris',
  '9006': 'Aluminium blanc (par défaut)',
  '7016': 'Gris anthracite',
  '3000': 'Rouge feu',
  '5010': 'Bleu gentiane',
  '6005': 'Vert mousse',
  '1015': 'Ivoire clair',
  '8017': 'Brun chocolat',
  '7035': 'Gris clair'
};

export function Results({ config, priceBreakdown, onReset, onAddToCart }: ResultsProps) {
  const [wantsBET, setWantsBET] = useState(false);
  const [cerfaType, setCerfaType] = useState<'none' | 'accompagnement' | 'complet'>('none');
  const [supportType, setSupportType] = useState<'none' | 'fiche' | 'pilotage' | 'pilotage_suivi'>('none');

  // Calcul de la fourchette de prix pour le sous-total (avec échafaudage inclus si applicable)
  const scaffoldingCost = (config.height > 2.20 && config.includeInstaller) ? 300 : 0;
  const subtotal = priceBreakdown.totalCost + scaffoldingCost;
  const subtotalMin = Math.round((subtotal * 0.975) / 100) * 100; // -2.5% arrondi à la centaine
  const subtotalMax = Math.round((subtotal * 1.025) / 100) * 100; // +2.5% arrondi à la centaine

  // Prix des services complémentaires
  const betPrice = 480; // € (Prix fixe étude BET)
  const cerfaAccompagnementPrice = 90; // €
  const cerfaCompletPrice = 350; // €
  
  // Calcul du prix du pilotage dynamiquement
  const supportPrice = calculateSupportCost(supportType, subtotalMax);

  const cerfaPrice = cerfaType === 'accompagnement' ? cerfaAccompagnementPrice : 
                     cerfaType === 'complet' ? cerfaCompletPrice : 0;

  const additionalServicesTotal = 
    (wantsBET ? betPrice : 0) +
    cerfaPrice +
    supportPrice;

  const needsScaffolding = config.height > 2.20;

  // Calcul de l'empreinte carbone totale du projet (en kgCO2e/m²)
  let totalCO2 = 0;
  let totalSurface = 0;
  
  if (config.projectType === 'habillage' && config.materials) {
    config.materials.forEach(mat => {
      const surface = mat.surface || 0;
      const co2PerM2 = MATERIAL_CO2[mat.type] || 0;
      totalCO2 += surface * co2PerM2;
      totalSurface += surface;
    });
  } else if (config.projectType === 'montage' && config.materials) {
    config.materials.forEach(mat => {
      const length = mat.length || 0;
      const surface = length * config.height;
      const co2PerM2 = MATERIAL_CO2[mat.type] || 0;
      totalCO2 += surface * co2PerM2;
      totalSurface += surface;
    });
  }
  
  const averageCO2PerM2 = totalSurface > 0 ? (totalCO2 / totalSurface).toFixed(2) : '0';

  // Équivalence CO2 : 1 kg CO2 = environ 5 km en voiture (voiture moyenne 200g CO2/km)
  // Ou 1 arbre absorbe environ 25 kg CO2 par an
  const carKmEquivalent = (totalCO2 * 5).toFixed(0); // km en voiture
  const treesEquivalent = (totalCO2 / 25).toFixed(1); // arbres nécessaires pour compenser sur 1 an

  const finalMin = subtotalMin + additionalServicesTotal;
  const finalMax = subtotalMax + additionalServicesTotal;

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Estimation Urbyn', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 30);
    
    // Configuration
    doc.setFontSize(14);
    doc.text('Configuration', 20, 45);
    doc.setFontSize(10);
    
    let yPos = 55;
    if (config.projectType === 'habillage') {
      doc.text(`Type: Habillage de palissade`, 20, yPos);
      yPos += 7;
      doc.text(`Longueur: ${config.length}m`, 20, yPos);
      yPos += 7;
      doc.text(`Hauteur: ${config.height}m`, 20, yPos);
      yPos += 7;
      
      // Bardages
      if (config.materials && config.materials.length > 0) {
        doc.text(`Bardages:`, 20, yPos);
        yPos += 7;
        config.materials.forEach((mat, idx) => {
          doc.text(`  ${idx + 1}. ${MATERIAL_LABELS[mat.type]} - ${mat.surface}m2`, 20, yPos);
          yPos += 5;
          doc.setFontSize(8);
          doc.text(`     ${MATERIAL_DESCRIPTIONS[mat.type]}`, 20, yPos);
          yPos += 4;
          if (mat.type === 'dibond' && mat.dibondLamination) {
            doc.text(`     ${DIBOND_LAMINATION_LABELS[mat.dibondLamination]}`, 20, yPos);
            yPos += 4;
          }
          doc.setFontSize(10);
          yPos += 1;
        });
      }
    } else {
      doc.text(`Type: Monter + habiller une palissade`, 20, yPos);
      yPos += 7;
      doc.text(`Hauteur: ${config.height}m`, 20, yPos);
      yPos += 7;
      if (config.soilEnrobe) {
        doc.text(`Sol enrobe: ${config.soilEnrobe}ml`, 20, yPos);
        yPos += 7;
      }
      if (config.soilMeuble) {
        doc.text(`Sol meuble: ${config.soilMeuble}ml`, 20, yPos);
        yPos += 7;
      }
      
      // Accès
      if (config.portailsSelections && config.portailsSelections.length > 0) {
        doc.text(`Portails:`, 20, yPos);
        yPos += 7;
        config.portailsSelections.forEach((sel, idx) => {
          doc.text(`  ${idx + 1}. ${PORTAIL_LABELS[sel.type]}`, 20, yPos);
          yPos += 5;
        });
      }
      if (config.portillonsSelections && config.portillonsSelections.length > 0) {
        doc.text(`Portillons:`, 20, yPos);
        yPos += 7;
        config.portillonsSelections.forEach((sel, idx) => {
          doc.text(`  ${idx + 1}. ${PORTILLON_LABELS[sel.type]}`, 20, yPos);
          yPos += 5;
        });
      }
    }
    
    yPos += 5;
    
    // Services selectionnes
    if (additionalServicesTotal > 0) {
      doc.setFontSize(14);
      doc.text('Prestations Urbyn selectionnees', 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      
      if (wantsBET) {
        doc.text(`- Etude BET : 480 EUR HT`, 20, yPos);
        yPos += 5;
      }
      if (supportType !== 'none') {
        doc.text(`- ${INSTALLATION_LABELS[supportType]} : ${supportPrice.toLocaleString()} EUR HT`, 20, yPos);
        yPos += 5;
        if (supportType === 'pilotage' || supportType === 'pilotage_suivi') {
          doc.setFontSize(8);
          doc.text('  A/ EXPERTISE : Etude (Alternatives site, Simulation, Plan exe, Calepinage)', 25, yPos);
          yPos += 4;
          doc.text('  Preparation : Cahier de Pose (Securite, Contraintes, Liste appro materiels)', 25, yPos);
          yPos += 4;
          doc.text(`  B/ TERRAIN : Suivi (${supportType === 'pilotage_suivi' ? 'sur site' : 'a distance'}, coordination, Bon de Reception)`, 25, yPos);
          yPos += 6;
          doc.setFontSize(10);
        }
      }
      if (cerfaType !== 'none') {
        doc.text(`- ${CERFA_LABELS[cerfaType]} : ${cerfaPrice} EUR HT`, 20, yPos);
        yPos += 5;
      }
      yPos += 5;
    }
    
    // Prix
    doc.setFontSize(14);
    doc.text('Estimation budgetaire globale', 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Fourchette projet: ${subtotalMin.toLocaleString()} - ${subtotalMax.toLocaleString()} EUR HT`, 20, yPos);
    yPos += 10;
    doc.text(`Total avec services: ${finalMin.toLocaleString()} - ${finalMax.toLocaleString()} EUR HT`, 20, yPos);
    yPos += 7;
    doc.text(`TTC: ${(finalMin * 1.2).toLocaleString()} - ${(finalMax * 1.2).toLocaleString()} EUR`, 20, yPos);
    
    yPos += 15;
    doc.setFontSize(8);
    doc.text('Les prix affiches sont approximatifs et peuvent varier selon la region,', 20, yPos);
    yPos += 5;
    doc.text('les fournisseurs et les conditions du chantier.', 20, yPos);
    yPos += 10;
    doc.text('Contact: info@urbanize.site', 20, yPos);
    yPos += 5;
    doc.text('Adresse: 39 rue Dupleix - 75015 Paris, France', 20, yPos);
    
    doc.save('estimation-urbyn.pdf');
  };

  return (
    <div className="bg-white min-h-screen pt-[73px]">
      <ProgressSteps currentStep={3} />

      <div className="max-w-4xl mx-auto pt-8 pb-12">
        {/* Hero Title */}
        <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-6">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Votre estimation
        </h2>
        <p className="text-xl text-slate-600">
          {config.projectType === 'habillage' ? 'Habillage de palissade' : 'Monter + habiller une palissade'}
        </p>
      </div>

      {/* Main Card */}
      <Card className="border-0 shadow-2xl shadow-slate-200/50 mb-8">
        <CardContent className="p-8 md:p-12">
          {/* Configuration Summary */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold">Configuration</h3>
            
            {config.projectType === 'habillage' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Longueur</p>
                  <p className="text-xl font-bold">{config.length}m</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Hauteur</p>
                  <p className="text-xl font-bold">{config.height}m</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Surface</p>
                  <p className="text-xl font-bold">{((config.length || 0) * config.height).toFixed(1)}m²</p>
                </div>
                
                {/* Liste des bardages sélectionnés */}
                {config.materials && config.materials.length > 0 && (
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-sm text-slate-600 mb-2">Bardage{config.materials.length > 1 ? 's' : ''} sélectionné{config.materials.length > 1 ? 's' : ''}</p>
                    <div className="space-y-3">
                      {config.materials.map((mat, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-semibold text-base">{MATERIAL_LABELS[mat.type]}</p>
                            <p className="font-bold text-lg">{mat.surface}m²</p>
                          </div>
                          <p className="text-xs text-slate-500">{MATERIAL_DESCRIPTIONS[mat.type]}</p>

                          {/* Lamination pour dibond */}
                          {mat.type === 'dibond' && mat.dibondLamination && (
                            <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
                              <p className="text-xs text-slate-900 font-semibold">
                                {DIBOND_LAMINATION_LABELS[mat.dibondLamination]}
                              </p>
                            </div>
                          )}

                          {/* RAL pour tôle */}
                          {mat.type === 'tole' && mat.ralColor && (
                            <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
                                <p className="text-xs text-slate-900 font-semibold">
                                  Couleur RAL : {mat.ralColor} - {RAL_DESCRIPTIONS[mat.ralColor] || 'Couleur personnalisée'}
                                </p>
                            </div>
                          )}
                          
                          {/* Traitement pour bois */}
                          {mat.type === 'bois' && mat.boisTreatment && (
                            <p className="text-xs text-slate-600 mt-2">
                              <span className="font-semibold">Traitement :</span> {mat.boisTreatment === 'classe2' ? 'Classe 2 - Sans traitement' : 'Classe 3 - Traitement autoclave'}
                            </p>
                          )}
                          
                          {/* Châssis de protection */}
                          {mat.includeProtectionFrame && (
                            <p className="text-xs text-orange-700 mt-2 font-semibold">
                              ✓ Avec châssis de protection
                            </p>
                          )}
                          
                          {/* Type de végétal */}
                          {mat.type === 'vegetal' && (
                            <>
                              {mat.vegetalType && (
                                <p className="text-xs text-slate-600 mt-2">
                                  <span className="font-semibold">Type :</span> {mat.vegetalType === 'feuillage' ? 'Feuillage synthétique' : 'Mur végétal'}
                                </p>
                              )}
                              {mat.vegetalVariety && (
                                <p className="text-xs text-slate-600 mt-1">
                                  <span className="font-semibold">Variété :</span> {mat.vegetalVariety}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Hauteur</p>
                    <p className="text-xl font-bold">{config.height}m</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total linéaire</p>
                    <p className="text-xl font-bold">
                      {((config.soilEnrobe || 0) + (config.soilMeuble || 0)).toFixed(1)}ml
                    </p>
                  </div>
                </div>

                {(config.soilEnrobe! > 0 || config.soilMeuble! > 0) && (
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Sol</p>
                    <div className="space-y-1 text-sm">
                      {config.soilEnrobe! > 0 && (
                        <p>• Sol enrobé : {config.soilEnrobe}ml</p>
                      )}
                      {config.soilMeuble! > 0 && (
                        <p>• Sol meuble : {config.soilMeuble}ml</p>
                      )}
                    </div>
                  </div>
                )}

                {((config.portails || 0) > 0 || (config.portillons || 0) > 0) && (
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Accès</p>
                    <div className="space-y-1 text-sm">
                      {(config.portails || 0) > 0 && (
                        <>
                          <p className="font-medium">Portails : {config.portails}</p>
                          {config.portailsSelections?.map((sel, idx) => (
                            <p key={idx} className="ml-4 text-xs text-slate-500">
                              {idx + 1}. {PORTAIL_LABELS[sel.type]}
                            </p>
                          ))}
                        </>
                      )}
                      {(config.portillons || 0) > 0 && (
                        <>
                          <p className="font-medium mt-2">Portillons : {config.portillons}</p>
                          {config.portillonsSelections?.map((sel, idx) => (
                            <p key={idx} className="ml-4 text-xs text-slate-500">
                              {idx + 1}. {PORTILLON_LABELS[sel.type]}
                            </p>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {config.materials && config.materials.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Bardages</p>
                    <div className="space-y-2 text-sm">
                      {config.materials.map((mat, idx) => (
                        <div key={idx}>
                          <p className="font-medium">• {MATERIAL_LABELS[mat.type]} : {mat.length}ml</p>
                          <p className="ml-4 text-xs text-slate-500">{MATERIAL_DESCRIPTIONS[mat.type]}</p>
                          {mat.type === 'dibond' && mat.dibondLamination && (
                            <p className="ml-4 text-xs text-blue-700 font-semibold">
                              {DIBOND_LAMINATION_LABELS[mat.dibondLamination]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Services d'accompagnement */}
            {config.servicesAccompagnement && Object.keys(config.servicesAccompagnement).length > 0 && (
              <div className="pt-4 mt-4 border-t border-slate-200">
                <h4 className="font-semibold mb-3">Services d'accompagnement sélectionnés</h4>
                <div className="space-y-2">
                  {config.servicesAccompagnement.toolkit && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                        <Wrench className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Fiche d'installation & liste d'approvisionnement</p>
                      </div>
                      <Check className="w-4 h-4 text-black flex-shrink-0" />
                    </div>
                  )}

                  {config.servicesAccompagnement.transport && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Transport et livraison</p>
                      </div>
                      <Check className="w-4 h-4 text-black flex-shrink-0" />
                    </div>
                  )}

                  {config.servicesAccompagnement.conseil && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Pack complet de déploiement</p>
                        <p className="text-xs text-slate-600">Inclut l'installation par Urbyn</p>
                      </div>
                      <Check className="w-4 h-4 text-black flex-shrink-0" />
                    </div>
                  )}

                  {config.servicesAccompagnement.expertises && config.servicesAccompagnement.expertises.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm font-medium mb-2">Expertises sélectionnées</p>
                      <ul className="space-y-1 text-xs text-slate-600 ml-4">
                        {config.servicesAccompagnement.expertises.map((exp: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-black flex-shrink-0" />
                            <span>{EXPERTISE_LABELS[exp] || exp.replace(/-/g, ' ')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Option Installation */}
            <div className="pt-4 mt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded flex items-center justify-center ${
                  config.includeInstaller ? 'bg-black' : 'bg-slate-200'
                }`}>
                  {config.includeInstaller && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="font-medium">
                    {config.includeInstaller ? 'Installation incluse' : 'Installation non incluse'}
                  </p>
                  {config.includeInstaller && (
                    <p className="text-xs text-slate-500">L'estimation inclut l'installation</p>
                  )}
                </div>
              </div>
              
              {/* Alerte échafaudage roulant */}
              {needsScaffolding && config.includeInstaller && (
                <div className="mt-4 bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
                  <p className="text-sm text-orange-900">
                    <strong>⚠️ Échafaudage roulant nécessaire</strong>
                  </p>
                  <p className="text-xs text-orange-800 mt-1">
                    Votre palissade fait plus de 2,20m de hauteur. Un échafaudage roulant est indispensable pour l'installation en toute sécurité.
                  </p>
                </div>
              )}
              
              {needsScaffolding && !config.includeInstaller && (
                <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <p className="text-sm text-blue-900">
                    <strong>ℹ️ Information importante</strong>
                  </p>
                  <p className="text-xs text-blue-800 mt-1">
                    Votre palissade fait plus de 2,20m de hauteur. Un échafaudage roulant sera nécessaire pour l'installation en toute sécurité.
                  </p>
                </div>
              )}
            </div>
            
            {/* Empreinte carbone totale */}
            {totalSurface > 0 && (
              <div className="pt-4 mt-4 border-t border-slate-200">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm text-green-900">
                        🌱 Empreinte carbone du projet
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Impact environnemental des matériaux de bardage
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-900">
                        {Math.round(totalCO2)} kgCO2e
                      </p>
                      <p className="text-xs text-green-700">
                        total
                      </p>
                    </div>
                  </div>
                  
                  {/* Équivalence CO2 */}
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-xs text-green-800 font-medium mb-2">Équivalence :</p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white rounded p-2 border border-green-200">
                        <p className="text-green-900">
                          🚗 <strong>{carKmEquivalent} km</strong>
                        </p>
                        <p className="text-green-700 text-[10px] mt-1">en voiture thermique</p>
                      </div>
                      <div className="bg-white rounded p-2 border border-green-200">
                        <p className="text-green-900">
                          🌳 <strong>{treesEquivalent} arbre{parseFloat(treesEquivalent) > 1 ? 's' : ''}</strong>
                        </p>
                        <p className="text-green-700 text-[10px] mt-1">nécessaire(s) sur 1 an</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-8" />

          {/* Price Range - Subtotal */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold">Estimation du projet</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-slate-900">
                  {subtotalMin.toLocaleString()} € - {subtotalMax.toLocaleString()} € HT
                </p>
                <p className="text-sm text-slate-600 mt-2">Approche budgétaire ±2,5%</p>
                <p className="text-xs text-slate-500 mt-3">
                  Cette estimation inclut les matériaux{config.includeInstaller ? ' et l\'installation' : ''}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prestations Urbyn - Carte séparée */}
      <Card className="border-2 border-black shadow-2xl shadow-slate-200/50 mb-8">
        <CardContent className="p-8 md:p-12">
          {/* Additional Services */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Prestations Urbyn</h3>
              <p className="text-slate-600">
                Simplifiez votre projet avec nos services d'accompagnement
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Étude BET - NOUVEAU SERVICE */}
              {config.projectType === 'montage' && (
                <div 
                  onClick={() => setWantsBET(!wantsBET)}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    wantsBET ? 'border-black bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      id="bet"
                      checked={wantsBET}
                      onCheckedChange={(checked) => setWantsBET(checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <FileCheck className="w-5 h-5 text-blue-600" />
                        <Label htmlFor="bet" className="cursor-pointer font-semibold text-base">
                          Étude BET (Bureau d'Études Techniques)
                        </Label>
                      </div>
                      <p className="text-sm text-slate-700 mb-3 font-medium">
                        Sécurisez votre installation avec une expertise technique approfondie.
                      </p>
                      <ul className="text-sm text-slate-600 space-y-2 ml-4 mb-3">
                        <li>✓ Calcul de descente de charges et stabilité au vent</li>
                        <li>✓ Note de calcul officielle pour vos assurances</li>
                        <li>✓ Plan d'exécution détaillé avec préconisations de lestage</li>
                      </ul>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{betPrice} € HT</p>
                    </div>
                  </div>
                </div>
              )}

              <Separator className="my-6" />
              
              <h4 className="font-semibold text-base">Accompagnement installation</h4>

              {/* Support - Options d'accompagnement */}
              <div className="border-2 rounded-lg p-5 transition-all border-slate-200">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Choisissez le niveau d'accompagnement souhaité pour votre projet
                    </p>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{supportType === 'none' ? '0 €' : `${supportPrice.toLocaleString()} € HT`}</p>
                    </div>
                  </div>
                </div>
                
                <RadioGroup
                  value={supportType}
                  onValueChange={(value) => setSupportType(value as 'none' | 'fiche' | 'pilotage' | 'pilotage_suivi')}
                  className="space-y-3"
                >
                  <div className="flex items-start justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <div className="flex items-start gap-3 flex-1">
                      <RadioGroupItem value="none" id="support-none" className="mt-1" />
                      <Label htmlFor="support-none" className="cursor-pointer flex-1">
                        <span className="font-medium block">Aucun accompagnement</span>
                        <span className="text-sm text-slate-600">Installation autonome</span>
                      </Label>
                    </div>
                    <span className="font-semibold text-slate-400">Gratuit</span>
                  </div>
                  
                  <div className="flex items-start justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-200">
                    <div className="flex items-start gap-3 flex-1">
                      <RadioGroupItem value="fiche" id="support-fiche" className="mt-1" />
                      <Label htmlFor="support-fiche" className="cursor-pointer flex-1">
                        <span className="font-medium block">Fiche d'installation & Liste d'approvisionnement</span>
                        <span className="text-sm text-slate-600">Prestation clé en main : Fiche technique, liste des matériaux et réseau d'artisans qualifiés.</span>
                      </Label>
                    </div>
                    <span className="font-semibold">280 € HT</span>
                  </div>
                  
                  <div className="flex items-start justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-200">
                    <div className="flex items-start gap-3 flex-1">
                      <RadioGroupItem value="pilotage" id="support-pilotage" className="mt-1" />
                      <Label htmlFor="support-pilotage" className="cursor-pointer flex-1">
                        <span className="font-medium block">Pilotage de l'installation par Urbyn</span>
                        <span className="text-sm text-slate-600 mb-1 block italic">Coordination et supervision à distance</span>
                        
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[11px] leading-tight text-slate-500 border-t border-slate-100 pt-2">
                          <div>
                            <p className="font-bold text-slate-700 uppercase tracking-tighter mb-1 border-b border-slate-50 inline-block">A/ EXPERTISE</p>
                            <p className="mb-1"><span className="font-semibold text-slate-600">1) Étude:</span> Alternatives site, Simulation, Plan d'exécution, Calepinage des visuels</p>
                            <p><span className="font-semibold text-slate-600">2) Préparation:</span> Cahier de Pose (CDP) : Sécurité, Contraintes, Liste appro & moyens d'exécution</p>
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 uppercase tracking-tighter mb-1 border-b border-slate-50 inline-block">B/ DÉPLOIEMENT TERRAIN</p>
                            <p><span className="font-semibold text-slate-600">Suivi:</span> Coordination des intervenants, suivi de chantier (à distance), Bon de Réception</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                    <span className="font-semibold shrink-0 ml-2">{calculateSupportCost('pilotage', subtotalMax).toLocaleString()} € HT</span>
                  </div>
                  
                  <div className="flex items-start justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-200">
                    <div className="flex items-start gap-3 flex-1">
                      <RadioGroupItem value="pilotage_suivi" id="support-pilotage-suivi" className="mt-1" />
                      <Label htmlFor="support-pilotage-suivi" className="cursor-pointer flex-1">
                        <span className="font-medium block">Pilotage + suivi sur site par Urbyn</span>
                        <span className="text-sm text-slate-600 mb-1 block italic">Coordination complète avec présence sur chantier</span>
                        
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[11px] leading-tight text-slate-500 border-t border-slate-100 pt-2">
                          <div>
                            <p className="font-bold text-slate-700 uppercase tracking-tighter mb-1 border-b border-slate-50 inline-block">A/ EXPERTISE</p>
                            <p className="mb-1"><span className="font-semibold text-slate-600">1) Étude:</span> Alternatives site, Simulation, Plan d'exécution, Calepinage des visuels</p>
                            <p><span className="font-semibold text-slate-600">2) Préparation:</span> Cahier de Pose (CDP) : Sécurité, Contraintes, Liste appro & moyens d'exécution</p>
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 uppercase tracking-tighter mb-1 border-b border-slate-50 inline-block">B/ DÉPLOIEMENT TERRAIN</p>
                            <p><span className="font-semibold text-slate-600 text-blue-700">Suivi sur site:</span> Coordination intervenants, supervision physique du chantier, Bon de Réception</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                    <span className="font-semibold shrink-0 ml-2">{calculateSupportCost('pilotage_suivi', subtotalMax).toLocaleString()} € HT</span>
                  </div>
                </RadioGroup>
              </div>

              <Separator className="my-6" />

              {/* CERFA - EN DERNIER avec 2 formules */}
              <div className="border-2 rounded-lg p-5 transition-all border-slate-200">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="w-5 h-5" />
                    <h4 className="font-semibold text-base">Demande d'autorisation pré-enseigne CERFA</h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    Un représentant Urbyn vous accompagne dans vos démarches administratives
                  </p>
                  <a 
                    href="https://entreprendre.service-public.gouv.fr/vosdroits/R24287"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mb-4"
                  >
                    📄 Télécharger le formulaire CERFA de pré-enseigne
                  </a>
                </div>
                
                <RadioGroup
                  value={cerfaType}
                  onValueChange={(value) => setCerfaType(value as 'none' | 'accompagnement' | 'complet')}
                  className="space-y-3"
                >
                  <div className="flex items-start justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <div className="flex items-start gap-3 flex-1">
                      <RadioGroupItem value="none" id="cerfa-none" className="mt-1" />
                      <Label htmlFor="cerfa-none" className="cursor-pointer flex-1">
                        <span className="font-medium block">Pas d'accompagnement</span>
                        <span className="text-sm text-slate-600">Je m'occupe seul de mes démarches</span>
                      </Label>
                    </div>
                    <span className="font-semibold text-slate-400">Gratuit</span>
                  </div>
                  
                  <div className="flex items-start justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-200">
                    <div className="flex items-start gap-3 flex-1">
                      <RadioGroupItem value="accompagnement" id="cerfa-accompagnement" className="mt-1" />
                      <Label htmlFor="cerfa-accompagnement" className="cursor-pointer flex-1">
                        <span className="font-medium block">Accompagnement téléphonique</span>
                        <span className="text-sm text-slate-600">Un représentant vous aide à remplir le document par téléphone</span>
                      </Label>
                    </div>
                    <span className="font-semibold">{cerfaAccompagnementPrice} € HT</span>
                  </div>
                  
                  <div className="flex items-start justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-200">
                    <div className="flex items-start gap-3 flex-1">
                      <RadioGroupItem value="complet" id="cerfa-complet" className="mt-1" />
                      <Label htmlFor="cerfa-complet" className="cursor-pointer flex-1">
                        <span className="font-medium block">Service complet avec mandat</span>
                        <span className="text-sm text-slate-600">Remplissage du document et envoi à l'administration via mandat</span>
                      </Label>
                    </div>
                    <span className="font-semibold">{cerfaCompletPrice} € HT</span>
                  </div>
                </RadioGroup>
                
                <p className="text-xs text-slate-500 mt-4 italic">
                  Service disponible uniquement en France métropolitaine
                </p>
              </div>
            </div>

            {additionalServicesTotal > 0 && (
              <>
                <Separator />
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
                  <div className="text-center">
                    <p className="text-sm opacity-90 mb-2">Total des prestations Urbyn</p>
                    <p className="text-3xl md:text-4xl font-bold">
                      {additionalServicesTotal.toLocaleString()} € HT
                    </p>
                  </div>
                </div>
              </>
            )}
            
            {additionalServicesTotal === 0 && (
              <div className="bg-slate-50 rounded-xl p-6 text-center border-2 border-dashed border-slate-200">
                <p className="text-slate-600">
                  Aucune prestation sélectionnée
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Choisissez les services qui vous intéressent ci-dessus
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Coût total combiné - Nouveau bloc */}
      {additionalServicesTotal > 0 && (
        <Card className="border-2 border-blue-600 shadow-2xl shadow-blue-200/50 mb-8">
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4 text-blue-900">
                Coût total de votre projet
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Estimation du projet + Prestations Urbyn
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="text-slate-600">Estimation du projet</span>
                  <span className="font-semibold">
                    {subtotalMin.toLocaleString()} - {subtotalMax.toLocaleString()} € HT
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="text-slate-600">Prestations Urbyn</span>
                  <span className="font-semibold text-green-700">
                    +{additionalServicesTotal.toLocaleString()} € HT
                  </span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                <p className="text-sm opacity-90 mb-2">Total global</p>
                <p className="text-4xl md:text-5xl font-bold">
                  {finalMin.toLocaleString()} - {finalMax.toLocaleString()} € HT
                </p>
              </div>
              
              <p className="text-xs text-slate-500 mt-4 italic">
                Le montant des prestations Urbyn s'ajoute à l'estimation du projet
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <Button 
          onClick={onReset} 
          variant="outline" 
          className="flex-1 h-14 text-base border-2 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nouvelle estimation
        </Button>
        {additionalServicesTotal > 0 && onAddToCart && (
          <Button 
            className="flex-1 h-14 text-base bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md border-2 border-orange-400"
            onClick={() => {
              onAddToCart({
                config,
                priceBreakdown,
                subtotalMin,
                subtotalMax,
                services: {
                  wantsBET,
                  supportType,
                  cerfaType
                },
                supportPrice: supportPrice,
                servicesTotal: additionalServicesTotal,
                finalMin,
                finalMax
              });
            }}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Ajouter au panier
          </Button>
        )}
      </div>
      </div>
    </div>
  );
}
