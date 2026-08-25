import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ProgressSteps } from '../components/ProgressSteps';
import { Paintbrush, HardHat, Package, ImageIcon } from 'lucide-react';

const productServices: Record<string, { title: string; services: Array<{ id: string; name: string; description: string; icon: any }> }> = {
  totem: {
    title: 'Totem',
    services: [
      {
        id: 'caisson-bois',
        name: 'Totem Caisson Bois',
        description: 'Totem en structure bois avec panneaux interchangeables',
        icon: Package
      },
      {
        id: 'gabion',
        name: 'Totem Gabion',
        description: 'Totem design en gabion métallique avec remplissage minéral',
        icon: Package
      },
      {
        id: 'liz',
        name: 'Totem Triptyque LIZ',
        description: 'Totem triptyque haut de gamme avec panneaux orientables',
        icon: Package
      }
    ]
  },
  palissade: {
    title: 'Palissade',
    services: [
      {
        id: 'habillage',
        name: 'Habiller une palissade',
        description: 'Habillage d\'une structure existante avec bardage de haute qualité : Dibond imprimé, tôle, bois ou végétal',
        icon: Paintbrush
      },
      {
        id: 'montage',
        name: 'Monter + habiller une palissade',
        description: 'Installation complète : terrassement, fondations, structure métallique modulaire, portails et bardage personnalisé',
        icon: HardHat
      }
    ]
  },
  'facade-echafaudage': {
    title: 'Façade et Échafaudage',
    services: [
      {
        id: 'habillage-facade',
        name: 'Habillage de façade',
        description: 'Bâche imprimée grand format pour habillage de façade et échafaudage',
        icon: ImageIcon
      }
    ]
  },
  'massif-beton': {
    title: 'Massif béton',
    services: [
      {
        id: 'achat-massif',
        name: 'Acquisition de massif béton',
        description: 'Massif en béton pour lestage et stabilisation de vos installations',
        icon: Package
      }
    ]
  }
};

export function SelectServicePage() {
  const navigate = useNavigate();
  const { product } = useParams<{ product: string }>();

  const productData = product ? productServices[product] : null;

  if (!productData) {
    return (
      <div className="pt-[var(--header-height)] px-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
        <Button onClick={() => navigate('/definir-besoin')}>Retour</Button>
      </div>
    );
  }

  const handleServiceSelect = (serviceId: string) => {
    if (product === 'totem') {
      if (serviceId === 'caisson-bois') {
        navigate('/totem/caisson-bois/format');
      } else {
        navigate(`/totem/${serviceId}/config`);
      }
    } else if (product === 'palissade') {
      navigate(`/palissade/${serviceId}`);
    } else if (product === 'massif-beton') {
      navigate('/massif');
    } else if (product === 'facade-echafaudage') {
      // Service bientôt disponible
      navigate('/definir-besoin');
    }
  };

  return (
    <div className="bg-white min-h-screen pt-[var(--header-height)]">
      <ProgressSteps currentStep={product === 'palissade' ? 3 : 2} />

      <section className="pt-8 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => navigate(`/services-additionnels/${product}`)}
              className="border-2 border-black"
            >
              ← Retour
            </Button>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black text-center">
            {productData.title}
          </h1>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto">
            Choisissez le service qui correspond à votre besoin
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {productData.services.map((service) => {
              const Icon = service.icon;
              return (
                <Card
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className="cursor-pointer hover:shadow-2xl transition-all group border-2 border-slate-200 hover:border-black"
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 group-hover:bg-black rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
                      <Icon className="w-8 h-8 text-slate-700 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-black group-hover:underline">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
