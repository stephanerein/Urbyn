import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { ImageWithFallback } from '../../components/figma/ImageWithFallback'
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

function productImage(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('200')) return imgCaissonBois200
  if (n.includes('160')) return imgCaissonBois160
  if (n.includes('120')) return imgCaissonBois120
  if (n.includes('80')) return imgCaissonBois80
  return imgCaissonBoisVignette
}

function fmtDim(value: number | null | undefined): string {
  if (value == null) return '—'
  if (Math.abs(value - Math.round(value)) < 1e-9) return `${Math.round(value)} cm`
  return `${String(value).replace('.', ',')} cm`
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

export function TotemComparePage() {
  const navigate = useNavigate()
  const { offer = 'acquisition' } = useParams<{ offer?: string }>()
  const [searchParams] = useSearchParams()
  const familyId = searchParams.get('family')
  const productIds =
    searchParams
      .get('products')
      ?.split(',')
      .map((x) => Number(x))
      .filter(Number.isFinite) || []
  // Compat ancienne URL ?formats=80,120 (TotemFormatPage hardcodée)
  const legacyFormats =
    searchParams.get('formats')?.split(',').filter(Boolean) || []

  const [products, setProducts] = useState<TotemProductDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const backPath = familyId
    ? `/totem/${offer}/family/${familyId}`
    : legacyFormats.length
      ? '/totem/caisson-bois/format'
      : `/totem/${offer}`

  useEffect(() => {
    if (productIds.length < 2 && legacyFormats.length < 2) {
      setLoading(false)
      setProducts([])
      return
    }
    if (productIds.length >= 2) {
      let cancelled = false
      setLoading(true)
      Promise.all(productIds.map((id) => fetchTotemProductDetail(id)))
        .then((rows) => {
          if (!cancelled) setProducts(rows)
        })
        .catch((e) => {
          if (!cancelled) {
            setError(e instanceof Error ? e.message : 'Comparaison impossible.')
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
      return () => {
        cancelled = true
      }
    }
    // Legacy : ne charge rien ici — géré par TotemFormat/ancien flux via redirect soft
    setLoading(false)
    setProducts([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('products'), searchParams.get('formats')])

  if (!loading && productIds.length < 2 && legacyFormats.length >= 2) {
    // Redirige vers l'ancien comportement via navigation soft vers format page
    // En pratique on affiche un message + retour
    return (
      <div className="max-w-6xl mx-auto pt-[var(--header-height)] px-4">
        <Card className="border-2 border-yellow-500">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Comparaison</h2>
            <p className="text-gray-700 mb-6">
              Utilisez le parcours Acquisition dynamique pour comparer les formats.
            </p>
            <Button
              onClick={() => navigate('/totem/acquisition')}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Voir les modèles
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!loading && (productIds.length < 2 || products.length < 2)) {
    return (
      <div className="max-w-6xl mx-auto pt-[var(--header-height)] px-4">
        <Card className="border-2 border-yellow-500">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Comparaison impossible</h2>
            <p className="text-gray-700 mb-6">
              Veuillez sélectionner au moins 2 formats pour effectuer une comparaison.
            </p>
            <Button
              onClick={() => navigate(backPath)}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Retour aux formats
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto pt-[var(--header-height)] px-4 pb-16">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate(backPath)}
          className="border border-black"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux formats
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-2 text-black">Comparaison des formats</h1>
      <p className="text-gray-700 mb-8">
        Comparez les caractéristiques et choisissez le format adapté à vos besoins
      </p>

      {loading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <div
            className={`grid ${
              products.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
            } gap-6`}
          >
            {products.map((product) => {
              const label = product.product_name.replace(/^totem\s+/i, '')
              const profondeur =
                product.dimensions.profondeur ?? product.dimensions.largeur
              return (
                <Card key={product.product_id} className="border-2 border-gray-200">
                  <CardContent className="p-0">
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      <ImageWithFallback
                        src={productImage(product.product_name)}
                        alt={label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-black mb-4">{label}</h3>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-600 mb-1">Prix unitaire</p>
                        <p className="text-2xl font-bold text-black">
                          {formatPriceEur(product.price)}€{' '}
                          <span className="text-sm font-normal">HT</span>
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Dès 5 unités : {formatPriceEur(Math.round(product.price * 0.9))}€ HT
                        </p>
                      </div>
                      <div className="space-y-3 mb-6">
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-xs text-gray-600">Longueur</p>
                          <p className="font-semibold text-black">
                            {fmtDim(product.dimensions.longueur)}
                          </p>
                        </div>
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-xs text-gray-600">Hauteur</p>
                          <p className="font-semibold text-black">
                            {fmtDim(product.dimensions.hauteur)}
                          </p>
                        </div>
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-xs text-gray-600">Profondeur</p>
                          <p className="font-semibold text-black">{fmtDim(profondeur)}</p>
                        </div>
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-xs text-gray-600">Poids</p>
                          <p className="font-semibold text-black">
                            {product.poids != null ? `${product.poids} kg` : '—'}
                          </p>
                        </div>
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-xs text-gray-600">Emprise au sol</p>
                          <p className="font-semibold text-black">
                            {product.footprint || '—'}
                          </p>
                        </div>
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-xs text-gray-600">Format panneau</p>
                          <p className="font-semibold text-black">
                            {product.panel_format || '—'}
                          </p>
                        </div>
                        <div className="pb-2">
                          <p className="text-xs text-gray-600">Prix panneau imprimé</p>
                          <p className="font-semibold text-black">
                            {guessPanelPrice(product)}€ HT
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          navigate(
                            `/totem/${offer}/product/${product.product_id}${
                              familyId ? `?family=${familyId}` : ''
                            }`,
                          )
                        }
                        className="w-full bg-black hover:bg-gray-800 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Choisir ce format
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="mt-8 border-2 border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 text-black">Tableau comparatif</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 font-semibold text-black">
                        Caractéristique
                      </th>
                      {products.map((p) => (
                        <th
                          key={p.product_id}
                          className="text-center py-3 px-4 font-semibold text-black"
                        >
                          {p.product_name.replace(/^totem\s+/i, '')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-700">Prix unitaire (HT)</td>
                      {products.map((p) => (
                        <td
                          key={p.product_id}
                          className="text-center py-3 px-4 font-semibold text-black"
                        >
                          {formatPriceEur(p.price)}€
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Prix dès 5 unités (HT)</td>
                      {products.map((p) => (
                        <td
                          key={p.product_id}
                          className="text-center py-3 px-4 font-semibold text-green-700"
                        >
                          {formatPriceEur(Math.round(p.price * 0.9))}€
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-700">Dimensions</td>
                      {products.map((p) => (
                        <td key={p.product_id} className="text-center py-3 px-4 text-black">
                          {p.dimensions_label || '—'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Poids</td>
                      {products.map((p) => (
                        <td key={p.product_id} className="text-center py-3 px-4 text-black">
                          {p.poids != null ? `${p.poids} kg` : '—'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-700">Emprise au sol</td>
                      {products.map((p) => (
                        <td key={p.product_id} className="text-center py-3 px-4 text-black">
                          {p.footprint || '—'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Format panneau</td>
                      {products.map((p) => (
                        <td key={p.product_id} className="text-center py-3 px-4 text-black">
                          {p.panel_format || '—'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-gray-700">Prix panneau imprimé (HT)</td>
                      {products.map((p) => (
                        <td key={p.product_id} className="text-center py-3 px-4 text-black">
                          {guessPanelPrice(p)}€
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
