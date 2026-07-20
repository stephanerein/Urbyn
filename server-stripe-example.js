/**
 * BACKEND STRIPE - EXEMPLE DE CONFIGURATION
 * 
 * Ce fichier doit être exécuté sur votre serveur Node.js, PAS dans le navigateur !
 * 
 * INSTALLATION :
 * npm install express cors stripe dotenv
 * 
 * UTILISATION :
 * 1. Créez un fichier .env avec votre clé secrète Stripe
 * 2. Lancez avec : node server-stripe-example.js
 * 3. Le serveur écoutera sur http://localhost:3001
 */

// ========================================
// IMPORTS
// ========================================
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51SnQmhLYbLga2mRIZjYCBi2ZhDyCEbJ2KUE3uHQ0BVfC9CMl8hFa2fy1vaiRTXNWAwXRR80SAWGA0vRn3CwLCSSe00wDg0dhZW');

const app = express();
const PORT = process.env.PORT || 3001;

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://votre-domaine.com'],
  methods: ['POST', 'GET', 'OPTIONS'],
  credentials: true
}));

app.use(express.json()); // Pour parser le JSON dans le body

// ========================================
// ROUTE PRINCIPALE : CRÉER UN PAYMENT INTENT
// ========================================
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, orderDetails } = req.body;

    // Validation des données
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Montant invalide' 
      });
    }

    if (!orderDetails || !orderDetails.type) {
      return res.status(400).json({ 
        error: 'Détails de commande manquants' 
      });
    }

    // Créer le Payment Intent avec Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir en centimes
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true, // Active tous les moyens de paiement configurés
      },
      metadata: {
        orderType: orderDetails.type,
        description: orderDetails.description || '',
        // Vous pouvez ajouter d'autres métadonnées ici
      },
      description: `${orderDetails.type} - ${orderDetails.description}`,
    });

    // Log pour debug (à retirer en production)
    console.log('✅ Payment Intent créé:', {
      id: paymentIntent.id,
      amount: amount,
      type: orderDetails.type
    });

    // Retourner le client secret au frontend
    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Erreur création Payment Intent:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// ========================================
// ROUTE : CONFIRMER UN PAIEMENT (optionnel)
// ========================================
app.get('/payment-status/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata
    });
  } catch (error) {
    console.error('❌ Erreur récupération Payment Intent:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// ========================================
// WEBHOOKS STRIPE (recommandé pour production)
// ========================================
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Erreur webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Traiter les événements
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('✅ Paiement réussi:', paymentIntent.id);
      
      // ICI : Envoyer un email de confirmation
      // ICI : Mettre à jour votre base de données
      // ICI : Déclencher la préparation de commande
      
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('❌ Paiement échoué:', failedPayment.id);
      
      // ICI : Envoyer un email d'échec
      // ICI : Logger l'échec
      
      break;
      
    default:
      console.log(`Événement non géré : ${event.type}`);
  }

  res.json({received: true});
});

// ========================================
// ROUTE DE TEST
// ========================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur Stripe Urbyn opérationnel',
    timestamp: new Date().toISOString()
  });
});

// ========================================
// DÉMARRAGE DU SERVEUR
// ========================================
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 SERVEUR STRIPE HOARDINGO DÉMARRÉ                   ║
║                                                          ║
║   Port: ${PORT}                                         ║
║   URL: http://localhost:${PORT}                         ║
║                                                          ║
║   ✅ Routes disponibles :                               ║
║   POST /create-payment-intent                           ║
║   GET  /payment-status/:id                              ║
║   POST /webhook                                         ║
║   GET  /health                                          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

// ========================================
// GESTION DES ERREURS NON CAPTURÉES
// ========================================
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err);
  process.exit(1);
});
