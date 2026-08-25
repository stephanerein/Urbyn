# Gouvernance SEO & GEO — Atelier Urbanize

> **URL de production** : https://plateform.urbanize.site  
> **Site principal** : https://www.urbanize.site  
> **Dernière mise à jour** : 14 août 2026

## 0. Positionnement (14 août 2026)

Le site a été restructuré autour d'**Atelier Urbanize**, organisé en deux domaines :
- **Habillage Urbain** (totems, palissades, massifs béton, échafaudages...) — vendu et estimé
  en ligne via **Urbyn**, la plateforme dédiée (`/urbyn`).
- **Habillage Thermique** (toiles de protection façades/patios, films solaires vitrages) —
  catalogue produit à venir, contenu descriptif uniquement pour l'instant.

L'accueil (`/`) présente désormais Atelier Urbanize et ses deux domaines ; `/urbyn` porte
l'ancien contenu de la page d'accueil (estimation instantanée, configurateur).

---

## Règle fondamentale

**Toute modification du site doit être répercutée dans les fichiers de référencement.**  
Ce document est la checklist obligatoire à consulter avant tout déploiement.

---

## 1. Fichiers de référencement — sources de vérité

| Fichier | Rôle | Modifier quand |
|---|---|---|
| `public/sitemap.xml` | URLs indexables + priorité | Ajout / suppression / renommage d'une page publique |
| `public/robots.txt` | Règles d'accès crawlers | Ajout d'une section privée ou publique |
| `public/llms.txt` | Fiche entité pour IA (ChatGPT, Claude, Perplexity, Gemini, Copilot) | Nouveau produit, changement de prix, nouveau service, nouvelle zone géo |
| `src/app/components/SEOMeta.tsx` | Composant centralisé meta + JSON-LD | Changement de domaine, nouveau type de schéma Schema.org |
| `prerender.mjs` (tableau `ROUTES`) | Liste des pages pré-rendues en HTML statique au build | Ajout / suppression d'une page **indexable** — doit rester synchro avec `sitemap.xml` |
| `SEO_GOVERNANCE.md` (ce fichier) | Tableau de couverture + checklist | Après chaque ajout ou modification de page |

---

## 2. Couverture SEO — état au Juin 2026

### Pages indexées (avec `<SEOMeta>` sans `noIndex`) ✅

| Page | URL sitemap | Title | Schémas JSON-LD |
|---|---|---|---|
| Accueil (Atelier Urbanize) | `/` | Habillage urbain & habillage thermique | Organization, Breadcrumb |
| Urbyn (plateforme) | `/urbyn` | Urbyn — Estimation instantanée pour vos projets d'habillage urbain | Breadcrumb |
| À propos | `/a-propos` | À propos d'Urbyn | Breadcrumb |
| Contact | `/contact` | Contact | Breadcrumb |
| Configurateur | `/definir-besoin` | Configurez votre projet | — |
| Totems acquisition | `/totem/acquisition` | Totems — Acquisition | Product, Breadcrumb |
| Totems location | `/totem/location` | Totems — Location | Breadcrumb |
| Totem Sign-IZ acquisition | `/totem/sign-iz/acquisition` | Totem Sign-IZ — Acquisition | Product, Breadcrumb |
| Totem Sign-IZ location | `/totem/sign-iz/location` | Totem Sign-IZ — Location | Product, Breadcrumb |
| Totem Caisson Bois 120 location | `/totem/caisson-bois-120/location` | Totem Caisson Bois 120 — Location | Product, Breadcrumb |
| Palissade | `/palissade` | Palissade de chantier — Configuration | Breadcrumb |
| Massif béton | `/massif/selection` | Massif béton — Sélection | Breadcrumb |
| BET | `/bet` | Bureau d'études techniques | Breadcrumb |
| Mentions légales | `/mentions-legales` | Mentions légales | noIndex |
| Confidentialité | `/confidentialite` | Politique de confidentialité | noIndex |
| CGV | `/cgv` | Conditions générales de vente | noIndex |
| Cookies | `/cookies` | Politique des cookies | noIndex |

