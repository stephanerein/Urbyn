import { useId, useRef, useState } from 'react';
import {
  coinsValides,
  homographie,
  type Point,
  type Quadrilatere,
} from '../../lib/patioOmbrage';

// Simulation d'une solution d'ombrage sur la photo du patio.
//
// Les quatre coins placés par le client relient le plan du patio (en mètres) à
// la photo ; les vélums implantés sur le plan sont alors reportés sur l'image,
// en perspective. Avec `onCoinsChange`, les coins deviennent des poignées à
// faire glisser ; sans, la photo est une simple vue du résultat.
//
// Avec `rehaussement` (en mètres), les vélums sont dessinés surélevés au-dessus
// du patio, portés par des supports : c'est la couverture repliable, dont la
// toile se tient à environ 1,10 m du toit, par opposition à la couverture fixe
// tendue au niveau du toit. La photo ne donne pas l'échelle verticale : le
// décalage est estimé d'après l'échelle locale du plan et reste indicatif.

const LARGEUR = 1000;

// Ordre des coins : A∩C, A∩D, B∩D, B∩C. Chaque côté relie deux coins voisins.
const COTES: Array<{ lettre: string; de: number; vers: number }> = [
  { lettre: 'A', de: 0, vers: 1 },
  { lettre: 'D', de: 1, vers: 2 },
  { lettre: 'B', de: 2, vers: 3 },
  { lettre: 'C', de: 3, vers: 0 },
];

const NOMS_COINS = [
  'Coin entre les côtés A et C',
  'Coin entre les côtés A et D',
  'Coin entre les côtés B et D',
  'Coin entre les côtés B et C',
];

