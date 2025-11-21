'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  sku: string | null;
  stock: number;
  category: string | null;
  images: string[];
}

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    sku: '',
    stock: '',
    category: '',
    images: '',
  });

  function getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  useEffect(() => {
    loadProduct();
  }, []);

  async function loadProduct() {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error('Failed to load product');
      const product: Product = await res.json();

      setFormData({
        title: product.title,
        slug: product.slug,
        description: product.description || '',
        price: (product.price / 100).toString(),
        sku: product.sku || '',
        stock: product.stock.toString(),
        category: product.category || '',
        images: product.images.join('\n'),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!formData.title || !formData.slug || !formData.price || !formData.stock) {
        throw new Error('Please fill in all required fields');
      }

      const imageArray = formData.images
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url);

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          price: Math.round(parseFloat(formData.price) * 100),
          images: imageArray,
          sku: formData.sku,
          stock: parseInt(formData.stock),
          category: formData.category,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update product');

      router.push(ROUTES.ADMIN_PRODUCTS);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <>
      <div className="mb-6">
        <Link href={ROUTES.ADMIN_PRODUCTS} className="text-blue-600 hover:underline">
          ← Back to Products
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

        {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Product Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Premium Laptop"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-2">Slug (URL friendly) *</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="e.g., premium-laptop"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Product description..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 50000"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium mb-2">SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g., LAPTOP-001"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="e.g., 10"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Home">Home & Garden</option>
              <option value="Sports">Sports</option>
              <option value="Books">Books</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2">Image URLs</label>
            <textarea
              name="images"
              value={formData.images}
              onChange={handleChange}
              placeholder="One image URL per line"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href={ROUTES.ADMIN_PRODUCTS}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-center transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
