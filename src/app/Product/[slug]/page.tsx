"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, Product } from "@/services/productService";
import { addToCart } from "@/services/cartService";

function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAlert, setShowAlert] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null);

  // Format currency to Indonesian Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Show alert with auto-hide
  const showMessage = (type: 'success' | 'error' | 'warning', message: string) => {
    setShowAlert({ type, message });
    setTimeout(() => setShowAlert(null), 4000);
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <i key={`full-${i}`} className="fas fa-star text-warning"></i>
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <i key="half" className="fas fa-star-half-alt text-warning"></i>
      );
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <i key={`empty-${i}`} className="far fa-star text-muted"></i>
      );
    }

    return stars;
  };

  // Fetch product details
  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting to fetch product with slug:', slug);
      const productData = await getProductBySlug(slug);
      console.log('Product data received:', productData);
      setProduct(productData);
      
      // Set initial selected image
      if (productData.image?.original) {
        setSelectedImage(productData.image.original);
      } else if (productData.images && productData.images.length > 0) {
        setSelectedImage(productData.images[0].original);
      }

      // Set default variant to first variant
      if (productData.variants && productData.variants.length > 0) {
        setSelectedVariant(productData.variants[0].id);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch product");
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  // Get current price based on selected variant or main product
  const getCurrentPrice = () => {
    if (selectedVariant && product?.variants) {
      const variant = product.variants.find(v => v.id === selectedVariant);
      return variant ? variant.price : product.price;
    }
    return product?.price || 0;
  };

  // Get current variant stock
  const getCurrentStock = () => {
    if (selectedVariant && product?.variants) {
      const variant = product.variants.find(v => v.id === selectedVariant);
      return variant ? variant.stock : 0;
    }
    return 999; // Default for main product
  };

  // Get all available images
  const getAllImages = () => {
    const images = [];
    
    // Add main product image
    if (product?.image) {
      images.push(product.image);
    }
    
    // Add additional images
    if (product?.images && product.images.length > 0) {
      images.push(...product.images);
    }
    
    // Add variant images
    if (product?.variants) {
      product.variants.forEach(variant => {
        if (variant.image) {
          images.push(variant.image);
        }
      });
    }
    
    // Remove duplicates based on original URL
    return images.filter((img, index, self) => 
      self.findIndex(i => i.original === img.original) === index
    );
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;

    // Check if variant is required but not selected
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      showMessage('warning', 'Please select a variant before adding to cart');
      return;
    }

    // Check stock
    const currentStock = getCurrentStock();
    if (currentStock === 0) {
      showMessage('error', 'Sorry, this item is out of stock');
      return;
    }

    if (quantity > currentStock) {
      showMessage('warning', `Only ${currentStock} items available in stock`);
      return;
    }

    try {
      setAddingToCart(true);
      
      await addToCart({
        product_id: product.id,
        variant_id: selectedVariant || undefined,
        quantity: quantity
      });

      showMessage('success', 'Item added to cart successfully!');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      showMessage('error', error instanceof Error ? error.message : 'Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading product details...</h5>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="alert alert-danger d-inline-block">
            <div className="text-danger mb-3">
              <i className="fas fa-exclamation-triangle fa-3x"></i>
            </div>
            <h5 className="alert-heading">Error loading product</h5>
            <p className="mb-3">{error}</p>
            <div className="d-flex gap-2 justify-content-center">
              <button
                onClick={fetchProduct}
                className="btn btn-primary"
              >
                <i className="fas fa-redo me-2"></i>Try Again
              </button>
              <Link href="/product" className="btn btn-outline-secondary">
                <i className="fas fa-arrow-left me-2"></i>Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="alert alert-warning d-inline-block">
            <h5 className="alert-heading">Product not found</h5>
            <p className="mb-3">The product you're looking for doesn't exist.</p>
            <Link href="/product" className="btn btn-primary">
              <i className="fas fa-arrow-left me-2"></i>Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const allImages = getAllImages();
  const currentStock = getCurrentStock();

  return (
    <div>
      {/* Alert Messages */}
      {showAlert && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 9999 }}>
          <div className={`alert alert-${showAlert.type === 'success' ? 'success' : showAlert.type === 'error' ? 'danger' : 'warning'} alert-dismissible fade show shadow-lg`} role="alert">
            <i className={`fas ${showAlert.type === 'success' ? 'fa-check-circle' : showAlert.type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'} me-2`}></i>
            {showAlert.message}
            <button type="button" className="btn-close" onClick={() => setShowAlert(null)}></button>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <section className="hero">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link href="/" className="text-white text-decoration-none">
                      <i className="fas fa-home me-1"></i>Home
                    </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link href="/product" className="text-white text-decoration-none">
                      Products
                    </Link>
                  </li>
                  <li className="breadcrumb-item active text-white" aria-current="page">
                    {product.title}
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail Section */}
      <section className="untree_co-section bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="card shadow-lg border-0 overflow-hidden" style={{ borderRadius: '20px' }}>
                <div className="row g-0">
                  {/* Product Images */}
                  <div className="col-md-6 bg-white p-4">
                    <div className="product-detail-images position-sticky" style={{ top: '20px' }}>
                      {/* Main Image */}
                      <div className="main-image mb-3 position-relative">
                        <div className="image-container" style={{ 
                          borderRadius: '15px', 
                          overflow: 'hidden',
                          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                          padding: '20px'
                        }}>
                          <img
                            src={selectedImage || "/assets/images/sofa.png"}
                            alt={product.title}
                            className="img-fluid"
                            style={{ 
                              width: '100%', 
                              height: '450px', 
                              objectFit: 'cover',
                              borderRadius: '10px',
                              transition: 'transform 0.3s ease',
                              cursor: 'zoom-in'
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/assets/images/sofa.png";
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLImageElement).style.transform = 'scale(1)';
                            }}
                          />
                        </div>
                        
                        {/* Image overlay with zoom icon */}
                        <div className="position-absolute top-0 end-0 m-3">
                          <button className="btn btn-light btn-sm rounded-circle shadow-sm">
                            <i className="fas fa-search-plus"></i>
                          </button>
                        </div>
                      </div>

                      {/* Thumbnail Images */}
                      {allImages.length > 1 && (
                        <div className="thumbnail-images">
                          <div className="row g-2">
                            {allImages.slice(0, 4).map((image, index) => (
                              <div key={index} className="col-3">
                                <div 
                                  className={`thumbnail-item ${
                                    selectedImage === image.original ? 'active' : ''
                                  }`}
                                  style={{
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: selectedImage === image.original ? '3px solid #0d6efd' : '2px solid transparent',
                                    transform: selectedImage === image.original ? 'scale(1.05)' : 'scale(1)'
                                  }}
                                  onClick={() => setSelectedImage(image.original)}
                                >
                                  <img
                                    src={image.small || image.medium || image.original}
                                    alt={`${product.title} ${index + 1}`}
                                    className="img-fluid"
                                    style={{ 
                                      width: '100%', 
                                      height: '80px', 
                                      objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/assets/images/sofa.png";
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                            {allImages.length > 4 && (
                              <div className="col-3">
                                <div 
                                  className="d-flex align-items-center justify-content-center bg-light text-muted"
                                  style={{
                                    height: '80px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  +{allImages.length - 4}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="col-md-6">
                    <div className="card-body p-5 h-100 d-flex flex-column">
                      {/* Product Title */}
                      <div className="mb-4">
                        <h1 className="product-title display-6 fw-bold text-dark mb-2">{product.title}</h1>
                        
                        {/* Categories */}
                        {product.categories && product.categories.length > 0 && (
                          <div className="product-categories mb-3">
                            {product.categories.map((category, index) => (
                              <span key={index} className="badge bg-primary bg-opacity-10 text-primary me-2 px-3 py-2" 
                                    style={{ fontSize: '0.85rem', borderRadius: '20px' }}>
                                {category}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Rating */}
                        {product.rating && (
                          <div className="product-rating mb-3">
                            <div className="d-flex align-items-center gap-2">
                              <div className="d-flex">
                                {renderStarRating(product.rating)}
                              </div>
                              <span className="text-muted fw-medium">
                                ({product.rating.toFixed(1)} out of 5)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="product-price mb-4">
                        <h2 className="text-primary fw-bold mb-0 display-5">
                          {formatRupiah(getCurrentPrice())}
                        </h2>
                        {selectedVariant && product.price !== getCurrentPrice() && (
                          <small className="text-muted text-decoration-line-through fs-6">
                            {formatRupiah(product.price)}
                          </small>
                        )}
                        
                        {/* Stock Status */}
                        <div className="mt-2">
                          {currentStock > 0 ? (
                            <span className="badge bg-success bg-opacity-10 text-success px-3 py-2">
                              <i className="fas fa-check-circle me-1"></i>
                              {currentStock} in stock
                            </span>
                          ) : (
                            <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-2">
                              <i className="fas fa-times-circle me-1"></i>
                              Out of stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Variants */}
                      {product.variants && product.variants.length > 0 && (
                        <div className="product-variants mb-4">
                          <h6 className="fw-bold mb-3 text-dark">Choose Variant:</h6>
                          <div className="row g-2">
                            {product.variants.map((variant) => (
                              <div key={variant.id} className="col-12">
                                <button
                                  className={`btn w-100 p-3 text-start ${
                                    selectedVariant === variant.id
                                      ? 'btn-primary shadow-sm'
                                      : 'btn-outline-light border-2'
                                  }`}
                                  style={{ 
                                    borderRadius: '12px',
                                    transition: 'all 0.3s ease'
                                  }}
                                  onClick={() => setSelectedVariant(variant.id)}
                                >
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <div className="fw-bold">{variant.title}</div>
                                      <div className="fs-6 opacity-75">{formatRupiah(variant.price)}</div>
                                    </div>
                                    <div className="text-end">
                                      {variant.stock > 0 ? (
                                        <small className="text-success">
                                          <i className="fas fa-check-circle me-1"></i>
                                          {variant.stock} left
                                        </small>
                                      ) : (
                                        <small className="text-danger">
                                          <i className="fas fa-times-circle me-1"></i>
                                          Out of stock
                                        </small>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quantity Selector */}
                      <div className="quantity-selector mb-4 w-100">
                        <h6 className="fw-bold mb-3 text-dark">Quantity:</h6>
                        <div className="input-group" style={{ maxWidth: '220px' }}>
                          <button 
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                          >
                            <i className="fas fa-minus"></i>
                          </button>
                          <input 
                            type="number" 
                            className="form-control text-center fw-bold"
                            value={quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setQuantity(Math.max(1, Math.min(currentStock, val)));
                            }}
                            min="1"
                            max={currentStock}
                          />
                          <button 
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                            disabled={quantity >= currentStock}
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      {product.deskripsi && (
                        <div className="product-description mb-4 flex-grow-1">
                          <h6 className="fw-bold mb-3 text-dark">Description:</h6>
                          <p className="text-muted lh-lg">{product.deskripsi}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="product-actions mt-auto">
                        <div className="row g-3 mb-3">
                          <div className="col-12">
                            <button 
                              className="btn btn-primary w-100 btn-lg py-3 fw-bold"
                              style={{ borderRadius: '12px' }}
                              onClick={handleAddToCart}
                              disabled={addingToCart || currentStock === 0}
                            >
                              {addingToCart ? (
                                <>
                                  <div className="spinner-border spinner-border-sm me-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </div>
                                  Adding to Cart...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-shopping-cart me-2"></i>
                                  Add to Cart
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="mt-3">
                          <Link href="/product" className="btn btn-outline-secondary w-100">
                            <i className="fas fa-arrow-left me-2"></i>
                            Back to Products
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Styles */}
      <style jsx>{`
        .thumbnail-item:hover {
          transform: scale(1.02) !important;
        }
        
        .image-container:hover {
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%);
          border: none;
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .product-title {
          line-height: 1.2;
        }
        
        @media (max-width: 768px) {
          .display-6 {
            font-size: 1.5rem;
          }
          
          .display-5 {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
}

export default ProductDetailPage;