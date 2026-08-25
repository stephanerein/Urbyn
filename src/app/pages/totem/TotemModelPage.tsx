import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { ProgressSteps } from '../../components/ProgressSteps';
import { imgCaissonBoisVignette as totemCaissonBoisImg, imgTotemSignIzNoir as totemSignIzImg } from '../../assets/images';

const TOTEM_MODELS = {
  'caisson-bois': {
    name: 'Totem Caisson Bois',
    description: 'Totem en structure bois avec panneaux interchangeables — 4 formats disponibles',
    image: totemCaissonBoisImg,
    startPrice: { acquisition: '2 650€', location: null },
    modesDisponibles: ['acquisition'],
  },
  'gabion': {
    name: 'Totem Gabion',
    description: 'Totem design en gabion métallique avec remplissage minéral',
    image: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&q=80',
    startPrice: { acquisition: '1 800€', location: null },
    modesDisponibles: ['acquisition'],
  },
  'liz': {
    name: 'Totem LIZ',
    description: 'Totem triptyque haut de gamme avec panneaux orientables',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    startPrice: { acquisition: '2 600€', location: null },
    modesDisponibles: ['acquisition'],
  },
  'sign-iz': {
    name: 'Totem Sign-IZ',
    description: 'Totem compact et modulaire — disponible à l\'acquisition et à la location',
    image: totemSignIzImg,
    startPrice: { acquisition: '1 980€', location: '290€' },
    modesDisponibles: ['acquisition', 'location'],
  },
  'caisson-bois-120': {
    name: 'Totem Caisson Bois 120',
    description: 'Totem en structure bois, format 120 cm — disponible à la location',
    image: totemCaissonBoisImg,
    startPrice: { acquisition: null, location: '320€' },
    modesDisponibles: ['location'],
  },
};

export function TotemModelPage() {
  const navigate = useNavigate();
  const totemMode = (sessionStorage.getItem('totemMode') ?? 'acquisition') as 'acquisition' | 'location';

  const visibleModels = Object.entries(TOTEM_MODELS).filter(([, model]) =>
    model.modesDisponibles.includes(totemMode)
  );

  const handleModelSelect = (modelId: string) => {
    if (modelId === 'caisson-bois-120') {
      navigate('/totem/caisson-bois-120/location');
    } else if (modelId === 'caisson-bois') {
      navigate('/totem/caisson-bois/format');
    } else if (modelId === 'sign-iz') {
      navigate(totemMode === 'location' ? '/totem/sign-iz/location' : '/totem/sign-iz/acquisition');
    } else {
      navigate(`/totem/${modelId}/config`);
    }
  };

  return (
    <div className="bg-white min-h-screen pt-[var(--header-height)]">
      <ProgressSteps currentStep={3} />

      <div className="max-w-6xl mx-auto pt-8 px-4 pb-20">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/services-specifiques/totem')}
            className="border-2 border-black"
          >
            ← Retour
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-1 text-black">Choisissez votre modèle de Totem</h1>
          <p className="text-gray-600">
            Mode sélectionné : <span className="font-semibold text-black capitalize">{totemMode}</span>
            {totemMode === 'location' && (
              <span className="ml-2 text-xs bg-black text-white px-2 py-0.5 rounded-full">
                Modèles disponibles à la location
              </span>
            )}
          </p>
        </div>

        <div className={`grid gap-6 ${visibleModels.length <= 2 ? 'md:grid-cols-2 max-w-3xl' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
          {visibleModels.map(([id, model]) => (
            <Card
              key={id}
              className="cursor-pointer hover:shadow-2xl transition-all group overflow-hidden"
              onClick={() => handleModelSelect(id)}
            >
              <CardContent className="p-0">
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={model.image}
                    alt={model.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full border-2 border-black">
                    <span className="font-bold text-sm text-black">
                      {(() => {
                        const price = model.startPrice[totemMode];
                        return price ? `À partir de ${price} HT` : 'Sur devis';
                      })()}
                    </span>
                  </div>
                  {model.modesDisponibles.includes('location') && totemMode === 'acquisition' && (
                    <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
                      Aussi en location
                    </div>
                  )}
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
