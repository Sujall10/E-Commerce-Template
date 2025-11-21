'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <a href="/products" className="text-blue-600 hover:underline">
              Continue shopping
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="border border-gray-200 rounded">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                      {item.images?.[0] && (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        ₹{(item.price / 100).toFixed(2)} each
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 border border-gray-300 rounded"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, parseInt(e.target.value) || 1)
                          }
                          className="w-12 text-center border border-gray-300 rounded py-1"
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 border border-gray-300 rounded"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto text-red-600 hover:underline text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ₹{((item.price * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 h-fit">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
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
                className="w-full px-4 py-3 bg-black text-white rounded font-semibold hover:bg-gray-800 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
