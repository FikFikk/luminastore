import { useState } from 'react';
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addToCartThunk, getCartThunk } from "@/store/slices/cartSlice";
import type { AddToCartParams } from "@/services/cartService";

interface UseAddToCartReturn {
  addToCart: (params: AddToCartParams) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useAddToCart = (): UseAddToCartReturn => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const addToCart = async (params: AddToCartParams): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add item to cart
      const result = await dispatch(addToCartThunk(params));
      
      if (addToCartThunk.fulfilled.match(result)) {
        // Immediately refresh the cart to ensure header badge is updated
        await dispatch(getCartThunk());
      } else {
        const errorMessage = result.payload as string;
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    addToCart,
    isLoading,
    error,
  };
};