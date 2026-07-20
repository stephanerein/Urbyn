import { SEOMeta, breadcrumbSchema } from '../components/SEOMeta';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Award, Leaf } from 'lucide-react';

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEOMeta
        title="À propos d'Urbyn"
        description="Urbyn by Atelier Urbanize, entreprise française spécialisée dans le mobilier urbain temporaire : totems, palissades, massifs béton pour chantiers et événements."
        keywords="Atelier Urbanize, Urbyn, mobilier urbain, fabricant totem, palissade chantier France"
        url="/a-propos"
        jsonLd={breadcrumbSchema([{ name: "Accueil", url: "/" }, { name: "À propos", url: "/a-propos" }])}
      />
    <div className="max-w-6xl mx-auto pt-20 px-4 pb-16">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="border-2 border-black"
        >
          ← Retour à l'accueil
        </Button>
      </div>

      <h1 className="text-4xl font-bold mb-4 text-black">À propos d'Urbyn</h1>
      <p className="text-xl text-black mb-12">
        Spécialiste de l'aménagement urbain depuis 2015
      </p>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-6 text-black">
          <p>
            <strong>Urbyn by Atelier Urbanize</strong> est une entreprise française spécialisée dans la conception, 
            la fabrication et l'installation de mobilier urbain de qualité professionnelle.
          </p>
          <p>
            Nous accompagnons les collectivités, les entreprises et les professionnels du BTP dans leurs projets 
            d'aménagement extérieur : totems signalétiques, clôtures de chantier et stores urbains.
          </p>
          <p>
            Notre engagement : proposer des solutions durables, esthétiques et conformes aux réglementations en vigueur.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-6 border-2 border-black rounded-lg">
            <Building2 className="w-12 h-12 mb-4 text-black" />
            <h3 className="font-bold text-black mb-2">200+</h3>
            <p className="text-sm text-black">Projets réalisés</p>
          </div>
          <div className="bg-gray-50 p-6 border-2 border-black rounded-lg">
            <Users className="w-12 h-12 mb-4 text-black" />
            <h3 className="font-bold text-black mb-2">150+</h3>
            <p className="text-sm text-black">Clients satisfaits</p>
          </div>
          <div className="bg-gray-50 p-6 border-2 border-black rounded-lg">
            <Award className="w-12 h-12 mb-4 text-black" />
            <h3 className="font-bold text-black mb-2">10 ans</h3>
            <p className="text-sm text-black">D'expertise</p>
          </div>
          <div className="bg-gray-50 p-6 border-2 border-black rounded-lg">
            <Leaf className="w-12 h-12 mb-4 text-black" />
            <h3 className="font-bold text-black mb-2">Éco-responsable</h3>
            <p className="text-sm text-black">Matériaux durables</p>
          </div>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-black">Nos valeurs</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border-2 border-black p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3 text-black">Qualité</h3>
            <p className="text-black">
              Nos produits sont fabriqués en France avec des matériaux sélectionnés pour leur durabilité et leur résistance.
            </p>
          </div>
          <div className="border-2 border-black p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3 text-black">Innovation</h3>
            <p className="text-black">
              Nous développons constamment de nouvelles solutions pour répondre aux besoins évolutifs de l'aménagement urbain.
            </p>
          </div>
          <div className="border-2 border-black p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3 text-black">Service</h3>
            <p className="text-black">
              Notre équipe vous accompagne de la conception à l'installation pour garantir le succès de votre projet.
            </p>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
