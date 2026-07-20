import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ShieldCheck, Wind, Package, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getTotemImage } from '../assets/totemImages';

interface TotemBalastRequirement {
  totemId: string;
  totemName: string;
  totemFormat: string;
  balastsNeeded: number;
  totalWeight: number;
}

interface ComplianceResults {
  windZone: {
    zone: number;
    vb: number;
    description: string;
    critical: boolean;
  };
  terrain: {
    key: string;
    label: string;
  };
  nearWater: boolean;
  totemRequirements: TotemBalastRequirement[];
  totalBalasts: number;
  totalWeight: number;
  totalPrice: number;
  deliveryAddress: string;
}

export function TotemComplianceResultsPage() {
  const navigate = useNavigate();
  const { items, addItem, updateWindCompliance } = useCart();
  const [results, setResults] = useState<ComplianceResults | null>(null);

  useEffect(() => {
    const savedResults = localStorage.getItem('complianceResults');
    if (savedResults) {
      setResults(JSON.parse(savedResults));
    }
  }, []);

  const handleAddAllBalasts = () => {
    if (results && results.totalBalasts > 0) {
      addItem({
        id: `balast-${Date.now()}`,
        type: 'totem',
        name: `Lest en fonte 25 kg`,
        price: 70.00,
        quantity: results.totalBalasts,
        details: {
          itemType: 'balast',
          weight: 25
        }
      });
    }

    // Marquer tous les totems comme vérifiés
    results?.totemRequirements.forEach(req => {
      updateWindCompliance(req.totemId, true);
    });

    navigate('/panier');
  };

  const handleContinueWithoutBalasts = () => {
    // Marquer tous les totems comme vérifiés même sans lests
    results?.totemRequirements.forEach(req => {
      updateWindCompliance(req.totemId, true);
    });
    navigate('/panier');
  };

  if (!results) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <Card className="bg-white rounded-xl border-2 border-yellow-400 shadow-lg">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-20 h-20 mx-auto mb-6 text-yellow-500" />
              <h2 className="text-3xl font-bold mb-4 text-black">Aucun résultat disponible</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Veuillez d'abord effectuer l'analyse de conformité vent.
              </p>
              <Button onClick={() => navigate('/totem/conformite')} className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg rounded-xl shadow-lg">
                Effectuer l'analyse
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const needsBalasts = results.totalBalasts > 0;

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="mb-8">
          <Button variant="outline" onClick={() => navigate('/totem/conformite')} className="border border-gray-300 hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'analyse
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className={`w-10 h-10 ${needsBalasts ? 'text-orange-600' : 'text-green-600'}`} />
            <h1 className="text-3xl font-bold text-black">Résultats de conformité vent</h1>
          </div>
          <p className="text-gray-600">
            Analyse effectuée selon la norme Eurocode EN 1991-1-4 pour la localisation : <strong className="text-black">{results.deliveryAddress}</strong>
          </p>
        </div>

      {/* Zone de vent et terrain */}
      <Card className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className={`rounded-lg p-4 mb-0 ${results.windZone.critical ? 'bg-orange-50 border border-orange-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Wind className={`w-5 h-5 ${results.windZone.critical ? 'text-orange-700' : 'text-blue-700'}`} />
              <h3 className="font-bold text-black">Conditions de vent et terrain</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Zone de vent</p>
                <p className="text-sm font-semibold text-black">Zone {results.windZone.zone} - {results.windZone.description}</p>
                <p className="text-xs text-gray-600 mt-1">Vitesse de base : {results.windZone.vb} m/s ({Math.round(results.windZone.vb * 3.6)} km/h)</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Catégorie de terrain</p>
                <p className="text-sm font-semibold text-black">{results.terrain.label}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Environnement</p>
                {results.nearWater ? (
                  <span className="text-sm font-semibold text-orange-700">⚠️ Proximité cours d'eau (+50%)</span>
                ) : (
                  <span className="text-sm font-semibold text-gray-600">Zone standard</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exigences par totem */}
      <Card className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-black mb-4">Exigences de lestage par totem</h2>
          <p className="text-sm text-gray-600 mb-6">
            Détail des besoins en lestage pour chacun de vos totems
          </p>
          <div className="space-y-3">
            {results.totemRequirements.map((req, index) => (
              <div key={req.totemId} className={`border rounded-xl p-5 ${req.balastsNeeded > 0 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 border border-gray-300">
                    <ImageWithFallback
                      src={getTotemImage(req.totemId, req.totemFormat)}
                      alt={req.totemName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-black">{req.totemName}</h3>
                        <p className="text-sm text-gray-600">Format : {req.totemFormat} cm</p>
                      </div>
                      <div className="text-right">
                        {req.balastsNeeded > 0 ? (
                          <div className="bg-white border-2 border-orange-400 rounded-xl px-4 py-3 shadow-sm">
                            <p className="text-xs text-orange-700 font-medium uppercase tracking-wider">Lests nécessaires</p>
                            <p className="text-3xl font-bold text-orange-600 my-1">{req.balastsNeeded}</p>
                            <p className="text-xs text-gray-600">{req.totalWeight} kg total</p>
                          </div>
                        ) : (
                          <div className="bg-white border-2 border-green-400 rounded-xl px-4 py-3 shadow-sm">
                            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                              <CheckCircle className="w-5 h-5" />
                              <p className="text-sm font-bold">Conforme</p>
                            </div>
                            <p className="text-xs text-gray-600 text-center">Sans lestage</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Récapitulatif total */}
      <Card className={`mb-6 bg-white rounded-xl shadow-lg border-2 ${needsBalasts ? 'border-orange-400' : 'border-green-400'}`}>
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            {needsBalasts ? (
              <AlertTriangle className="w-10 h-10 text-orange-600 flex-shrink-0" />
            ) : (
              <ShieldCheck className="w-10 h-10 text-green-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-black mb-3">
                {needsBalasts ? 'Lestage requis pour la conformité' : 'Configuration conforme'}
              </h2>

              {needsBalasts ? (
                <>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Pour garantir la stabilité et la conformité de vos <strong className="text-black">{results.totemRequirements.length} totem(s)</strong> dans cette zone de vent
                    {results.nearWater && ' et compte tenu de la proximité d\'un cours d\'eau'},
                    nous recommandons l'ajout de <strong className="text-black">{results.totalBalasts} lest(s) en fonte de 25 kg</strong> au total.
                  </p>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-300 p-6 mb-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-xl font-bold text-black">Lest en fonte 25 kg</h3>
                        <p className="text-sm text-gray-600 mt-1">Quantité totale recommandée</p>
                      </div>
                      <div className="text-right bg-white rounded-lg px-4 py-3 border border-orange-200">
                        <p className="text-4xl font-bold text-orange-600">{results.totalBalasts}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">unités</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Poids total</p>
                        <p className="font-bold text-black text-2xl">{results.totalWeight} kg</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Prix total HT</p>
                        <p className="font-bold text-black text-2xl">{results.totalPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button onClick={handleAddAllBalasts} className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                      <Package className="w-5 h-5 mr-2" />
                      Ajouter les {results.totalBalasts} lests au panier — {results.totalPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ HT
                    </Button>
                    <Button onClick={handleContinueWithoutBalasts} variant="outline" className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl">
                      Continuer sans lestage (non recommandé)
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Vos totems sont conformes aux exigences de la norme Eurocode EN 1991-1-4 sans lestage supplémentaire dans cette configuration.
                  </p>
                  <Button onClick={handleContinueWithoutBalasts} className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Marquer comme vérifié et continuer
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations complémentaires */}
      <Card className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-bold text-black mb-4">Informations complémentaires</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-gray-400 mt-0.5">•</span>
              <p className="text-gray-700">
                <strong className="text-black">Norme appliquée :</strong> Eurocode EN 1991-1-4 (Actions du vent)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gray-400 mt-0.5">•</span>
              <p className="text-gray-700">
                <strong className="text-black">Hypothèses :</strong> Installation en zone dégagée, hauteur standard
              </p>
            </div>
            {results.nearWater && (
              <div className="flex items-start gap-3">
                <span className="text-gray-400 mt-0.5">•</span>
                <p className="text-gray-700">
                  <strong className="text-black">Proximité cours d'eau :</strong> Coefficient de majoration de 50% appliqué au lestage
                </p>
              </div>
            )}
            <div className="flex items-start gap-3">
              <span className="text-gray-400 mt-0.5">•</span>
              <p className="text-gray-700">
                <strong className="text-black">Coefficient de sécurité :</strong> Conforme aux exigences réglementaires
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-xs text-blue-800 italic leading-relaxed">
                ℹ️ <strong>Note :</strong> Cette vérification est indicative. Pour une installation définitive,
                nous recommandons une étude par un bureau d'études techniques (BET).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}