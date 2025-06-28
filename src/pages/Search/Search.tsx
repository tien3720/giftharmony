import React, { useState, useEffect } from 'react';
import { ArrowLeft, Filter, SlidersHorizontal, Grid, List } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { ProductCard, EmptyState, LoadingSpinner } from '../../components/common';
import { useCart } from '../../contexts/CartContext';
import { useManualAuth } from '../../contexts/ManualAuthContext';
import { useToast } from '../../components/ui/toast';
import { useDebounce } from '../../hooks/useDebounce';
import { FEATURED_PRODUCTS } from '../../data/mockData';
import { CATEGORIES } from '../../constants';
import { Product } from '../../types';

interface SearchProps {
  onBack: () => void;
  onViewProduct: (productId: number) => void;
  onViewCart: () => void;
  initialQuery?: string;
}

interface FilterState {
  category: string;
  priceRange: [number, number];
  rating: number;
  sortBy: string;
}

export const Search = ({ onBack, onViewProduct, onViewCart, initialQuery = '' }: SearchProps): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    priceRange: [0, 10000000],
    rating: 0,
    sortBy: 'relevance'
  });

  const { addToCart } = useCart();
  const { requireAuth } = useManualAuth();
  const { addToast } = useToast();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    // Simulate loading products
    setIsLoading(true);
    setTimeout(() => {
      setProducts(FEATURED_PRODUCTS);
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [debouncedSearchQuery, filters, products]);

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (debouncedSearchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.priceNumber >= filters.priceRange[0] && 
      product.priceNumber <= filters.priceRange[1]
    );

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.rating);
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.priceNumber - b.priceNumber);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.priceNumber - a.priceNumber);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // relevance - keep original order
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    requireAuth(() => {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.priceNumber,
        image: product.image,
        category: product.category,
        inStock: true,
        maxQuantity: product.maxQuantity
      });

      addToast({
        type: 'success',
        title: 'Đã thêm vào giỏ hàng',
        description: `${product.name} đã được thêm vào giỏ hàng`,
        duration: 3000
      });
    });
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 10000000],
      rating: 0,
      sortBy: 'relevance'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <div className="min-h-screen bg-[#fffefc]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 max-w-2xl">
              <Input
                type="text"
                placeholder="Tìm kiếm quà tặng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Bộ lọc
              </Button>
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-['Poppins',Helvetica]">Bộ lọc</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Đặt lại
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Danh mục</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={filters.category === ''}
                        onChange={(e) => setFilters({...filters, category: e.target.value})}
                        className="mr-2"
                      />
                      Tất cả
                    </label>
                    {CATEGORIES.map((category) => (
                      <label key={category.name} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category.name}
                          checked={filters.category === category.name}
                          onChange={(e) => setFilters({...filters, category: e.target.value})}
                          className="mr-2"
                        />
                        {category.name}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Khoảng giá</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Dưới 500k', min: 0, max: 500000 },
                      { label: '500k - 1tr', min: 500000, max: 1000000 },
                      { label: '1tr - 3tr', min: 1000000, max: 3000000 },
                      { label: 'Trên 3tr', min: 3000000, max: 10000000 }
                    ].map((range) => (
                      <label key={range.label} className="flex items-center">
                        <input
                          type="radio"
                          name="priceRange"
                          checked={filters.priceRange[0] === range.min && filters.priceRange[1] === range.max}
                          onChange={() => setFilters({...filters, priceRange: [range.min, range.max]})}
                          className="mr-2"
                        />
                        {range.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Đánh giá</h3>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                      <label key={rating} className="flex items-center">
                        <input
                          type="radio"
                          name="rating"
                          checked={filters.rating === rating}
                          onChange={() => setFilters({...filters, rating})}
                          className="mr-2"
                        />
                        {rating}+ sao
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Sắp xếp theo</h3>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                  >
                    <option value="relevance">Liên quan nhất</option>
                    <option value="price-low">Giá thấp đến cao</option>
                    <option value="price-high">Giá cao đến thấp</option>
                    <option value="rating">Đánh giá cao nhất</option>
                    <option value="name">Tên A-Z</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 font-['Poppins',Helvetica]">
                  Kết quả tìm kiếm
                </h2>
                <p className="text-gray-600">
                  {isLoading ? 'Đang tìm kiếm...' : `Tìm thấy ${filteredProducts.length} sản phẩm`}
                  {searchQuery && ` cho "${searchQuery}"`}
                </p>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredProducts.length === 0 && (
              <EmptyState
                icon={<SlidersHorizontal className="h-24 w-24" />}
                title="Không tìm thấy sản phẩm"
                description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy sản phẩm phù hợp"
                actionLabel="Đặt lại bộ lọc"
                onAction={resetFilters}
              />
            )}

            {/* Products Grid/List */}
            {!isLoading && filteredProducts.length > 0 && (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  viewMode === 'grid' ? (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onProductClick={onViewProduct}
                      onAddToCart={handleAddToCart}
                    />
                  ) : (
                    <Card key={product.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                            <p className="text-sm text-gray-500">{product.category}</p>
                            <div className="flex items-center mt-1">
                              <span className="font-bold text-[#49bbbd] mr-2">{product.price}</span>
                              {product.originalPrice && (
                                <span className="text-sm text-gray-400 line-through">
                                  {product.originalPrice}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-gray-600">⭐ {product.rating}</span>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button
                              size="sm"
                              onClick={() => onViewProduct(product.id)}
                              variant="outline"
                            >
                              Xem chi tiết
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => handleAddToCart(product, e)}
                              className="bg-[#49bbbd] hover:bg-[#3a9a9c] text-white"
                            >
                              Thêm vào giỏ
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};