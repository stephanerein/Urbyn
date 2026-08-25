import { useNavigate } from 'react-router-dom';
import { SEOMeta, breadcrumbSchema } from '../components/SEOMeta';
import { Button } from '../components/ui/button';
import { Signpost, HardHat, Box, Building2, LayoutGrid, ArrowLeft, ArrowRight } from 'lucide-react';

const EXPERTISES = [
  {
    icon: Building2,
    title: 'Habillage d\'échafaudage et de mur',
    description: 'Habillage graphique de façades et d\'échafaudages de chantier — bâches imprimées, communication visuelle grand format.',
    cta: 'Configurer un projet',
    to: '/definir-besoin',
  },
  {
    icon: HardHat,
    title: 'Palissade de chantier',
    description: 'Conception, habillage graphique et montage de palissades urbaines pour sécuriser et valoriser vos chantiers.',
    cta: 'Configurer une palissade',
    to: '/palissade',
  },
  {
    icon: Signpost,
    title: 'Totem de communication urbain',
    description: 'Totems signalétiques pour l\'affichage et la communication en milieu urbain — acquisition ou location, plusieurs formats.',
    cta: 'Configurer un totem',
    to: '/totem',
  },
  {
    icon: Box,
    title: 'Massif béton',
    description: 'Massifs temporaires (cubique, lego, cylindrique) pour le lestage et la sécurisation de structures de chantier ou d\'événement.',
    cta: 'Configurer un massif',
    to: '/massif/selection',
  },
  {
    icon: LayoutGrid,
    title: 'Panneau de chantier & structures extérieures',
    description: 'Panneaux réglementaires et structures extérieures pour vos opérations de chantier.',
    cta: 'Configurer un projet',
    to: '/definir-besoin',
  },
];

export function HabillageUrbainPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEOMeta
        title="Habillage Urbain — Totems, palissades, massifs béton, échafaudages"
        description="Depuis plus de 20 ans, Atelier Urbanize conçoit et déploie des solutions d'habillage urbain : échafaudages, murs, palissades, totems de communication, massifs béton, panneaux de chantier et structures extérieures."
        keywords="habillage urbain, palissade chantier, totem urbain, massif béton, habillage échafaudage, panneau de chantier, Atelier Urbanize"
        url="/habillage-urbain"
        jsonLd={breadcrumbSchema([{ name: 'Accueil', url: '/' }, { name: 'Habillage Urbain', url: '/habillage-urbain' }])}
      />
      <div className="max-w-6xl mx-auto pt-24 px-4 pb-16">
        <div className="mb-8">
          <Button variant="outline" onClick={() => navigate('/')} className="border-2 border-black">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>

        <h1 className="text-4xl font-bold mb-4 text-black">Habillage Urbain</h1>
        <p className="text-xl text-black mb-12 max-w-3xl">
          Une longue expérience dans l'aménagement et l'habillage des espaces urbains et de chantier :
          conseil, étude de structures, direction artistique, design produit et déploiement clé en main.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {EXPERTISES.map(({ icon: Icon, title, description, cta, to }) => (
            <div key={title} className="border-2 border-black p-6 rounded-xl flex flex-col">
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-black" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">{title}</h3>
              <p className="text-black mb-4 flex-1">{description}</p>
              <button
                onClick={() => navigate(to)}
                className="text-sm font-bold text-black inline-flex items-center gap-1 hover:gap-2 transition-all self-start"
              >
                {cta} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
