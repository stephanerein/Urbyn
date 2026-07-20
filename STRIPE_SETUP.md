# 🎯 Configuration Backend Stripe - Urbyn by Atelier Urbanize

## 📋 Vue d'ensemble

Ce guide explique comment configurer le backend Node.js pour traiter les paiements Stripe dans votre plateforme Urbyn.

---

## ✅ Prérequis

- Node.js (version 14 ou supérieure)
- npm ou yarn
- Compte Stripe (https://stripe.com)
- Clés API Stripe (test et production)

---

## 🚀 Installation rapide

### 1. Créer un dossier pour le backend

```bash
mkdir urbyn-backend
cd urbyn-backend
```

### 2. Initialiser le projet Node.js

```bash
npm init -y
```

### 3. Installer les dépendances

```bash
npm install express cors stripe dotenv
```

### 4. Copier le fichier serveur

Copiez le fichier `/server-stripe-example.js` dans votre dossier backend :

```bash
cp ../server-stripe-example.js ./server.js
```

### 5. Configurer les variables d'environnement

Créez un fichier `.env` (basé sur `.env.example`) :

```bash
cp ../.env.example ./.env
```

Éditez `.env` avec vos vraies clés :

```env
STRIPE_SECRET_KEY=sk_test_51SnQmhLYbLga2mRIZjYCBi2ZhDyCEbJ2KUE3uHQ0BVfC9CMl8hFa2fy1vaiRTXNWAwXRR80SAWGA0vRn3CwLCSSe00wDg0dhZW
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_ici
PORT=3001
```

### 6. Ajouter .env au .gitignore

⚠️ **TRÈS IMPORTANT** pour la sécurité :

```bash
echo ".env" >> .gitignore
echo "node_modules/" >> .gitignore
```

### 7. Lancer le serveur

```bash
node server.js
```

Vous devriez voir :

```
╔══════════════════════════════════════════════════════════╗
║   🚀 SERVEUR STRIPE URBYN DÉMARRÉ                       ║
║   Port: 3001                                            ║
║   URL: http://localhost:3001                            ║
╚══════════════════════════════════════════════════════════╝
```

---

## 🔧 Modifier le frontend pour utiliser le backend

### Fichier : `/src/app/components/StripeCheckout.tsx`

Actuellement, le composant simule les paiements. Pour activer les vrais paiements :

**AVANT (simulation) :**
```typescript
// Simulation de paiement
setTimeout(() => {
  setIsProcessing(false);
  onSuccess();
}, 2000);
```

**APRÈS (vraie intégration) :**
```typescript
// 1. Créer un Payment Intent côté serveur
const response = await fetch('http://localhost:3001/create-payment-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: amount,
    orderDetails: orderDetails
  }),
});

const { clientSecret } = await response.json();

// 2. Confirmer le paiement avec Stripe
const { error } = await stripe.confirmPayment({
  elements,
  clientSecret,
  confirmParams: {
    return_url: `${window.location.origin}/payment-success`,
  },
});

if (error) {
  setError(error.message || 'Une erreur est survenue');
  setIsProcessing(false);
} else {
  onSuccess();
}
```

---

## 📡 Routes API disponibles

### 1. **POST /create-payment-intent**

Crée un nouveau Payment Intent Stripe.

**Request:**
```json
{
  "amount": 1600,
  "orderDetails": {
    "type": "Étude BET - Résistance au vent",
    "description": "Chantier : Paris (75015) - Zone de vent 2"
  }
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### 2. **GET /payment-status/:paymentIntentId**

Vérifie le statut d'un paiement.

**Response:**
```json
{
  "status": "succeeded",
  "amount": 1600,
  "currency": "eur",
  "metadata": {
    "orderType": "Étude BET",
    "description": "..."
  }
}
```

### 3. **POST /webhook**

Reçoit les événements Stripe (recommandé en production).

Événements traités :
- `payment_intent.succeeded` - Paiement réussi
- `payment_intent.payment_failed` - Paiement échoué

### 4. **GET /health**

Vérifie que le serveur fonctionne.

**Response:**
```json
{
  "status": "OK",
  "message": "Serveur Stripe Urbyn opérationnel",
  "timestamp": "2026-01-08T..."
}
```

---

## 🔐 Sécurité - Points importants

### ❌ NE JAMAIS faire :

1. **Mettre la clé secrète dans le frontend**
   ```javascript
   // ❌ MAUVAIS - Exposé dans le navigateur !
   const stripe = require('stripe')('sk_test_...');
   ```

2. **Committer .env dans Git**
   ```bash
   # ❌ DANGEREUX
   git add .env
   ```

3. **Accepter n'importe quel montant du frontend**
   ```javascript
   // ❌ Vulnérable à la manipulation
   const amount = req.body.amount; // Non validé !
   ```

### ✅ TOUJOURS faire :

1. **Valider les montants côté serveur**
   ```javascript
   if (!amount || amount <= 0 || amount > 100000) {
     return res.status(400).json({ error: 'Montant invalide' });
   }
   ```

2. **Utiliser HTTPS en production**
   ```javascript
   // Production uniquement
   app.use(enforce.HTTPS({ trustProtoHeader: true }));
   ```

3. **Configurer les webhooks Stripe**
   - Aller sur : https://dashboard.stripe.com/webhooks
   - Ajouter l'endpoint : `https://votre-domaine.com/webhook`
   - Sélectionner les événements : `payment_intent.succeeded`, `payment_intent.payment_failed`

---

## 🧪 Tester avec des cartes de test Stripe

En mode test, utilisez ces numéros de carte :

| Carte | Numéro | Résultat |
|-------|--------|----------|
| ✅ Succès | 4242 4242 4242 4242 | Paiement réussi |
| ❌ Échec | 4000 0000 0000 0002 | Carte refusée |
| 🔐 3D Secure | 4000 0027 6000 3184 | Authentification requise |

**Infos supplémentaires pour tous les tests :**
- Date d'expiration : n'importe quelle date future
- CVC : n'importe quel 3 chiffres
- Code postal : n'importe lequel

Plus de cartes de test : https://stripe.com/docs/testing

---

## 🚀 Déploiement en production

### 1. Obtenir les clés LIVE Stripe

Sur https://dashboard.stripe.com/apikeys :
- Clé publique : `pk_live_...`
- Clé secrète : `sk_live_...`

### 2. Mettre à jour les variables d'environnement

```env
STRIPE_SECRET_KEY=sk_live_votre_vraie_cle
PORT=443
```

### 3. Configurer CORS pour votre domaine

Dans `server.js` :
```javascript
app.use(cors({
  origin: ['https://urbyn.com', 'https://www.urbyn.com'],
  methods: ['POST', 'GET', 'OPTIONS'],
  credentials: true
}));
```

### 4. Activer HTTPS

**Option A : Avec Nginx**
```nginx
server {
  listen 443 ssl;
  server_name urbyn.com;
  
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  
  location / {
    proxy_pass http://localhost:3001;
  }
}
```

**Option B : Avec Heroku/Vercel/Railway**
HTTPS est automatiquement géré par la plateforme.

### 5. Configurer les webhooks

1. Dashboard Stripe → Webhooks
2. Ajouter l'endpoint : `https://urbyn.com/webhook`
3. Copier le secret webhook dans `.env`

---

## 📊 Monitoring et logs

### Consulter les paiements

Dashboard Stripe : https://dashboard.stripe.com/payments

### Logs serveur

```bash
# Avec PM2 (recommandé en production)
npm install -g pm2
pm2 start server.js --name urbyn-stripe
pm2 logs urbyn-stripe
```

### Événements importants à logger

```javascript
// Paiement réussi
console.log('✅ Paiement:', { id, amount, email });

// Erreur de paiement
console.error('❌ Échec:', { id, error, email });
```

---

## 🆘 Dépannage

### Erreur : "No such payment intent"
- Vérifiez que le `clientSecret` est bien transmis
- Vérifiez que vous utilisez les bonnes clés (test vs live)

### Erreur : "CORS policy"
- Ajoutez votre domaine dans la config CORS
- Vérifiez que le serveur est bien démarré

### Erreur : "Invalid API key"
- Vérifiez que la clé commence par `sk_test_` ou `sk_live_`
- Vérifiez le fichier `.env`

### Les webhooks ne fonctionnent pas
- Vérifiez le secret webhook dans `.env`
- Testez avec Stripe CLI : `stripe listen --forward-to localhost:3001/webhook`

---

## 📞 Support

- **Stripe Documentation** : https://stripe.com/docs
- **Stripe Support** : https://support.stripe.com
- **Urbyn** : info@urbanize.site

---

## 📝 Checklist de mise en production

- [ ] Clés LIVE Stripe configurées
- [ ] Variables d'environnement sécurisées
- [ ] HTTPS activé
- [ ] CORS configuré pour le domaine de production
- [ ] Webhooks Stripe configurés
- [ ] .env dans .gitignore
- [ ] Validation des montants côté serveur
- [ ] Logs et monitoring en place
- [ ] Tests avec vraies cartes effectués
- [ ] Emails de confirmation configurés

---

**Date de création** : 8 janvier 2026  
**Version** : 1.0  
**Projet** : Urbyn by Atelier Urbanize
