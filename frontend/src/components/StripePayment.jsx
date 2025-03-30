import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLIC_KEY);

const StripePaymentForm = ({ dealId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create payment intent (already done before showing this form)
      // 2. Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (error) {
        toast.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement className="p-2 border rounded" />
      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? 'Processing...' : `Pay $${amount}`}
      </Button>
    </form>
  );
};

export const StripePaymentModal = ({ dealId, amount }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchPaymentIntent = async () => {
    try {
      const res = await apiRequest('POST', `/payment/create-payment-intent/${dealId}`);
      setClientSecret(res.clientSecret);
      setShowForm(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <Button onClick={fetchPaymentIntent} className="bg-green-600 hover:bg-green-700">
        Buy Now (${amount})
      </Button>

      {showForm && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <StripePaymentForm 
            dealId={dealId}
            amount={amount}
            onSuccess={() => setShowForm(false)}
          />
        </Elements>
      )}
    </div>
  );
};