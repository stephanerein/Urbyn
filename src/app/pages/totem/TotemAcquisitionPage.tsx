import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SEOMeta, breadcrumbSchema } from '../../components/SEOMeta'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { ImageWithFallback } from '../../components/figma/ImageWithFallback'
import { ProgressSteps } from '../../components/ProgressSteps'
import { imgCaissonBoisVignette } from '../../assets/images'
import {
  fetchTotemFamilies,
  formatPriceEur,
  type TotemFamily,
} from '../../api/totem'

function familyImage(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('caisson') || n.includes('sign')) return imgCaissonBoisVignette
  return imgCaissonBoisVignette
}

export function TotemAcquisitionPage() {
  const navigate = useNavigate()
  const [families, setFamilies] = useState<TotemFamily[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchTotemFamilies('Acquisition')
      .then((res) => {
        if (!cancelled) setFamilies(res.families)
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Impossible de charger les modèles.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="bg-white min-h-screen pt-[var(--header-height)]">
      <ProgressSteps currentStep={3} />

      <div className="max-w-6xl mx-auto pt-8 px-4 pb-20">
        <SEOMeta
          title="Totems — Acquisition"
          description="Choisissez votre totem urbain à l'achat. Fabriqués en France, livrés montés."
          keywords="totem acquisition, totem achat, Urbyn"
          url="/totem/acquisition"
          jsonLd={breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Totems', url: '/totem/acquisition' },
          ])}
        />
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/services-specifiques/totem')}
            className="border-2 border-black"
          >
            ← Retour
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-4xl font-bold text-black">Totem — Acquisition</h1>
            <span className="bg-black text-white text-sm font-bold px-3 py-1 rounded-full">Achat</span>
          </div>
          <p className="text-gray-600">Choisissez le modèle que vous souhaitez acquérir</p>
        </div>

        {loading ? (
          <p className="text-gray-500">Chargement des modèles…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : families.length === 0 ? (
          <p className="text-gray-500">Aucun modèle Acquisition disponible pour le moment.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {families.map((family) => (
              <Card
                key={family.family_catalog_id}
                className="cursor-pointer hover:shadow-2xl transition-all group overflow-hidden"
                onClick={() =>
                  navigate(`/totem/acquisition/family/${family.family_catalog_id}`)
                }
              >
                <CardContent className="p-0">
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={familyImage(family.name)}
                      alt={family.display_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full border-2 border-black">
                      <span className="font-bold text-sm text-black">
                        À partir de {formatPriceEur(family.min_price)}€ HT
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-black group-hover:underline">
                      {family.display_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {family.description || `${family.product_count} format(s) disponible(s)`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
