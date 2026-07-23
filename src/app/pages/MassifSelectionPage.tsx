import { SEOMeta, breadcrumbSchema } from '../components/SEOMeta';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowRight, Check, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { cn } from '../components/ui/utils';
import { ProgressSteps } from '../components/ProgressSteps';
import {
  WEIGHT_BANDS,
  ALL_FAMILIES,
  familyImage,
  type WeightBand,
  type MassifType,
  type MassifOption,
} from '../components/MassifCalculator';
import massifImg from 'figma:asset/massif-beton-cubique.png';

type WizardStep = 'weight' | 'family' | 'dimension';

const stepIndex: Record<WizardStep, number> = { weight: 0, family: 1, dimension: 2 };

// ── Mapping famille → catalogue API ──────────────────────────────────────────
const CATALOG_MAP: Record<MassifType, string[]> = {
  cubique:      ['Massif', 'Temporaire', 'Massif Cubique'],
  lego:         ['Massif', 'Temporaire', 'Massif Lego'],
  cylindrique:  ['Massif', 'Temporaire', 'Massif Cylindrique'],
  stabilize:    ['Massif', 'Temporaire', 'Massif Stabilisé'],
  candelabre:   ['Massif', 'Temporaire', 'Massif Candélabre'],
};

// ── Types réponse API ─────────────────────────────────────────────────────────
interface ApiProduct {
  product_id: number;
  product_name: string;
  admin_sku: string;
  poids: number;
  dimensions: {
    longueur: number | null;
    largeur: number | null;
    hauteur: number | null;
    volume: number | null;
  };
  price: number;
  currency: string;
  company_name: string;
  catalog_id: number;
  catalog_name: string;
}

interface ApiResponse {
  catalog_leaf_ids: number[];
  count: number;
  products: ApiProduct[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function familyHasItems(type: MassifType, band: WeightBand): boolean {
  // On considère toujours disponible si la tranche est cohérente
  return band.max > 0;
}

function buildPayload(family: MassifType, band: WeightBand) {
  return {
    catalog: CATALOG_MAP[family],
    poids_min: band.min,
    poids_max: band.max === Infinity ? 99999 : band.max,
  };
}

async function fetchProducts(family: MassifType, band: WeightBand): Promise<ApiResponse> {
  const payload = buildPayload(family, band);
  const response = await fetch(
    'https://crm-urbyn.onrender.com/api/v1/client-portal/products/search-by-weight',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) throw new Error(`Erreur API : ${response.status}`);
  return response.json();
}

function formatDim(val: number | null, unit = 'cm') {
  if (val == null) return '—';
  return `${val} ${unit}`;
}

// ── Composant ─────────────────────────────────────────────────────────────────
export function MassifSelectionPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<WizardStep>('weight');
  const [selectedBandId, setSelectedBandId] = useState<string | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<MassifType | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);

  // État API
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
  const [lastPayload, setLastPayload] = useState<object | null>(null);

  const selectedBand = WEIGHT_BANDS.find(b => b.id === selectedBandId) ?? null;

  const handleFamilySelect = async (family: MassifType) => {
    if (!selectedBand) return;
    setSelectedFamily(family);
    setSelectedProduct(null);
    setApiError(null);
    setApiProducts([]);
    setStep('dimension');

    const payload = buildPayload(family, selectedBand);
    setLastPayload(payload);
    setApiLoading(true);
    try {
      const data = await fetchProducts(family, selectedBand);
      setApiProducts(data.products ?? []);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setApiLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedFamily || !selectedProduct) return;
    const defaultOption: MassifOption = selectedFamily === 'cubique' ? 'reservation' : 'aucun';
    const config = {
      items: [{
        id: `massif-${selectedFamily}-${selectedProduct.product_id}`,
        type: selectedFamily,
        dimension: String(selectedProduct.product_id),
        option: defaultOption,
        quantity: 1,
        product: selectedProduct,
      }],
    };
    sessionStorage.setItem('massifConfig', JSON.stringify(config));
    navigate('/massif');
  };

  const StepBreadcrumb = () => (
    <div className="flex items-center gap-2 text-xs text-gray-500 mb-8">
      {(['weight', 'family', 'dimension'] as WizardStep[]).map((s, i) => {
        const labels: Record<WizardStep, string> = { weight: 'Poids', family: 'Famille', dimension: 'Dimension' };
        const done = stepIndex[step] > i;
        const active = step === s;
        return (
          <span key={s} className="flex items-center gap-2">
            {i > 0 && <ChevronLeft className="w-3 h-3 rotate-180 text-gray-300" />}
            <span className={cn('flex items-center gap-1', active ? 'text-black font-semibold' : done ? 'text-gray-700' : 'text-gray-400')}>
              {done && <Check className="w-3 h-3 text-green-600" />}
              {labels[s]}
            </span>
          </span>
        );
      })}
    </div>
  );

