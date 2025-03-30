import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import toast from "react-hot-toast";
import { apiRequest } from "@/utils/api";

// Initialize Stripe outside the component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const StripePaymentForm = ({ dealId, clientSecret, onSuccess, onClose, setConversations }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const handlePaymentSuccess = async () => {
    try {
      // Update the deal status and add buyer ID
      await apiRequest("PUT", `/payment/complete-deal/${dealId}`, {
        status: "Completed",
        buyerId: user._id // Assuming user._id is the buyer's ID
      });
  
      // Refresh the conversations list
      const res = await apiRequest("GET", "messages/deals-with-messages");
      setConversations(res);
      
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Error updating deal status");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (error) {
        throw error;
      }

      if (paymentIntent.status === 'succeeded') {
        handlePaymentSuccess();
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (error) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center z-50">
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
    <h3 className="text-lg font-semibold mb-4">Complete Payment</h3>
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement 
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }}
        className="p-3 border rounded"
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || loading}>
          {loading ? 'Processing...' : 'Pay Now'}
        </Button>
      </div>
    </form>
  </div>
</div>

  );
};

const AllMessagesPage = () => {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [conversations, setConversations] = useState([]);
  const [paymentData, setPaymentData] = useState({
    showModal: false,
    clientSecret: '',
    dealId: null,
    amount: 0
  });

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await apiRequest("GET", "messages/deals-with-messages");
        setConversations(res);
      } catch (error) {
        toast.error(error.message || "Error fetching messages");
      }
    };

    fetchConversations();
  }, [token]);

  const initiatePayment = async (dealId, amount) => {
    try {
      const res = await apiRequest("POST", `/payment/create-payment-intent/${dealId}`);
      setPaymentData({
        showModal: true,
        clientSecret: res.clientSecret,
        dealId,
        amount
      });
    } catch (error) {
      toast.error(error.message || "Error initiating payment");
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      const res = await apiRequest("GET", "messages/deals-with-messages");
      setConversations(res);
      setPaymentData({
        showModal: false,
        clientSecret: '',
        dealId: null,
        amount: 0
      });
    } catch (error) {
      toast.error(error.message || "Error updating deals");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 relative">
      <h2 className="text-2xl font-semibold mb-4">
        <span className="text-blue-600 font-bold">
          {user.role === "seller" ? "Seller" : "Buyer"}
        </span> All Messages
      </h2>
      
      <div className="space-y-4">
        {conversations.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          conversations.map((conv) => (
            <Card key={conv.dealId}>
              <CardHeader>
                <h3 className="text-lg font-semibold">{conv.dealTitle}</h3>
                <p className="text-sm text-gray-500">Price: ₹{conv.price}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Last Message: {conv.latestMessage?.text || "No messages yet"}
                </p>
                {user.role !== "buyer" && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Buyer: {conv.buyerName} (ID: {conv.buyerId})
                  </p>
                )}
                <div className="flex justify-between items-center mt-2">
                  <Link
                    to={`/messages/${conv.dealId}`}
                    className="text-blue-500 hover:underline"
                  >
                    View Chat
                  </Link>
                  {user.role === "buyer" && (
                    <Button 
                      onClick={() => initiatePayment(conv.dealId, conv.price)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Buy Now (₹{conv.price})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {paymentData.showModal && (
        <Elements stripe={stripePromise} options={{ clientSecret: paymentData.clientSecret }}>
          <StripePaymentForm
            dealId={paymentData.dealId}
            clientSecret={paymentData.clientSecret}
            onSuccess={handlePaymentSuccess}
            setConversations={setConversations}
            onClose={() => setPaymentData(prev => ({ ...prev, showModal: false }))}
          />
        </Elements>
      )}
    </div>
  );
};

export default AllMessagesPage;