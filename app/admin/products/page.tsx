'use client';

import { useState, useEffect } from 'react';
import { API_ROUTES } from '@/lib/constants';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  sku: string | null;
  category: string | null;
  createdAt: string;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch(API_ROUTES.PRODUCTS.CREATE, {
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(API_ROUTES.PRODUCTS.DELETE(id), {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error('Failed to delete');
      setProducts(products.filter((p) => p.id !== id));
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600 text-sm mt-1">{products.length} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium"
        >
          + Add Product
        </Link>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-6">{error}</div>}

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title, SKU, or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        {filteredProducts.length > 0 ? (
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-sm">Title</th>
                <th className="text-left px-6 py-3 font-semibold text-sm">SKU</th>
                <th className="text-left px-6 py-3 font-semibold text-sm">Category</th>
                <th className="text-right px-6 py-3 font-semibold text-sm">Price</th>
                <th className="text-center px-6 py-3 font-semibold text-sm">Stock</th>
                <th className="text-left px-6 py-3 font-semibold text-sm">Created</th>
                <th className="text-center px-6 py-3 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{product.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.sku || '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    {product.category ? (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {product.category}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-right">₹{(product.price / 100).toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        product.stock > 5
                          ? 'bg-green-100 text-green-800'
                          : product.stock > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteProduct(product.id, product.title)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'No products match your search' : 'No products found'}
          </div>
        )}
      </div>
    </>
  );
}
