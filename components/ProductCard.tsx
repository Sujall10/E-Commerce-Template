'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/lib/constants';

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  images: string[];
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const priceInRupees = (product.price / 100).toFixed(2);

  return (
    <Link href={ROUTES.PRODUCT_DETAIL(product.slug)}>
      <div className="group cursor-pointer animate-fade-in">
        <div className="relative overflow-hidden bg-gray-100 rounded-lg mb-4 aspect-square">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
        <h3 className="font-semibold text-sm line-clamp-2 mb-2">
          {product.title}
        </h3>
        <p className="text-lg font-bold">₹{priceInRupees}</p>
      </div>
    </Link>
  );
}
