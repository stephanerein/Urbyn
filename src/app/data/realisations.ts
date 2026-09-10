import {
  imgMonacoIriseFacade,
  imgMonacoIriseVitrines,
  imgMonacoIrisePonton,
  imgMonacoIriseTerrasse,
  imgLuminiscenceTotemArty,
  imgJrInsideOutFace,
  imgJrInsideOutAerien,
} from '../assets/images';

// ─────────────────────────────────────────────────────────────────────────────
// Réalisations — source unique de vérité pour la page /realisations et les
// pages de détail /realisations/:slug.
//
// Ce tableau ne contient que des réalisations réelles : pas de contenu
// d'exemple, chaque entrée est publiée telle quelle sur le site.
// Pour ajouter une réalisation : ajouter un objet à ce tableau
// (photo(s) réelle(s) du projet + titre + chapô + sections) — aucune autre
// modification n'est nécessaire, la page de détail est générique et s'appuie
// sur ces données. Penser à référencer le nouveau slug dans prerender.mjs et
// public/sitemap.xml pour qu'il soit pré-rendu et indexé.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Un bloc « sous-titre + paragraphe » du corps de la page de détail.
 * `body` accepte des liens au format `[libellé](url)` : une URL commençant par
 * « / » devient un lien interne, les autres des liens externes (voir RichText).
 */
export interface RealisationSection {
  title: string;
  body: string;
}

/** Une donnée clé du projet, affichée dans le bandeau sous le titre. */
export interface RealisationFact {
  label: string;
  /** Accepte également les liens `[libellé](url)`. */
  value: string;
}

export interface Realisation {
  slug: string;
  title: string;
  category: string;
  cover: string;
  images: string[];
  /**
   * Chapô affiché en tête de page. Accepte les liens `[libellé](url)`, qui sont
   * retirés automatiquement pour la meta description.
   */
  description: string;
  /** Données clés (client, lieu, surface, délai…) mises en avant sous le titre. */
  facts?: RealisationFact[];
  /**
   * Corps de l'article. Les photos de `images` (hors photo de couverture) sont
   * intercalées entre ces sections par la page de détail : une réalisation
   * sans `sections` reste valide et affiche simplement ses photos.
   */
  sections?: RealisationSection[];
}

export const REALISATIONS: Realisation[] = [
  {
    slug: 'jr-inside-out-palissade-abattoirs-toulouse',
    title: 'JR et « Inside Out » : une palissade au service de l\'art aux Abattoirs de Toulouse',
    category: 'Habillage Urbain — Palissade',
    // La vue de face (paysage) sert de couverture et d'ouverture ; la vue
    // aérienne (portrait) illustre la première section et donne l'échelle.
    cover: imgJrInsideOutFace,
    images: [imgJrInsideOutFace, imgJrInsideOutAerien],
    description:
      "Nous avons eu l'honneur d'être mécène de l'exposition « Le musée imaginaire d'Oli », " +
      "organisée par [les Abattoirs de Toulouse](https://www.lesabattoirs.org/). Ce lieu " +
      "culturel emblématique a aussi accueilli le projet « Inside Out » de l'artiste de " +
      "renom [JR](https://www.jr-art.net/fr/), sur l'esplanade Daniel Cordier." +
      "\n\n" +
      "Dans le cadre de ce projet participatif, nous avons conçu et installé une " +
      "[palissade](/palissade) sur mesure de 29 mètres linéaires. Réalisée en recto-verso " +
      "et haute de 2,5 mètres, cette structure a offert un support idéal pour la création " +
      "de la fresque. Elle répondait à la fois aux contraintes techniques et aux exigences " +
      "esthétiques du projet.",
    facts: [
      { label: 'Lieu', value: 'Les Abattoirs, Toulouse' },
      { label: 'Artiste', value: '[JR](https://www.jr-art.net/fr/)' },
      { label: 'Palissade', value: '29 m linéaires, 2,5 m de haut' },
      { label: 'Dates', value: '5–6 décembre 2024' },
    ],
    sections: [
      {
        title: 'Une œuvre participative ancrée dans Toulouse',
        body:
          "Pendant deux jours, les Toulousains ont été invités à participer activement au " +
          "projet artistique de JR. Les jeudi 5 décembre et vendredi 6 décembre 2024, " +
          "l'artiste a immortalisé des visages à l'aide de son camion photo, transformant " +
          "l'espace en une véritable expérience collective et artistique.",
      },
      {
        title: 'La contribution technique',
        body:
          "Notre expertise a permis de créer un support technique adapté à ce projet " +
          "ambitieux. La palissade a été conçue pour s'intégrer harmonieusement dans " +
          "l'environnement tout en offrant une surface stable et fonctionnelle pour " +
          "l'artiste. Cette réalisation reflète notre engagement envers l'art et notre " +
          "capacité à répondre aux exigences techniques des projets artistiques les plus " +
          "uniques.",
      },
    ],
  },
  {
    slug: 'habillage-urbain-irise-monaco',
    title: 'Un habillage urbain irisé à Monaco',
    category: 'Habillage Urbain — Covering de vitrines',
    cover: imgMonacoIriseFacade,
    // La photo des vitrines vient en premier après la couverture : c'est la
    // seule qui montre le covering irisé de près, elle illustre donc la
    // première section.
    images: [
      imgMonacoIriseFacade,
      imgMonacoIriseVitrines,
      imgMonacoIrisePonton,
      imgMonacoIriseTerrasse,
    ],
    description:
      "Nous avons eu le plaisir d'accompagner un projet d'[habillage urbain]" +
      "(/habillage-urbain) pour notre client [MARK](https://thisismark.com), dans le " +
      "nouveau quartier du Petit Portier à Monaco. Pour mettre en valeur les vitrines de " +
      "l'espace retail, une agence internationale a imaginé une chorégraphie multicolore " +
      "jouant avec la lumière. Urbanize a déployé un habillage de 400 m² irisé, " +
      "transformant les façades en une installation lumineuse aussi élégante qu'iconique.",
    facts: [
      { label: 'Client', value: '[MARK](https://thisismark.com)' },
      { label: 'Lieu', value: 'Le Petit Portier, Monaco' },
      { label: 'Surface', value: '400 m²' },
      { label: 'Délai', value: '2 semaines' },
    ],
    sections: [
      {
        title: "Une mise en valeur artistique pour l'espace retail",
        body:
          "Le port monégasque du Petit Portier à Monaco a souhaité valoriser son nouvel " +
          "espace retail le temps d'un moment. Pour ce faire, il a fait appel à une agence " +
          "de renom international pour imaginer une chorégraphie multicolore sur les " +
          "vitrines des futurs commerces. Le résultat est magique : l'habillage urbain " +
          "irisé fait danser un jeu de couleurs qui s'entrelacent au fil de la journée, " +
          "offrant des reflets changeants qui subliment ce nouveau lieu de rencontre. Une " +
          "expérience visuelle tout simplement unique, rendue possible grâce à un covering " +
          "maîtrisé.",
      },
      {
        title: 'Une réalisation alliant technicité et esthétique',
        body:
          "Pour ce projet, Urbanize a disposé de seulement deux semaines pour concevoir et " +
          "déployer l'habillage urbain de près de 400 m². Un défi relevé grâce à la " +
          "mobilisation d'une équipe de professionnels expérimentés, capables d'intervenir " +
          "sur des surfaces vitrées exigeantes. Cette expertise technique a permis " +
          "d'obtenir une installation parfaitement maîtrisée, à la fois esthétique et " +
          "durable.",
      },
      {
        title: 'Un projet iconique réalisé pour MARK',
        body:
          "Nous remercions chaleureusement notre client [MARK](https://thisismark.com) pour " +
          "sa confiance dans la réalisation de ce projet ambitieux et iconique. Avec cette " +
          "réalisation, Urbanize illustre une nouvelle fois sa capacité à allier " +
          "créativité, technicité et rapidité d'exécution, afin de donner vie à des projets " +
          "d'[habillage urbain](/habillage-urbain) qui marquent durablement les lieux et " +
          "les esprits.",
      },
    ],
  },
  {
    slug: 'luminiscence-totem-arty-lyon',
    title: 'Luminiscence choisit le Totem Arty pour sa communication extérieure à Lyon',
    category: 'Habillage Urbain — Totem',
    cover: imgLuminiscenceTotemArty,
    images: [imgLuminiscenceTotemArty],
    description:
      "Nous avons eu le plaisir de contribuer au projet [Luminiscence]" +
      "(https://luminiscence.com), une expérience " +
      "immersive unique à la basilique Saint-Bonaventure de Lyon. Ce spectacle mêlant " +
      "vidéo-mapping à 360°, sonorisation et jeux de lumières nécessitait une " +
      "signalétique raffinée. Le [totem Arty](/definir-besoin) en bois s'est imposé comme " +
      "la solution idéale grâce à son esthétique élégante, parfaitement adaptée à la " +
      "communication événementielle.",
    facts: [
      { label: 'Client', value: '[Luminiscence](https://luminiscence.com)' },
      { label: 'Lieu', value: 'Basilique Saint-Bonaventure, Lyon' },
      { label: 'Produit', value: 'Totem Arty bois' },
      { label: 'Usage', value: 'Communication événementielle' },
    ],
    sections: [
      {
        title: "Une conception élégante et durable pour l'événement",
        body:
          "Le bois composite apporte au totem une élégance unique et une durabilité " +
          "optimale, répondant parfaitement aux exigences du projet. Son habillage en bois " +
          "composite et sa structure métallique thermolaquée assurent une intégration " +
          "harmonieuse au lieu. Ce dispositif garantit aussi une visibilité optimale pour " +
          "les visiteurs tout en respectant l'esthétique du site.",
      },
      {
        title: 'Un dispositif technique conçu sur mesure',
        body:
          "Grâce à ses visuels interchangeables sans perçage, le [totem Arty]" +
          "(/definir-besoin) a offert une " +
          "communication simple et évolutive pendant l'événement. Son montage facile et sa " +
          "robustesse en font une solution idéale pour les exigences techniques et " +
          "esthétiques. Ce dispositif s'adapte parfaitement aux projets événementiels qui " +
          "demandent une signalétique élégante et performante.",
      },
      {
        title: 'Une installation pensée pour une intégration parfaite',
        body:
          "Le totem Arty en bois a été positionné de manière stratégique pour guider les " +
          "visiteurs sans perturber le parcours de l'événement. Sa structure autoportante a " +
          "permis une mise en place rapide, sans fixation permanente, offrant ainsi une " +
          "flexibilité d'utilisation. Grâce à son format optimisé, il s'adapte aux " +
          "contraintes des espaces événementiels tout en assurant une lecture fluide des " +
          "informations affichées.",
      },
      {
        title: 'Notre savoir-faire au service d\'une expérience unique',
        body:
          "Nous remercions chaleureusement l'équipe de [Luminiscence]" +
          "(https://luminiscence.com) pour sa confiance. " +
          "Cette réalisation illustre notre savoir-faire dans la conception de supports " +
          "d'exposition extérieurs alliant élégance et performance. Nos solutions de " +
          "[signalétique](/habillage-urbain) s'intègrent parfaitement aux événements " +
          "culturels et historiques, garantissant une visibilité optimale." +
          "\n\n" +
          "Notre engagement reste le même : proposer des supports durables et esthétiques, " +
          "adaptés aux exigences des espaces extérieurs.",
      },
    ],
  },
];

export function getRealisationBySlug(slug: string): Realisation | undefined {
  return REALISATIONS.find(r => r.slug === slug);
}
