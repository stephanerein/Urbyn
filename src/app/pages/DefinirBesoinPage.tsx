import { SEOMeta } from '../components/SEOMeta';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ProgressSteps } from '../components/ProgressSteps';
import { Card, CardContent } from '../components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { Signpost, UtilityPole, HardHat, Box, Wind, FileText, Building2, LayoutGrid, PanelTop, Umbrella, Sparkles, CloudSun } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import palissadeImg from 'figma:asset/palissade-bois.png';
import totemImg from 'figma:asset/totem-urbain.png';
import massifImg from 'figma:asset/massif-beton-cubique.png';
import echafaudageImg from 'figma:asset/echafaudage.png';
import ombrageFacadeImg from 'figma:asset/solution-ombrage-facade.jpeg';
import ombragePatioImg from 'figma:asset/solution-ombrage-patio.jpeg';
import cielDeRueImg from 'figma:asset/ciel-de-rue.jpg';

interface ProductCard {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  image?: string;
}

export function DefinirBesoinPage() {
  const navigate = useNavigate();

  // Produits catalogués, avec parcours d'estimation en ligne.
  const ensembleProduits = [
    {
      id: 'massif-beton',
      title: 'Massif béton',
      description: 'Lestage et stabilisation',
      icon: Box,
      image: massifImg
    },
    {
      id: 'totem',
      title: 'Totem',
      description: 'Signalétique verticale pour expositions',
      icon: Signpost,
      image: totemImg
    },
    {
      id: 'poteau',
      title: 'Poteau',
      description: "Support d'éclairage, de caméras de sécurité et de câbles aériens",
      icon: UtilityPole
    }
  ];

  const ensembleUrbain = [
    {
      id: 'palissade',
      title: 'Palissade',
      description: 'Habillage et sécurisation de chantier',
      icon: HardHat,
      image: palissadeImg
    },
    {
      id: 'echafaudage',
      title: 'Échafaudage',
      description: 'Habillage par bâche imprimée',
      icon: Building2,
      image: echafaudageImg
    },
    {
      id: 'facade',
      title: 'Façade',
      description: 'Habillage par bâche imprimée',
      icon: Building2,
      image: echafaudageImg
    },
    {
      id: 'panneau-chantier',
      title: 'Panneau de chantier',
      description: 'Signalétique et affichage de chantier',
      icon: LayoutGrid,
      image: palissadeImg
    }
  ];

  const ensemble2 = [
    {
      id: 'bet',
      title: 'Étude BET',
      description: 'Résistance au vent de vos installations',
      icon: Wind,
      image: "https://images.unsplash.com/photo-1764740109279-c7a8abd78821?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdpbmVlcmluZyUyMGJsdWVwcmludHMlMjBkZXNrfGVufDF8fHx8MTc2OTUxNDYxNXww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: 'cahier-charges',
      title: 'Cahier des Charges',
      description: 'Rédaction pour Appel d\'Offre',
      icon: FileText,
      image: "https://images.unsplash.com/photo-1760561994147-8b6fd8c7fc5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMGRvY3VtZW50JTIwY29udHJhY3QlMjBzcGVjaWZpY2F0aW9uc3xlbnwxfHx8fDE3Njk3MTE0NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ];

  // Solutions d'ombrage : pas encore de catalogue ni de tarif en ligne, elles
  // sont chiffrées sur mesure. Les cartes sans photo disponible n'affichent
  // que leur icône.
  const ensembleOmbrage = [
    {
      id: 'ombrage-facade',
      title: "Solution d'ombrage pour façade",
      description: 'Réduction de la chaleur reçue par le bâti',
      icon: PanelTop,
      image: ombrageFacadeImg
    },
    {
      id: 'ombrage-patio',
      title: "Solution d'ombrage pour patio",
      description: 'Réduction de la chaleur reçue par les patios',
      icon: Umbrella,
      image: ombragePatioImg
    },
    {
      id: 'ciel-de-rue',
      title: 'Ciel de Rue',
      description: 'Ombrage urbain pour rendre un passage de rue agréable sous la chaleur du soleil',
      icon: CloudSun,
      image: cielDeRueImg
    },
    {
      id: 'film-solaire',
      title: 'Film solaire pour vitrage',
      description: 'Performance énergétique et luminosité préservée',
      icon: Sparkles
    }
  ];

  const handleOmbrageSelect = () => {
    toast.info('Chiffrage sur mesure', {
      description:
        "Ces solutions sont étudiées au cas par cas. Décrivez-nous votre projet et nous revenons vers vous avec une proposition."
    });
    navigate('/contact');
  };

  const renderProductCard = (product: ProductCard) => {
    const Icon = product.icon;
    return (
      <Card
        key={product.id}
        onClick={() => handleProductSelect(product.id)}
        className="cursor-pointer transition-all hover:shadow-2xl group bg-white overflow-hidden border-2 border-slate-200 hover:border-black"
      >
        <CardContent className="p-4 text-center">
          <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
            <Icon className="w-7 h-7 text-black" strokeWidth={2.5} />
          </div>
          <h4 className="text-base font-bold mb-2 text-black group-hover:underline">
            {product.title}
          </h4>
          <p className="text-black text-xs mb-4 leading-tight">
            {product.description}
          </p>
          {product.image && (
            <div className="relative h-32 overflow-hidden rounded-lg">
              <ImageWithFallback
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const handleProductSelect = (productId: string) => {
    if (productId === 'echafaudage' || productId === 'facade' || productId === 'poteau') {
      const libelle =
        productId === 'echafaudage' ? "L'habillage d'échafaudage"
        : productId === 'facade' ? "L'habillage de façade"
        : 'Le poteau';
      toast.info("Service bientôt disponible", {
        description: `${libelle} est un service sur mesure. Contactez notre bureau d'étude via le chat pour plus d'informations.`
      });
      return;
    }

    // Palissade va directement aux services d'accompagnement
    if (productId === 'palissade') {
      navigate(`/services-additionnels/${productId}`);
    } else {
      // Totem et autres vont aux services spécifiques
      navigate(`/services-specifiques/${productId}`);
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    if (serviceId === 'cahier-charges') {
      toast.info("Service bientôt disponible", {
        description: "La rédaction de Cahier des Charges est un service sur mesure. Contactez notre bureau d'étude via le chat pour plus d'informations."
      });
      return;
    }
    navigate(`/${serviceId}`);
  };

  return (
    <>
      <SEOMeta
        title="Configurez votre projet"
        description="Définissez votre besoin en mobilier urbain temporaire : totem, palissade, massif béton ou étude BET. Obtenez une estimation en quelques clics."
        url="/definir-besoin"
      />
    <div className="bg-white min-h-screen pt-[var(--header-height)]">
      <ProgressSteps currentStep={1} />

      <section className="pt-8 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-black">
            Définissez votre besoin
          </h1>
          <p className="text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
            Sélectionnez le type de solution souhaitée pour obtenir une estimation instantanée
          </p>

          {/* Ensemble 1 : Produits catalogués */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-black">Produits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {ensembleProduits.map(renderProductCard)}
            </div>
          </div>

          {/* Ensemble 2 : Habillage urbain */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-black">Habillage urbain</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ensembleUrbain.map(renderProductCard)}
            </div>
          </div>

          {/* Ensemble 3 : Solutions d'ombrage */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-2 text-black">Solutions d'ombrage</h2>
            <p className="text-sm text-gray-600 mb-8">
              Solutions chiffrées sur mesure — décrivez-nous votre projet
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ensembleOmbrage.map((solution) => {
                const Icon = solution.icon;
                return (
                  <Card
                    key={solution.id}
                    onClick={handleOmbrageSelect}
                    className="cursor-pointer transition-all hover:shadow-2xl group bg-white overflow-hidden border-2 border-slate-200 hover:border-black"
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                        <Icon className="w-7 h-7 text-black" strokeWidth={2.5} />
                      </div>
                      <h4 className="text-base font-bold mb-2 text-black group-hover:underline">
                        {solution.title}
                      </h4>
                      {solution.description && (
                        <p className="text-black text-xs leading-tight">
                          {solution.description}
                        </p>
                      )}
                      {'image' in solution && solution.image && (
                        <div className="relative h-32 overflow-hidden rounded-lg mt-4">
                          <ImageWithFallback
                            src={solution.image}
                            alt={solution.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Ensemble 4 : Services d'étude */}
          <div>
            <h2 className="text-2xl font-bold mb-8 text-black">Accompagnements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {ensemble2.map((service) => {
                const Icon = service.icon;
                return (
                  <Card
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className="cursor-pointer transition-all hover:shadow-2xl group bg-white overflow-hidden border-2 border-slate-200 hover:border-black"
                  >
                    <CardContent className="p-4 text-center">
                      <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                        <Icon className="w-7 h-7 text-black" strokeWidth={2.5} />
                      </div>
                      <h4 className="text-base font-bold mb-2 text-black group-hover:underline">
                        {service.title}
                      </h4>
                      <p className="text-black text-xs mb-4 leading-tight">
                        {service.description}
                      </p>
                      <div className="relative h-32 overflow-hidden rounded-lg">
                        <ImageWithFallback
                          src={service.image}
                          alt={`${service.title}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}

