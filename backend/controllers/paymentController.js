const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Deal = require('../models/Deal');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { dealId } = req.params;
    const deal = await Deal.findById(dealId);

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Create PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: deal.price * 100, // Stripe uses cents
      currency: 'inr',
      metadata: { 
        dealId: deal._id.toString(), 
        userId: req.user.id,
        dealTitle: deal.title
      },
      description: `Purchase of ${deal.title}`
    });

    console.log("paymentIntent =", paymentIntent);

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: deal.price,
      dealId: deal._id,
      currency: 'inr'
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to create payment intent' 
    });
  }
};

exports.completeDeal = async (req, res) => {
    try {
      const { dealId } = req.params;
      const { status, buyerId } = req.body;
  
      const deal = await Deal.findByIdAndUpdate(
        dealId,
        {
          status,
          buyer: buyerId
        },
        { new: true }
      );
  
      if (!deal) {
        return res.status(404).json({ error: 'Deal not found' });
      }
  
      res.status(200).json(deal);
    } catch (error) {
      console.error('Error completing deal:', error);
      res.status(500).json({ 
        error: error.message,
        details: 'Failed to complete deal' 
      });
    }
  };

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the payment_intent.succeeded event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const dealId = paymentIntent.metadata.dealId;
    const userId = paymentIntent.metadata.userId;

    try {
      await Deal.findByIdAndUpdate(dealId, {
        status: 'Completed',
        buyer: userId,
        completedAt: new Date()
      });
      console.log(`✅ Deal ${dealId} marked as completed`);
    } catch (dbError) {
      console.error('❌ Database update failed:', dbError);
    }
  }

  res.status(200).json({ received: true });
};