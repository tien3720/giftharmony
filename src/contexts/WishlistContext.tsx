import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useManualAuth } from './ManualAuthContext';

interface WishlistContextType {
  wishlistItems: string[];
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  getWishlistCount: () => number;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useManualAuth();

  const refreshWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    // For now, use localStorage to store wishlist
    const stored = localStorage.getItem(`wishlist_${user.id}`);
    if (stored) {
      setWishlistItems(JSON.parse(stored));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [isAuthenticated, user]);

  const addToWishlist = async (productId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newItems = [...wishlistItems, productId];
      setWishlistItems(newItems);
      localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(newItems));
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newItems = wishlistItems.filter(id => id !== productId);
      setWishlistItems(newItems);
      localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(newItems));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.includes(productId);
  };

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const value: WishlistContextType = {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    getWishlistCount,
    refreshWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};