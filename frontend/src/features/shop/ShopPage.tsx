import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/useAuth';
import { productApi } from '../../services/productApi';
import { cartApi } from '../../services/cartApi';
import { Product, Category } from '../../types';
import ProductGrid from '../../components/ProductGrid';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

import PageHeader from '../../components/PageHeader';

const ShopPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync category param from URL
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setPage(1);
  }, [categoryParam]);

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const res = await productApi.getCategories();
        if (res.success && res.data) setCategories(res.data);
      } catch {
        console.error('Failed to load categories');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products on param change
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      const res = await productApi.getProducts({
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        sort: sortBy || undefined,
        page,
        limit: 12,
      });
      if (res.success && res.data) {
        setProducts(res.data.products);
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotalCount(res.data.pagination.total || 0);
      }
    } catch {
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [searchQuery, selectedCategory, sortBy, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await cartApi.addCartItem({ productId, quantity: 1 });
    } catch (err: any) {
      alert(err?.message || 'Could not add to cart.');
    }
  };

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    setPage(1);
  };

  return (
    <div className="bg-slate-50 py-14">
      <div className="max-w-[1180px] mx-auto px-6 lg:px-10">

        {/* ─── Page Header ─── */}
        <PageHeader
          label="CATALOG"
          title="Shop All Products"
          subtitle={isLoadingProducts ? 'Loading...' : `${totalCount} product${totalCount !== 1 ? 's' : ''} available`}
        />

        {/* ─── Search + Sort bar ─── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm mt-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 placeholder:text-gray-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.75} />
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10">

        {/* ─── Sidebar: Categories ─── */}
        <aside className="w-full md:w-52 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm md:sticky top-24">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Categories</h2>
            {isLoadingCategories ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0">
                <button
                  onClick={() => handleCategorySelect('')}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-left w-full whitespace-nowrap transition-colors',
                    selectedCategory === ''
                      ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/20'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-left w-full whitespace-nowrap transition-colors',
                      selectedCategory === cat.slug
                        ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/20'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </nav>
            )}
          </div>
        </aside>

        <div className="flex-1 space-y-6">
          <ProductGrid
            products={products}
            isLoading={isLoadingProducts}
            onAddToCart={handleAddToCart}
            emptyTitle="No products found"
            emptyMessage="Try adjusting your search or selected category."
            className="lg:grid-cols-3"
          />

          {/* ─── Pagination ─── */}
          {!isLoadingProducts && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="gap-1 font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={cn(
                        'w-8 h-8 rounded-md text-xs font-semibold transition-colors',
                        page === pageNum
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <span className="text-xs text-gray-400 px-1">...</span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="gap-1 font-medium"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default ShopPage;
