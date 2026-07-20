import { SEOMeta, breadcrumbSchema } from '../components/SEOMeta';
import { useNavigate } from 'react-router-dom';
import { PalissadeSubTypeSelector } from '../components/PalissadeSubTypeSelector';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import woodenHoardingImage from 'figma:asset/bc5db02dc136e0f6f2acb6bdcfd5000cf7768a25.png';
import dibondHoardingImage from 'figma:asset/4dfdb929f7d24f1065879acdb595e36733917e27.png';
import metalHoardingImage from 'figma:asset/d65771a457b9ec888e1035e7cbd2a5b302f778fa.png';

export function PalissadeSubTypePage() {
  const navigate = useNavigate();

  const handleSelect = (type: 'habillage' | 'montage') => {
    navigate(`/palissade/${type}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <>
      <SEOMeta
        title="Palissade de chantier — Configuration"
        description="Configurez votre palissade de chantier : habillage graphique ou montage complet. Matériaux, dimensions et services associés disponibles en ligne."
        keywords="palissade chantier, palissade habillage, palissade montage, clôture chantier, Urbyn"
        url="/palissade"
        jsonLd={breadcrumbSchema([{ name: "Accueil", url: "/" }, { name: "Palissade", url: "/palissade" }])}
      />
    <div className="bg-white">
      {/* Hero Header for Palissade Section */}
      <section className="pt-20 pb-12 px-6 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 text-slate-900">Module Palissade</h1>
          <p className="text-lg text-slate-600">
            Choisissez le type de prestation pour votre projet d'habillage urbain. 
            Que vous ayez déjà une structure ou que vous partiez de zéro, nous avons la solution.
          </p>
        </div>
      </section>

      <div className="py-12">
        <PalissadeSubTypeSelector onSelect={handleSelect} onBack={handleBack} />
      </div>
      
      {/* Features / Materials Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Matériaux fréquemment utilisés</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg overflow-hidden shadow-lg">
              <ImageWithFallback src={dibondHoardingImage} alt="Dibond" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Dibond imprimé</h3>
                <p className="text-slate-600">Panneau composite haute qualité, résistant et durable</p>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-lg">
              <ImageWithFallback src={metalHoardingImage} alt="Tôle" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Tôle ondulée</h3>
                <p className="text-slate-600">Solution métallique robuste et économique</p>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-lg">
              <ImageWithFallback src={woodenHoardingImage} alt="Bois" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Bois & Végétal synthétique</h3>
                <p className="text-slate-600">Aspect naturel et chaleureux pour vos projets</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}