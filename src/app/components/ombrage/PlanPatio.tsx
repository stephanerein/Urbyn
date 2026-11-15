import { useId } from 'react';
import { construireQuadrilatere, type Point, type Quadrilatere } from '../../lib/patioOmbrage';

// Vue de dessus d'un patio, partagée par la page de saisie et la page
// d'estimation pour que les deux dessinent exactement la même forme.
//
// Repère du modèle : sommets dans l'ordre A∩C, A∩D, B∩D, B∩C. Le côté A, où le
// dispositif est installé, va du sommet 0 au sommet 1.
//
// À l'affichage, le plus long des deux côtés C et D est posé à l'horizontale et
// le côté A se trouve à gauche : les vélums, parallèles à ce grand côté, se
// lisent alors comme des bandes horizontales déployées de gauche à droite.

const LARGEUR = 300;
const HAUTEUR = 230;
const MARGE = 40;

// Forme affichée tant que les quatre côtés ne sont pas tous connus.
const FORME_PAR_DEFAUT: Quadrilatere = [
  { x: 0, y: 0 },
  { x: 3, y: 0 },
  { x: 3, y: 4 },
  { x: 0, y: 4 },
];

export interface CotesPatio {
  largeur1: number | null;
  largeur2: number | null;
  longueur1: number | null;
  longueur2: number | null;
}

export interface VelumPlan {
  /** Contour du vélum, dans le repère du modèle. */
  polygone: Point[];
  /** Texte posé au centre du vélum, par exemple sa longueur. */
  etiquette?: string;
}

export function formePatio(cotes: CotesPatio): Quadrilatere | null {
  const { largeur1, largeur2, longueur1, longueur2 } = cotes;
  if (largeur1 === null || largeur2 === null || longueur1 === null || longueur2 === null) {
    return null;
  }
  return construireQuadrilatere(largeur1, largeur2, longueur1, longueur2);
}

/**
 * Transformation modèle → affichage : un quart de tour qui amène le côté A à
 * gauche, puis la rotation qui met le grand côté exactement à l'horizontale.
 * Aucune symétrie : l'ordre des côtés autour du patio est conservé.
 */
function orienter(forme: Quadrilatere): (pt: Point) => Point {
  const [a0, a1, b1, b0] = forme;
  const longeC = Math.hypot(b0.x - a0.x, b0.y - a0.y) >= Math.hypot(b1.x - a1.x, b1.y - a1.y);
  const [origine, bout] = longeC ? [a0, b0] : [a1, b1];
  const quartDeTour = (pt: Point): Point => ({ x: pt.y, y: -pt.x });
  const direction = quartDeTour({ x: bout.x - origine.x, y: bout.y - origine.y });
  const angle = -Math.atan2(direction.y, direction.x);
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
  return (pt) => {
    const t = quartDeTour(pt);
    return { x: t.x * cos - t.y * sin, y: t.x * sin + t.y * cos };
  };
}

