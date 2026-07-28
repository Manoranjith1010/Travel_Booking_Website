import Stripe from 'stripe';

export function createPaymentIntent(req, res) {
  const amount = Number(req.body.amount || 0);

  if (!amount) {
    return res.status(400).json({ message: 'Amount is required' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.json({
      clientSecret: 'demo-payment-session',
      message: 'Stripe is not configured yet, but the payment flow is wired.',
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe.paymentIntents
    .create({
      amount: Math.round(amount * 100),
      currency: 'inr',
      metadata: {
        bookingId: req.body.bookingId || 'unknown',
      },
    })
    .then((intent) => res.json({ clientSecret: intent.client_secret, message: 'Payment intent created' }))
    .catch((error) => res.status(500).json({ message: error.message }));
}
