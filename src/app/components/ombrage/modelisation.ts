import type { PatioQuoteLine, PointPlan } from '../../api/ombrage';
import { partCouverte, type Point, type Quadrilatere } from '../../lib/patioOmbrage';
import type { VelumPlan } from './PlanPatio';

// Couverture modélisée d'un patio, telle que le serveur l'a calculée et chiffrée :
// le site dessine ces polygones et n'en recalcule aucun.

export const enPoints = (polygone: PointPlan[]): Point[] => polygone.map(([x, y]) => ({ x, y }));

export const longueurVelum = (mm: number) =>
  `${(mm / 1000).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;

export function modeliserPatio(patio: PatioQuoteLine) {
  const forme = enPoints(patio.forme) as Quadrilatere;
  const velumsRepliables: VelumPlan[] = patio.retractable.velums.map((velum) => ({
    polygone: enPoints(velum.polygone),
    etiquette: longueurVelum(velum.longueur_mm),
  }));
  const velumsFixes: VelumPlan[] = patio.fixe.velums.map((polygone) => ({ polygone: enPoints(polygone) }));
  const pourcent = (velums: VelumPlan[]) =>
    Math.round(partCouverte(forme, velums.map((velum) => velum.polygone)) * 100);
  return {
    forme,
    velumsRepliables,
    velumsFixes,
    couvertRepliable: pourcent(velumsRepliables),
    couvertFixe: pourcent(velumsFixes),
  };
}
