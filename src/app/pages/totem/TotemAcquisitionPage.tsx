import { useNavigate } from 'react-router-dom';
import { SEOMeta, productSchema, breadcrumbSchema } from '../../components/SEOMeta';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { ProgressSteps } from '../../components/ProgressSteps';
import { imgCaissonBoisVignette, imgTotemSignIzNoir } from '../../assets/images';

const ACQUISITION_MODELS = [
  {
    id: 'caisson-bois',
    name: 'Totem Caisson Bois',
    description: 'Totem en structure bois avec panneaux interchangeables — 4 formats disponibles',
    image: imgCaissonBoisVignette,
    startPrice: '2 650€',
  },
  {
    id: 'gabion',
    name: 'Totem Gabion',
    description: 'Totem design en gabion métallique avec remplissage minéral',
    image: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&q=80',
    startPrice: '1 800€',
  },
  {
    id: 'liz',
    name: 'Totem LIZ',
    description: 'Totem triptyque haut de gamme avec panneaux orientables',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    startPrice: '2 600€',
  },
  {
    id: 'sign-iz',
    name: 'Totem Sign-IZ',
    description: 'Totem compact et modulaire — autolesté, montage rapide',
    image: imgTotemSignIzNoir,
    startPrice: '1 980€',
  },
];

export function TotemAcquisitionPage() {
  const navigate = useNavigate();

  const handleModelSelect = (modelId: string) => {
    if (modelId === 'caisson-bois') {
      navigate('/totem/caisson-bois/format');
    } else if (modelId === 'sign-iz') {
      navigate('/totem/sign-iz/acquisition');
    } else {
      navigate(`/totem/${modelId}/config`);
    }
  };

  return (
    <div className="bg-white min-h-screen pt-[73px]">
      <ProgressSteps currentStep={3} />

      <div className="max-w-6xl mx-auto pt-8 px-4 pb-20">
        <SEOMeta
          title="Totems — Acquisition"
          description="Choisissez votre totem urbain à l'achat : Caisson Bois, Gabion, LIZ, Sign-IZ. Fabriqués en France, livrés montés. À partir de 1 980 € HT."
          keywords="totem acquisition, totem achat, totem Caisson Bois, totem Sign-IZ, totem Gabion, totem LIZ, Urbyn"
          url="/totem/acquisition"
          jsonLd={[
            breadcrumbSchema([{ name: 'Accueil', url: '/' }, { name: 'Totems', url: '/totem/acquisition' }]),
            productSchema({ name: 'Totem Sign-IZ', description: 'Totem autolesté compact, montage rapide, RAL au choix. Fabriqué en France.', price: 1980, url: '/totem/sign-iz/acquisition' }),
          ]}
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACQUISITION_MODELS.map((model) => (
            <Card
              key={model.id}
              className="cursor-pointer hover:shadow-2xl transition-all group overflow-hidden"
              onClick={() => handleModelSelect(model.id)}
            >
              <CardContent className="p-0">
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={model.image}
                    alt={model.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full border-2 border-black">
                    <span className="font-bold text-sm text-black">À partir de {model.startPrice} HT</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-black group-hover:underline">{model.name}</h3>
                  <p className="text-sm text-gray-600">{model.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
