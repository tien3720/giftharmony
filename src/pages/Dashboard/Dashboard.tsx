import React, { useState, useEffect } from 'react';
import { Gift, Star, TrendingUp, Calendar, MapPin, User, Package, Heart, Settings, Search, Grid, Bell } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Header } from '../../components/layout';
import { ProductCard, LoadingSpinner } from '../../components/common';
import { useCart } from '../../contexts/CartContext';
import { useManualAuth } from '../../contexts/ManualAuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useToast } from '../../components/ui/toast';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { productService } from '../../services/products';

interface DashboardProps {
  onViewProduct?: (productId: number) => void;
  onViewCart?: () => void;
  onViewWishlist?: () => void;
  onViewNotifications?: () => void;
  onLogout?: () => void;
  onViewProfile?: () => void;
  onViewSearch?: (query?: string) => void;
  onViewCategories?: (category?: string) => void;
  onViewEvents?: () => void;
  onViewSettings?: () => void;
  onViewOrderHistory?: () => void;
}

export const Dashboard = ({ 
  onViewProduct, 
  onViewCart, 
  onViewWishlist,
  onViewNotifications,
  onLogout, 
  onViewProfile,
  onViewSearch,
  onViewCategories,
  onViewEvents,
  onViewSettings,
  onViewOrderHistory
}: DashboardProps): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  
  const { getTotalItems, addToCart } = useCart();
  const { user, logout, requireAuth } = useManualAuth();
  const { toggleWishlist, isInWishlist, getWishlistCount } = useWishlist();
  const { addToast } = useToast();
  const { categories } = useCategories();

  // Load featured products
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const products = await productService.getFeaturedProducts();
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Error loading featured products:', error);
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  const handleProductClick = (productId: string) => {
    if (onViewProduct) {
      onViewProduct(parseInt(productId));
    }
  };

  const handleCartClick = () => {
    if (onViewCart) {
      onViewCart();
    }
  };

  const handleWishlistClick = () => {
    if (onViewWishlist) {
      onViewWishlist();
    }
  };

  const handleNotificationsClick = () => {
    if (onViewNotifications) {
      onViewNotifications();
    }
  };

  const handleSearchSubmit = () => {
    if (onViewSearch) {
      onViewSearch(searchQuery);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    if (onViewCategories) {
      onViewCategories(categoryName);
    }
  };

  const handleQuickAddToCart = async (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    requireAuth(async () => {
      try {
        await addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.original_price,
          image: product.images[0] || '',
          category: product.category?.name || '',
          inStock: product.stock_count > 0,
          maxQuantity: product.max_quantity
        });

        addToast({
          type: 'success',
          title: 'Đã thêm vào giỏ hàng',
          description: `${product.name} đã được thêm vào giỏ hàng`,
          duration: 3000
        });
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Lỗi',
          description: 'Không thể thêm sản phẩm vào giỏ hàng',
          duration: 3000
        });
      }
    });
  };

  const handleToggleFavorite = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    requireAuth(async () => {
      try {
        const wasInWishlist = isInWishlist(productId);
        await toggleWishlist(productId);
        const product = featuredProducts.find(p => p.id === productId);
        
        if (wasInWishlist) {
          addToast({
            type: 'info',
            title: 'Đã xóa khỏi yêu thích',
            description: `${product?.name} đã được xóa khỏi danh sách yêu thích`,
            duration: 3000
          });
        } else {
          addToast({
            type: 'success',
            title: 'Đã thêm vào yêu thích',
            description: `${product?.name} đã được thêm vào danh sách yêu thích`,
            duration: 3000
          });
        }
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Lỗi',
          description: 'Không thể cập nhật danh sách yêu thích',
          duration: 3000
        });
      }
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Lỗi đăng xuất',
        description: 'Có lỗi xảy ra khi đăng xuất',
        duration: 3000
      });
    }
  };

  const handleProfileClick = () => {
    if (onViewProfile) {
      onViewProfile();
    }
  };

  const stats = [
    { label: 'Điểm tích lũy', value: user?.points?.toLocaleString() || '0', icon: <Star className="h-8 w-8 opacity-80" />, color: 'from-[#49bbbd] to-[#3a9a9c]' },
    { label: 'Hạng thành viên', value: user?.level || 'New Member', icon: <Gift className="h-8 w-8 opacity-80" />, color: 'from-[#ccb3ac] to-[#bba39c]' },
    { label: 'Quà đã tặng', value: '24', icon: <Heart className="h-8 w-8" />, color: 'bg-white', textColor: 'text-red-500' },
    { label: 'Sự kiện sắp tới', value: '3', icon: <Calendar className="h-8 w-8" />, color: 'bg-white', textColor: 'text-blue-500' }
  ];

  const convertToLegacyProduct = (product: any) => ({
    id: parseInt(product.id),
    name: product.name,
    price: new Intl.NumberFormat('vi-VN').format(product.price) + 'đ',
    priceNumber: product.price,
    originalPrice: product.original_price ? new Intl.NumberFormat('vi-VN').format(product.original_price) + 'đ' : undefined,
    image: product.images[0] || '',
    rating: product.rating,
    category: product.category?.name || '',
    isPopular: product.is_popular,
    isTrending: product.is_trending,
    maxQuantity: product.max_quantity
  });

  return (
    <div className="min-h-screen bg-[#fffefc]">
      <Header
        user={user}
        cartItemCount={getTotalItems()}
        wishlistCount={getWishlistCount()}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCartClick={handleCartClick}
        onWishlistClick={handleWishlistClick}
        onNotificationsClick={handleNotificationsClick}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 font-['Poppins',Helvetica]">
            Chào mừng trở lại, {user?.full_name?.split(' ').pop() || 'bạn'}! 👋
          </h2>
          <p className="text-gray-600">
            Hôm nay bạn muốn tìm món quà gì đặc biệt?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className={`${stat.color ? `bg-gradient-to-r ${stat.color}` : stat.color} ${stat.color?.includes('from-') ? 'text-white' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${stat.color?.includes('from-') ? 'opacity-90' : 'text-gray-600'}`}>{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color?.includes('from-') ? '' : 'text-gray-900'}`}>{stat.value}</p>
                  </div>
                  <div className={stat.textColor || ''}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">Danh mục quà tặng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant="ghost"
                      onClick={() => handleCategoryClick(category.name)}
                      className={`h-20 flex flex-col items-center justify-center space-y-2 ${category.color} hover:scale-105 transition-transform`}
                    >
                      <span className="text-2xl">{category.icon}</span>
                      <span className="text-xs font-medium">{category.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Gifts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-['Poppins',Helvetica]">Quà tặng nổi bật</CardTitle>
                <Button variant="outline" size="sm" onClick={() => onViewCategories?.()}>
                  Xem tất cả
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingFeatured ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredProducts.slice(0, 4).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={convertToLegacyProduct(product)}
                        onProductClick={handleProductClick}
                        onAddToCart={handleQuickAddToCart}
                        onToggleFavorite={handleToggleFavorite}
                        isFavorite={isInWishlist(product.id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica] flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Sự kiện sắp tới
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: 1, title: 'Sinh nhật mẹ', date: '15/02/2025', type: 'Sinh nhật', daysLeft: 12 },
                  { id: 2, title: 'Valentine', date: '14/02/2025', type: 'Lễ tình nhân', daysLeft: 11 },
                  { id: 3, title: 'Kỷ niệm ngày cưới', date: '20/03/2025', type: 'Kỷ niệm', daysLeft: 45 }
                ].map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-500">{event.date}</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {event.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#49bbbd]">
                        {event.daysLeft} ngày
                      </p>
                      <p className="text-xs text-gray-500">còn lại</p>
                    </div>
                  </div>
                ))}
                <Button 
                  className="w-full bg-[#ccb3ac] hover:bg-[#bba39c] text-black"
                  onClick={onViewEvents}
                >
                  Quản lý sự kiện
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onViewSearch?.()}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Tìm kiếm quà tặng
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onViewCategories?.()}
                >
                  <Grid className="h-4 w-4 mr-2" />
                  Xem danh mục
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={onViewOrderHistory}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Lịch sử đơn hàng
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleProfileClick}
                >
                  <User className="h-4 w-4 mr-2" />
                  Cập nhật hồ sơ
                </Button>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">Gợi ý cho bạn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                    <h4 className="font-medium text-gray-900 mb-1">Valentine sắp đến!</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Khám phá bộ sưu tập quà tặng lãng mạn
                    </p>
                    <Button 
                      size="sm" 
                      className="bg-pink-500 hover:bg-pink-600 text-white"
                      onClick={() => onViewCategories?.('Hoa tươi')}
                    >
                      Xem ngay
                    </Button>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-gray-900 mb-1">Ưu đãi đặc biệt</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Giảm 20% cho đơn hàng đầu tiên
                    </p>
                    <Button 
                      size="sm" 
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => onViewCategories?.()}
                    >
                      Sử dụng ngay
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};