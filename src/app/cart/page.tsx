"use client";

import React, { useState, useEffect } from "react";
import { 
  getCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart,
  formatPrice,
  CartItem,
  Cart 
} from "@/services/cartService";
import { getProducts } from "@/services/productService";

function CartPage() {
  const [cart, setCart] = useState<Cart>({ items: [], summary: { total_items: 0, total_price: 0, total_weight: 0, items_count: 0 } });
  const [productsData, setProductsData] = useState<{[key: number]: string}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [couponCode, setCouponCode] = useState("");

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const cartData = await getCart();
      setCart(cartData);

      // Load all products to get images
      try {
        const allProducts = await getProducts({ limit: 1000 }); // Get all products
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
      await loadCart(); // Reload cart to get updated totals
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
      await loadCart(); // Reload cart
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
      await loadCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
      console.error('Error clearing cart:', err);
    }
  };

  const handleApplyCoupon = () => {
    // Implement coupon logic here
    console.log('Applying coupon:', couponCode);
    alert('Coupon functionality not implemented yet');
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
                          <tr key={item.id}>
                            <td className="product-thumbnail">
                              <img
                                src={productsData[item.product_id] || '/assets/images/sofa.png'}
                                alt={item.product_title}
                                className="img-fluid"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/assets/images/sofa.png';
                                }}
                                style={{ maxWidth: '80px', maxHeight: '80px', objectFit: 'cover' }}
                              />
                            </td>
                            <td className="product-name">
                              <h2 className="h5 text-black">{item.product_title}</h2>
                              {item.variant_title && item.variant_title !== item.product_title && (
                                <small className="text-muted d-block">{item.variant_title}</small>
                              )}
                              {item.insufficient_stock && (
                                <small className="text-danger d-block">
                                  Low stock! Only {item.available_stock} available
                                </small>
                              )}
                            </td>
                            <td>{formatPrice(item.price)}</td>
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
                                    &minus;
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
                                    &plus;
                                  </button>
                                </div>
                              </div>
                              {updatingItems.has(item.id) && (
                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                  <span className="sr-only">Updating...</span>
                                </div>
                              )}
                            </td>
                            <td>{formatPrice(item.total_price)}</td>
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
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <span className="text-black">Subtotal</span>
                        </div>
                        <div className="col-md-6 text-right">
                          <strong className="text-black">{formatPrice(cart.summary.total_price)}</strong>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <span className="text-black">Items</span>
                        </div>
                        <div className="col-md-6 text-right">
                          <span className="text-black">{cart.summary.total_items}</span>
                        </div>
                      </div>
                      {cart.summary.total_weight > 0 && (
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <span className="text-black">Weight</span>
                          </div>
                          <div className="col-md-6 text-right">
                            <span className="text-black">{cart.summary.total_weight}g</span>
                          </div>
                        </div>
                      )}
                      <div className="row mb-5">
                        <div className="col-md-6">
                          <span className="text-black">Total</span>
                        </div>
                        <div className="col-md-6 text-right">
                          <strong className="text-black">{formatPrice(cart.summary.total_price)}</strong>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-12">
                          <button
                            className="btn btn-black btn-lg py-3 btn-block"
                            onClick={() => (window.location.href = "/cart/checkout")}
                            disabled={cart.items.length === 0 || cart.items.some(item => item.insufficient_stock)}
                          >
                            Proceed To Checkout
                          </button>
                          {cart.items.some(item => item.insufficient_stock) && (
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