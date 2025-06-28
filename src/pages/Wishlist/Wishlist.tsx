import React, { useState } from 'react';
import { ArrowLeft, Heart, Share2, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { EmptyState, ProductCard } from '../../components/common';
import { useCart } from '../../contexts/CartContext';
import { useManualAuth } from '../../contexts/ManualAuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useToast } from '../../components/ui/toast';
import { FEATURED_PRODUCTS } from '../../data/mockData';
import { Product } from '../../types';

interface WishlistProps {
  onBack: () => void;
  onViewProduct: (productId: number) => void;
  onViewCart: () => void;
}

export const Wishlist = ({ onBack, onViewProduct, onViewCart }: WishlistProps): JSX.Element => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  const { addToCart } = useCart();
  const { requireAuth } = useManualAuth();
  const { wishlistItems, removeFromWishlist, toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const wishlistProducts = FEATURED_PRODUCTS.filter(product => 
    wishlistItems.includes(product.id)
  );

  const handleRemoveFromWishlist = (productId: number) => {
    removeFromWishlist(productId);
    setSelectedItems(prev => prev.filter(id => id !== productId));
    
    addToast({
      type: 'info',
      title: 'Đã xóa khỏi danh sách yêu thích',
      duration: 3000
    });
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

  const handleToggleFavorite = (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(productId);
    
    const product = wishlistProducts.find(p => p.id === productId);
    if (product) {
      addToast({
        type: 'info',
        title: 'Đã xóa khỏi yêu thích',
        description: `${product.name} đã được xóa khỏi danh sách yêu thích`,
        duration: 3000
      });
    }
  };

  const handleSelectItem = (productId: number) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlistProducts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistProducts.map(p => p.id));
    }
  };

  const handleAddSelectedToCart = () => {
    requireAuth(() => {
      selectedItems.forEach(productId => {
        const product = wishlistProducts.find(p => p.id === productId);
        if (product) {
          addToCart({
            id: product.id,
            name: product.name,
            price: product.priceNumber,
            image: product.image,
            category: product.category,
            inStock: true,
            maxQuantity: product.maxQuantity
          });
        }
      });

      addToast({
        type: 'success',
        title: 'Đã thêm vào giỏ hàng',
        description: `${selectedItems.length} sản phẩm đã được thêm vào giỏ hàng`,
        duration: 3000
      });

      setSelectedItems([]);
    });
  };

  const handleRemoveSelected = () => {
    selectedItems.forEach(productId => {
      removeFromWishlist(productId);
    });
    setSelectedItems([]);
    
    addToast({
      type: 'info',
      title: 'Đã xóa các sản phẩm đã chọn',
      duration: 3000
    });
  };

  const handleShareWishlist = () => {
    // Mock share functionality
    navigator.clipboard.writeText(window.location.href);
    addToast({
      type: 'success',
      title: 'Đã sao chép liên kết',
      description: 'Liên kết danh sách yêu thích đã được sao chép',
      duration: 3000
    });
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
            <h1 className="text-xl font-semibold text-gray-900 font-['Poppins',Helvetica]">
              Danh sách yêu thích ({wishlistProducts.length})
            </h1>
            <div className="ml-auto flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareWishlist}
                className="flex items-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onViewCart}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {wishlistProducts.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-24 w-24" />}
            title="Danh sách yêu thích trống"
            description="Hãy thêm những sản phẩm yêu thích để dễ dàng theo dõi và mua sắm sau này"
            actionLabel="Khám phá sản phẩm"
            onAction={onBack}
          />
        ) : (
          <>
            {/* Action Bar */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === wishlistProducts.length && wishlistProducts.length > 0}
                        onChange={handleSelectAll}
                        className="mr-2"
                      />
                      Chọn tất cả ({selectedItems.length}/{wishlistProducts.length})
                    </label>
                  </div>
                  
                  {selectedItems.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddSelectedToCart}
                        className="flex items-center"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Thêm vào giỏ ({selectedItems.length})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveSelected}
                        className="flex items-center text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa ({selectedItems.length})
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Wishlist Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistProducts.map((product) => (
                <div key={product.id} className="relative">
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(product.id)}
                      onChange={() => handleSelectItem(product.id)}
                      className="w-4 h-4 bg-white border-2 border-gray-300 rounded"
                    />
                  </div>
                  
                  <ProductCard
                    product={product}
                    onProductClick={onViewProduct}
                    onAddToCart={handleAddToCart}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={isInWishlist(product.id)}
                  />
                </div>
              ))}
            </div>

            {/* Summary Card */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">Tóm tắt danh sách yêu thích</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#49bbbd]">{wishlistProducts.length}</div>
                    <div className="text-sm text-gray-600">Sản phẩm yêu thích</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#49bbbd]">
                      {new Set(wishlistProducts.map(p => p.category)).size}
                    </div>
                    <div className="text-sm text-gray-600">Danh mục khác nhau</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#49bbbd]">
                      {Math.round(wishlistProducts.reduce((sum, p) => sum + p.rating, 0) / wishlistProducts.length * 10) / 10}
                    </div>
                    <div className="text-sm text-gray-600">Đánh giá trung bình</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};