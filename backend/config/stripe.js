const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Add error handling
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set in environment variables');
}

module.exports = stripe; 