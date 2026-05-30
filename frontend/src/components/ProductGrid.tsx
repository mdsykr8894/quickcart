import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onAddToCart: (productId: string) => Promise<void>;
  emptyMessage?: string;
  emptyTitle?: string;
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  onAddToCart,
  emptyMessage = 'We could not find any active catalogue items matching your description.',
  emptyTitle = 'No Products Found',
  className
}) => {
  if (isLoading) {
    return <LoadingState message="Resolving active product catalogue..." className="py-16" />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        icon={<Package className="w-12 h-12 text-gray-300 stroke-[1.5]" />}
        className="py-16"
      />
    );
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", className)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
