import { HardHat, Truck, Shield, Award, Package, Wrench, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEOMeta, breadcrumbSchema } from '../components/SEOMeta';

export function UrbynPlatformPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEOMeta
        title="Urbyn — Estimation instantanée pour vos projets d'habillage urbain"
        description="Urbyn, la plateforme en ligne d'Atelier Urbanize : configurez et commandez vos totems de communication, palissades de chantier et massifs béton. Estimation instantanée, achat en ligne sécurisé."
        keywords="Urbyn, totem urbain, totem chantier, palissade chantier, massif béton, mobilier urbain temporaire, location totem, Sign-IZ, Caisson Bois, Atelier Urbanize"
        url="/urbyn"
        jsonLd={breadcrumbSchema([{ name: 'Accueil', url: '/' }, { name: 'Urbyn', url: '/urbyn' }])}
      />
      {/* Hero Section */}
      <section className="pt-20 pb-20 px-6 bg-gradient-to-br from-slate-100 via-white to-slate-50">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 leading-tight text-black">
            Urbyn
          </h1>

          <p className="text-xl md:text-2xl text-black font-medium mb-4 max-w-3xl mx-auto">
            Votre plateforme dédiée à <span className="text-black font-bold">l'habillage urbain</span>
          </p>

          <p className="text-base text-black mb-12 max-w-2xl mx-auto">
            Estimation instantanée • Achat en ligne sécurisé
          </p>

          {/* Distinguo Prestations de service vs Produits */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-6 h-6 text-black" strokeWidth={2.5} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-black">Prestations de service</h3>
              <p className="text-sm text-black mb-4">Solutions professionnelles avec accompagnement</p>
              <ul className="text-sm text-black space-y-2 text-left">
                <li>• Déploiement de projets</li>
                <li>• Approvisionnement</li>
                <li>• Etudes de structures</li>
                <li>• Direction artistique</li>
                <li>• Design produit</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-black" strokeWidth={2.5} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-black">Solutions</h3>
              <p className="text-sm text-black mb-4">Commercialisation d'équipements urbains prêts à l'emploi</p>
              <ul className="text-sm text-black space-y-2 text-left">
                <li>• Totem</li>
                <li>• Palissade</li>
                <li>• Façade et Echafaudage</li>
                <li>• Massif béton</li>
                <li>• Panneau de chantier</li>
              </ul>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-12">
            <button
              onClick={() => navigate('/definir-besoin')}
              className="px-8 py-4 bg-black hover:bg-gray-800 text-white font-bold text-lg rounded-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2 group"
            >
              Définir votre besoin
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-4">
              <Clock className="w-4 h-4" />
              Obtenez une estimation de votre projet en moins de 5 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Étapes de la plateforme */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-black">Comment ça marche ?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">1</span>
              </div>
              <h3 className="font-bold text-lg mb-2 text-black">Définir votre besoin</h3>
              <p className="text-sm text-gray-600">Palissade, acquisition d'un massif, etc.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">2</span>
              </div>
              <h3 className="font-bold text-lg mb-2 text-black">Choisir le service</h3>
              <p className="text-sm text-gray-600">Sélectionnez le service dont vous avez besoin</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">3</span>
              </div>
              <h3 className="font-bold text-lg mb-2 text-black">Obtenir votre estimation</h3>
              <p className="text-sm text-gray-600">Estimation en ligne instantanée</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">4</span>
              </div>
              <h3 className="font-bold text-lg mb-2 text-black">Échanger avec un spécialiste</h3>
              <p className="text-sm text-gray-600">Réservez un appel en visio</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi Urbyn */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-black">Pourquoi Urbyn ?</h2>
          <p className="text-center text-lg text-gray-600 mb-12">20 ans d'expertise</p>
          <div className="grid md:grid-cols-5 gap-6">
            <div className="text-center p-6 bg-slate-50 rounded-xl">
              <CheckCircle className="w-12 h-12 text-black mx-auto mb-4" />
              <h3 className="font-bold text-base mb-2 text-black">Expertise reconnue</h3>
              <p className="text-sm text-gray-600">Plus de 20 ans d'expérience dans l'habillage urbain</p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-xl">
              <Shield className="w-12 h-12 text-black mx-auto mb-4" />
              <h3 className="font-bold text-base mb-2 text-black">Qualité certifiée</h3>
              <p className="text-sm text-gray-600">Produits et services aux normes les plus exigeantes</p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-xl">
              <Clock className="w-12 h-12 text-black mx-auto mb-4" />
              <h3 className="font-bold text-base mb-2 text-black">Rapidité d'exécution</h3>
              <p className="text-sm text-gray-600">Estimation instantanée et livraison dans les délais</p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-xl">
              <HardHat className="w-12 h-12 text-black mx-auto mb-4" />
              <h3 className="font-bold text-base mb-2 text-black">Solutions sur mesure</h3>
              <p className="text-sm text-gray-600">Accompagnement personnalisé pour chaque projet</p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-xl">
              <Truck className="w-12 h-12 text-black mx-auto mb-4" />
              <h3 className="font-bold text-base mb-2 text-black">Service complet</h3>
              <p className="text-sm text-gray-600">De l'étude à la livraison, tout est géré</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
