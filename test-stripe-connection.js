/**
 * SCRIPT DE TEST - CONNEXION STRIPE
 * 
 * Ce script teste la connexion à l'API Stripe avec vos clés.
 * 
 * UTILISATION :
 * node test-stripe-connection.js
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

console.log('\n🔍 Test de connexion Stripe...\n');

async function testStripeConnection() {
  try {
    // 1. Vérifier la clé API
    console.log('✅ Clé API chargée :', 
      process.env.STRIPE_SECRET_KEY ? 
      `${process.env.STRIPE_SECRET_KEY.substring(0, 15)}...` : 
      '❌ MANQUANTE'
    );

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Clé STRIPE_SECRET_KEY manquante dans .env');
    }

    // 2. Tester en créant un Payment Intent test
    console.log('\n📝 Création d\'un Payment Intent de test...');
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // 1€ en centimes
      currency: 'eur',
      metadata: {
        test: 'true',
        description: 'Test de connexion backend Urbyn'
      }
    });

    console.log('✅ Payment Intent créé avec succès !');
    console.log('   ID:', paymentIntent.id);
    console.log('   Montant:', paymentIntent.amount / 100, '€');
    console.log('   Statut:', paymentIntent.status);
    console.log('   Client Secret:', paymentIntent.client_secret ? '✓ Généré' : '✗ Manquant');

    // 3. Récupérer les infos du compte
    console.log('\n👤 Informations du compte Stripe...');
    
    const balance = await stripe.balance.retrieve();
    console.log('✅ Compte accessible');
    console.log('   Devise par défaut:', balance.available[0]?.currency || 'N/A');

    // 4. Vérifier le mode (test vs live)
    const mode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 
      '🧪 MODE TEST' : 
      '🚀 MODE PRODUCTION';
    
    console.log('\n', mode);

    // 5. Résumé final
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ✅ CONNEXION STRIPE RÉUSSIE !                         ║
║                                                          ║
║   Votre configuration est correcte.                     ║
║   Vous pouvez maintenant lancer le serveur :           ║
║                                                          ║
║   $ npm start                                           ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `);

  } catch (error) {
    console.error('\n❌ ERREUR DE CONNEXION STRIPE\n');
    console.error('Message:', error.message);
    console.error('\n📋 Vérifications à faire :');
    console.error('  1. Vérifiez que le fichier .env existe');
    console.error('  2. Vérifiez que STRIPE_SECRET_KEY est défini');
    console.error('  3. Vérifiez que la clé commence par sk_test_ ou sk_live_');
    console.error('  4. Vérifiez votre connexion internet');
    console.error('\n💡 Documentation : https://stripe.com/docs/keys\n');
    
    process.exit(1);
  }
}

// Lancer le test
testStripeConnection();
