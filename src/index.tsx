import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Landing } from "./pages/Landing";
import { Login } from "./screens/Login";
import { Dashboard } from "./pages/Dashboard";
import { ProductDetail } from "./screens/ProductDetail";
import { Cart } from "./screens/Cart";
import { Checkout } from "./screens/Checkout";
import { OrderSuccess } from "./screens/OrderSuccess";
import { Profile } from "./screens/Profile";
import { Search } from "./pages/Search";
import { Wishlist } from "./pages/Wishlist";
import { Notifications } from "./pages/Notifications";
import { OrderHistory } from "./pages/OrderHistory";
import { Categories } from "./pages/Categories";
import { Events } from "./pages/Events";
import { Settings } from "./pages/Settings";
import { 
  AdminDashboard, 
  ProductManagement, 
  OrderManagement, 
  UserManagement, 
  Analytics,
  InventoryManagement,
  PromotionManagement,
  ReviewManagement
} from "./pages/Admin";
import { CartProvider } from "./contexts/CartContext";
import { ManualAuthProvider } from "./contexts/ManualAuthContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { ToastProvider } from "./components/ui/toast";
import { Screen } from "./types";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  const handleRequireLogin = () => {
    setCurrentScreen('login');
  };

  const handleLoginSuccess = () => {
    setCurrentScreen('dashboard');
  };

  const handleAdminLogin = () => {
    setIsAdminMode(true);
    setCurrentScreen('admin-dashboard');
  };

  const handleLogout = () => {
    setIsAdminMode(false);
    setCurrentScreen('landing');
  };

  const handleGoToLogin = () => {
    setCurrentScreen('login');
  };

  const handleGoToRegister = () => {
    setCurrentScreen('register');
  };

  const handleViewProduct = (productId: number) => {
    setSelectedProductId(productId);
    setCurrentScreen('product-detail');
  };

  const handleBackToDashboard = () => {
    if (isAdminMode) {
      setCurrentScreen('admin-dashboard');
    } else {
      setCurrentScreen('dashboard');
    }
  };

  const handleViewCart = () => {
    setCurrentScreen('cart');
  };

  const handleCheckout = () => {
    setCurrentScreen('checkout');
  };

  const handleOrderComplete = () => {
    setCurrentScreen('order-success');
  };

  const handleViewProfile = () => {
    setCurrentScreen('profile');
  };

  const handleViewSearch = (query?: string) => {
    if (query) setSearchQuery(query);
    setCurrentScreen('search');
  };

  const handleViewWishlist = () => {
    setCurrentScreen('wishlist');
  };

  const handleViewNotifications = () => {
    setCurrentScreen('notifications');
  };

  const handleViewOrderHistory = () => {
    setCurrentScreen('order-history');
  };

  const handleViewCategories = (category?: string) => {
    if (category) setSelectedCategory(category);
    setCurrentScreen('categories');
  };

  const handleViewEvents = () => {
    setCurrentScreen('events');
  };

  const handleViewSettings = () => {
    setCurrentScreen('settings');
  };

  const handleViewOrderDetail = (orderId: string) => {
    // For now, just show a toast - in a real app this would navigate to order detail
    console.log('View order detail:', orderId);
  };

  // Admin handlers
  const handleViewProducts = () => {
    setCurrentScreen('admin-products');
  };

  const handleViewOrders = () => {
    setCurrentScreen('admin-orders');
  };

  const handleViewUsers = () => {
    setCurrentScreen('admin-users');
  };

  const handleViewAnalytics = () => {
    setCurrentScreen('admin-analytics');
  };

  const handleViewInventory = () => {
    setCurrentScreen('admin-inventory');
  };

  const handleViewPromotions = () => {
    setCurrentScreen('admin-promotions');
  };

  const handleViewReviews = () => {
    setCurrentScreen('admin-reviews');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return (
          <Landing 
            onLogin={handleGoToLogin}
            onRegister={handleGoToRegister}
          />
        );
      case 'login':
        return (
          <Login 
            onLoginSuccess={handleLoginSuccess}
            onAdminLogin={handleAdminLogin}
            onBackToLanding={() => setCurrentScreen('landing')}
            defaultTab="login"
          />
        );
      case 'register':
        return (
          <Login 
            onLoginSuccess={handleLoginSuccess}
            onAdminLogin={handleAdminLogin}
            onBackToLanding={() => setCurrentScreen('landing')}
            defaultTab="register"
          />
        );
      case 'dashboard':
        return (
          <Dashboard 
            onViewProduct={handleViewProduct}
            onViewCart={handleViewCart}
            onViewWishlist={handleViewWishlist}
            onViewNotifications={handleViewNotifications}
            onLogout={handleLogout}
            onViewProfile={handleViewProfile}
            onViewSearch={handleViewSearch}
            onViewCategories={handleViewCategories}
            onViewEvents={handleViewEvents}
            onViewSettings={handleViewSettings}
            onViewOrderHistory={handleViewOrderHistory}
          />
        );
      case 'product-detail':
        return (
          <ProductDetail
            productId={selectedProductId}
            onBack={handleBackToDashboard}
            onViewCart={handleViewCart}
          />
        );
      case 'cart':
        return (
          <Cart
            onBack={handleBackToDashboard}
            onCheckout={handleCheckout}
          />
        );
      case 'checkout':
        return (
          <Checkout
            onBack={handleViewCart}
            onOrderComplete={handleOrderComplete}
          />
        );
      case 'order-success':
        return (
          <OrderSuccess
            onBackToDashboard={handleBackToDashboard}
            onViewOrders={handleViewOrderHistory}
          />
        );
      case 'profile':
        return (
          <Profile
            onBack={handleBackToDashboard}
            onViewSettings={handleViewSettings}
            onViewOrderHistory={handleViewOrderHistory}
            onViewWishlist={handleViewWishlist}
          />
        );
      case 'search':
        return (
          <Search
            onBack={handleBackToDashboard}
            onViewProduct={handleViewProduct}
            onViewCart={handleViewCart}
            initialQuery={searchQuery}
          />
        );
      case 'wishlist':
        return (
          <Wishlist
            onBack={handleBackToDashboard}
            onViewProduct={handleViewProduct}
            onViewCart={handleViewCart}
          />
        );
      case 'notifications':
        return (
          <Notifications
            onBack={handleBackToDashboard}
          />
        );
      case 'order-history':
        return (
          <OrderHistory
            onBack={handleBackToDashboard}
            onViewOrderDetail={handleViewOrderDetail}
          />
        );
      case 'categories':
        return (
          <Categories
            onBack={handleBackToDashboard}
            onViewProduct={handleViewProduct}
            onViewCart={handleViewCart}
            selectedCategory={selectedCategory}
          />
        );
      case 'events':
        return (
          <Events
            onBack={handleBackToDashboard}
          />
        );
      case 'settings':
        return (
          <Settings
            onBack={handleBackToDashboard}
          />
        );
      // Admin screens
      case 'admin-dashboard':
        return (
          <AdminDashboard
            onViewProducts={handleViewProducts}
            onViewOrders={handleViewOrders}
            onViewUsers={handleViewUsers}
            onViewAnalytics={handleViewAnalytics}
            onViewInventory={handleViewInventory}
            onViewPromotions={handleViewPromotions}
            onViewReviews={handleViewReviews}
            onLogout={handleLogout}
          />
        );
      case 'admin-products':
        return (
          <ProductManagement
            onBack={handleBackToDashboard}
          />
        );
      case 'admin-orders':
        return (
          <OrderManagement
            onBack={handleBackToDashboard}
          />
        );
      case 'admin-users':
        return (
          <UserManagement
            onBack={handleBackToDashboard}
          />
        );
      case 'admin-analytics':
        return (
          <Analytics
            onBack={handleBackToDashboard}
          />
        );
      case 'admin-inventory':
        return (
          <InventoryManagement
            onBack={handleBackToDashboard}
          />
        );
      case 'admin-promotions':
        return (
          <PromotionManagement
            onBack={handleBackToDashboard}
          />
        );
      case 'admin-reviews':
        return (
          <ReviewManagement
            onBack={handleBackToDashboard}
          />
        );
      default:
        return (
          <Landing 
            onLogin={handleGoToLogin}
            onRegister={handleGoToRegister}
          />
        );
    }
  };

  return (
    <ManualAuthProvider onRequireLogin={handleRequireLogin}>
      <CartProvider>
        <WishlistProvider>
          <ToastProvider>
            {renderScreen()}
          </ToastProvider>
        </WishlistProvider>
      </CartProvider>
    </ManualAuthProvider>
  );
}

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);