### Pages exclues de l'index (`noIndex`) ❌

| Page | Raison |
|---|---|
| `/panier` | Tunnel transactionnel |
| `/livraison` | Tunnel transactionnel |
| `/paiement` | Tunnel transactionnel |
| `/login` | Accès privé |
| `/partner/*` | Espace partenaire privé |
| `/totem/resultats` | Résultat dynamique de session |
| `/totem/conformite/resultats` | Résultat dynamique de session |
| `/massif/resultats` | Résultat dynamique de session |
| `/bet/resultats` | Résultat dynamique de session |
| `/palissade/resultats` | Résultat dynamique de session |

### Pages non-couvertes (flow intermédiaire, pas nécessaires au référencement)

`TotemConfigPage`, `TotemFormatPage`, `TotemComparePage`, `TotemModelPage`, `TotemSignIzPage`, `TotemCompliancePage`, `PalissadeHabillagePage`, `PalissadeMontagePage`, `MassifCalculatorPage`, `ServicesAdditionnelsPage`, `ServicesSpecifiquesPage`, `SelectServicePage`, `ChiffrageFinalPage`, `SitemapPage`

---

## 3. Règle d'or : toute nouvelle page déclare son SEO

### Page **indexable** (produit, service, information)

```tsx
import { SEOMeta, breadcrumbSchema, productSchema } from '../components/SEOMeta';

// Premier enfant dans le return :
<SEOMeta
  title="Titre concis (max 60 caractères)"
  description="Description accrocheuse avec mots-clés (150–160 caractères)"
  keywords="mot-clé 1, mot-clé 2, mot-clé 3"
  url="/chemin-exact-de-la-page"
  jsonLd={breadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Catégorie', url: '/categorie' },
    { name: 'Page', url: '/chemin-exact-de-la-page' },
  ])}
/>
```

**Checklist associée :**
- [ ] URL ajoutée dans `sitemap.xml` avec `<priority>` et `<changefreq>`
- [ ] `llms.txt` mis à jour si c'est un nouveau produit ou service

### Page **non-indexable** (tunnel, résultat de calcul, espace privé)

```tsx
import { SEOMeta } from '../components/SEOMeta';

<SEOMeta title="Nom descriptif" noIndex />
```

**Checklist associée :**
- [ ] `Disallow: /chemin` ajouté dans `robots.txt`

---

## 4. Checklist complète — à appliquer avant chaque déploiement

### Lors d'un **ajout de page**
```
[ ] <SEOMeta> ajouté avec title + description + url
[ ] keywords pertinents (3–6 mots-clés ciblés)
[ ] breadcrumbSchema() configuré
[ ] productSchema() si page produit avec prix
[ ] URL dans sitemap.xml (si indexable)
[ ] Disallow dans robots.txt (si non-indexable)
[ ] llms.txt mis à jour si nouveau produit/service
[ ] SEO_GOVERNANCE.md mis à jour (tableau couverture)
```

### Lors d'une **modification de prix**
```
[ ] Prix mis à jour dans llms.txt
[ ] Prix mis à jour dans productSchema() de la page concernée
[ ] Prix mis à jour dans la description SEOMeta si mentionné
```

### Lors d'un **renommage ou déplacement de page**
```
[ ] Ancienne URL supprimée du sitemap.xml
[ ] Nouvelle URL ajoutée au sitemap.xml
[ ] robots.txt vérifié (Disallow éventuellement à modifier)
[ ] Redirection 301 configurée côté hébergeur si page déjà indexée
[ ] SEO_GOVERNANCE.md mis à jour
```

### Lors d'un **nouveau produit ou service**
```
[ ] Page produit créée avec SEOMeta complet + productSchema
[ ] URL dans sitemap.xml
[ ] llms.txt : section ajoutée avec nom, description, prix, specs
[ ] ORG_SCHEMA dans SEOMeta.tsx si l'entité organisation change
```

---

## 5. Schémas Schema.org disponibles

