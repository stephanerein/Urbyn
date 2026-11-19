# Gouvernance SEO & GEO — Atelier Urbanize

> **URL de production** : https://plateform.urbanize.site  
> **Site principal** : https://www.urbanize.site  
> **Dernière mise à jour** : 19 novembre 2026

## 0. Positionnement (25 août 2026)

Le site a été restructuré autour d'**Atelier Urbanize**, organisé en deux domaines, chacun
avec sa page de présentation dédiée et son entrée dans le menu principal :
- **Habillage Urbain** (`/habillage-urbain`) — totems, palissades, massifs béton, échafaudages...
- **Solutions d'ombrage** (`/solutions-ombrage`) — toiles d'ombrage façades/patios, Ciel de Rue,
  films solaires vitrages. Catalogue produit à venir, contenu descriptif uniquement pour l'instant.

Menu principal : Expertise (Urbaine · Ombrage) · Configurateur (`/configurateur`) ·
Réalisations (`/realisations`) · Contact (`/contact`). `/a-propos` reste accessible depuis le footer.

`/urbyn` a été supprimée le 25 août 2026 (page orpheline, plus aucun lien interne ni contenu
propre — son rôle est repris par `/configurateur` et les pages Habillage Urbain / Solutions d'ombrage).
Retirée des routes, du sitemap et du script de pré-rendu.

**Réalisations** (`/realisations` + `/realisations/:slug`) : portfolio de projets, données dans
`src/app/data/realisations.ts` (tableau `REALISATIONS` — titre, catégorie, photo(s), chapô,
données clés, sections). Ajouter une réalisation = ajouter une entrée à ce tableau, la page de
détail (`RealisationDetailPage.tsx`) est générique et n'a pas besoin d'être dupliquée. Penser à
déclarer le nouveau slug dans `prerender.mjs` et `public/sitemap.xml`.

Les textes (chapô, sections, données clés) acceptent des liens au format `[libellé](url)`,
rendus par `src/app/components/RichText.tsx` : une URL commençant par « / » devient un lien
interne React Router (maillage intrasite), les autres des liens externes en `target="_blank"`
avec `rel="noopener noreferrer"`. Le balisage est retiré automatiquement de la meta description.

Le tableau ne contient que des **réalisations réelles** (Monaco, Luminiscence) : les 3 entrées
d'exemple ont été retirées, ainsi que leurs pages de détail, leurs entrées de pré-rendu et leurs
URL de sitemap. Ne jamais y remettre de contenu « modèle » : tout ce qui est dans ce tableau est
publié tel quel.

**Marque** : le site ne doit contenir aucune référence à « Celize », y compris dans les noms de
fichiers images (ils apparaissent dans les URL servies en production). Vérification :
`grep -ri celize --exclude-dir=node_modules --exclude-dir=dist . | grep -v SEO_GOVERNANCE`
doit ne rien retourner (seul ce document cite la marque, pour énoncer la règle).

---

## 0 bis. Arborescence des URL (19 novembre 2026)

Les URL suivent la hiérarchie du site : **domaine → famille de produits → variante**. Chaque page
indexable a une URL qui se lit seule (un moteur ou une IA comprend de quoi parle la page sans la
charger) et qui reprend les mots que l'on tape dans une recherche.

```
/                                       Accueil
├── /habillage-urbain                   Domaine Habillage Urbain
│   ├── /totems/acquisition · /totems/location
│   ├── /totems/sign-iz/(acquisition|location)
│   ├── /totems/caisson-bois/format · /totems/caisson-bois-120/location
│   ├── /palissades
│   └── /massifs-beton
├── /solutions-ombrage                  Domaine Solutions d'ombrage
│   └── /patio                          Couverture de patio : repliable ou fixe
│       └── /services · /dimensions · /estimation   (parcours, noindex)
├── /bureau-d-etudes                    Étude BET (conseil)
├── /configurateur                      Définir son besoin
│   └── /:produit/(choix-service|services-additionnels|services-specifiques)   (parcours, noindex)
├── /realisations/:slug · /a-propos · /contact · /plan-du-site
└── /panier · /livraison · /paiement    Tunnel de commande (noindex)
```

Conventions :
- français, minuscules, **kebab-case sans accent**, pluriel pour une famille (`totems`, `palissades`) ;
- le segment de tête désigne le domaine (`habillage-urbain`, `solutions-ombrage`) : une page produit
  n'est jamais à la racine ;
- trois niveaux au plus pour une page indexable ; les étapes de parcours (noindex) peuvent aller plus loin ;
- une URL = une page : pas de doublon (`/cart` redirige vers `/panier`).

**Anciennes URL.** Toutes les anciennes adresses (`/totem/*`, `/palissade/*`, `/massif*`, `/bet*`,
`/definir-besoin`, `/services-additionnels/*`, `/services-specifiques/*`, `/select-service/*`,
`/cart`, `/solutions-ombrage/patio/solutions`) redirigent en **301** vers la nouvelle. Les règles
sont dans `vercel.json` (source de vérité) ; `src/app/routes.tsx` les rejoue côté navigateur pour les
liens internes et le développement local. **Ne jamais supprimer ces règles** : des liens externes et
l'index des moteurs y renvoient encore. Pour déplacer une page : changer la route, ajouter la
redirection de l'ancienne adresse dans `vercel.json`, puis suivre la checklist « renommage » (§4).

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
| Accueil (Atelier Urbanize) | `/` | Excellence en Consulting Urbain | Organization, Breadcrumb |
| Habillage Urbain | `/habillage-urbain` | Habillage Urbain — Totems, palissades, massifs béton, échafaudages | Breadcrumb |
| Solutions d'ombrage | `/solutions-ombrage` | Solutions d'ombrage — Protection solaire & confort urbain | Breadcrumb |
| Couverture de patio — repliable ou fixe | `/solutions-ombrage/patio` | Couverture de patio repliable ou fixe : ombrage, motorisation, coût sur 5 et 10 ans | Breadcrumb, Service, FAQPage (page de référencement SEO et GEO de la solution) |
| Réalisations (liste) | `/realisations` | Réalisations | Breadcrumb |
| Réalisations (détail, ×2 réelles) | `/realisations/:slug` | Titre de la réalisation | Breadcrumb |
| À propos | `/a-propos` | À propos d'Atelier Urbanize | Breadcrumb |
| Contact | `/contact` | Contact | Breadcrumb |
| Configurateur | `/configurateur` | Configurez votre projet | — |
| Totems acquisition | `/habillage-urbain/totems/acquisition` | Totems — Acquisition | Product, Breadcrumb |
| Totems location | `/habillage-urbain/totems/location` | Totems — Location | Breadcrumb |
| Totem Sign-IZ acquisition | `/habillage-urbain/totems/sign-iz/acquisition` | Totem Sign-IZ — Acquisition | Product, Breadcrumb |
| Totem Sign-IZ location | `/habillage-urbain/totems/sign-iz/location` | Totem Sign-IZ — Location | Product, Breadcrumb |
| Totem Caisson Bois 120 location | `/habillage-urbain/totems/caisson-bois-120/location` | Totem Caisson Bois 120 — Location | Product, Breadcrumb |
| Palissade | `/habillage-urbain/palissades` | Palissade de chantier — Configuration | Breadcrumb |
| Massif béton | `/habillage-urbain/massifs-beton` | Massif béton — Sélection | Breadcrumb |
| BET | `/bureau-d-etudes` | Bureau d'études techniques | Breadcrumb |
| Plan du site | `/plan-du-site` | Plan du site | Breadcrumb |

### Pages exclues de l'index (`noIndex`) ❌

| Page | Raison |
|---|---|
| `/mentions-legales` | Page légale, faible valeur SEO |
| `/confidentialite` | Page légale, faible valeur SEO |
| `/cgv` | Page légale, faible valeur SEO |
| `/cookies` | Page légale, faible valeur SEO |
| `/panier` | Tunnel transactionnel |
| `/livraison` | Tunnel transactionnel |
| `/paiement` | Tunnel transactionnel |
| `/login` | Accès privé |
| `/partner/*` | Espace partenaire privé |
| `/habillage-urbain/totems/resultats` | Résultat dynamique de session |
| `/habillage-urbain/totems/conformite/resultats` | Résultat dynamique de session |
| `/habillage-urbain/massifs-beton/resultats` | Résultat dynamique de session |
| `/bureau-d-etudes/resultats` | Résultat dynamique de session |
| `/habillage-urbain/palissades/resultats` | Résultat dynamique de session |

### Pages non-couvertes (flow intermédiaire, pas nécessaires au référencement)

`PatioServicesPage`, `PatioConfigPage`, `PatioCalibragePage`, `PatioChiffragePage` et `PatioCoordonneesPage` (`/solutions-ombrage/patio/services`, `…/dimensions`, `…/calibrage`, `…/chiffrage`, `…/coordonnees`) : choix des services, saisie des patios, calibrage technique, chiffrage financier et demande de devis, en `noIndex`. Leurs arguments commerciaux viennent du catalogue « Solutions d'ombrage 2027 ».

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
