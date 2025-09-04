import { useState } from 'react';
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { 
  removeCartItemThunk, 
  clearCartThunk, 
  updateCartItemThunk,
  getCartThunk 
} from "@/store/slices/cartSlice";
import type { UpdateCartParams } from "@/services/cartService";

interface UseCartPageReturn {
  // State
  cartItems: any[];
  summary: any;
  isLoading: boolean;
  error: string | null;
  updatingItems: Set<number>;
  
  // Actions
  removeItem: (cartId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  updateItemQuantity: (cartId: number, quantity: number) => Promise<void>;
  loadCart: () => Promise<void>;
  
  // UI helpers
  setUpdatingItems: React.Dispatch<React.SetStateAction<Set<number>>>;
}

export const useCartPage = (): UseCartPageReturn => {
  const dispatch = useAppDispatch();
  const { items: cartItems, summary, isLoading, error } = useAppSelector((state) => state.cart);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  const removeItem = async (cartId: number): Promise<void> => {
    try {
      setUpdatingItems(prev => new Set(prev).add(cartId));
      
      const result = await dispatch(removeCartItemThunk(cartId));
      
      if (removeCartItemThunk.fulfilled.match(result)) {
        // Success - Redux state is already updated by the thunk
        // Force refresh to ensure header badge updates immediately
        await dispatch(getCartThunk());
      } else {
        throw new Error(result.payload as string);
      }
    } catch (err) {
      // On error, refresh cart to ensure consistency
      await dispatch(getCartThunk());
      throw err;
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    }
  };

  const clearCart = async (): Promise<void> => {
    try {
      const result = await dispatch(clearCartThunk());
      
      if (clearCartThunk.fulfilled.match(result)) {
        // Success - Redux state is already updated by the thunk
        // Force refresh to ensure header badge updates immediately
        await dispatch(getCartThunk());
      } else {
        throw new Error(result.payload as string);
      }
    } catch (err) {
      // On error, refresh cart to ensure consistency
      await dispatch(getCartThunk());
      throw err;
    }
  };

  const updateItemQuantity = async (cartId: number, quantity: number): Promise<void> => {
    try {
      setUpdatingItems(prev => new Set(prev).add(cartId));
      
      const result = await dispatch(updateCartItemThunk({ 
        cartId, 
        params: { quantity } 
      }));
      
      if (updateCartItemThunk.fulfilled.match(result)) {
        // Success - Redux state is already updated by the thunk
        // Force refresh to ensure header badge updates immediately
        await dispatch(getCartThunk());
      } else {
        throw new Error(result.payload as string);
      }
    } catch (err) {
      // On error, refresh cart to ensure consistency
      await dispatch(getCartThunk());
      throw err;
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    }
  };

  const loadCart = async (): Promise<void> => {
    try {
      const result = await dispatch(getCartThunk());
      if (!getCartThunk.fulfilled.match(result)) {
        throw new Error(result.payload as string);
      }
    } catch (err) {
      console.error('Error loading cart:', err);
      throw err;
    }
  };

  return {
    // State
    cartItems,
    summary,
    isLoading,
    error,
    updatingItems,
    
    // Actions
    removeItem,
    clearCart,
    updateItemQuantity,
    loadCart,
    
    // UI helpers
    setUpdatingItems,
  };
};