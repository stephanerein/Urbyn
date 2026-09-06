import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { ShieldCheck, Wind, Package, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getTotemImage } from '../assets/totemImages';
import { balastLineId } from '../lib/totemBallast';

interface TotemBalastRequirement {
  totemId: string;
  totemName: string;
  totemFormat: string;
  totemQuantity?: number;
  balastsPerUnit?: number;
  balastsNeeded: number;
  totalWeight: number;
  unitPrice?: number;
  linePrice?: number;
  sheetHeader?: string | null;
  sheetValue?: number | string | null;
  sheetMatched?: boolean;
  sheetSupported?: boolean;
  sheetMessage?: string | null;
  source?: string;
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
  unitPrice?: number;
  unitWeight?: number;
  ballastProduct?: {
    product_id: number;
    product_name: string;
    client_sku: string | null;
    price: number;
    poids: number | null;
  } | null;
  deliveryAddress: string;
  googleSheet?: {
    region_sheet?: string;
    terrain_sheet?: string;
    write_ok?: boolean;
    error?: string | null;
    error_code?: string | null;
  };
}

export function TotemComplianceResultsPage() {
  const navigate = useNavigate();
  const { addItems, updateWindCompliance } = useCart();
  const [results, setResults] = useState<ComplianceResults | null>(null);
  /** Totems pour lesquels l'utilisateur accepte d'acheter les lests (pré-coché). */
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const savedResults = localStorage.getItem('complianceResults');
    if (!savedResults) return;
    try {
      const parsed = JSON.parse(savedResults) as ComplianceResults;
      setResults(parsed);
      const init: Record<string, boolean> = {};
      for (const req of parsed.totemRequirements || []) {
        if (req.balastsNeeded > 0) init[req.totemId] = true;
      }
      setSelected(init);
    } catch {
      /* ignore */
    }
  }, []);

  const unitPrice = results?.unitPrice ?? results?.ballastProduct?.price ?? 70;
  const unitWeight = results?.unitWeight ?? results?.ballastProduct?.poids ?? 25;
  const ballastName = results?.ballastProduct?.product_name || `Lest en fonte ${unitWeight} kg`;

  const selectedReqs = useMemo(() => {
    if (!results) return [];
    return results.totemRequirements.filter(
      (r) => r.balastsNeeded > 0 && selected[r.totemId],
    );
  }, [results, selected]);

  const selectedBalasts = selectedReqs.reduce((s, r) => s + r.balastsNeeded, 0);
  const selectedPrice = selectedBalasts * unitPrice;
  const selectedWeight = selectedBalasts * unitWeight;
  const needsBalasts = (results?.totalBalasts ?? 0) > 0;
  const compliantReqs =
    results?.totemRequirements.filter((r) => r.balastsNeeded <= 0) ?? [];

  const markCompliantTotems = () => {
    compliantReqs.forEach((req) => updateWindCompliance(req.totemId, true));
  };

  const handleAddSelectedBalasts = () => {
    if (!results) return;

    const batch = selectedReqs.map((req) => ({
      id: balastLineId(req.totemId),
      type: 'totem' as const,
      name: ballastName,
      price: unitPrice,
      quantity: req.balastsNeeded,
      details: {
        itemType: 'balast',
        weight: unitWeight,
        forTotemId: req.totemId,
        forTotemName: req.totemName,
        balastsPerUnit: req.balastsPerUnit ?? (req.totemQuantity && req.totemQuantity > 0
          ? req.balastsNeeded / req.totemQuantity
          : req.balastsNeeded),
        balastsNeeded: req.balastsNeeded,
        productId: results.ballastProduct?.product_id,
        sku: results.ballastProduct?.client_sku,
      },
    }));

    if (batch.length > 0) addItems(batch);

    // Vert uniquement pour : conformes sans lest + ceux dont les lests sont cochés/ajoutés
    markCompliantTotems();
    selectedReqs.forEach((req) => updateWindCompliance(req.totemId, true));

    // Totems non cochés avec besoin de lest → restent orange
    results.totemRequirements.forEach((req) => {
      if (req.balastsNeeded > 0 && !selected[req.totemId]) {
        updateWindCompliance(req.totemId, false);
      }
    });

    navigate('/panier');
  };

  const handleContinueWithoutBalasts = () => {
    if (!results) return;
    // Conformes sans lest → verts ; les autres restent orange (non normatif accepté)
    markCompliantTotems();
    results.totemRequirements.forEach((req) => {
      if (req.balastsNeeded > 0) updateWindCompliance(req.totemId, false);
    });
    navigate('/panier');
  };

  const handleMarkAllCompliantNoNeed = () => {
    markCompliantTotems();
    navigate('/panier');
  };

  if (!results) {
    return (
      <div className="min-h-screen pt-[var(--header-height)] bg-gray-50">
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

  return (
    <div className="min-h-screen pt-[var(--header-height)] bg-gray-50">
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
          {results.googleSheet?.write_ok ? (
            <p className="text-sm text-blue-700 mt-2">
              Google Sheet : {results.googleSheet.region_sheet} · {results.googleSheet.terrain_sheet}
            </p>
          ) : (
            <div className="mt-3 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-sm text-red-900">
              <p className="font-semibold mb-1">
                Google Sheet inaccessible — résultat estimatif local (pas la valeur Excel)
              </p>
              {results.googleSheet?.error ? (
                <p className="text-xs whitespace-pre-wrap break-words opacity-90 mb-2">
                  {results.googleSheet.error_code ? `[${results.googleSheet.error_code}] ` : ''}
                  {results.googleSheet.error.slice(0, 500)}
                </p>
              ) : (
                <p className="text-xs mb-2">Erreur Sheets non détaillée.</p>
              )}
              {/Sheets API has not been used|is disabled/i.test(results.googleSheet?.error || '') ? (
                <p className="text-xs">
                  Active l’API ici puis réessaie :{' '}
                  <a
                    className="underline font-medium"
                    href="https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=1033129201788"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Activer Google Sheets API (projet urbyn-secu-drive)
                  </a>
                </p>
              ) : null}
            </div>
          )}
        </div>

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

        <Card className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-black mb-2">Exigences de lestage par totem</h2>
            <p className="text-sm text-gray-600 mb-6">
              Cochez les lests supplémentaires à ajouter au panier — chaque totem a sa propre quantité (× nombre d'unités).
            </p>
            <div className="space-y-3">
              {results.totemRequirements.map((req) => {
                const needs = req.balastsNeeded > 0;
                const linePrice = (req.linePrice ?? req.balastsNeeded * unitPrice);
                return (
                  <div
                    key={req.totemId}
                    className={`border rounded-xl p-5 ${needs ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}
                  >
                    <div className="flex gap-4">
                      {needs ? (
                        <div className="pt-1">
                          <Checkbox
                            id={`balast-${req.totemId}`}
                            checked={!!selected[req.totemId]}
                            onCheckedChange={(checked) =>
                              setSelected((prev) => ({ ...prev, [req.totemId]: checked === true }))
                            }
                          />
                        </div>
                      ) : null}
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
                            <label htmlFor={needs ? `balast-${req.totemId}` : undefined} className="font-semibold text-black cursor-pointer">
                              {req.totemName}
                              {req.totemQuantity && req.totemQuantity > 1 ? (
                                <span className="text-gray-500 font-normal"> × {req.totemQuantity}</span>
                              ) : null}
                            </label>
                            <p className="text-sm text-gray-600">Format : {req.totemFormat} cm</p>
                            {req.sheetSupported ? (
                              <p className="text-xs text-blue-700 mt-1">
                                Sheet [{req.sheetHeader}]
                                {req.sheetMatched
                                  ? ` → ${req.sheetValue ?? '—'} (${req.balastsPerUnit ?? '—'} lest/u)`
                                  : ` → non trouvé${req.sheetMessage ? ` (${req.sheetMessage})` : ''}`}
                              </p>
                            ) : req.sheetSupported === false ? (
                              <p className="text-xs text-gray-400 mt-1">Hors périmètre Google Sheet</p>
                            ) : null}
                            {needs ? (
                              <p className="text-xs text-orange-800 mt-2">
                                {req.balastsNeeded} × {ballastName} — {unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ HT / u
                                {' · '}
                                <strong>{linePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ HT</strong>
                              </p>
                            ) : null}
                          </div>
                          <div className="text-right">
                            {needs ? (
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
                );
              })}
            </div>
          </CardContent>
        </Card>

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
                      Pour la conformité Eurocode de vos totems, ajoutez les lests cochés
                      ({ballastName} à {unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ HT).
                      Sans les lests, le marqueur reste orange (hors norme acceptée).
                    </p>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-300 p-6 mb-6">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="text-xl font-bold text-black">{ballastName}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Sélection : {selectedReqs.length} totem(s) · {unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ HT / unité
                          </p>
                        </div>
                        <div className="text-right bg-white rounded-lg px-4 py-3 border border-orange-200">
                          <p className="text-4xl font-bold text-orange-600">{selectedBalasts}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">unités</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Poids total</p>
                          <p className="font-bold text-black text-2xl">{selectedWeight} kg</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Prix total HT</p>
                          <p className="font-bold text-black text-2xl">
                            {selectedPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={handleAddSelectedBalasts}
                        disabled={selectedBalasts <= 0}
                        className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        <Package className="w-5 h-5 mr-2" />
                        Ajouter {selectedBalasts} lest(s) au panier — {selectedPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ HT
                      </Button>
                      <Button
                        onClick={handleContinueWithoutBalasts}
                        variant="outline"
                        className="w-full border-2 border-orange-300 text-orange-800 hover:bg-orange-50 py-3 rounded-xl"
                      >
                        Continuer sans lestage (marqueur orange — hors norme)
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      Vos totems sont conformes aux exigences de la norme Eurocode EN 1991-1-4 sans lestage supplémentaire dans cette configuration.
                    </p>
                    <Button
                      onClick={handleMarkAllCompliantNoNeed}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Marquer comme vérifié et continuer
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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
                  <strong className="text-black">Catalogue :</strong> Totem / Accessoire — prix unitaire issu de la DB
                </p>
              </div>
              {results.nearWater && (
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <p className="text-gray-700">
                    <strong className="text-black">Proximité cours d'eau :</strong> Coefficient de majoration de 50% (fallback local uniquement)
                  </p>
                </div>
              )}
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
