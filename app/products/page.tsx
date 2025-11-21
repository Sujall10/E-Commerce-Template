import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { API_ROUTES } from '@/lib/constants';

export const revalidate = 60;

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  images: string[];
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    pages: number;
    current: number;
    limit: number;
  };
}

async function getProducts(page: number = 1) {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${API_ROUTES.PRODUCTS.LIST}?page=${page}&limit=12`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error('Failed to fetch');
    return (await res.json()) as ProductsResponse;
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      products: [],
      pagination: { total: 0, pages: 0, current: 1, limit: 12 },
    };
  }
}

export default async function Products() {
  const { products, pagination } = await getProducts(1);

  return (
    <>
      <Header />
      <main>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">All Products</h1>
            <p className="text-gray-600">
              {pagination.total} products available
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                No products found
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (page) => (
                  <a
                    key={page}
                    href={`/products?page=${page}`}
                    className={`px-4 py-2 rounded border transition ${
                      page === pagination.current
                        ? 'bg-black text-white border-black'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {page}
                  </a>
                )
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
