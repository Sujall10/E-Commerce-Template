'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  image: string | null;
  createdAt: string;
  _count: {
    orders: number;
  };
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await fetch('/api/admin/users', {
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateUserRole(userId: string, newRole: 'USER' | 'ADMIN') {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      const updated = await res.json();
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)));
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Users</h1>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Role</th>
              <th className="text-left px-4 py-2">Orders</th>
              <th className="text-left px-4 py-2">Joined</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{user.email}</td>
                <td className="px-4 py-2">{user.name || '—'}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">{user._count.orders}</td>
                <td className="px-4 py-2 text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  {user.role === 'USER' ? (
                    <button
                      onClick={() => updateUserRole(user.id, 'ADMIN')}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Make Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => updateUserRole(user.id, 'USER')}
                      className="text-orange-600 hover:underline text-sm"
                    >
                      Remove Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">No users found</div>
        )}
      </div>
    </>
  );
}