export function PlanPatio({
  forme,
  velums = [],
  fleche = false,
  description,
}: {
  /** Forme du patio, ou null tant qu'elle n'est pas connue. */
  forme: Quadrilatere | null;
  velums?: VelumPlan[];
  /** Flèche de déploiement, utile tant qu'aucun vélum n'est dessiné. */
  fleche?: boolean;
  description: string;
}) {
  // Identifiants propres à chaque plan : plusieurs coexistent sur une page.
  const id = useId();
  const idPointe = `${id}-pointe`;
  const idHachures = `${id}-hachures`;

  const modele = forme ?? FORME_PAR_DEFAUT;
  const bandes = forme ? velums : [];

  // Orientation, puis mise à l'échelle sur l'emprise de tout ce qui est dessiné.
  const tourner = orienter(modele);
  const tous = [...modele, ...bandes.flatMap((bande) => bande.polygone)].map(tourner);
  const xMin = Math.min(...tous.map((pt) => pt.x));
  const xMax = Math.max(...tous.map((pt) => pt.x));
  const yMin = Math.min(...tous.map((pt) => pt.y));
  const yMax = Math.max(...tous.map((pt) => pt.y));
  const echelle = Math.min(
    (LARGEUR - 2 * MARGE) / (xMax - xMin),
    (HAUTEUR - 2 * MARGE) / (yMax - yMin),
  );
  const decalageX = (LARGEUR - (xMax - xMin) * echelle) / 2;
  const decalageY = (HAUTEUR - (yMax - yMin) * echelle) / 2;
  const projeter = (pt: Point): Point => {
    const t = tourner(pt);
    return { x: decalageX + (t.x - xMin) * echelle, y: decalageY + (t.y - yMin) * echelle };
  };
  const tracer = (points: Point[]) =>
    points.map((pt) => projeter(pt)).map((pt) => `${pt.x},${pt.y}`).join(' ');

  // Sommets à l'écran : A = a→b, B = d→c, C = a→d, D = b→c.
  const [a, b, c, d] = modele.map(projeter);
  const centre = { x: (a.x + b.x + c.x + d.x) / 4, y: (a.y + b.y + c.y + d.y) / 4 };
  const milieu = (p1: Point, p2: Point) => ({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });

  /** Pastille d'un côté : à l'extérieur de la forme, toujours droite. */
  const repere = (p1: Point, p2: Point, lettre: string, pleine = false) => {
    const m = milieu(p1, p2);
    const longueur = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
    let normale = { x: (p2.y - p1.y) / longueur, y: -(p2.x - p1.x) / longueur };
    if (normale.x * (m.x - centre.x) + normale.y * (m.y - centre.y) < 0) {
      normale = { x: -normale.x, y: -normale.y };
    }
    const x = m.x + normale.x * 20;
    const y = m.y + normale.y * 20;
    return (
      <g key={lettre}>
        <circle cx={x} cy={y} r="11" fill={pleine ? '#0f172a' : '#ffffff'} stroke="#0f172a" strokeWidth="1.5" />
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="13"
          fontWeight="700"
          fill={pleine ? '#ffffff' : '#0f172a'}
        >
          {lettre}
        </text>
      </g>
    );
  };

  const depart = milieu(a, b);
  const arrivee = milieu(d, c);
  const portee = Math.hypot(arrivee.x - depart.x, arrivee.y - depart.y) || 1;
  const direction = { x: (arrivee.x - depart.x) / portee, y: (arrivee.y - depart.y) / portee };

  return (
    <svg viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} className="w-full" role="img" aria-label={description}>
      <defs>
        <marker id={idPointe} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#64748b" />
        </marker>
        {/* Vélums : rose hachuré */}
        <pattern id={idHachures} patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
          <rect width="7" height="7" fill="#fce7f3" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="#ec4899" strokeWidth="3" />
        </pattern>
      </defs>

      <polygon
        points={tracer(modele)}
        fill="#f1f5f9"
        stroke={forme ? 'none' : '#94a3b8'}
        strokeWidth="1.5"
        strokeDasharray={forme ? undefined : '5 4'}
      />
      {bandes.map((bande, i) => (
        <polygon
          key={i}
          points={tracer(bande.polygone)}
          fill={`url(#${idHachures})`}
          fillOpacity="0.92"
          stroke="#db2777"
          strokeWidth="1"
        />
      ))}
      {/* Contour du patio par-dessus les vélums : on voit ce qu'ils couvrent ou dépassent. */}
      {forme && <polygon points={tracer(modele)} fill="none" stroke="#0f172a" strokeWidth="1.5" />}

      {/* Longueur de chaque vélum, posée en son centre. */}
      {bandes.map((bande, i) => {
        if (!bande.etiquette) return null;
        const points = bande.polygone.map(projeter);
        const x = points.reduce((somme, pt) => somme + pt.x, 0) / points.length;
        const y = points.reduce((somme, pt) => somme + pt.y, 0) / points.length;
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10"
            fontWeight="700"
            fill="#831843"
            stroke="#ffffff"
            strokeWidth="3"
            paintOrder="stroke"
          >
            {bande.etiquette}
          </text>
        );
      })}

      {fleche && (
        <line
          x1={depart.x + direction.x * 10}
          y1={depart.y + direction.y * 10}
          x2={depart.x + direction.x * portee * 0.72}
          y2={depart.y + direction.y * portee * 0.72}
          stroke="#64748b"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          markerEnd={`url(#${idPointe})`}
        />
      )}
      {/* Côté A : installation du dispositif */}
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />

      {repere(a, b, 'A', true)}
      {repere(d, c, 'B')}
      {repere(a, d, 'C')}
      {repere(b, c, 'D')}
    </svg>
  );
}
