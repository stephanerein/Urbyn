import { useId } from 'react';

// Coupe schématique d'un patio, vue de côté : elle situe la toile par rapport
// au toit. La couverture fixe est tendue au niveau du toit ; la couverture
// repliable se tient environ 1,10 m au-dessus. Même échelle pour les deux, afin
// que le contraste se lise d'un coup d'œil. Schéma indicatif, sans fixation
// détaillée.

/** Hauteur de la toile repliable au-dessus du toit, en mètres. */
export const HAUTEUR_REPLIABLE_M = 1.1;

const ECHELLE = 40; // pixels par mètre, dans le dessin
const NIVEAU_TOIT = 92;
const LARGEUR = 320;
const HAUTEUR = 150;

export function CoupeCouverture({ solution }: { solution: 'repliable' | 'fixe' }) {
  const idHachures = useId();
  const repliable = solution === 'repliable';
  const hauteurToile = HAUTEUR_REPLIABLE_M * ECHELLE;
  const yToile = repliable ? NIVEAU_TOIT - hauteurToile : NIVEAU_TOIT;
  const xDebut = repliable ? 52 : 96;
  const xFin = repliable ? 268 : 224;
  const libelle = repliable
    ? `Coupe du patio : la toile de la couverture repliable se tient environ ${HAUTEUR_REPLIABLE_M.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} m au-dessus du toit`
    : 'Coupe du patio : la toile fixe est tendue au niveau du toit';

  return (
    <figure className="mb-4">
      <svg
        viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
        role="img"
        aria-label={libelle}
        className="w-full h-auto rounded-md border border-slate-200 bg-white"
      >
        <defs>
          <pattern id={idHachures} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
            <rect width="8" height="8" fill="#fce7f3" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#ec4899" strokeWidth="4" />
          </pattern>
        </defs>

        {/* Toits de part et d'autre du patio */}
        <rect x="0" y={NIVEAU_TOIT} width="96" height="14" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
        <rect x="224" y={NIVEAU_TOIT} width="96" height="14" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
        {/* Patio : le vide entre les deux bâtiments */}
        <rect x="96" y={NIVEAU_TOIT} width="128" height={HAUTEUR - NIVEAU_TOIT} fill="#f1f5f9" />
        <line x1="96" y1={NIVEAU_TOIT} x2="96" y2={HAUTEUR} stroke="#64748b" strokeWidth="1.5" />
        <line x1="224" y1={NIVEAU_TOIT} x2="224" y2={HAUTEUR} stroke="#64748b" strokeWidth="1.5" />
        <text x="160" y={HAUTEUR - 14} textAnchor="middle" fontSize="11" fill="#475569">
          Patio
        </text>

        {/* Niveau du toit, en repère */}
        <line
          x1="0"
          y1={NIVEAU_TOIT}
          x2={LARGEUR}
          y2={NIVEAU_TOIT}
          stroke="#0f172a"
          strokeOpacity={repliable ? 0.45 : 0}
          strokeDasharray="5 4"
          strokeWidth="1.2"
        />

        {repliable && (
          <>
            {/* Supports, posés sur les toits */}
            <line x1={xDebut} y1={NIVEAU_TOIT} x2={xDebut} y2={yToile} stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
            <line x1={xFin} y1={NIVEAU_TOIT} x2={xFin} y2={yToile} stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
            {/* Cote de la hauteur */}
            <line x1="22" y1={NIVEAU_TOIT} x2="22" y2={yToile} stroke="#0f172a" strokeWidth="1.5" />
            <line x1="16" y1={NIVEAU_TOIT} x2="28" y2={NIVEAU_TOIT} stroke="#0f172a" strokeWidth="1.5" />
            <line x1="16" y1={yToile} x2="28" y2={yToile} stroke="#0f172a" strokeWidth="1.5" />
            <text x="160" y={yToile - 10} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">
              ≈ {HAUTEUR_REPLIABLE_M.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} m au-dessus du toit
            </text>
          </>
        )}

        {/* Toile */}
        <rect
          x={xDebut}
          y={yToile - 4}
          width={xFin - xDebut}
          height="8"
          rx="2"
          fill={`url(#${idHachures})`}
          stroke="#db2777"
          strokeWidth="2"
        />
        {!repliable && (
          <text x="160" y={yToile - 14} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">
            Au niveau du toit
          </text>
        )}
      </svg>
      <figcaption className="text-xs text-gray-600 mt-1">
        {repliable
          ? 'Coupe schématique : la toile se tient au-dessus du toit, sur des supports.'
          : 'Coupe schématique : la toile est tendue au niveau du toit.'}
      </figcaption>
    </figure>
  );
}
