import { SEOMeta, breadcrumbSchema } from '../components/SEOMeta';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowRight, Check, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { cn } from '../components/ui/utils';
import { ProgressSteps } from '../components/ProgressSteps';
import { WEIGHT_BANDS, type WeightBand, type MassifOption } from '../components/MassifCalculator';
import massifImg from 'figma:asset/1e6a3eb50a7bcc897639b57c16806ba7a3ff933c.png';
import {
  fetchMassifLeafCatalogs,
  fetchMassifProducts,
  type MassifLeafCatalog,
  type MassifProduct,
} from '../api/massif';
import { ApiError } from '../api/client';

type WizardStep = 'weight' | 'family' | 'dimension';
type WeightMode = 'band' | 'exact';

const stepIndex: Record<WizardStep, number> = { weight: 0, family: 1, dimension: 2 };

function formatDim(val: number | null, unit = 'cm') {
  if (val == null) return '—';
  return `${val} ${unit}`;
}

function productAttributes(product: MassifProduct): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [];
  for (const attr of product.mandatory_attributes) {
    if (attr.value?.trim()) {
      rows.push({ label: attr.attribute_name, value: attr.value });
    }
  }
  for (const attr of product.free_attributes) {
    if (attr.value?.trim()) {
      rows.push({ label: attr.name, value: attr.value });
    }
  }
  return rows;
}

