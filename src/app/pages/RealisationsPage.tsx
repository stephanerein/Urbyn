import { useNavigate } from 'react-router-dom';
import { SEOMeta, breadcrumbSchema } from '../components/SEOMeta';
import { Button } from '../components/ui/button';
import { RealisationCard } from '../components/RealisationCard';
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
        <p className="text-xl text-black mb-4 max-w-3xl">
          Un aperçu de nos projets d'habillage urbain : totems, palissades, massifs béton et structures extérieures.
        </p>
        <p className="text-xl text-black mb-12 max-w-3xl">
          Découvrez les références d'Urbanize dans l'habillage de votre quotidien !
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {REALISATIONS.map(realisation => (
            <RealisationCard key={realisation.slug} realisation={realisation} />
          ))}
        </div>

        {/* Appel à l'action : depuis les réalisations, on enchaîne naturellement
            sur l'estimation d'un projet ou la prise de contact. */}
        <div className="mt-16 rounded-xl bg-gray-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-black mb-3">Un projet d'habillage urbain ?</h2>
          <p className="text-lg text-black mb-6 max-w-2xl mx-auto">
            Urbanize vous accompagne de la conception à la pose, partout en France et à
            l'international.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={() => navigate('/definir-besoin')} className="bg-black text-white hover:bg-gray-800">
              Estimez votre projet
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/contact')} className="border-2 border-black">
              Nous contacter
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
