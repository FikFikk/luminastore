"use client";

import React, { useState, useEffect } from "react";
import { 
  getCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart,
  formatPrice,
  Cart 
} from "@/services/cartService";
import { getProducts } from "@/services/productService";
import { Shimmer } from "react-shimmer";

function CartPage() {
  const [cart, setCart] = useState<Cart>({ items: [], summary: { total_items: 0, total_price: 0, total_weight: 0, items_count: 0 } });
  const [productsData, setProductsData] = useState<{[key: number]: string}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [couponCode, setCouponCode] = useState("");
  
  // State untuk checkbox selection
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  // Update isAllSelected when selectedItems or cart changes
  useEffect(() => {
    if (cart.items.length > 0) {
      const allItemsSelected = cart.items.every(item => selectedItems.has(item.id));
      setIsAllSelected(allItemsSelected);
    } else {
      setIsAllSelected(false);
    }
  }, [selectedItems, cart.items]);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const cartData = await getCart();
      setCart(cartData);

      // Auto-select all items on first load
      const allItemIds = new Set(cartData.items.map(item => item.id));
      setSelectedItems(allItemIds);

      // Load all products to get images
      try {
        const allProducts = await getProducts({ limit: 1000 });
        const productImages: {[key: number]: string} = {};
        
        allProducts.data.forEach(product => {
          if (product.image?.original) {
            productImages[product.id] = product.image.original;
          }
        });
        
        setProductsData(productImages);
      } catch (err) {
        console.error('Error loading product images:', err);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (cartId: number, newQuantity: number) => {
    if (newQuantity <= 0) return;

    try {
      setUpdatingItems(prev => new Set(prev).add(cartId));
      await updateCartItem(cartId, { quantity: newQuantity });
      await loadCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quantity');
      console.error('Error updating quantity:', err);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartId: number) => {
    if (!confirm('Are you sure you want to remove this item?')) return;

    try {
      setUpdatingItems(prev => new Set(prev).add(cartId));
      await removeCartItem(cartId);
      
      // Remove from selected items if it was selected
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
      
      await loadCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
      console.error('Error removing item:', err);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    try {
      setLoading(true);
      await clearCart();
      setSelectedItems(new Set());
      await loadCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
      console.error('Error clearing cart:', err);
    }
  };

  const handleApplyCoupon = () => {
    console.log('Applying coupon:', couponCode);
    alert('Coupon functionality not implemented yet');
  };

  // Handle individual item selection
  const handleItemSelect = (cartId: number, isSelected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(cartId);
      } else {
        newSet.delete(cartId);
      }
      return newSet;
    });
  };

  // Handle select all/none
  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      const allItemIds = new Set(cart.items.map(item => item.id));
      setSelectedItems(allItemIds);
    } else {
      setSelectedItems(new Set());
    }
  };

  // Calculate totals for selected items
  const calculateSelectedTotals = () => {
    const selectedCartItems = cart.items.filter(item => selectedItems.has(item.id));
    const totalItems = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = selectedCartItems.reduce((sum, item) => sum + item.total_price, 0);
    const totalWeight = selectedCartItems.reduce((sum, item) => sum + ((item.weight || 0) * item.quantity), 0);
    
    return {
      total_items: totalItems,
      total_price: totalPrice,
      total_weight: totalWeight,
      items_count: selectedCartItems.length
    };
  };

  const selectedTotals = calculateSelectedTotals();

  // Handle proceed to checkout with selected items
  const handleProceedToCheckout = () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one item to checkout');
      return;
    }

    const selectedCartIds = Array.from(selectedItems);
    
    // Store selected cart IDs in sessionStorage for checkout page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedCartIds', JSON.stringify(selectedCartIds));
    }
    
    window.location.href = "/cart/checkout";
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading cart...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-lg-5">
              <div className="intro-excerpt">
                <h1>Cart ({cart.summary.items_count} items)</h1>
                {selectedItems.size > 0 && (
                  <p className="text-muted">
                    {selectedItems.size} item(s) selected for checkout
                  </p>
                )}
              </div>
            </div>
            <div className="col-lg-7"></div>
          </div>
        </div>
      </section>

      {/* Cart Section */}
      <section className="untree_co-section before-footer-section">
        <div className="container">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
              <button 
                className="btn btn-sm btn-outline-danger ml-2"
                onClick={loadCart}
              >
                Retry
              </button>
            </div>
          )}

          {cart.items.length === 0 ? (
            <div className="row">
              <div className="col-12 text-center">
                <h3>Your cart is empty</h3>
                <p>Add some products to get started!</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.href = '/product'}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="row mb-5">
                <div className="col-md-12">
                  <div className="site-blocks-table">
                    <table className="table">
                      <thead>
                        <tr>
                          <th className="product-checkbox">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="selectAll"
                                checked={isAllSelected}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                              />
                              <label className="form-check-label" htmlFor="selectAll">
                                All
                              </label>
                            </div>
                          </th>
                          <th className="product-thumbnail">Image</th>
                          <th className="product-name">Product</th>
                          <th className="product-price">Price</th>
                          <th className="product-quantity">Quantity</th>
                          <th className="product-total">Total</th>
                          <th className="product-remove">Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.items.map((item) => (
                          <tr key={item.id} className={selectedItems.has(item.id) ? 'table-active' : ''}>
                            <td className="product-checkbox">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`item-${item.id}`}
                                  checked={selectedItems.has(item.id)}
                                  onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                                />
                              </div>
                            </td>

                            <td className="product-thumbnail">
                              {productsData[item.product_id] ? (
                                <img
                                  src={productsData[item.product_id]}
                                  alt={item.product_title}
                                  className="img-fluid"
                                  style={{ maxWidth: '80px', maxHeight: '80px', objectFit: 'cover' }}
                                />
                              ) : (
                                <Shimmer width={80} height={80} />
                              )}
                            </td>

                            <td className="product-name">
                              <h2 className="h5 text-black">
                                {item.product_title ? (
                                  item.product_title
                                ) : (
                                  <Shimmer width={120} height={18} />
                                )}
                              </h2>

                              {item.variant_title && item.variant_title !== item.product_title ? (
                                <small className="text-muted d-block">{item.variant_title}</small>
                              ) : (
                                <Shimmer width={100} height={14} />
                              )}

                              {item.insufficient_stock && (
                                <small className="text-danger d-block">
                                  Low stock! Only {item.available_stock} available
                                </small>
                              )}
                            </td>

                            <td>
                              {item.price ? (
                                formatPrice(item.price)
                              ) : (
                                <Shimmer width={60} height={16} />
                              )}
                            </td>

                            <td>
                              {item.total_price ? (
                                formatPrice(item.total_price)
                              ) : (
                                <Shimmer width={70} height={16} />
                              )}
                            </td>


                            <td>
                              <div
                                className="input-group mb-3 d-flex align-items-center quantity-container"
                                style={{ maxWidth: "120px" }}
                              >
                                <div className="input-group-prepend">
                                  <button
                                    className="btn btn-outline-black decrease"
                                    type="button"
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    disabled={updatingItems.has(item.id) || item.quantity <= 1}
                                  >
                                    -
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  className="form-control text-center quantity-amount"
                                  value={item.quantity}
                                  readOnly
                                />
                                <div className="input-group-append">
                                  <button
                                    className="btn btn-outline-black increase"
                                    type="button"
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    disabled={updatingItems.has(item.id)}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              {updatingItems.has(item.id) && (
                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                  <span className="sr-only">Updating...</span>
                                </div>
                              )}
                            </td>

                            <td>
                              {item.total_price ? (
                                formatPrice(item.total_price)
                              ) : (
                                <Shimmer width={70} height={16} />
                              )}
                            </td>

                            <td>
                              <button
                                className="btn btn-black btn-sm"
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={updatingItems.has(item.id)}
                              >
                                {updatingItems.has(item.id) ? '...' : 'X'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>

                    </table>
                  </div>
                </div>
              </div>

              <div className="row">
                {/* Left Column */}
                <div className="col-md-6">
                  <div className="row mb-5">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <button 
                        className="btn btn-black btn-sm btn-block"
                        onClick={loadCart}
                        disabled={loading}
                      >
                        {loading ? 'Updating...' : 'Update Cart'}
                      </button>
                    </div>
                    <div className="col-md-6">
                      <button 
                        className="btn btn-outline-black btn-sm btn-block"
                        onClick={() => window.location.href = '/product'}
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-12">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={handleClearCart}
                        disabled={loading}
                      >
                        Clear Cart
                      </button>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <label className="text-black h4" htmlFor="coupon">
                        Coupon
                      </label>
                      <p>Enter your coupon code if you have one.</p>
                    </div>
                    <div className="col-md-8 mb-3 mb-md-0">
                      <input
                        type="text"
                        className="form-control py-3"
                        id="coupon"
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <button 
                        className="btn btn-black"
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim()}
                      >
                        Apply Coupon
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-md-6 pl-5">
                  <div className="row justify-content-end">
                    <div className="col-md-7">
                      <div className="row">
                        <div className="col-md-12 text-right border-bottom mb-5">
                          <h3 className="text-black h4 text-uppercase">
                            Cart Totals
                          </h3>
                          {selectedItems.size > 0 && selectedItems.size < cart.items.length && (
                            <small className="text-muted d-block">
                              ({selectedItems.size} of {cart.items.length} items selected)
                            </small>
                          )}
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <span className="text-black">Subtotal</span>
                        </div>
                        <div className="col-md-6 text-right">
                          <strong className="text-black">
                            {formatPrice(selectedTotals.total_price)}
                          </strong>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <span className="text-black">Items</span>
                        </div>
                        <div className="col-md-6 text-right">
                          <span className="text-black">{selectedTotals.total_items}</span>
                        </div>
                      </div>
                      {selectedTotals.total_weight > 0 && (
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <span className="text-black">Weight</span>
                          </div>
                          <div className="col-md-6 text-right">
                            <span className="text-black">{selectedTotals.total_weight}g</span>
                          </div>
                        </div>
                      )}
                      <div className="row mb-5">
                        <div className="col-md-6">
                          <span className="text-black">Total</span>
                        </div>
                        <div className="col-md-6 text-right">
                          <strong className="text-black">
                            {formatPrice(selectedTotals.total_price)}
                          </strong>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-12">
                          <button
                            className="btn btn-black btn-lg py-3 btn-block"
                            onClick={handleProceedToCheckout}
                            disabled={
                              selectedItems.size === 0 || 
                              cart.items.filter(item => selectedItems.has(item.id)).some(item => item.insufficient_stock)
                            }
                          >
                            Proceed To Checkout ({selectedItems.size} items)
                          </button>
                          {selectedItems.size === 0 && (
                            <small className="text-danger d-block mt-2">
                              Please select at least one item to checkout
                            </small>
                          )}
                          {cart.items.filter(item => selectedItems.has(item.id)).some(item => item.insufficient_stock) && (
                            <small className="text-danger d-block mt-2">
                              Please check items with insufficient stock before checkout
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default CartPage;