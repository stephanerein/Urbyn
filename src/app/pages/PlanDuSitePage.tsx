import { Link, useNavigate } from 'react-router-dom';
import { SEOMeta, breadcrumbSchema } from '../components/SEOMeta';
import { Button } from '../components/ui/button';

interface SiteLink {
  label: string;
  to: string;
}

interface SiteSection {
  title: string;
  links: SiteLink[];
}

const SECTIONS: SiteSection[] = [
  {
    title: 'Pages principales',
    links: [
      { label: 'Accueil', to: '/' },
      { label: 'Configurateur — Définir votre besoin', to: '/definir-besoin' },
      { label: 'Contact', to: '/contact' },
      { label: 'À propos', to: '/a-propos' },
    ],
  },
  {
    title: 'Expertise',
    links: [
      { label: 'Habillage Urbain', to: '/habillage-urbain' },
      { label: 'Habillage Thermique', to: '/habillage-thermique' },
    ],
  },
  {
    title: 'Habillage Urbain — Produits',
    links: [
      { label: 'Totem de communication urbain', to: '/totem' },
      { label: 'Totem — Acquisition', to: '/totem/acquisition' },
      { label: 'Totem — Location', to: '/totem/location' },
      { label: 'Totem Sign-IZ', to: '/totem/sign-iz' },
      { label: 'Palissade de chantier', to: '/palissade' },
      { label: 'Massif béton', to: '/massif/selection' },
      { label: "Bureau d'études techniques (BET)", to: '/bet' },
    ],
  },
  {
    title: 'Informations légales',
    links: [
      { label: 'Mentions légales', to: '/mentions-legales' },
      { label: 'Conditions générales de vente', to: '/cgv' },
      { label: 'Politique de confidentialité', to: '/confidentialite' },
      { label: 'Politique de cookies', to: '/cookies' },
      { label: 'Plan du site', to: '/plan-du-site' },
    ],
  },
];

export function PlanDuSitePage() {
  const navigate = useNavigate();

  return (
    <>
      <SEOMeta
        title="Plan du site"
        description="Retrouvez toutes les pages du site Atelier Urbanize : Habillage Urbain, Habillage Thermique, configurateur Urbyn et informations légales."
        url="/plan-du-site"
        jsonLd={breadcrumbSchema([{ name: 'Accueil', url: '/' }, { name: 'Plan du site', url: '/plan-du-site' }])}
      />
      <div className="max-w-4xl mx-auto pt-20 px-4 pb-16">
        <div className="mb-8">
          <Button variant="outline" onClick={() => navigate('/')} className="border-2 border-black">
            ← Retour à l'accueil
          </Button>
        </div>

        <h1 className="text-4xl font-bold mb-4 text-black">Plan du site</h1>
        <p className="text-xl text-black mb-12">
          Retrouvez ici l'ensemble des pages du site Atelier Urbanize.
        </p>

        <div className="space-y-10">
          {SECTIONS.map(section => (
            <section key={section.title}>
              <h2 className="text-2xl font-bold mb-4 text-black">{section.title}</h2>
              <ul className="space-y-2 list-disc list-inside">
                {section.links.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-black underline hover:no-underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