export function MassifSelectionPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<WizardStep>('weight');
  const [weightMode, setWeightMode] = useState<WeightMode>('band');
  const [selectedBandId, setSelectedBandId] = useState<string | null>(null);
  const [exactWeight, setExactWeight] = useState('');
  const [selectedCatalog, setSelectedCatalog] = useState<MassifLeafCatalog | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MassifProduct | null>(null);

  const [catalogs, setCatalogs] = useState<MassifLeafCatalog[]>([]);
  const [catalogsLoading, setCatalogsLoading] = useState(false);
  const [catalogsError, setCatalogsError] = useState<string | null>(null);

  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiProducts, setApiProducts] = useState<MassifProduct[]>([]);
  const [lastPayload, setLastPayload] = useState<object | null>(null);

  const selectedBand = WEIGHT_BANDS.find((b) => b.id === selectedBandId) ?? null;

  const weightLabel =
    weightMode === 'exact' && exactWeight.trim()
      ? `${exactWeight.trim()} kg`
      : selectedBand?.label ?? null;

  const weightFilter = (): { poids?: number; poids_min?: number; poids_max?: number } | null => {
    if (weightMode === 'exact') {
      const value = Number(exactWeight.replace(',', '.'));
      if (!Number.isFinite(value) || value < 0) return null;
      return { poids: value };
    }
    if (!selectedBand) return null;
    return {
      poids_min: selectedBand.min,
      poids_max: selectedBand.max === Infinity ? 99999 : selectedBand.max,
    };
  };

  useEffect(() => {
    let cancelled = false;
    setCatalogsLoading(true);
    setCatalogsError(null);
    fetchMassifLeafCatalogs()
      .then((data) => {
        if (!cancelled) setCatalogs(data.catalogs ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          setCatalogsError(
            err instanceof ApiError ? err.message : 'Impossible de charger les familles massif.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setCatalogsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const goToFamily = () => {
    const filter = weightFilter();
    if (!filter) return;
    setSelectedCatalog(null);
    setSelectedProduct(null);
    setApiProducts([]);
    setApiError(null);
    setStep('family');
  };

  const handleCatalogSelect = async (catalog: MassifLeafCatalog) => {
    const filter = weightFilter();
    if (!filter) return;

    setSelectedCatalog(catalog);
    setSelectedProduct(null);
    setApiError(null);
    setApiProducts([]);
    setStep('dimension');

    const payload = { catalog_id: catalog.id, ...filter };
    setLastPayload(payload);
    setApiLoading(true);
    try {
      const data = await fetchMassifProducts(payload);
      setApiProducts(data.products ?? []);
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Erreur inconnue');
    } finally {
      setApiLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedCatalog || !selectedProduct) return;
    const defaultOption: MassifOption = 'aucun';
    navigate('/massif', {
      state: {
        family: selectedCatalog.name,
        catalogId: selectedCatalog.id,
        productId: selectedProduct.product_id,
        productName: selectedProduct.product_name,
        dimension: String(selectedProduct.product_id),
        option: defaultOption,
        quantity: 1,
        weightKg: selectedProduct.poids,
        price: selectedProduct.price,
        currency: selectedProduct.currency,
        attributes: productAttributes(selectedProduct),
        fromApi: true,
      },
    });
  };

  return (
    <>
      <SEOMeta
        title="Massifs béton temporaires | Urbyn"
        description="Configurez vos massifs béton temporaires. Estimation filtrée sur le catalogue Massif Type."
        jsonLd={breadcrumbSchema([
          { name: 'Accueil', url: '/' },
          { name: 'Massifs béton', url: '/massif/selection' },
        ])}
      />
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-black shrink-0">
              <ImageWithFallback src={massifImg} alt="Massif béton" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-black">Massifs béton</h1>
              <p className="text-sm text-gray-500">Obtenez votre estimation</p>
            </div>
          </div>

          <ProgressSteps currentStep={3} />

          {/* Sous-étapes estimation */}
          <div className="flex items-center gap-2 mb-6 text-xs font-medium">
            {(['weight', 'family', 'dimension'] as WizardStep[]).map((s, i) => {
              const labels = { weight: 'Poids', family: 'Famille', dimension: 'Produit' };
              const active = stepIndex[s] === stepIndex[step];
              const done = stepIndex[s] < stepIndex[step];
              return (
                <span key={s} className="flex items-center gap-2">
                  {i > 0 ? <span className="text-gray-300">·</span> : null}
                  <span className={active || done ? 'text-black' : 'text-gray-400'}>
                    {done ? '✓ ' : `${i + 1}. `}
                    {labels[s]}
                  </span>
                </span>
              );
            })}
          </div>

          <p className="text-sm text-gray-500 mb-8">
            Sélectionnez le poids, une famille catalogue, puis un produit disponible.
          </p>

          {/* ── ÉTAPE 1 : Poids ── */}
          {step === 'weight' && (
            <div>
              <h2 className="font-bold text-black text-lg mb-4">Quel poids recherchez-vous ?</h2>

              <div className="flex gap-2 mb-5">
                <button
                  type="button"
                  onClick={() => setWeightMode('band')}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border font-medium',
                    weightMode === 'band' ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600',
                  )}
                >
                  Fourchette
                </button>
                <button
                  type="button"
                  onClick={() => setWeightMode('exact')}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border font-medium',
                    weightMode === 'exact' ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600',
                  )}
                >
                  Poids exact
                </button>
              </div>

              {weightMode === 'band' ? (
                <div className="space-y-3">
                  {WEIGHT_BANDS.map((wb: WeightBand) => (
                    <button
                      key={wb.id}
                      type="button"
                      onClick={() => {
                        setSelectedBandId(wb.id);
                        setExactWeight('');
                      }}
                      className={cn(
                        'w-full text-left p-4 rounded-xl border transition-all',
                        selectedBandId === wb.id
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 bg-white hover:border-black',
                      )}
                    >
                      <p className="font-bold">{wb.label}</p>
                      <p className={cn('text-xs mt-1', selectedBandId === wb.id ? 'text-gray-300' : 'text-gray-500')}>
                        {wb.min} – {wb.max === Infinity ? '∞' : wb.max} kg
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-w-sm">
                  <label className="text-sm font-medium text-gray-700">Poids en kg</label>
                  <Input
                    type="number"
                    min={0}
                    step="1"
                    placeholder="ex. 1200"
                    value={exactWeight}
                    onChange={(e) => {
                      setExactWeight(e.target.value);
                      setSelectedBandId(null);
                    }}
                  />
                </div>
              )}

              <Button
                onClick={goToFamily}
                disabled={!weightFilter()}
                className="mt-6 w-full bg-black hover:bg-gray-800 text-white py-5 disabled:opacity-40"
              >
                Continuer <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* ── ÉTAPE 2 : Famille (catalogues feuilles DB) ── */}
          {step === 'family' && weightLabel && (
            <div>
              <button
                type="button"
                onClick={() => setStep('weight')}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black mb-4 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Modifier le poids
              </button>

              <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <span className="text-gray-700">
                  Poids sélectionné : <strong className="text-black">{weightLabel}</strong>
                </span>
              </div>

              <h2 className="font-bold text-black text-lg mb-4">Quelle famille de massif ?</h2>

              {catalogsLoading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin text-black" />
                  <p className="text-sm">Chargement des catalogues Massif Type…</p>
                </div>
              )}

              {!catalogsLoading && catalogsError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Catalogues indisponibles</p>
                    <p className="text-xs text-red-600 mt-1">{catalogsError}</p>
                  </div>
                </div>
              )}

              {!catalogsLoading && !catalogsError && catalogs.length === 0 && (
                <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-sm">Aucun catalogue feuille sous « Massif Type ».</p>
                </div>
              )}

              {!catalogsLoading && !catalogsError && catalogs.length > 0 && (
                <div className="space-y-3">
                  {catalogs.map((catalog) => (
                    <button
                      key={catalog.id}
                      type="button"
                      onClick={() => handleCatalogSelect(catalog)}
                      className="flex items-center gap-4 p-4 border border-gray-200 bg-white rounded-xl hover:border-black hover:shadow-sm transition-all text-left w-full"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-slate-50 flex items-center justify-center">
                        <ImageWithFallback
                          src={massifImg}
                          alt={catalog.name ?? 'Massif'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900">{catalog.name ?? `Catalogue #${catalog.id}`}</p>
                        {catalog.description ? (
                          <p className="text-xs text-gray-500 mt-0.5">{catalog.description}</p>
                        ) : null}
                        <p className="text-xs text-gray-400 mt-1 font-mono">
                          {(catalog.breadcrumb.length ? catalog.breadcrumb : ['Massif Type']).join(' › ')}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ÉTAPE 3 : Produits filtrés ── */}
          {step === 'dimension' && weightLabel && selectedCatalog && (
            <div>
              <button
                type="button"
                onClick={() => {
                  setStep('family');
                  setSelectedProduct(null);
                }}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black mb-4 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Modifier la famille
              </button>

              <div className="flex flex-wrap items-center gap-2 mb-5 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-black">{weightLabel}</strong>
                  <span className="mx-2 text-gray-300">·</span>
                  <strong className="text-black">{selectedCatalog.name}</strong>
                </span>
              </div>

              <h2 className="font-bold text-black text-lg mb-4">Quelle dimension / produit ?</h2>

              {apiLoading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin text-black" />
                  <p className="text-sm">Recherche des produits disponibles…</p>
                </div>
              )}

              {!apiLoading && apiError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Impossible de charger les produits</p>
                    <p className="text-xs text-red-600 mt-1">{apiError}</p>
                    <button
                      type="button"
                      onClick={() => handleCatalogSelect(selectedCatalog)}
                      className="mt-2 text-xs font-semibold text-red-700 underline hover:text-red-900"
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              )}

              {!apiLoading && !apiError && apiProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-sm">Aucun produit disponible pour cette sélection.</p>
                </div>
              )}

              {!apiLoading && !apiError && apiProducts.length > 0 && (
                <div className="space-y-3">
                  {apiProducts.map((product) => {
                    const isSelected = selectedProduct?.product_id === product.product_id;
                    const { longueur, largeur, hauteur, volume } = product.dimensions;
                    const attrs = productAttributes(product);
                    return (
                      <button
                        key={product.product_id}
                        type="button"
                        onClick={() => setSelectedProduct(product)}
                        className={cn(
                          'w-full text-left p-4 rounded-xl border transition-all',
                          isSelected
                            ? 'border-black bg-black text-white shadow-lg'
                            : 'border-gray-200 bg-white hover:border-black hover:shadow-sm text-gray-900',
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <p className="font-bold text-sm">{product.product_name}</p>
                              {isSelected && <Check className="w-4 h-4 shrink-0" />}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-1">
                              {longueur != null && (
                                <span className={isSelected ? 'text-gray-300' : 'text-gray-500'}>
                                  L : {formatDim(longueur)}
                                </span>
                              )}
                              {largeur != null && (
                                <span className={isSelected ? 'text-gray-300' : 'text-gray-500'}>
                                  l : {formatDim(largeur)}
                                </span>
                              )}
                              {hauteur != null && (
                                <span className={isSelected ? 'text-gray-300' : 'text-gray-500'}>
                                  H : {formatDim(hauteur)}
                                </span>
                              )}
                              {volume != null && (
                                <span className={isSelected ? 'text-gray-300' : 'text-gray-500'}>
                                  Vol : {volume}
                                </span>
                              )}
                            </div>
                            {attrs.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {attrs.slice(0, 8).map((attr) => (
                                  <span
                                    key={`${attr.label}-${attr.value}`}
                                    className={cn(
                                      'text-[10px] px-1.5 py-0.5 rounded border',
                                      isSelected
                                        ? 'border-white/30 text-gray-200'
                                        : 'border-gray-200 text-gray-600 bg-gray-50',
                                    )}
                                  >
                                    {attr.label}: {attr.value}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className={cn('text-xs mt-1 font-mono', isSelected ? 'text-gray-400' : 'text-gray-400')}>
                              {product.admin_sku}
                              {product.company_name ? ` · ${product.company_name}` : ''}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-sm">{product.poids} kg</p>
                            {product.price > 0 && (
                              <p className={cn('text-xs mt-0.5', isSelected ? 'text-gray-300' : 'text-gray-500')}>
                                {product.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}{' '}
                                {product.currency}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {lastPayload && !apiLoading && (
                <details className="mt-6 text-xs text-gray-400">
                  <summary className="cursor-pointer hover:text-gray-600">Payload envoyé à l&apos;API</summary>
                  <pre className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto text-[11px]">
                    {JSON.stringify(lastPayload, null, 2)}
                  </pre>
                </details>
              )}

              <Button
                onClick={handleConfirm}
                disabled={!selectedProduct}
                className="mt-6 w-full bg-black hover:bg-gray-800 text-white py-5 disabled:opacity-40"
              >
                Accéder à la configuration <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
