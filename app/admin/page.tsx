'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
  totalUsers: number;
  lowStockProducts: number;
  ordersByStatus: Record<string, number>;
  recentOrders: Array<{
    id: string;
    userEmail: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error('Failed to load stats');
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );

  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>;
  if (!stats) return <div className="text-center py-8 text-gray-500">No data available</div>;

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <p className="text-blue-600 text-sm font-medium mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-blue-900">₹{(stats.totalRevenue / 100).toFixed(0)}</p>
          <p className="text-xs text-blue-600 mt-2">From all orders</p>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <p className="text-green-600 text-sm font-medium mb-2">Total Orders</p>
          <p className="text-3xl font-bold text-green-900">{stats.totalOrders}</p>
          <p className="text-xs text-green-600 mt-2">{stats.pendingOrders} pending</p>
        </div>

        {/* Total Products */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <p className="text-purple-600 text-sm font-medium mb-2">Total Products</p>
          <p className="text-3xl font-bold text-purple-900">{stats.totalProducts}</p>
          <p className="text-xs text-purple-600 mt-2">{stats.lowStockProducts} low stock</p>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <p className="text-orange-600 text-sm font-medium mb-2">Total Users</p>
          <p className="text-3xl font-bold text-orange-900">{stats.totalUsers}</p>
          <p className="text-xs text-orange-600 mt-2">Registered users</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
          <p className="text-red-600 text-sm font-medium mb-2">Action Required</p>
          <p className="text-3xl font-bold text-red-900">{stats.pendingOrders}</p>
          <p className="text-xs text-red-600 mt-2">Pending orders</p>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">Order Status Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(stats.ordersByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{status}</span>
                <span className="inline-block px-3 py-1 bg-gray-100 rounded text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              href="/admin/products/new"
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-center text-sm"
            >
              Add New Product
            </Link>
            <Link
              href="/admin/products"
              className="block w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-center text-sm"
            >
              Manage Products
            </Link>
            <Link
              href="/admin/orders"
              className="block w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition text-center text-sm"
            >
              View Orders
            </Link>
            <Link
              href="/admin/users"
              className="block w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-center text-sm"
            >
              Manage Users
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Database: Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">API: Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Auth: Configured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-lg mb-4">Recent Orders</h3>
        {stats.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-2">Customer</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-center py-2">Status</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-gray-600">{order.userEmail}</td>
                    <td className="text-right py-3 font-medium">₹{(order.amount / 100).toFixed(2)}</td>
                    <td className="text-center py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          order.status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No recent orders</p>
        )}
      </div>
    </>
  );
}
