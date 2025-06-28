import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useManualAuth } from './ManualAuthContext';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  category: string;
  inStock: boolean;
  maxQuantity: number;
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useManualAuth();

  const refreshCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    // For now, use localStorage to store cart
    const stored = localStorage.getItem(`cart_${user.id}`);
    if (stored) {
      setItems(JSON.parse(stored));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setItems([]);
    }
  }, [isAuthenticated, user]);

  const saveCart = (cartItems: CartItem[]) => {
    if (user) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems));
    }
  };

  const addToCart = async (product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const existingItemIndex = items.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const newItems = [...items];
        newItems[existingItemIndex].quantity += quantity;
        setItems(newItems);
        saveCart(newItems);
      } else {
        // Add new item
        const newItem: CartItem = { ...product, quantity };
        const newItems = [...items, newItem];
        setItems(newItems);
        saveCart(newItems);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newItems = items.filter(item => item.id !== productId);
      setItems(newItems);
      saveCart(newItems);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) throw new Error('User not authenticated');

    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      const newItems = items.map(item => 
        item.id === productId ? { ...item, quantity } : item
      );
      setItems(newItems);
      saveCart(newItems);
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      setItems([]);
      localStorage.removeItem(`cart_${user.id}`);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value: CartContextType = {
    items,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};