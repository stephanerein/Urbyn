import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { SEOMeta, breadcrumbSchema } from '../components/SEOMeta';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ArrowLeft } from 'lucide-react';
import { getRealisationBySlug } from '../data/realisations';

// Page de détail générique pour une réalisation : une photo + un titre + un
// texte explicatif. Ce composant est le modèle réutilisé pour toutes les
// réalisations — ajouter une nouvelle réalisation (voir
// src/app/data/realisations.ts) suffit à lui générer automatiquement sa page
// de détail, sans dupliquer de fichier.
export function RealisationDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const realisation = slug ? getRealisationBySlug(slug) : undefined;

  if (!realisation) {
    return <Navigate to="/realisations" replace />;
  }

  return (
    <>
      <SEOMeta
        title={realisation.title}
        description={realisation.description.slice(0, 160)}
        url={`/realisations/${realisation.slug}`}
        jsonLd={breadcrumbSchema([
          { name: 'Accueil', url: '/' },
          { name: 'Réalisations', url: '/realisations' },
          { name: realisation.title, url: `/realisations/${realisation.slug}` },
        ])}
      />
      <div className="max-w-4xl mx-auto pt-[var(--header-height)] px-4 pb-16">
        <div className="mb-8 mt-8">
          <Button variant="outline" onClick={() => navigate('/realisations')} className="border-2 border-black">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux réalisations
          </Button>
        </div>

        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{realisation.category}</p>
        <h1 className="text-4xl font-bold mb-8 text-black">{realisation.title}</h1>

        <div className="grid gap-4 mb-8">
          {realisation.images.map((src, i) => (
            <div key={i} className="rounded-xl overflow-hidden border-2 border-black">
              <ImageWithFallback
                src={src}
                alt={`${realisation.title} — photo ${i + 1}`}
                className="w-full h-auto object-cover"
              />
            </div>
          ))}
        </div>

        <p className="text-lg text-black leading-relaxed">{realisation.description}</p>
      </div>
    </>
  );
}
