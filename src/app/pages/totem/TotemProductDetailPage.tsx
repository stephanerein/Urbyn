import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, ChevronRight, Info, Package } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Checkbox } from '../../components/ui/checkbox'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { ProgressSteps } from '../../components/ProgressSteps'
import { FicheTechniqueButton } from '../../components/FicheTechniqueButton'
import { ImageWithFallback } from '../../components/figma/ImageWithFallback'
import { useCart } from '../../context/CartContext'
import {
  imgCaissonBois80,
  imgCaissonBois120,
  imgCaissonBois160,
  imgCaissonBois200,
  imgCaissonBoisVignette,
} from '../../assets/images'
import {
  fetchTotemProductDetail,
  formatPriceEur,
  type TotemProductDetail,
} from '../../api/totem'

const POSTAL_RULES: Record<string, { pattern: RegExp; example: string }> = {
  France: { pattern: /^\d{5}$/, example: '75011' },
  Belgique: { pattern: /^\d{4}$/, example: '1000' },
  Luxembourg: { pattern: /^\d{4}$/, example: '1009' },
  Allemagne: { pattern: /^\d{5}$/, example: '10115' },
  Suisse: { pattern: /^\d{4}$/, example: '1003' },
  Italie: { pattern: /^\d{5}$/, example: '00100' },
  Monaco: { pattern: /^980\d{2}$/, example: '98000' },
  Andorre: { pattern: /^AD\d{3}$/i, example: 'AD100' },
  Espagne: { pattern: /^\d{5}$/, example: '28001' },
}

const INSTALLATION_PRICE = 1690

function productImage(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('200')) return imgCaissonBois200
  if (n.includes('160')) return imgCaissonBois160
  if (n.includes('120')) return imgCaissonBois120
  if (n.includes('80')) return imgCaissonBois80
  return imgCaissonBoisVignette
}

function guessPanelPrice(product: TotemProductDetail): number {
  const fromName = product.product_name.match(/(\d{2,3})\s*$/)
  const fromPanel = product.panel_format?.match(/(\d{2,3})/)
  const n = parseInt(fromName?.[1] || fromPanel?.[1] || '120', 10)
  if (n <= 80) return 120
  if (n <= 120) return 180
  if (n <= 160) return 240
  return 300
}

function installationServiceSelected(): boolean {
  try {
    const saved = sessionStorage.getItem('servicesSpecifiques')
    if (!saved) return false
    const parsed = JSON.parse(saved)
    if (Array.isArray(parsed)) return parsed.includes('installation')
    return Array.isArray(parsed.totem) && parsed.totem.includes('installation')
  } catch {
    return false
  }
}

