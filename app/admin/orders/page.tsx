'use client';

import { useState, useEffect } from 'react';
import { API_ROUTES } from '@/lib/constants';

interface Order {
  id: string;
  razorpayOrderId: string;
  amount: number;
  status: string;
  user: { email: string; name: string };
  createdAt: string;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await fetch(API_ROUTES.ORDERS.LIST, {
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Orders</h1>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Order ID</th>
              <th className="text-left px-4 py-2">Customer</th>
              <th className="text-left px-4 py-2">Amount</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 text-sm font-mono">{order.razorpayOrderId?.slice(0, 12)}</td>
                <td className="px-4 py-2">
                  <div className="text-sm">
                    <p className="font-medium">{order.user.name}</p>
                    <p className="text-gray-500">{order.user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-2">₹{(order.amount / 100).toFixed(2)}</td>
                <td className="px-4 py-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="FAILED">Failed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
