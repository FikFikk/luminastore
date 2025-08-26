"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, Product } from "@/services/productService";

function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  // Format currency to Indonesian Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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

      console.log('Attempting to fetch product with slug:', slug); // Debug log
      const productData = await getProductBySlug(slug);
      console.log('Product data received:', productData); // Debug log
      setProduct(productData);
      
      // Set initial selected image
      if (productData.image?.original) {
        setSelectedImage(productData.image.original);
      } else if (productData.images && productData.images.length > 0) {
        setSelectedImage(productData.images[0].original);
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

  return (
    <div>
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
      <section className="untree_co-section">
        <div className="container">
          <div className="row">
            {/* Product Images */}
            <div className="col-md-6">
              <div className="product-detail-images">
                {/* Main Image */}
                <div className="main-image mb-3">
                  <img
                    src={selectedImage || "/assets/images/sofa.png"}
                    alt={product.title}
                    className="img-fluid rounded shadow-sm"
                    style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/images/sofa.png";
                    }}
                  />
                </div>

                {/* Thumbnail Images */}
                {allImages.length > 1 && (
                  <div className="thumbnail-images">
                    <div className="row g-2">
                      {allImages.map((image, index) => (
                        <div key={index} className="col-3">
                          <img
                            src={image.small || image.medium || image.original}
                            alt={`${product.title} ${index + 1}`}
                            className={`img-fluid rounded shadow-sm cursor-pointer ${
                              selectedImage === image.original ? 'border border-primary border-3' : ''
                            }`}
                            style={{ 
                              width: '100%', 
                              height: '80px', 
                              objectFit: 'cover',
                              cursor: 'pointer'
                            }}
                            onClick={() => setSelectedImage(image.original)}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/assets/images/sofa.png";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="col-md-6">
              <div className="product-detail-info">
                <h1 className="product-title mb-3">{product.title}</h1>

                {/* Rating */}
                {product.rating && (
                  <div className="product-rating mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="d-flex">
                        {renderStarRating(product.rating)}
                      </div>
                      <span className="text-muted">
                        ({product.rating.toFixed(1)} out of 5)
                      </span>
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="product-price mb-4">
                  <h2 className="text-primary fw-bold mb-0">
                    {formatRupiah(getCurrentPrice())}
                  </h2>
                  {selectedVariant && product.price !== getCurrentPrice() && (
                    <small className="text-muted text-decoration-line-through">
                      {formatRupiah(product.price)}
                    </small>
                  )}
                </div>

                {/* Categories */}
                {product.categories && product.categories.length > 0 && (
                  <div className="product-categories mb-3">
                    <span className="text-muted me-2">Categories:</span>
                    {product.categories.map((category, index) => (
                      <span key={index} className="badge bg-secondary me-1">
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div className="product-variants mb-4">
                    <h6 className="fw-bold">Choose Variant:</h6>
                    <div className="row g-2">
                      {product.variants.map((variant) => (
                        <div key={variant.id} className="col-6">
                          <button
                            className={`btn w-100 ${
                              selectedVariant === variant.id
                                ? 'btn-primary'
                                : 'btn-outline-secondary'
                            }`}
                            onClick={() => setSelectedVariant(variant.id)}
                          >
                            <div className="text-start">
                              <div className="fw-bold">{variant.title}</div>
                              <small>{formatRupiah(variant.price)}</small>
                              {variant.stock > 0 ? (
                                <small className="text-success d-block">
                                  Stock: {variant.stock}
                                </small>
                              ) : (
                                <small className="text-danger d-block">
                                  Out of stock
                                </small>
                              )}
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {product.deskripsi && (
                  <div className="product-description mb-4">
                    <h6 className="fw-bold">Description:</h6>
                    <p className="text-muted">{product.deskripsi}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="product-actions">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <button className="btn btn-primary w-100 btn-lg">
                        <i className="fas fa-shopping-cart me-2"></i>
                        Add to Cart
                      </button>
                    </div>
                    <div className="col-md-6">
                      <button className="btn btn-outline-primary w-100 btn-lg">
                        <i className="fas fa-heart me-2"></i>
                        Add to Wishlist
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Link href="/product" className="btn btn-outline-secondary">
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Products
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductDetailPage;