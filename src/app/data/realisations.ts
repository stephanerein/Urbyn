import { imgTotemSignIzNoir, imgCaissonBoisUrbain } from '../assets/images';
import palissadeImg from 'figma:asset/palissade-bois.png';

// ─────────────────────────────────────────────────────────────────────────────
// Réalisations — source unique de vérité pour la page /realisations et les
// pages de détail /realisations/:slug.
//
// Ce fichier ne contient pour l'instant que des exemples génériques servant
// de modèle. Pour ajouter une vraie réalisation : ajouter un objet à ce
// tableau (photo(s) réelle(s) du projet + titre + texte explicatif) — aucune
// autre modification n'est nécessaire, la page de détail est générique et
// s'appuie sur ces données.
// ─────────────────────────────────────────────────────────────────────────────

export interface Realisation {
  slug: string;
  title: string;
  category: string;
  cover: string;
  images: string[];
  description: string;
}

export const REALISATIONS: Realisation[] = [
  {
    slug: 'totem-sign-iz-salon-professionnel',
    title: 'Totem Sign-IZ pour salon professionnel',
    category: 'Habillage Urbain — Totem',
    cover: imgTotemSignIzNoir,
    images: [imgTotemSignIzNoir],
    description:
      "Exemple de réalisation (modèle). Mise en place d'un Totem Sign-IZ pour la " +
      "signalétique d'un événement professionnel : structure légère, montage rapide, " +
      "résistance au vent certifiée jusqu'à 85 km/h. Ce type d'installation permet " +
      "d'assurer une communication visible et durable sur toute la durée d'un salon " +
      "ou d'une manifestation.",
  },
  {
    slug: 'palissade-chantier-habillage-graphique',
    title: 'Habillage graphique de palissade de chantier',
    category: 'Habillage Urbain — Palissade',
    cover: palissadeImg,
    images: [palissadeImg],
    description:
      "Exemple de réalisation (modèle). Habillage graphique complet d'une palissade " +
      "de chantier en zone urbaine : conception visuelle, production et pose de " +
      "panneaux imprimés, sécurisation du périmètre. Une solution qui valorise le " +
      "chantier tout en assurant la sécurité des passants.",
  },
  {
    slug: 'massif-beton-securisation-evenement',
    title: 'Massifs béton pour sécurisation d\'événement',
    category: 'Habillage Urbain — Massif béton',
    cover: imgCaissonBoisUrbain,
    images: [imgCaissonBoisUrbain],
    description:
      "Exemple de réalisation (modèle). Déploiement de massifs béton temporaires pour " +
      "le lestage et la sécurisation de structures lors d'un événement en espace " +
      "public. Solution modulaire, livrée et installée sur site, conforme aux " +
      "exigences de stabilité requises.",
  },
];

export function getRealisationBySlug(slug: string): Realisation | undefined {
  return REALISATIONS.find(r => r.slug === slug);
}
