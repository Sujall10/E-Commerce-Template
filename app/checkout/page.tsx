'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { API_ROUTES } from '@/lib/constants';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      // Check for JWT token from OTP auth
      const jwtToken = localStorage.getItem('authToken');
      const userEmailFromStorage = localStorage.getItem('userEmail');

      // Check for NextAuth session or JWT token
      if (session?.user?.email || jwtToken) {
        setIsAuthenticated(true);
        setUserEmail(session?.user?.email || userEmailFromStorage || '');
        setEmail(session?.user?.email || userEmailFromStorage || '');
      } else {
        setIsAuthenticated(false);
      }
      setAuthLoading(false);
    };

    if (status !== 'loading') {
      checkAuth();
    }
  }, [session, status]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);

    // Load cart from localStorage
    const stored = localStorage.getItem('cart');
    if (!stored) {
      router.push('/products');
      return;
    }
    setCart(JSON.parse(stored));
  }, [router]);

  if (authLoading || status === 'loading') {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </>
    );
  }

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg border border-gray-200 text-center">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to complete your purchase.</p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="w-full px-4 py-3 bg-black text-white rounded font-semibold hover:bg-gray-800 transition mb-3"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/products')}
              className="w-full px-4 py-3 bg-gray-200 text-black rounded font-semibold hover:bg-gray-300 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!address || !city || !pincode || !phone) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      // Create order on backend
      const orderRes = await fetch(API_ROUTES.RAZORPAY.CREATE_ORDER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          items: cart,
        }),
      });

      if (!orderRes.ok) throw new Error('Failed to create order');
      const order = await orderRes.json();

      // Razorpay checkout
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: 'ShopHub',
        description: 'Order from ShopHub',
        customer_notify: 1,
        prefill: {
          name: session?.user?.name || 'Customer',
          email: email,
          contact: phone,
        },
        handler: function (_response: any) {
          // Payment successful
          alert('Payment successful!');
          localStorage.removeItem('cart');
          router.push(`/orders/${order.orderId}`);
        },
        theme: {
          color: '#000000',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      alert(error.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded flex items-center gap-3">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
          <p className="text-green-700">
            <span className="font-semibold">Signed in as:</span> {userEmail}
          </p>
        </div>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91..."
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6 border-b border-gray-200 pb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.title} x {item.quantity}
                  </span>
                  <span>₹{((item.price * item.quantity) / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{(total / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹0</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{(total / 100).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full px-4 py-3 bg-black text-white rounded font-semibold hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
