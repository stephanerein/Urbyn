import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Realisation } from '../data/realisations';

// Carte d'une réalisation : la photo seule, dont le titre apparaît en blanc au
// survol. Partagée par la page liste et le bloc « autres réalisations » des
// pages de détail, pour que les deux restent identiques.
export function RealisationCard({ realisation }: { realisation: Realisation }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/realisations/${realisation.slug}`)}
      className="group relative block w-full h-56 text-left rounded-xl overflow-hidden bg-gray-100 hover:shadow-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
    >
      <ImageWithFallback
        src={realisation.cover}
        alt={realisation.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      {/* Titre en blanc au survol de la photo. Le calque n'est masqué que sur
          les appareils qui savent survoler : au tactile (mobile, tablette) il
          reste visible en permanence, sinon le titre y serait inaccessible. */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 opacity-100 [@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
        <p className="text-xs font-bold uppercase tracking-wide text-white/80 mb-1">
          {realisation.category}
        </p>
        <h3 className="text-lg font-bold text-white">{realisation.title}</h3>
      </div>
    </button>
  );
}