export function SimulationPhoto({
  photo,
  forme,
  coins,
  onCoinsChange,
  velums,
  rehaussement,
  description,
}: {
  photo: string;
  forme: Quadrilatere;
  coins: Point[];
  onCoinsChange?: (coins: Point[]) => void;
  velums?: Point[][];
  /** Hauteur de la toile au-dessus du toit, en mètres. */
  rehaussement?: number;
  description: string;
}) {
  const idHachures = useId();
  const svg = useRef<SVGSVGElement>(null);
  // Rapport hauteur / largeur de la photo, connu une fois l'image chargée.
  const [rapport, setRapport] = useState<number | null>(null);
  const hauteur = LARGEUR * (rapport ?? 0.66);
  const reglable = Boolean(onCoinsChange);

  const points = coins.map((coin) => ({ x: coin.x * LARGEUR, y: coin.y * hauteur }));
  const valides = coinsValides(points);
  const projeter = valides ? homographie(forme, points) : null;

  const tracer = (polygone: Point[]): string | null => {
    if (!projeter) return null;
    const projetes = polygone.map(projeter);
    if (projetes.some((pt) => pt === null)) return null;
    return (projetes as Point[]).map((pt) => `${pt.x},${pt.y}`).join(' ');
  };
  const contour = points.map((pt) => `${pt.x},${pt.y}`).join(' ');

  // Point du plan relevé de `rehaussement` mètres, dans l'image : on le décale
  // vers le haut de la photo, de la hauteur multipliée par l'échelle locale
  // (pixels par mètre) mesurée le long du côté A.
  const relever = (pt: Point): Point | null => {
    if (!projeter || !rehaussement) return null;
    const base = projeter(pt);
    const gauche = projeter({ x: pt.x - 0.5, y: pt.y });
    const droite = projeter({ x: pt.x + 0.5, y: pt.y });
    if (!base || !gauche || !droite) return null;
    const echelle = Math.hypot(droite.x - gauche.x, droite.y - gauche.y);
    return { x: base.x, y: base.y - rehaussement * echelle };
  };
  const velumsReleves = rehaussement
    ? (velums ?? []).map((velum) => ({
        base: velum.map((pt) => projeter?.(pt) ?? null),
        haut: velum.map(relever),
      }))
    : [];
  const eleve = velumsReleves.length > 0 && velumsReleves.every(
    (v) => v.base.every(Boolean) && v.haut.every(Boolean),
  );
  // Support le plus proche de l'objectif (le plus bas dans l'image) : on y
  // porte la cote.
  const pied = eleve
    ? velumsReleves
        .flatMap((v) => v.base.map((b, i) => ({ b: b as Point, h: v.haut[i] as Point })))
        .reduce((a, c) => (c.b.y > a.b.y ? c : a))
    : null;

  const deplacer = (index: number, x: number, y: number) => {
    if (!onCoinsChange) return;
    const borne = (v: number) => Math.min(1, Math.max(0, v));
    onCoinsChange(coins.map((coin, i) => (i === index ? { x: borne(x), y: borne(y) } : coin)));
  };

  const suivrePointeur = (index: number, event: React.PointerEvent) => {
    const cadre = svg.current?.getBoundingClientRect();
    if (!cadre) return;
    deplacer(
      index,
      (event.clientX - cadre.left) / cadre.width,
      (event.clientY - cadre.top) / cadre.height,
    );
  };

  const auClavier = (index: number, event: React.KeyboardEvent) => {
    const pas = event.shiftKey ? 0.05 : 0.01;
    const sens: Record<string, [number, number]> = {
      ArrowLeft: [-pas, 0],
      ArrowRight: [pas, 0],
      ArrowUp: [0, -pas],
      ArrowDown: [0, pas],
    };
    const delta = sens[event.key];
    if (!delta) return;
    event.preventDefault();
    deplacer(index, coins[index].x + delta[0], coins[index].y + delta[1]);
  };

  return (
    <div className="relative overflow-hidden rounded-lg bg-slate-200">
      <img
        src={photo}
        alt=""
        className="block w-full select-none"
        draggable={false}
        onLoad={(e) => setRapport(e.currentTarget.naturalHeight / e.currentTarget.naturalWidth)}
      />
      <svg
        ref={svg}
        viewBox={`0 0 ${LARGEUR} ${hauteur}`}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={description}
        style={{ touchAction: reglable ? 'none' : undefined }}
      >
        <defs>
          <pattern
            id={idHachures}
            patternUnits="userSpaceOnUse"
            width="22"
            height="22"
            patternTransform="rotate(45)"
          >
            <rect width="22" height="22" fill="#fce7f3" fillOpacity="0.72" />
            <line x1="0" y1="0" x2="0" y2="22" stroke="#ec4899" strokeWidth="9" />
          </pattern>
        </defs>

        {!eleve &&
          velums?.map((velum, i) => {
            const trace = tracer(velum);
            return trace ? (
              <polygon
                key={i}
                points={trace}
                fill={`url(#${idHachures})`}
                stroke="#db2777"
                strokeWidth="3"
                strokeLinejoin="round"
              />
            ) : null;
          })}

        {eleve && (
          <>
            {velumsReleves.map((v, i) => (
              <polygon
                key={i}
                points={v.haut.map((pt) => `${(pt as Point).x},${(pt as Point).y}`).join(' ')}
                fill={`url(#${idHachures})`}
                stroke="#db2777"
                strokeWidth="3"
                strokeLinejoin="round"
              />
            ))}
            {/* Supports : du toit jusqu'à la toile relevée. */}
            {velumsReleves.map((v, i) =>
              v.base.map((b, k) => (
                <line
                  key={`h${i}-${k}`}
                  x1={(b as Point).x}
                  y1={(b as Point).y}
                  x2={(v.haut[k] as Point).x}
                  y2={(v.haut[k] as Point).y}
                  stroke="#ffffff"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              )),
            )}
            
            {velumsReleves.map((v, i) =>
              v.base.map((b, k) => (
                <line
                  key={`${i}-${k}`}
                  x1={(b as Point).x}
                  y1={(b as Point).y}
                  x2={(v.haut[k] as Point).x}
                  y2={(v.haut[k] as Point).y}
                  stroke="#0f172a"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )),
            )}
            {pied && (() => {
              // La cote se place à droite du support, ou à gauche s'il touche le bord.
              const sens = pied.b.x > LARGEUR - 230 ? -1 : 1;
              const xCote = pied.b.x + 22 * sens;
              const yMilieu = (pied.b.y + pied.h.y) / 2;
              const xPastille = sens === 1 ? pied.b.x + 40 : pied.b.x - 190;
              return (
                <g pointerEvents="none">
                  <line x1={xCote} y1={pied.b.y} x2={xCote} y2={pied.h.y} stroke="#ffffff" strokeWidth="3" />
                  <line x1={xCote - 10} y1={pied.b.y} x2={xCote + 10} y2={pied.b.y} stroke="#ffffff" strokeWidth="3" />
                  <line x1={xCote - 10} y1={pied.h.y} x2={xCote + 10} y2={pied.h.y} stroke="#ffffff" strokeWidth="3" />
                  <rect x={xPastille} y={yMilieu - 20} width="150" height="40" rx="20" fill="#0f172a" fillOpacity="0.85" />
                  <text
                    x={xPastille + 75}
                    y={yMilieu}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="24"
                    fontWeight="700"
                    fill="#ffffff"
                  >
                    {`≈ ${(rehaussement as number).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} m`}
                  </text>
                </g>
              );
            })()}
          </>
        )}

        {/* Contour du patio : liseré sombre puis clair, lisible sur toute photo. */}
        <polygon points={contour} fill="none" stroke="#0f172a" strokeOpacity="0.55" strokeWidth="7" strokeLinejoin="round" />
        <polygon
          points={contour}
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeDasharray={valides ? undefined : '14 10'}
        />

        {reglable && (
          <>
            {COTES.map(({ lettre, de, vers }) => {
              const x = (points[de].x + points[vers].x) / 2;
              const y = (points[de].y + points[vers].y) / 2;
              const pleine = lettre === 'A';
              return (
                <g key={lettre} pointerEvents="none">
                  <circle cx={x} cy={y} r="24" fill={pleine ? '#0f172a' : '#ffffff'} stroke="#0f172a" strokeWidth="3" />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="28"
                    fontWeight="700"
                    fill={pleine ? '#ffffff' : '#0f172a'}
                  >
                    {lettre}
                  </text>
                </g>
              );
            })}
            {points.map((pt, i) => (
              <g
                key={i}
                tabIndex={0}
                role="slider"
                aria-label={`${NOMS_COINS[i]} — flèches du clavier pour déplacer`}
                aria-valuetext={`${Math.round(coins[i].x * 100)} % depuis la gauche, ${Math.round(coins[i].y * 100)} % depuis le haut`}
                className="cursor-grab focus:outline-none active:cursor-grabbing [&:focus-visible>circle:nth-child(2)]:stroke-pink-500"
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  suivrePointeur(i, e);
                }}
                onPointerMove={(e) => {
                  if (e.currentTarget.hasPointerCapture(e.pointerId)) suivrePointeur(i, e);
                }}
                onKeyDown={(e) => auClavier(i, e)}
              >
                {/* Zone de prise élargie, pour le doigt comme pour la souris. */}
                <circle cx={pt.x} cy={pt.y} r="46" fill="transparent" />
                <circle cx={pt.x} cy={pt.y} r="20" fill="#ffffff" stroke="#0f172a" strokeWidth="5" />
                <circle cx={pt.x} cy={pt.y} r="6" fill="#0f172a" />
              </g>
            ))}
          </>
        )}
      </svg>
    </div>
  );
}
