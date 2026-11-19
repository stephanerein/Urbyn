import { useId } from 'react';
import { SectionDepliable } from './SectionDepliable';

// Comparatif économique repliable / fixe : courbe du coût cumulé sur 10 ans, mise
// en place comprise.
//
// Reprise du « Comparatif financier : repliable ou fixe » de la présentation
// commerciale Urbanize (cas d'école, patio de 10 m × 10 m, hauteur 7,5 m).
// Montants HT en acquisition, forfait de mise en place compris. Ces chiffres sont
// ceux de la présentation : ne pas les modifier ici sans la mettre à jour.

const MISE_EN_PLACE = 7500;

const REPLIABLE = {
  acquisition: 23443,
  fraisParAn: 1840.75, // vérification, assurance et pièces d'usure (estimations)
};

const FIXE = {
  acquisition: 16767,
  premiereAnnee: 2062, // une seule dépose la première année
  fraisParAn: 3934.8, // dépose, repose, assurance et toile (estimations)
};

/** Coût cumulé après `annee` années, mise en place comprise. */
const coutRepliable = (annee: number) => MISE_EN_PLACE + REPLIABLE.acquisition + REPLIABLE.fraisParAn * annee;
const coutFixe = (annee: number) =>
  MISE_EN_PLACE + FIXE.acquisition + (annee === 0 ? 0 : FIXE.premiereAnnee + FIXE.fraisParAn * (annee - 1));

const ANNEES = Array.from({ length: 11 }, (_, i) => i);

const eur = (valeur: number) => `${Math.round(valeur).toLocaleString('fr-FR')} € HT`;
const kEur = (valeur: number) => `${Math.round(valeur / 1000)} k€`;

// Dessin
const L = 520;
const H = 300;
const MARGE = { gauche: 48, droite: 28, haut: 20, bas: 40 };
const Y_MIN = 20000;
const Y_MAX = 65000;
const x = (annee: number) => MARGE.gauche + (annee / 10) * (L - MARGE.gauche - MARGE.droite);
const y = (valeur: number) => MARGE.haut + (1 - (valeur - Y_MIN) / (Y_MAX - Y_MIN)) * (H - MARGE.haut - MARGE.bas);
const trace = (cout: (a: number) => number) => ANNEES.map((a) => `${x(a)},${y(cout(a))}`).join(' ');

const COULEUR_FIXE = '#ea580c';
const COULEUR_REPLIABLE = '#0f172a';