  return (
    <>
      <SEOMeta
        title="Massif béton — Sélection"
        description="Configurez vos massifs béton temporaires : cubique, lego, cylindrique. Calcul du poids et dimensions adapté à votre chantier."
        keywords="massif béton, massif temporaire, lestage chantier, massif cubique, massif lego"
        url="/massif/selection"
        jsonLd={breadcrumbSchema([{ name: "Accueil", url: "/" }, { name: "Massif béton", url: "/massif/selection" }])}
      />
    <div className="bg-white min-h-screen pt-[73px]">
      <ProgressSteps currentStep={3} />

      <div className="max-w-2xl mx-auto px-6 pt-12 pb-20">

        {/* Hero */}
        <div className="relative h-40 overflow-hidden rounded-xl mb-8 bg-gray-100">
          <ImageWithFallback
            src={selectedFamily ? familyImage(selectedFamily) : massifImg}
            alt="Massif béton"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-5">
            <span className="bg-white/90 backdrop-blur-sm text-black text-xs font-bold px-3 py-1 rounded-full">
              Massif béton
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-black mb-1">Configurer votre massif</h1>
        <p className="text-sm text-gray-500 mb-8">Sélectionnez le poids, la famille et les dimensions souhaitées.</p>

        <StepBreadcrumb />

        {/* ── ÉTAPE 1 : Poids ── */}
        {step === 'weight' && (
          <div>
            <h2 className="font-bold text-black text-lg mb-4">Quel poids recherchez-vous ?</h2>
            <div className="grid grid-cols-2 gap-3">
              {WEIGHT_BANDS.map(wb => {
                const available = ALL_FAMILIES.some(f => familyHasItems(f.type, wb));
                return (
                  <button
                    key={wb.id}
                    type="button"
                    onClick={() => {
                      if (!available) return;
                      setSelectedBandId(wb.id);
                      setSelectedFamily(null);
                      setSelectedProduct(null);
                      setApiProducts([]);
                      setStep('family');
                    }}
                    className={cn(
                      'flex flex-col items-start p-4 border rounded-xl text-left transition-all',
                      available
                        ? 'border-gray-200 bg-white hover:border-black hover:shadow-sm cursor-pointer'
                        : 'border-dashed border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span className="font-bold text-sm text-gray-900">{wb.label}</span>
                    <span className="text-xs text-gray-500 mt-1">{wb.sublabel}</span>
                    {!available && <span className="text-[10px] text-gray-400 mt-1 italic">Bientôt disponible</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 : Famille ── */}
        {step === 'family' && selectedBand && (
          <div>
            <button type="button" onClick={() => setStep('weight')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black mb-4 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Modifier le poids
            </button>

            <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span className="text-gray-700">Poids sélectionné : <strong className="text-black">{selectedBand.label}</strong></span>
            </div>

            <h2 className="font-bold text-black text-lg mb-4">Quelle famille de massif ?</h2>
            <div className="space-y-3">
              {ALL_FAMILIES.map(({ type: fam, label: famLabel, description: famDesc }) => (
                <button
                  key={fam}
                  type="button"
                  onClick={() => handleFamilySelect(fam)}
                  className="flex items-center gap-4 p-4 border border-gray-200 bg-white rounded-xl hover:border-black hover:shadow-sm transition-all text-left w-full"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                    <ImageWithFallback src={familyImage(fam)} alt={famLabel} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{famLabel}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{famDesc}</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      {CATALOG_MAP[fam].join(' › ')}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 3 : Dimension (résultats API) ── */}
        {step === 'dimension' && selectedBand && selectedFamily && (
          <div>
            <button type="button" onClick={() => { setStep('family'); setSelectedProduct(null); }} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black mb-4 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Modifier la famille
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-5 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span className="text-gray-700">
                <strong className="text-black">{selectedBand.label}</strong>
                <span className="mx-2 text-gray-300">·</span>
                <strong className="text-black">{ALL_FAMILIES.find(f => f.type === selectedFamily)?.label}</strong>
              </span>
            </div>

            <h2 className="font-bold text-black text-lg mb-4">Quelle dimension ?</h2>

            {/* Chargement */}
            {apiLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
                <p className="text-sm">Recherche des produits disponibles…</p>
              </div>
            )}

            {/* Erreur */}
            {!apiLoading && apiError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Impossible de charger les produits</p>
                  <p className="text-xs text-red-600 mt-1">{apiError}</p>
                  <button
                    type="button"
                    onClick={() => handleFamilySelect(selectedFamily)}
                    className="mt-2 text-xs font-semibold text-red-700 underline hover:text-red-900"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            )}

            {/* Aucun produit */}
            {!apiLoading && !apiError && apiProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-xl">
                <p className="text-sm">Aucun produit disponible pour cette sélection.</p>
              </div>
            )}

            {/* Liste des produits */}
            {!apiLoading && !apiError && apiProducts.length > 0 && (
              <div className="space-y-3">
                {apiProducts.map(product => {
                  const isSelected = selectedProduct?.product_id === product.product_id;
                  const { longueur, largeur, hauteur } = product.dimensions;
                  return (
                    <button
                      key={product.product_id}
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className={cn(
                        'w-full text-left p-4 rounded-xl border transition-all',
                        isSelected
                          ? 'border-black bg-black text-white shadow-lg'
                          : 'border-gray-200 bg-white hover:border-black hover:shadow-sm text-gray-900'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <p className="font-bold text-sm">{product.product_name}</p>
                            {isSelected && <Check className="w-4 h-4 shrink-0" />}
                          </div>
                          {/* Dimensions */}
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
                          </div>
                          <p className={cn('text-xs mt-1 font-mono', isSelected ? 'text-gray-400' : 'text-gray-400')}>
                            {product.admin_sku}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-sm">{product.poids} kg</p>
                          {product.price > 0 && (
                            <p className={cn('text-xs mt-0.5', isSelected ? 'text-gray-300' : 'text-gray-500')}>
                              {product.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {product.currency}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Payload envoyé — debug discret */}
            {lastPayload && !apiLoading && (
              <details className="mt-6 text-xs text-gray-400">
                <summary className="cursor-pointer hover:text-gray-600">Payload envoyé à l'API</summary>
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