export function TotemProductDetailPage() {
  const { offer = 'acquisition', productId } = useParams<{
    offer: string
    productId: string
  }>()
  const [searchParams] = useSearchParams()
  const familyId = searchParams.get('family')
  const navigate = useNavigate()
  const { addItems, items } = useCart()

  const [product, setProduct] = useState<TotemProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [quantity, setQuantity] = useState(1)
  const [panelsEnabled, setPanelsEnabled] = useState(false)
  const [panelsQuantity, setPanelsQuantity] = useState(1)
  const [panelsInputValue, setPanelsInputValue] = useState('1')
  const [installationEnabled, setInstallationEnabled] = useState(installationServiceSelected)
  const [deliveryFormOpen, setDeliveryFormOpen] = useState(false)
  const [deliveryPostalCode, setDeliveryPostalCode] = useState('')
  const [deliveryCountry, setDeliveryCountry] = useState('France')
  const [deliveryInfoValidated, setDeliveryInfoValidated] = useState(false)
  const [postalCodeError, setPostalCodeError] = useState(false)

  useEffect(() => {
    const id = Number(productId)
    if (!Number.isFinite(id)) {
      setError('Produit invalide.')
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchTotemProductDetail(id)
      .then((res) => {
        if (!cancelled) setProduct(res)
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Chargement impossible.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [productId])

  useEffect(() => {
    if (panelsEnabled) {
      const newMax = quantity * 2
      setPanelsQuantity(newMax)
      setPanelsInputValue(String(newMax))
    }
  }, [quantity, panelsEnabled])

  useEffect(() => {
    const saved = localStorage.getItem('deliveryInfo')
    if (saved) {
      const { postalCode, country } = JSON.parse(saved)
      setDeliveryPostalCode(postalCode ?? '')
      setDeliveryCountry(country ?? 'France')
      setDeliveryInfoValidated(true)
    }
  }, [])

  const validatePostalCode = (code: string, country: string) => {
    const rule = POSTAL_RULES[country]
    return rule ? rule.pattern.test(code.trim()) : code.trim().length > 0
  }

  const backToFamily = () => {
    if (familyId) {
      navigate(`/totem/${offer}/family/${familyId}`)
    } else {
      navigate(`/totem/${offer}`)
    }
  }

  const getTotalTotemQuantity = () =>
    items
      .filter((item) => item.details?.itemType === 'totem')
      .reduce((sum, item) => sum + item.quantity, 0)

  const handleAddToCart = () => {
    if (!product) return
    const panelPrice = guessPanelPrice(product)
    const panelSize = product.panel_format || '—'
    const label = product.product_name.replace(/^totem\s+/i, '')
    const unitPrice =
      getTotalTotemQuantity() + quantity >= 5
        ? Math.round(product.price * 0.9)
        : product.price

    const batch = [
      {
        id: `totem-product-${product.product_id}`,
        type: 'totem' as const,
        name: label,
        price: unitPrice,
        quantity,
        details: {
          itemType: 'totem',
          productId: product.product_id,
          format: label,
          mode: offer,
          basePrice: product.price,
        },
      },
      ...(panelsEnabled
        ? [
            {
              id: `panels-product-${product.product_id}`,
              type: 'totem' as const,
              name: 'Panneaux imprimés laminé anti-UV dibond 3mm',
              price: panelPrice,
              quantity: panelsQuantity,
              details: {
                itemType: 'panels',
                productId: product.product_id,
                panelSize,
                panelPrice,
              },
            },
          ]
        : []),
      ...(installationEnabled
        ? [
            {
              id: `installation-product-${product.product_id}`,
              type: 'totem' as const,
              name: 'Installation complète',
              price: INSTALLATION_PRICE,
              quantity: 1,
              details: { itemType: 'installation' },
            },
          ]
        : []),
    ]
    addItems(batch)

    localStorage.setItem(
      'deliveryInfo',
      JSON.stringify({ postalCode: deliveryPostalCode, country: deliveryCountry }),
    )
  }

  const totalQuantity = getTotalTotemQuantity() + quantity

  return (
    <div className="bg-white min-h-screen">
      <ProgressSteps currentStep={3} />
      <div className="max-w-6xl mx-auto pt-[var(--header-height)] px-4 pb-20">
        <div className="mb-8">
          <Button variant="outline" onClick={backToFamily} className="border border-black">
            ← Retour aux formats
          </Button>
        </div>

        {loading ? (
          <p className="text-gray-500">Chargement…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : !product ? (
          <p className="text-gray-500">Produit introuvable.</p>
        ) : (
          <div>
            <div className="relative h-48 overflow-hidden bg-gray-100">
              <ImageWithFallback
                src={productImage(product.product_name)}
                alt={product.product_name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-8">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-3xl font-bold mb-2 text-black">
                    {product.product_name.replace(/^totem\s+/i, '')}
                  </h1>
                  <p className="text-base font-semibold text-black">
                    {formatPriceEur(product.price)}€ HT
                  </p>
                  <p className="text-sm text-black mt-1">
                    Prix unitaire dès 5 unités : {formatPriceEur(Math.round(product.price * 0.9))}€
                    HT
                  </p>
                </div>
                <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full capitalize">
                  {offer}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mt-6">
                {/* Gauche — infos dynamiques */}
                <div>
                  {product.description ? (
                    <div className="mb-6">
                      <p className="text-sm text-black leading-relaxed whitespace-pre-line">
                        {product.description}
                      </p>
                    </div>
                  ) : null}

                  <h4 className="font-bold mb-4 text-black text-xl">
                    Caractéristiques techniques
                  </h4>
                  <div className="space-y-3 mb-6">
                    {product.dimensions_label ? (
                      <div className="flex justify-between gap-4">
                        <span className="text-black font-medium">Dimensions:</span>
                        <span className="text-black text-right">{product.dimensions_label}</span>
                      </div>
                    ) : null}
                    {product.poids != null ? (
                      <div className="flex justify-between gap-4">
                        <span className="text-black font-medium">Poids:</span>
                        <span className="text-black">{product.poids} kg</span>
                      </div>
                    ) : null}
                    {product.footprint ? (
                      <div className="flex justify-between gap-4">
                        <span className="text-black font-medium">Encombrement au sol:</span>
                        <span className="text-black">{product.footprint}</span>
                      </div>
                    ) : null}
                    {product.panel_format ? (
                      <div className="flex justify-between gap-4">
                        <span className="text-black font-medium">Format panneau:</span>
                        <span className="text-black">{product.panel_format}</span>
                      </div>
                    ) : null}
                  </div>

                  {product.detail_bullets.length > 0 ? (
                    <div>
                      <h4 className="font-bold mb-3 text-black flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        Détails
                      </h4>
                      <ul className="space-y-2">
                        {product.detail_bullets.map((feature) => (
                          <li
                            key={feature}
                            className="text-sm text-black flex items-start gap-2"
                          >
                            <span className="text-black mt-1">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <FicheTechniqueButton
                    documentKey={product.fiche_document_key || product.product_name}
                    className="mt-6"
                  />
                </div>

                {/* Droite — configuration / panier */}
                <div className="space-y-6">
                  <h4 className="font-bold text-black text-xl">Configuration</h4>

                  <div>
                    <Label className="text-black font-bold mb-2 block">Quantité</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="border border-gray-300 text-black"
                    />
                    <div
                      className={`mt-2 text-xs p-2 rounded border-2 ${
                        totalQuantity >= 5
                          ? 'bg-green-50 border-green-500 text-green-900'
                          : 'bg-blue-50 border-blue-200 text-black'
                      }`}
                    >
                      <Info className="w-3 h-3 inline mr-1" />
                      {totalQuantity >= 5 ? (
                        <strong>Remise de 10% appliquée sur les totems !</strong>
                      ) : (
                        <>
                          Commandez 5 totems ou plus et bénéficiez de 10% de remise sur les
                          totems
                        </>
                      )}
                    </div>
                  </div>

                  <Card className="border border-gray-300 bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <Checkbox
                          id="panels"
                          checked={panelsEnabled}
                          onCheckedChange={(checked) => {
                            setPanelsEnabled(checked as boolean)
                            if (checked) {
                              setPanelsQuantity(quantity * 2)
                              setPanelsInputValue(String(quantity * 2))
                            }
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="panels"
                            className="text-black font-bold cursor-pointer flex items-center gap-2"
                          >
                            Panneaux imprimés laminé anti-UV dibond 3mm
                            <Package className="w-4 h-4" />
                          </Label>
                          <p className="text-xs text-black mt-1">
                            Panneaux personnalisés format{' '}
                            {product.panel_format || 'selon modèle'}
                          </p>
                          <p className="text-sm font-bold text-black mt-2">
                            {guessPanelPrice(product)}€ HT par panneau
                          </p>
                        </div>
                      </div>

                      {panelsEnabled ? (
                        <div className="mt-3 pl-7">
                          <Label className="text-black text-sm mb-2 block">
                            Nombre de panneaux (max {quantity * 2})
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            max={quantity * 2}
                            value={panelsInputValue}
                            onChange={(e) => {
                              setPanelsInputValue(e.target.value)
                              const value = parseInt(e.target.value)
                              if (!isNaN(value)) {
                                setPanelsQuantity(Math.max(1, Math.min(quantity * 2, value)))
                              }
                            }}
                            onBlur={() => {
                              const clamped = Math.max(
                                1,
                                Math.min(quantity * 2, panelsQuantity),
                              )
                              setPanelsQuantity(clamped)
                              setPanelsInputValue(String(clamped))
                            }}
                            className="border border-gray-300 text-black"
                          />
                          <p className="text-xs text-black mt-2">
                            <Info className="w-3 h-3 inline mr-1" />
                            Maximum 2 panneaux par totem - Impression UV haute qualité
                          </p>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>

                  <div className="p-3">
                    <p className="text-sm text-black">
                      <Info className="w-4 h-4 inline mr-1" />
                      <strong>Totems livrés déjà montés, prêts à l'emploi</strong>
                    </p>
                  </div>

                  <Card className="border border-gray-300 bg-gray-50">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <Label className="text-black font-bold block">Comment les obtenir</Label>
                        <div>
                          <div className="flex items-start space-x-2">
                            <div className="flex-1">
                              <div className="font-bold text-black">Livraison</div>
                              {deliveryInfoValidated ? (
                                <div className="text-sm mt-1 text-black">
                                  {deliveryPostalCode}, {deliveryCountry}
                                </div>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                setDeliveryFormOpen(!deliveryFormOpen)
                              }}
                              className="text-black hover:text-gray-700 transition-colors"
                            >
                              <ChevronRight
                                className={`w-5 h-5 transition-transform ${
                                  deliveryFormOpen ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                          </div>

                          {deliveryFormOpen ? (
                            <div className="mt-3 space-y-3">
                              <div>
                                <Label className="text-black text-sm mb-1 block">
                                  Code postal <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  type="text"
                                  value={deliveryPostalCode}
                                  onChange={(e) => {
                                    setDeliveryPostalCode(e.target.value)
                                    setPostalCodeError(false)
                                  }}
                                  placeholder={POSTAL_RULES[deliveryCountry]?.example ?? ''}
                                  className={`border text-black ${
                                    postalCodeError ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                />
                                {postalCodeError ? (
                                  <p className="text-red-600 text-xs mt-1">
                                    Veuillez saisir un code postal valide (par ex. :{' '}
                                    {POSTAL_RULES[deliveryCountry]?.example ?? ''}).
                                  </p>
                                ) : null}
                              </div>
                              <div>
                                <Label className="text-black text-sm mb-1 block">Pays</Label>
                                <Select
                                  value={deliveryCountry}
                                  onValueChange={(value) => {
                                    setDeliveryCountry(value)
                                    setPostalCodeError(false)
                                  }}
                                >
                                  <SelectTrigger className="border border-gray-300 bg-white">
                                    <SelectValue placeholder="Sélectionnez un pays" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="France">France</SelectItem>
                                    <SelectItem value="Belgique">Belgique</SelectItem>
                                    <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                                    <SelectItem value="Allemagne">Allemagne</SelectItem>
                                    <SelectItem value="Suisse">Suisse</SelectItem>
                                    <SelectItem value="Italie">Italie</SelectItem>
                                    <SelectItem value="Monaco">Monaco</SelectItem>
                                    <SelectItem value="Andorre">Andorre</SelectItem>
                                    <SelectItem value="Espagne">Espagne</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <p className="text-xs text-gray-600 italic">
                                L'adresse complète sera renseignée lors de la commande
                              </p>
                              <Button
                                type="button"
                                onClick={() => {
                                  if (
                                    !validatePostalCode(deliveryPostalCode, deliveryCountry)
                                  ) {
                                    setPostalCodeError(true)
                                    return
                                  }
                                  setPostalCodeError(false)
                                  setDeliveryInfoValidated(true)
                                  setDeliveryFormOpen(false)
                                  localStorage.setItem(
                                    'deliveryInfo',
                                    JSON.stringify({
                                      postalCode: deliveryPostalCode,
                                      country: deliveryCountry,
                                    }),
                                  )
                                }}
                                disabled={!deliveryPostalCode || !deliveryCountry}
                                className="w-full bg-black hover:bg-gray-800 text-white"
                              >
                                Valider
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-300 bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <Checkbox
                          id="installation"
                          checked={installationEnabled}
                          onCheckedChange={(checked) =>
                            setInstallationEnabled(checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="installation"
                            className="text-black font-bold cursor-pointer"
                          >
                            Installation complète
                          </Label>
                          <p className="text-sm font-bold text-black mt-2">
                            + {INSTALLATION_PRICE}€ HT
                          </p>
                        </div>
                      </div>
                      <div className="pl-7">
                        <p className="text-xs text-black mb-2">
                          <strong>L'installation complète comprend :</strong>
                        </p>
                        <ul className="text-xs text-black space-y-1 ml-4">
                          <li>
                            • <strong>Pilotage / Scénographie :</strong> établissement des plans
                            d'intervention, coordination des intervenants, suivi de chantier
                          </li>
                          <li>
                            • <strong>Installation :</strong> mise en place, nivellement,
                            fixation sécurisée et tests de stabilité
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {!deliveryInfoValidated ? (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-center">
                      Veuillez renseigner votre code postal et votre pays dans la section{' '}
                      <strong>Comment les obtenir</strong> avant d'ajouter au panier.
                    </p>
                  ) : null}

                  <Button
                    onClick={handleAddToCart}
                    disabled={!deliveryInfoValidated}
                    className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Ajouter au panier
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