function Courbes() {
  const titre = useId();
  return (
    <svg
      viewBox={`0 0 ${L} ${H}`}
      role="img"
      aria-labelledby={titre}
      className="w-full h-auto"
    >
      <title id={titre}>
        Coût cumulé sur 10 ans, mise en place comprise. Après 5 ans, la couverture repliable coûte{' '}
        {eur(coutRepliable(5))} contre {eur(coutFixe(5))} pour la couverture fixe. Après 10 ans,{' '}
        {eur(coutRepliable(10))} contre {eur(coutFixe(10))}.
      </title>

      {/* Grille et axes */}
      {[20000, 30000, 40000, 50000, 60000].map((valeur) => (
        <g key={valeur}>
          <line x1={MARGE.gauche} x2={L - MARGE.droite} y1={y(valeur)} y2={y(valeur)} stroke="#e2e8f0" />
          <text x={MARGE.gauche - 8} y={y(valeur)} textAnchor="end" dominantBaseline="central" fontSize="11" fill="#64748b">
            {kEur(valeur)}
          </text>
        </g>
      ))}
      {ANNEES.map((annee) => (
        <text key={annee} x={x(annee)} y={H - MARGE.bas + 18} textAnchor="middle" fontSize="11" fill="#64748b">
          {annee}
        </text>
      ))}
      <text x={(MARGE.gauche + L - MARGE.droite) / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="#64748b">
        Années
      </text>

      {/* Repère des 5 ans */}
      <line x1={x(5)} x2={x(5)} y1={MARGE.haut} y2={H - MARGE.bas} stroke="#94a3b8" strokeDasharray="4 4" />

      {/* Courbes */}
      <polyline points={trace(coutFixe)} fill="none" stroke={COULEUR_FIXE} strokeWidth="3" strokeLinejoin="round" />
      <polyline points={trace(coutRepliable)} fill="none" stroke={COULEUR_REPLIABLE} strokeWidth="3" strokeLinejoin="round" />

      {/* Valeurs à 5 et 10 ans */}
      {[5, 10].map((annee) => (
        <g key={annee}>
          <circle cx={x(annee)} cy={y(coutFixe(annee))} r="4.5" fill={COULEUR_FIXE} />
          <circle cx={x(annee)} cy={y(coutRepliable(annee))} r="4.5" fill={COULEUR_REPLIABLE} />
          <text x={x(annee) - 8} y={y(coutFixe(annee)) - 10} textAnchor="end" fontSize="12" fontWeight="700" fill={COULEUR_FIXE}>
            {kEur(coutFixe(annee))}
          </text>
          <text x={x(annee) + (annee === 10 ? -8 : 8)} y={y(coutRepliable(annee)) + 18} textAnchor={annee === 10 ? 'end' : 'start'} fontSize="12" fontWeight="700" fill={COULEUR_REPLIABLE}>
            {kEur(coutRepliable(annee))}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function ComparatifEconomique() {
  const ecart5 = Math.round((1 - coutRepliable(5) / coutFixe(5)) * 100);
  const ecart10 = Math.round((1 - coutRepliable(10) / coutFixe(10)) * 100);

  return (
    <SectionDepliable id="titre-approche-economique" titre="Approche économique : repliable ou fixe">
      <p className="text-sm text-gray-700 mb-8 max-w-[75ch]">
        Cas d'école : patio de 10 m × 10 m, hauteur 7,5 m. Montants HT en acquisition, forfait de mise en place
        compris ({eur(MISE_EN_PLACE)}, identique pour les deux solutions). La couverture fixe coûte moins cher à
        l'acquisition ; la couverture repliable devient moins coûteuse à partir de la cinquième année.
      </p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-x-10 gap-y-8 items-start">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Couverture repliable</p>
            <p className="text-3xl font-bold text-black mt-1">{eur(REPLIABLE.acquisition)}</p>
            <p className="text-sm text-gray-600">Frais fixes : fourniture et pose, une seule fois</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <li>• Frais opérationnels : {eur(REPLIABLE.fraisParAn)} par an, vérification comprise</li>
              <li>• Store replié hors saison, sans dépose ni repose</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Couverture fixe</p>
            <p className="text-3xl font-bold text-black mt-1">{eur(FIXE.acquisition)}</p>
            <p className="text-sm text-gray-600">Frais fixes : fourniture et première pose</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <li>
                • Frais opérationnels : {eur(FIXE.fraisParAn)} par an ({eur(FIXE.premiereAnnee)} la première année)
              </li>
              <li>• Dépose en octobre, repose en avril, par une équipe de cordistes</li>
            </ul>
          </div>
        </div>

        <figure>
          <figcaption className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
            Coût cumulé sur 10 ans, mise en place comprise (k€ HT)
          </figcaption>
          <Courbes />
          <p className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-700 mt-2">
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="inline-block h-1 w-6 rounded" style={{ background: COULEUR_REPLIABLE }} />
              Repliable
            </span>
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="inline-block h-1 w-6 rounded" style={{ background: COULEUR_FIXE }} />
              Fixe
            </span>
          </p>
        </figure>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-10 gap-y-4 mt-8 border-t border-slate-200 pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="font-bold text-black">Sur 5 ans : {eur(coutRepliable(5))} contre {eur(coutFixe(5))}</p>
            <p className="text-sm text-gray-600">La couverture repliable devient moins coûteuse à partir de la cinquième année.</p>
          </div>
          <p className="text-2xl font-bold text-emerald-700 shrink-0">− {ecart5} %</p>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="font-bold text-black">Sur 10 ans : {eur(coutRepliable(10))} contre {eur(coutFixe(10))}</p>
            <p className="text-sm text-gray-600">Économie de {eur(coutFixe(10) - coutRepliable(10))} avec la couverture repliable.</p>
          </div>
          <p className="text-2xl font-bold text-emerald-700 shrink-0">− {ecart10} %</p>
        </div>
      </div>

      <table className="mt-6 w-full max-w-2xl text-sm">
        <caption className="sr-only">Coût cumulé, mise en place comprise, montants HT</caption>
        <thead>
          <tr className="border-b border-slate-200 text-left text-gray-600">
            <th scope="col" className="py-2 pr-4 font-medium">Horizon</th>
            <th scope="col" className="py-2 pr-4 font-medium">Couverture repliable</th>
            <th scope="col" className="py-2 font-medium">Couverture fixe</th>
          </tr>
        </thead>
        <tbody>
          {[0, 5, 10].map((annee) => (
            <tr key={annee} className="border-b border-slate-100">
              <th scope="row" className="py-2 pr-4 font-medium text-black">
                {annee === 0 ? 'À la mise en place' : `Après ${annee} ans`}
              </th>
              <td className="py-2 pr-4 text-black">{eur(coutRepliable(annee))}</td>
              <td className="py-2 text-black">{eur(coutFixe(annee))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-gray-500 mt-4 max-w-[90ch]">
        Hypothèses : les frais opérationnels comprennent l'assurance et le remplacement des pièces d'usure
        (estimations). Couverture fixe : dépose et repose par une équipe de cordistes, une seule dépose la première
        année, pas de vérification annuelle. Au-delà de 5 ans, projection à coûts constants. Montants hors taxes,
        indicatifs, à confirmer après étude du patio.
      </p>
    </SectionDepliable>
  );
}