```tsx
import { SEOMeta, ORG_SCHEMA, productSchema, breadcrumbSchema } from '../components/SEOMeta';
```

| Export | Type Schema.org | Usage |
|---|---|---|
| `ORG_SCHEMA` | `Organization` | Injecté globalement dans App.tsx — ne pas dupliquer |
| `productSchema({ name, description, price, url })` | `Product` + `Offer` | Pages produit avec prix (totem, palissade…) |
| `breadcrumbSchema([{ name, url }])` | `BreadcrumbList` | Toutes les pages avec hiérarchie de navigation |

---

## 6. Optimisation GEO — moteurs IA

### Plateformes ciblées
ChatGPT (OpenAI) · Claude (Anthropic) · Perplexity · Gemini (Google) · Copilot (Microsoft)

### Fichier `public/llms.txt`
Standard émergent lu par les crawlers IA. Contient actuellement :
- Identité de l'entreprise (Urbyn by Atelier Urbanize)
- Catalogue produits avec prix et spécifications techniques
- Zone géographique couverte (France, Belgique, Suisse, Allemagne…)
- Normes appliquées (Eurocode EN 1991-1-4)
- Contact

**À mettre à jour à chaque :** nouveau produit · changement de prix · nouvelle zone de livraison · nouvelle certification

### Bonnes pratiques GEO en vigueur
- **Données structurées JSON-LD `Product` avec prix** — extraites par les IA pour répondre aux questions tarifaires
- **Entités nommées précises** : "Totem Sign-IZ", "Atelier Urbanize", "Eurocode EN 1991-1-4", "INPI réf. 20213357-3"
- **`ORG_SCHEMA` global** — ancre l'organisation dans les knowledge graphs
- **Descriptions factuelles avec chiffres** — les LLMs privilégient les données mesurables (prix HT, dimensions mm, kg, km/h)

---

## 7. Priorités d'amélioration restantes

| Priorité | Action | Impact SEO/GEO |
|---|---|---|
| ✅ Fait (2026-07-23) | Retirer `<meta name="robots" content="noindex, nofollow">` codé en dur dans `index.html` (reliquat protection preview Figma Make) | **Bloquait l'indexation de tout le site**, indépendamment du travail SEO par page |
| ✅ Fait (2026-07-23) | Remplacer title/description génériques (placeholder anglais) dans `index.html` par le contenu de marque + Open Graph | Fallback correct pour les crawlers n'exécutant pas le JS |
| ✅ Fait (2026-07-23) | Ajouter `lastmod` aux URLs du sitemap.xml | Priorité de recrawl Google |
| ✅ Déjà en place | `<html lang="fr-fr">` dans l'entrypoint | Signal linguistique pour Google |
| 🔴 Haute | Créer `/public/og-image.jpg` (1200×630px) — référencé mais fichier absent | Aperçus riches sur réseaux sociaux et IA |
| ✅ Fait (2026-07-23) | **Pré-rendu HTML des pages indexables** — `npm run build` génère maintenant un fichier HTML statique par route indexable (`src/entry-server.tsx` + `prerender.mjs`), avec le vrai title/description/JSON-LD de la page injecté directement dans le HTML livré au crawler | Les crawlers sans exécution JS (plusieurs crawlers IA, certains bots de prévisualisation de liens) voient désormais le bon contenu par page, plus un fallback générique |
| 🔴 Haute | Soumettre sitemap dans Google Search Console | Indexation Google accélérée |
| 🔴 Haute | Enregistrer dans Bing Webmaster Tools | Indexation Bing/Copilot |
| 🟡 Moyenne | Ajouter `FAQPage` schema sur la page d'accueil | Snippets enrichis Google + réponses IA |
| 🟡 Moyenne | Ajouter `LocalBusiness` schema (si adresse physique dispo) | Référencement local Google Maps |
| 🟢 Faible | Générer sitemap dynamiquement via plugin Vite | Maintenance automatique |
| 🟢 Faible | Ajouter `hreflang` si version multilingue | SEO international |
