# Urbyn (nouveau front)

Front Figma Make adapté pour tourner en local, branché sur le backend CRM (Neon via API).

## Démarrage

```bash
cd Urbyn
cp .env.example .env   # si besoin
npm install
npm run dev
```

Ouvre http://localhost:5174

Backend local (ou Render via `VITE_API_URL_WEB`) :

```bash
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Auth

- Bouton **Connexion** → modal Client / Partenaire (login + signup + OTP + onboarding)
- Client connecté → reste sur les pages Urbyn (anonyme = même pages, non identifié)
- Partenaire connecté → portail `/fournisseur` (dashboard, offres, expédition, paiement) — même API que l’ancien frontend
- Fallback API : `VITE_API_URL_WEB` puis `VITE_API_URL_LOCAL`

### Routes fournisseur

- `/fournisseur` — dashboard
- `/fournisseur/offres/catalogue` · `/offres/produit`
- `/fournisseur/expedition` (+ créer / modifier zones & tarifs)
- `/fournisseur/paiement` (+ créer / modifier méthode & banque)

### Admin

- `/admin/login` — connexion admin (Bearer `sessionStorage`)
- `/admin` — dashboard
- `/admin/catalogues` — arbre catalogues + édition
- `/admin/produits/:id` — fiche produit
- `/admin/utilisateurs` · `/admin/utilisateurs/:id`
- `/admin/societes` · `/admin/societes/:tva`

Identifiants : `ADMIN_ID` / `ADMIN_PWD` du `.env` backend.

