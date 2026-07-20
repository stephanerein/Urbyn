import { useNavigate } from 'react-router-dom';
import { SEOMeta, breadcrumbSchema } from '../../components/SEOMeta';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { ProgressSteps } from '../../components/ProgressSteps';
import { imgCaissonBois120, imgTotemSignIzNoir } from '../../assets/images';

const LOCATION_MODELS = [
  {
    id: 'caisson-bois-120',
    name: 'Totem Caisson Bois 120',
    description: 'Totem en structure bois, format 120 cm — livraison + reprise incluses',
    image: imgCaissonBois120,
    startPrice: '320€',
  },
  {
    id: 'sign-iz',
    name: 'Totem Sign-IZ',
    description: 'Totem compact et modulaire — autolesté, montage rapide, livraison + reprise incluses',
    image: imgTotemSignIzNoir,
    startPrice: '290€',
  },
];

export function TotemLocationPage() {
  const navigate = useNavigate();

  const handleModelSelect = (modelId: string) => {
    if (modelId === 'caisson-bois-120') {
      navigate('/totem/caisson-bois-120/location');
    } else if (modelId === 'sign-iz') {
      navigate('/totem/sign-iz/location');
    }
  };

  return (
    <div className="bg-white min-h-screen pt-[73px]">
      <ProgressSteps currentStep={3} />

      <div className="max-w-6xl mx-auto pt-8 px-4 pb-20">
        <SEOMeta
          title="Totems — Location"
          description="Louez vos totems urbains pour vos chantiers et événements : Caisson Bois 120 et Sign-IZ. À partir de 290 € HT. Livraison + reprise incluses."
          keywords="location totem, totem événementiel, totem chantier location, Caisson Bois 120, Sign-IZ location, Urbyn"
          url="/totem/location"
          jsonLd={breadcrumbSchema([{ name: 'Accueil', url: '/' }, { name: 'Totems location', url: '/totem/location' }])}
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
            <h1 className="text-4xl font-bold text-black">Totem — Location</h1>
            <span className="bg-black text-white text-sm font-bold px-3 py-1 rounded-full">Location</span>
          </div>
          <p className="text-gray-600">Choisissez le modèle disponible à la location</p>
        </div>

        <div className="grid md:grid-cols-2 max-w-3xl gap-6">
          {LOCATION_MODELS.map((model) => (
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
