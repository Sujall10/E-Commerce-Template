import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { ROUTES, API_ROUTES } from '@/lib/constants';

export const revalidate = 60;

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  images: string[];
}

async function getProducts() {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${API_ROUTES.PRODUCTS.LIST}?limit=8`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gray-50 py-12 md:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Premium Products, Delivered Fast
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                Discover our curated collection of premium goods. From fashion to electronics,
                find everything you need at competitive prices.
              </p>
              <Link
                href={ROUTES.PRODUCTS}
                className="inline-block px-8 py-3 bg-black text-white rounded hover:bg-gray-800 transition"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 md:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.length > 0 ? (
                products.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500">
                  No products available
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-gray-50 py-12 md:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
                <p className="text-gray-600">On orders over ₹500</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Secure Payment</h3>
                <p className="text-gray-600">Razorpay powered transactions</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Easy Returns</h3>
                <p className="text-gray-600">30-day return policy</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
