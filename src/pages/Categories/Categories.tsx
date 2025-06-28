import React, { useState } from 'react';
import { ArrowLeft, Grid, List, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ProductCard, EmptyState, LoadingSpinner } from '../../components/common';
import { useCart } from '../../contexts/CartContext';
import { useManualAuth } from '../../contexts/ManualAuthContext';
import { useToast } from '../../components/ui/toast';
import { FEATURED_PRODUCTS } from '../../data/mockData';
import { CATEGORIES } from '../../constants';
import { Product } from '../../types';

interface CategoriesProps {
  onBack: () => void;
  onViewProduct: (productId: number) => void;
  onViewCart: () => void;
  selectedCategory?: string;
}

export const Categories = ({ onBack, onViewProduct, onViewCart, selectedCategory }: CategoriesProps): JSX.Element => {
  const [activeCategory, setActiveCategory] = useState(selectedCategory || CATEGORIES[0].name);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [isLoading, setIsLoading] = useState(false);

  const { addToCart } = useCart();
  const { requireAuth } = useManualAuth();
  const { addToast } = useToast();

  // Filter products by category
  const categoryProducts = FEATURED_PRODUCTS.filter(product => 
    product.category === activeCategory
  );

  // Sort products
  const sortedProducts = [...categoryProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.priceNumber - b.priceNumber;
      case 'price-high':
        return b.priceNumber - a.priceNumber;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

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

  const handleCategoryChange = (categoryName: string) => {
    setIsLoading(true);
    setActiveCategory(categoryName);
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const selectedCategoryData = CATEGORIES.find(cat => cat.name === activeCategory);

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
            <h1 className="text-xl font-semibold text-gray-900 font-['Poppins',Helvetica]">
              Danh mục sản phẩm
            </h1>
            <div className="ml-auto flex items-center space-x-2">
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
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">Danh mục</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryChange(category.name)}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      activeCategory === category.name
                        ? 'bg-[#49bbbd] text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl mr-3">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica] flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Sắp xếp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                >
                  <option value="popular">Phổ biến nhất</option>
                  <option value="price-low">Giá thấp đến cao</option>
                  <option value="price-high">Giá cao đến thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="name">Tên A-Z</option>
                </select>
              </CardContent>
            </Card>
          </div>

          {/* Products */}
          <div className="lg:col-span-3">
            {/* Category Header */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                {selectedCategoryData && (
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mr-4 ${selectedCategoryData.color}`}>
                    <span className="text-3xl">{selectedCategoryData.icon}</span>
                  </div>
                )}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 font-['Poppins',Helvetica]">
                    {activeCategory}
                  </h2>
                  <p className="text-gray-600">
                    {isLoading ? 'Đang tải...' : `${sortedProducts.length} sản phẩm`}
                  </p>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && sortedProducts.length === 0 && (
              <EmptyState
                icon={<SlidersHorizontal className="h-24 w-24" />}
                title="Chưa có sản phẩm"
                description={`Danh mục ${activeCategory} hiện chưa có sản phẩm nào. Hãy thử danh mục khác!`}
                actionLabel="Xem danh mục khác"
                onAction={() => handleCategoryChange(CATEGORIES[0].name)}
              />
            )}

            {/* Products Grid/List */}
            {!isLoading && sortedProducts.length > 0 && (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {sortedProducts.map((product) => (
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