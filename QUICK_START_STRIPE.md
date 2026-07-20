# 🚀 Démarrage Rapide - Backend Stripe Urbyn

## En 5 minutes chrono ! ⏱️

### 1️⃣ Créer le dossier backend

```bash
mkdir urbyn-backend
cd urbyn-backend
```

### 2️⃣ Copier les fichiers nécessaires

```bash
# Depuis le dossier racine de Urbyn
cp server-stripe-example.js urbyn-backend/server.js
cp backend-package.json urbyn-backend/package.json
cp test-stripe-connection.js urbyn-backend/
cp .env.example urbyn-backend/.env
```

### 3️⃣ Installer les dépendances

```bash
npm install
```

### 4️⃣ Configurer les clés Stripe

Éditez le fichier `.env` avec vos vraies clés :

```env
STRIPE_SECRET_KEY=sk_test_51SnQmhLYbLga2mRIZjYCBi2ZhDyCEbJ2KUE3uHQ0BVfC9CMl8hFa2fy1vaiRTXNWAwXRR80SAWGA0vRn3CwLCSSe00wDg0dhZW
PORT=3001
```

### 5️⃣ Tester la connexion

```bash
npm test
```

Vous devriez voir : ✅ CONNEXION STRIPE RÉUSSIE !

### 6️⃣ Lancer le serveur

```bash
npm start
```

Le serveur écoute sur : http://localhost:3001

---

## 🔄 Activer les vrais paiements

### Dans le frontend : `/src/app/components/StripeCheckout.tsx`

Remplacez la fonction `handleSubmit` par :

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!stripe || !elements) return;

  setIsProcessing(true);
  setError(null);

  try {
    // 1. Créer le Payment Intent côté serveur
    const response = await fetch('http://localhost:3001/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, orderDetails })
    });

    const { clientSecret } = await response.json();

    // 2. Confirmer le paiement
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      redirect: 'if_required'
    });

    if (stripeError) {
      setError(stripeError.message || 'Erreur de paiement');
    } else {
      onSuccess();
    }
  } catch (err) {
    setError('Erreur serveur');
  } finally {
    setIsProcessing(false);
  }
};
```

---

## 🧪 Tester avec une carte test

Numéro : `4242 4242 4242 4242`  
Date : n'importe quelle date future  
CVC : n'importe quel 3 chiffres  

---

## ✅ Checklist

- [ ] Backend démarré sur le port 3001
- [ ] Frontend modifié pour appeler le backend
- [ ] Test avec carte 4242 réussi
- [ ] Paiement confirmé dans Dashboard Stripe

---

## 📚 Documentation complète

Voir le fichier `STRIPE_SETUP.md` pour plus de détails.

---

**Questions ?** info@urbanize.site
