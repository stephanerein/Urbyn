import { useNavigate } from 'react-router-dom';
import { SEOMeta, breadcrumbSchema } from '../components/SEOMeta';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { REALISATIONS } from '../data/realisations';

export function RealisationsPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEOMeta
        title="Réalisations"
        description="Découvrez les réalisations d'Atelier Urbanize : totems de communication, palissades de chantier, massifs béton et projets d'habillage urbain."
        keywords="réalisations Atelier Urbanize, projets habillage urbain, totem urbain, palissade chantier, massif béton"
        url="/realisations"
        jsonLd={breadcrumbSchema([{ name: 'Accueil', url: '/' }, { name: 'Réalisations', url: '/realisations' }])}
      />
      <div className="max-w-6xl mx-auto pt-[var(--header-height)] px-4 pb-16">
        <div className="mb-8 mt-8">
          <Button variant="outline" onClick={() => navigate('/')} className="border-2 border-black">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>

        <h1 className="text-4xl font-bold mb-4 text-black">Réalisations</h1>
        <p className="text-xl text-black mb-12 max-w-3xl">
          Un aperçu de nos projets d'habillage urbain : totems, palissades, massifs béton et structures extérieures.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {REALISATIONS.map(realisation => (
            <button
              key={realisation.slug}
              onClick={() => navigate(`/realisations/${realisation.slug}`)}
              className="text-left border-2 border-black rounded-xl overflow-hidden hover:shadow-xl transition-all group"
            >
              <div className="h-56 overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src={realisation.cover}
                  alt={realisation.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">{realisation.category}</p>
                <h3 className="text-lg font-bold text-black mb-2">{realisation.title}</h3>
                <span className="text-sm font-bold text-black inline-flex items-center gap-1">
                  Voir la réalisation <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
