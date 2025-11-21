'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import { API_ROUTES } from '@/lib/constants';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  sku: string;
  stock: number;
}

export default function ProductDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(API_ROUTES.PRODUCTS.DETAIL(slug));
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
    setQuantity(1);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="skeleton h-96 rounded mb-4" />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-center text-gray-500">Product not found</p>
        </div>
      </>
    );
  }

  const priceInRupees = (product.price / 100).toFixed(2);
  const isOutOfStock = product.stock === 0;

  return (
    <>
      <Header />
      <main>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 aspect-square relative">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No image available
                  </div>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((image, i) => (
                    <div
                      key={i}
                      className="w-20 h-20 bg-gray-100 rounded cursor-pointer overflow-hidden"
                    >
                      <Image
                        src={image}
                        alt={`${product.title} ${i + 1}`}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {product.title}
              </h1>

              {product.description && (
                <p className="text-gray-600 mb-6">{product.description}</p>
              )}

              <div className="mb-6">
                <p className="text-4xl font-bold">₹{priceInRupees}</p>
                {product.sku && (
                  <p className="text-sm text-gray-500 mt-2">SKU: {product.sku}</p>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <label className="font-medium">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isOutOfStock}
                      className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      min="1"
                      max={product.stock}
                      disabled={isOutOfStock}
                      className="w-12 text-center border-x border-gray-300 py-2 disabled:opacity-50"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={isOutOfStock}
                      className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>
                {product.stock > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    {product.stock} in stock
                  </p>
                )}
                {isOutOfStock && (
                  <p className="text-sm text-red-600 mt-2">Out of stock</p>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full px-6 py-3 bg-black text-white rounded font-semibold hover:bg-gray-800 disabled:opacity-50 transition"
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <div className="mt-8 pt-8 border-t space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Shipping & Returns</h3>
                  <p className="text-sm text-gray-600">
                    Free shipping on orders over ₹500. Easy returns within 30 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
