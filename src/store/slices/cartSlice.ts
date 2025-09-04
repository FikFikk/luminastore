import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ICartItem } from "@/app/components/inteface/ICartItem";
import * as cartApi from '@/services/cartService';

// Types
export interface CartSummary {
  total_items: number;
  total_price: number;
  total_weight: number;
  items_count: number;
}

export interface CartState {
  items: ICartItem[];
  summary: CartSummary;
  isLoading: boolean;
  error: string | null;
  addingToCart: boolean;
  updatingItem: number | null; // ID of item being updated
}

// Initial state
const initialState: CartState = {
  items: [],
  summary: {
    total_items: 0,
    total_price: 0,
    total_weight: 0,
    items_count: 0,
  },
  isLoading: false,
  error: null,
  addingToCart: false,
  updatingItem: null,
};

// Async thunks
export const addToCartThunk = createAsyncThunk(
  'cart/addToCart',
  async (params: cartApi.AddToCartParams, { rejectWithValue }) => {
    try {
      const cartItem = await cartApi.addToCart(params);
      return cartItem;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add to cart');
    }
  }
);

export const getCartThunk = createAsyncThunk(
  'cart/getCart',
  async (_, { rejectWithValue }) => {
    try {
      const cart = await cartApi.getCart();
      return cart;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get cart');
    }
  }
);

export const updateCartItemThunk = createAsyncThunk(
  'cart/updateCartItem',
  async ({ cartId, params }: { cartId: number; params: cartApi.UpdateCartParams }, { rejectWithValue }) => {
    try {
      const updatedItem = await cartApi.updateCartItem(cartId, params);
      return updatedItem;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update cart item');
    }
  }
);

export const removeCartItemThunk = createAsyncThunk(
  'cart/removeCartItem',
  async (cartId: number, { rejectWithValue }) => {
    try {
      await cartApi.removeCartItem(cartId);
      return cartId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove cart item');
    }
  }
);

export const clearCartThunk = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await cartApi.clearCart();
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to clear cart');
    }
  }
);

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetCart: (state) => {
      state.items = [];
      state.summary = initialState.summary;
      state.error = null;
    },
    // Local state updates for optimistic UI
    updateLocalCartItem: (state, action: PayloadAction<{ cartId: number; quantity: number }>) => {
      const { cartId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === cartId);
      
      if (itemIndex !== -1) {
        const item = state.items[itemIndex];
        const oldQuantity = item.quantity;
        item.quantity = quantity;
        item.sub_total = item.price * quantity;
        
        // Update summary
        state.summary.total_items += (quantity - oldQuantity);
        state.summary.total_price += (quantity - oldQuantity) * item.price;
        state.summary.total_weight += (quantity - oldQuantity) * (item.weight || 0);
      }
    },
  },
  extraReducers: (builder) => {
    // Add to cart
    builder
      .addCase(addToCartThunk.pending, (state) => {
        state.addingToCart = true;
        state.error = null;
      })
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        state.addingToCart = false;
        const newItem = action.payload;
        
        // Check if item already exists (same product and variant)
        const existingItemIndex = state.items.findIndex(
          item => item.product_id === newItem.product_id && 
                  item.variant_id === newItem.variant_id
        );
        
        if (existingItemIndex !== -1) {
          // Update existing item - the API should return the updated item with new total quantity
          const existingItem = state.items[existingItemIndex];
          const oldQuantity = existingItem.quantity;
          const oldSubTotal = existingItem.sub_total;
          
          // Replace with new item data
          state.items[existingItemIndex] = newItem;
          
          // Calculate differences for summary update
          const quantityDiff = newItem.quantity - oldQuantity;
          const priceDiff = newItem.sub_total - oldSubTotal;
          const weightDiff = quantityDiff * (newItem.weight || 0);
          
          // Update summary
          state.summary.total_items += quantityDiff;
          state.summary.total_price += priceDiff;
          state.summary.total_weight += weightDiff;
        } else {
          // Add completely new item
          state.items.push(newItem);
          
          // Update summary for new item
          state.summary.total_items += newItem.quantity;
          state.summary.items_count += 1;
          state.summary.total_price += newItem.sub_total;
          state.summary.total_weight += newItem.quantity * (newItem.weight || 0);
        }
      })
      .addCase(addToCartThunk.rejected, (state, action) => {
        state.addingToCart = false;
        state.error = action.payload as string;
      });

    // Get cart
    builder
      .addCase(getCartThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCartThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.summary = action.payload.summary;
      })
      .addCase(getCartThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update cart item
    builder
      .addCase(updateCartItemThunk.pending, (state, action) => {
        state.updatingItem = action.meta.arg.cartId;
        state.error = null;
      })
      .addCase(updateCartItemThunk.fulfilled, (state, action) => {
        state.updatingItem = null;
        const updatedItem = action.payload;
        const itemIndex = state.items.findIndex(item => item.id === updatedItem.id);
        
        if (itemIndex !== -1) {
          const oldItem = state.items[itemIndex];
          const quantityDiff = updatedItem.quantity - oldItem.quantity;
          const priceDiff = updatedItem.sub_total - oldItem.sub_total;
          
          state.items[itemIndex] = updatedItem;
          
          // Update summary
          state.summary.total_items += quantityDiff;
          state.summary.total_price += priceDiff;
          state.summary.total_weight += quantityDiff * (updatedItem.weight || 0);
        }
      })
      .addCase(updateCartItemThunk.rejected, (state, action) => {
        state.updatingItem = null;
        state.error = action.payload as string;
      });

    // Remove cart item
    builder
      .addCase(removeCartItemThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(removeCartItemThunk.fulfilled, (state, action) => {
        const removedCartId = action.payload;
        const itemIndex = state.items.findIndex(item => item.id === removedCartId);
        
        if (itemIndex !== -1) {
          const removedItem = state.items[itemIndex];
          
          // Update summary
          state.summary.total_items -= removedItem.quantity;
          state.summary.items_count -= 1;
          state.summary.total_price -= removedItem.sub_total;
          state.summary.total_weight -= removedItem.quantity * (removedItem.weight || 0);
          
          // Remove item
          state.items.splice(itemIndex, 1);
        }
      })
      .addCase(removeCartItemThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Clear cart
    builder
      .addCase(clearCartThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(clearCartThunk.fulfilled, (state) => {
        state.items = [];
        state.summary = initialState.summary;
      })
      .addCase(clearCartThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetCart, updateLocalCartItem } = cartSlice.actions;
export default cartSlice.reducer;