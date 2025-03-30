const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createPaymentIntent,
  handleWebhook,
  completeDeal
} = require('../controllers/paymentController');

// Create payment intent
router.post('/create-payment-intent/:dealId', protect, createPaymentIntent);

router.put('/complete-deal/:dealId', protect, completeDeal);

// Stripe webhook (must be raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;