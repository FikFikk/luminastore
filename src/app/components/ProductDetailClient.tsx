"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, Product } from "@/services/productService";
import { Image as RawShimmerImage, Shimmer } from 'react-shimmer'
import { useAddToCart } from "@/hooks/useAddToCart";

function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showAlert, setShowAlert] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null);
  
  // Image gallery states
  const [showImageModal, setShowImageModal] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart, isLoading: addingToCart, error } = useAddToCart();
  
  const imageRef = useRef<HTMLDivElement>(null);
  
  const ShimmerImage = RawShimmerImage as React.ComponentType<{
    src: string;
    fallback: React.ReactNode;
    onLoad?: () => void;
    onError?: () => void;
    style?: React.CSSProperties;
    className?: string;
  }>;

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
      // setError(null);

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
      // setError(err instanceof Error ? err.message : "Failed to fetch product");
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

  // Handle image selection
  const handleImageSelect = (imageUrl: string, index: number) => {
    setSelectedImage(imageUrl);
    setCurrentImageIndex(index);
    setIsImageLoaded(false);
    setImageError(false);
  };

  // Handle next/previous image in modal
  const handlePreviousImage = () => {
    const allImages = getAllImages();
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : allImages.length - 1;
    handleImageSelect(allImages[newIndex].original, newIndex);
  };

  const handleNextImage = () => {
    const allImages = getAllImages();
    const newIndex = currentImageIndex < allImages.length - 1 ? currentImageIndex + 1 : 0;
    handleImageSelect(allImages[newIndex].original, newIndex);
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
      await addToCart({
        product_id: product.id,
        variant_id: selectedVariant || undefined,
        quantity: quantity
      });

      showMessage('success', 'Item added to cart successfully!');
      
      // Optional: Reset quantity after successful add
      setQuantity(1);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      showMessage('error', error instanceof Error ? error.message : 'Failed to add item to cart');
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
            <p className="mb-3">The product youre looking for doesnt exist.</p>
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

      {/* Image Modal */}
      {showImageModal && (
        <div className="modal show d-block" style={{ zIndex: 10000, backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0 pb-0">
                <button
                  type="button"
                  className="btn-close btn-close-white ms-auto"
                  onClick={() => setShowImageModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center p-0">
                <div className="position-relative">
                  {/* Navigation arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        className="btn btn-light btn-lg position-absolute start-0 top-50 translate-middle-y ms-3 rounded-circle"
                        style={{ zIndex: 1001, width: '60px', height: '60px' }}
                        onClick={handlePreviousImage}
                      >
                        <i className="fas fa-chevron-left me-3"></i>
                      </button>
                      <button
                        className="btn btn-light btn-lg position-absolute end-0 top-50 translate-middle-y me-3 rounded-circle"
                        style={{ zIndex: 1001, width: '60px', height: '60px' }}
                        onClick={handleNextImage}
                      >
                        <i className="fas fa-chevron-right me-3"></i>
                      </button>
                    </>
                  )}
                  
                  <img
                    src={selectedImage}
                    alt={product.title}
                    className="img-fluid rounded"
                    style={{ maxHeight: '80vh', maxWidth: '100%' }}
                  />
                  
                  {/* Image counter */}
                  {allImages.length > 1 && (
                    <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">
                      <span className="badge bg-dark bg-opacity-75 px-3 py-2">
                        {currentImageIndex + 1} / {allImages.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                  {/* Enhanced Product Images */}
                  <div className="col-md-6 bg-white p-4">
                    <div className="product-detail-images position-sticky" style={{ top: '20px' }}>
                      {/* Main Image */}
                      <div className="main-image mb-3 position-relative">
                        <div 
                          className="image-container position-relative overflow-hidden"
                          style={{
                            width: "100%",
                            height: "450px", // Fixed height for consistency
                            borderRadius: "15px",
                            cursor: "zoom-in",
                            transition: "all 0.3s ease",
                            backgroundColor: '#f8f9fa'
                          }}
                          onClick={() => setShowImageModal(true)}
                          ref={imageRef}
                        >
                          {!isImageLoaded && !imageError && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                              <Shimmer width={500} height={450} className="rounded" />
                            </div>
                          )}
                          
                          <ShimmerImage
                            src={selectedImage || "/assets/images/sofa.png"}
                            fallback={<Shimmer width={500} height={450} className="rounded" />}
                            onLoad={() => setIsImageLoaded(true)}
                            onError={() => {
                              setImageError(true);
                              setIsImageLoaded(true);
                            }}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease',
                              opacity: isImageLoaded ? 1 : 0
                            }}
                            className="product-main-image"
                          />
                          
                          {/* Image overlay effects */}
                          <div className="image-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center opacity-0">
                            <div className="bg-dark bg-opacity-75 text-white px-3 py-2 rounded-pill">
                              <i className="fas fa-search-plus me-2"></i>
                              Click to zoom
                            </div>
                          </div>
                          
                          {/* Corner badges */}
                          <div className="position-absolute top-0 end-0 m-3 d-flex flex-column gap-2"
                              // style={{ height: "25%", width: "10%" }}
                              >
                            <button 
                              className="btn btn-light btn-sm  shadow-sm zoom-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowImageModal(true);
                              }}
                              title="Zoom image"
                            >
                              <i className="fas fa-expand-arrows-alt"></i>
                            </button>
                            {allImages.length > 1 && (
                              <div className="badge bg-primary">
                                {currentImageIndex + 1}/{allImages.length}
                              </div>
                            )}
                          </div>
                          
                          {/* Quick navigation arrows on main image */}
                          {allImages.length > 1 && (
                            <>
                              <button
                                className="btn btn-sm position-absolute start-0 top-50 translate-middle-y ms-2 rounded-circle nav-arrow opacity-0"
                                style={{height:"15%", width:"15%"}}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreviousImage();
                                }}
                              >
                                <i className="fas fa-chevron-left text-black" style={{ color:"#000" }}></i>
                              </button>
                              <button
                                className="btn btn-sm position-absolute end-0 top-50 translate-middle-y me-2 rounded-circle nav-arrow opacity-0"
                                style={{height:"15%", width:"15%"}}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNextImage();
                                }}
                              >
                                <i className="fas fa-chevron-right text-black" style={{ color:"#000" }}></i>
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Thumbnail Images */}
                      {allImages.length > 1 && (
                        <div className="thumbnail-images">
                          <h6 className="fw-bold mb-3 text-muted small">More Images</h6>
                          <div className="d-flex flex-wrap gap-2">
                            {allImages.map((image, index) => (
                              <div key={index} style={{ width: 'calc(25% - 6px)' }}>
                                <div 
                                  className={`position-relative overflow-hidden ${
                                    selectedImage === image.original ? 'border-primary' : 'border-light'
                                  }`}
                                  style={{
                                    borderRadius: '8px',
                                    width: '100%',
                                    height: '80px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: selectedImage === image.original ? '2px solid #0d6efd' : '2px solid #e9ecef',
                                    backgroundColor: '#f8f9fa'
                                  }}
                                  onClick={() => handleImageSelect(image.original, index)}
                                >
                                  <img
                                    src={image.small || image.medium || image.original}
                                    alt={`Product image ${index + 1}`}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      objectPosition: 'center'
                                    }}
                                    onError={(e) => {
                                      // e.target.style.display = 'none';
                                    }}
                                  />
                                  
                                  {/* Active indicator */}
                                  {selectedImage === image.original && (
                                    <div 
                                      className="position-absolute bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                      style={{
                                        top: '4px',
                                        right: '4px',
                                        width: '18px',
                                        height: '18px'
                                      }}
                                    >
                                      <i className="fas fa-check text-white" style={{ fontSize: '8px' }}></i>
                                    </div>
                                  )}
                                  
                                  {/* Hover overlay */}
                                  <div 
                                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                                    style={{
                                      backgroundColor: 'rgba(0,0,0,0.3)',
                                      opacity: 0,
                                      transition: 'opacity 0.3s ease'
                                    }}
                                    // onMouseEnter={(e) => e.target.style.opacity = 1}
                                    // onMouseLeave={(e) => e.target.style.opacity = 0}
                                  >
                                    <i className="fas fa-eye text-white"></i>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* View all images button */}
                          {allImages.length > 4 && (
                            <div className="mt-3">
                              <button 
                                className="btn btn-outline-primary btn-sm w-100"
                                onClick={() => setShowImageModal(true)}
                              >
                                <i className="fas fa-images me-2"></i>
                                View All {allImages.length} Images
                              </button>
                            </div>
                          )}
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
                                        <small className="text-white">
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
                            type="text" 
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

      {/* Enhanced Styles */}
      <style jsx>{`
        .image-container:hover .image-overlay {
          opacity: 1 !important;
        }
        
        .image-container:hover .nav-arrow {
          opacity: 1 !important;
        }
        
        .image-container:hover .product-main-image {
          transform: scale(1.02);
        }
        
        .thumbnail-item:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .thumbnail-item:hover .thumbnail-overlay {
          opacity: 1 !important;
        }
        
        .image-container {
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .image-container:hover {
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }
        
        .zoom-btn {
          transition: all 0.3s ease;
        }
        
        .zoom-btn:hover {
          transform: scale(1.1);
          background-color: #0d6efd !important;
          color: white !important;
        }
        
        .nav-arrow {
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          background-color: rgba(255, 255, 255, 0.9) !important;
        }
        
        .nav-arrow:hover {
          background-color: #0d6efd !important;
          color: white !important;
          transform: scale(1.1);
        }
        
        .thumbnail-item.active {
          box-shadow: 0 8px 25px rgba(13, 110, 253, 0.3);
        }
        
        .thumbnail-overlay {
          transition: all 0.3s ease;
          backdrop-filter: blur(2px);
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
        
        .modal {
          backdrop-filter: blur(5px);
        }
        
        .modal-content {
          animation: fadeInScale 0.3s ease;
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .product-main-image {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .shimmer-container {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .image-overlay {
          transition: all 0.3s ease;
          backdrop-filter: blur(2px);
        }
        
        /* Thumbnail images fixed styling */
        .thumbnail-item {
          position: relative;
          overflow: hidden;
          border-radius: 10px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .thumbnail-item img,
        .thumbnail-item .shimmer {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          border-radius: 8px;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .display-6 {
            font-size: 1.5rem;
          }
          
          .display-5 {
            font-size: 1.75rem;
          }
          
          .image-container {
            height: 300px !important;
          }
          
          .thumbnail-images .col-3 {
            flex: 0 0 25%;
          }
          
          .thumbnail-item {
            height: 70px !important;
          }
          
          .nav-arrow {
            width: 60px !important;
            height: 60px !important;
            font-size: 0.8rem;
          }
          
          .zoom-btn {
            width: 80px !important;
            height: 80px !important;
            font-size: 0.8rem;
          } 
          
          .modal-dialog {
            margin: 1rem;
          }
          
          .modal-body img {
            max-height: 70vh !important;
          }
        }
        
        /* Loading states */
        .image-loading {
          position: relative;
          overflow: hidden;
        }
        
        .image-loading::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
        
        /* Enhanced hover effects */
        .thumbnail-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, transparent, rgba(13, 110, 253, 0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
          z-index: 1;
        }
        
        .thumbnail-item:hover::before {
          transform: translateX(100%);
        }
        
        /* Image quality indicators */
        .image-quality-indicator {
          position: absolute;
          bottom: 8px;
          left: 8px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
        }
        
        /* Smooth transitions for all interactive elements */
        * {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
      `}</style>
    </div>
  );
}

export default ProductDetailPage;