import etatActuel from 'figma:asset/exemple-simulation-patio-etat-actuel.jpg';
import toileFixe from 'figma:asset/exemple-simulation-patio-toile-fixe.jpg';
import storeRepliable from 'figma:asset/exemple-simulation-patio-store-repliable.jpg';

// Exemple de simulation réaliste produite par les équipes Urbanize à partir
// d'une photo de patio : l'état actuel, puis chacune des deux solutions.
//
// Les images viennent d'une proposition commerciale réelle. Elles sont
// présentées sans nom d'établissement ni de lieu : ne pas en ajouter.

const VUES = [
  {
    image: etatActuel,
    titre: 'État actuel',
    alt: 'Photo d’un patio prise depuis la toiture-terrasse, avant tout aménagement',
    texte:
      'Vue depuis la toiture-terrasse. Le patio est bordé d’un acrotère, sans emprise au sol possible.',
  },
  {
    image: toileFixe,
    titre: 'Couverture fixe',
    alt: 'Simulation du même patio couvert par une toile fixe tendue',
    texte:
      'Toiles microperforées blanches tendues sur un filin périphérique, posées en avril et déposées en octobre.',
  },
  {
    image: storeRepliable,
    titre: 'Couverture repliable',
    alt: 'Simulation du même patio couvert par un store repliable déployé',
    texte:
      'Toile portée par des supports métalliques, déployée ou repliée à la demande, sans dépose saisonnière.',
  },
] as const;

const MENTION =
  'Simulations indicatives, réalisées à partir d’une photo ; implantation définitive après relevé sur site.';

/** Les trois vues côte à côte, avec leur légende : pour la page de présentation. */
export function ExempleSimulation() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-black mb-2">Exemple : un patio simulé à partir d'une photo</h2>
      <p className="text-sm text-gray-700 mb-6 max-w-[65ch]">
        À partir d'une simple photo prise depuis le toit, nos équipes simulent les deux solutions
        sur votre patio.
      </p>
      <div className="grid sm:grid-cols-3 gap-6">
        {VUES.map((vue) => (
          <figure key={vue.titre}>
            <img
              src={vue.image}
              alt={vue.alt}
              width={640}
              height={360}
              loading="lazy"
              className="w-full h-auto rounded-lg"
            />
            <figcaption className="mt-3">
              <p className="text-base font-bold text-black">{vue.titre}</p>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed">{vue.texte}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4">{MENTION}</p>
    </section>
  );
}

/** Les deux simulations seules, en petit : rappel du rendu attendu. */
export function ExempleSimulationCompact() {
  return (
    <figure className="rounded-lg border border-slate-200 bg-white p-4">
      <figcaption className="text-sm font-bold text-black mb-3">
        Exemple de simulation réalisée par nos équipes
      </figcaption>
      <div className="grid grid-cols-2 gap-3">
        {VUES.slice(1).map((vue) => (
          <div key={vue.titre}>
            <img
              src={vue.image}
              alt={vue.alt}
              width={640}
              height={360}
              loading="lazy"
              className="w-full h-auto rounded-md"
            />
            <p className="text-xs text-gray-600 mt-1">{vue.titre}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-3">{MENTION}</p>
    </figure>
  );
}
