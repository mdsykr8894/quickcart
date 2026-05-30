import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '../utils/formatCurrency';

const getFallbackImageUrl = (product: Product) => {
  const norm = (product.name + ' ' + (product.slug || '')).toLowerCase();
  
  if (norm.includes('laptop') || norm.includes('macbook') || norm.includes('computer') || norm.includes('notebook')) {
    return 'https://images.unsplash.com/photo-1496181130207-89941d39947b?auto=format&fit=crop&w=400&q=80'; // Laptop
  }
  if (norm.includes('headphone') || norm.includes('earbud') || norm.includes('audio') || norm.includes('speaker') || norm.includes('sound')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'; // Audio
  }
  if (norm.includes('game') || norm.includes('controller') || norm.includes('play') || norm.includes('console') || norm.includes('switch') || norm.includes('xbox') || norm.includes('ps5')) {
    return 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=400&q=80'; // Gaming
  }
  if (norm.includes('phone') || norm.includes('mobile') || norm.includes('iphone') || norm.includes('android')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80'; // Mobile
  }
  if (norm.includes('smart') || norm.includes('bulb') || norm.includes('light') || norm.includes('home') || norm.includes('hub')) {
    return 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&q=80'; // Smart home
  }
  if (norm.includes('keyboard') || norm.includes('mouse') || norm.includes('accessory') || norm.includes('cable') || norm.includes('desk') || norm.includes('pad') || norm.includes('watch') || norm.includes('charge')) {
    return 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=400&q=80'; // Accessories
  }
  
  // Default clean product/tech image
  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
};

const resolveProductImageUrl = (url?: string | null, product?: Product) => {
  if (!url) return getFallbackImageUrl(product!);
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const getApiBaseUrl = () => {
    if ((import.meta as any).env.VITE_API_BASE_URL) {
      return (import.meta as any).env.VITE_API_BASE_URL;
    }
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `http://${hostname}:5001/api`;
  };
  const baseUrl = getApiBaseUrl();
  const origin = baseUrl.replace(/\/api\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${origin}${cleanPath}`;
};

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => Promise<void>;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isButtonDisabled = isOutOfStock || !product.isActive || isAdding || addSuccess;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isButtonDisabled) return;
    setIsAdding(true);
    try {
      await onAddToCart(product.id);
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 1200);
    } catch (err) {
      // Error handled by parent onAddToCart call
    } finally {
      setIsAdding(false);
    }
  };

  const StockIndicator = () => {
    if (!product.isActive) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
          <XCircle className="w-3 h-3" /> Suspended
        </span>
      );
    }
    if (isOutOfStock) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
          <XCircle className="w-3 h-3" /> Out of Stock
        </span>
      );
    }
    if (product.stock <= 10) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3" /> Only {product.stock} left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> In Stock
      </span>
    );
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col h-full">

      {/* ─── Image ─── */}
      <Link
        to={`/shop/${product.slug}`}
        className="block relative w-full h-44 bg-gray-50 overflow-hidden shrink-0"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={resolveProductImageUrl(product.imageUrl, product)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
            onError={(e) => {
              const fallback = getFallbackImageUrl(product);
              if (e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              } else {
                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%2394a3b8">No Image</text></svg>';
              }
            }}
          />
        </div>

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.03] transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700 shadow-sm">
              <Eye className="w-3.5 h-3.5" /> Quick view
            </div>
          </div>
        </div>
      </Link>

      {/* ─── Content ─── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1 space-y-1.5">
          <StockIndicator />

          <Link
            to={`/shop/${product.slug}`}
            className="block text-sm font-bold text-gray-900 hover:text-orange-600 transition-colors line-clamp-2 leading-snug mt-1"
          >
            {product.name}
          </Link>

          {product.description && (
            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* ─── Price + Actions ─── */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2.5">
          <span className="text-sm font-extrabold text-gray-900 shrink-0">
            {formatCurrency(product.price)}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            <Link to={`/shop/${product.slug}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-[10.5px] font-medium"
              >
                Details
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isButtonDisabled}
              className={cn(
                'h-8 text-[10.5px] font-semibold gap-1 transition-all shrink-0 w-[72px] justify-center px-1',
                addSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              )}
            >
              {isAdding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : addSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <ShoppingCart className="w-3.5 h-3.5" strokeWidth={2} />
              )}
              <span>{isAdding ? 'Adding' : addSuccess ? 'Added' : 'Add'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
