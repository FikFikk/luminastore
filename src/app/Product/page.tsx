"use client";

import React, { useState, useEffect } from "react";
import { getProducts, Product, ProductListParams } from "@/services/productService";
import Link from "next/link";

function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductListParams>({
    limit: 8,
    page: 1,
    sort_field: "Title",
    sort_dir: "ASC",
  });

  // Categories for filter dropdown (you can make this dynamic by fetching from API)
  const categories = ["Electronic", "Sepatu", "Olahraga", "Lari", "Properti"];

  // Format currency to Indonesian Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Render star rating with proper half-star support
  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <i key={`full-${i}`} className="fas fa-star text-warning" style={{ fontSize: '0.9rem' }}></i>
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <i key="half" className="fas fa-star-half-alt text-warning" style={{ fontSize: '0.9rem' }}></i>
      );
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <i key={`empty-${i}`} className="far fa-star text-muted" style={{ fontSize: '0.9rem' }}></i>
      );
    }

    return stars;
  };

  // Generate product slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim(); // Remove leading/trailing hyphens
  };

  // Fetch products
  const fetchProducts = async (params: ProductListParams = filters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getProducts(params);
      setProducts(response.data);
      setTotalProducts(response.total);
      setCurrentPage(response.page);
      setTotalPages(Math.ceil(response.total / response.limit));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key: keyof ProductListParams, value: any) => {
    const updatedFilters = { ...filters, [key]: value, page: 1 };
    setFilters(updatedFilters);
    fetchProducts(updatedFilters);
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    const updatedFilters = { ...filters, title: searchTerm, page: 1 };
    setFilters(updatedFilters);
    fetchProducts(updatedFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      limit: 8,
      page: 1,
      sort_field: "Title" as const,
      sort_dir: "ASC" as const,
    };
    setFilters(clearedFilters);
    fetchProducts(clearedFilters);
  };

  // Pagination
  const handlePageChange = (page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchProducts(updatedFilters);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate pagination numbers with ellipsis
  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-lg-5">
              <div className="intro-excerpt">
                <h1>Shop</h1>
                <p className="mb-4">Browse our collection of quality products</p>
              </div>
            </div>
            <div className="col-lg-7"></div>
          </div>
        </div>
      </section>

      {/* Enhanced Filter and Search Section */}
      <section className="untree_co-section pt-0">
        <div className="container">
          {/* Main Toolbar */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="bg-white rounded-3 shadow-sm p-4 mb-4">
                <div className="row align-items-center g-3">
                  {/* Filter Toggle and Results Count */}
                  <div className="col-lg-4 col-md-6">
                    <div className="d-flex align-items-center gap-3">
                      <button 
                        className={`btn btn-sm d-flex align-items-center gap-2 ${
                          showFilters ? 'btn-primary' : 'btn-outline-primary'
                        }`}
                        onClick={() => setShowFilters(!showFilters)}
                        style={{ minWidth: '140px' }}
                      >
                        <i className={`fas ${showFilters ? 'fa-times' : 'fa-filter'}`}></i>
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                      </button>
                      
                      <div className="text-muted small">
                        <i className="fas fa-cube me-1"></i>
                        <span className="fw-medium">{products.length}</span> of{' '}
                        <span className="fw-medium">{totalProducts.toLocaleString('id-ID')}</span> products
                      </div>
                    </div>
                  </div>

                  {/* Quick Search */}
                  <div className="col-lg-5 col-md-6">
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control ps-5"
                        placeholder="Search products..."
                        value={filters.title || ''}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ borderRadius: '25px' }}
                      />
                      <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                      {filters.title && (
                        <button
                          className="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-1"
                          onClick={() => handleSearch('')}
                          style={{ fontSize: '0.8rem' }}
                        >
                          <i className="fas fa-times text-muted"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Sort */}
                  <div className="col-lg-3">
                    <div className="d-flex align-items-center">
                      <label className="text-muted small me-2 text-nowrap">
                        <i className="fas fa-sort me-1"></i>Sort by:
                      </label>
                      <select 
                        className="form-select form-select-sm"
                        value={`${filters.sort_field}-${filters.sort_dir}`}
                        onChange={(e) => {
                          const [field, dir] = e.target.value.split('-');
                          handleFilterChange('sort_field', field);
                          handleFilterChange('sort_dir', dir);
                        }}
                        style={{ borderRadius: '15px', fontSize: '0.875rem' }}
                      >
                        <option value="Title-ASC">🔤 Name (A-Z)</option>
                        <option value="Title-DESC">🔤 Name (Z-A)</option>
                        <option value="Price-ASC">💰 Price (Low to High)</option>
                        <option value="Price-DESC">💰 Price (High to Low)</option>
                        <option value="Rating-DESC">⭐ Rating (Best First)</option>
                        <option value="Rating-ASC">⭐ Rating (Lowest First)</option>
                        <option value="CreatedAt-DESC">🆕 Newest First</option>
                        <option value="CreatedAt-ASC">📅 Oldest First</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Filters Collapsible Panel */}
              {showFilters && (
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-light border-0 py-3">
                    <h6 className="mb-0 text-primary">
                      <i className="fas fa-sliders-h me-2"></i>Advanced Filters
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-4">
                      {/* Category Filter */}
                      <div className="col-lg-3 col-md-6">
                        <label className="form-label fw-medium text-dark">
                          <i className="fas fa-tags me-2 text-primary"></i>Category
                        </label>
                        <select 
                          className="form-select"
                          value={filters.category || ''}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          style={{ borderRadius: '10px' }}
                        >
                          <option value="">All Categories</option>
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      {/* Rating Filter */}
                      <div className="col-lg-3 col-md-6">
                        <label className="form-label fw-medium text-dark">
                          <i className="fas fa-star me-2 text-warning"></i>Minimum Rating
                        </label>
                        <select 
                          className="form-select"
                          value={filters.rating || ''}
                          onChange={(e) => handleFilterChange('rating', e.target.value ? Number(e.target.value) : undefined)}
                          style={{ borderRadius: '10px' }}
                        >
                          <option value="">Any Rating</option>
                          <option value="4">⭐⭐⭐⭐ 4+ Stars</option>
                          <option value="3">⭐⭐⭐ 3+ Stars</option>
                          <option value="2">⭐⭐ 2+ Stars</option>
                          <option value="1">⭐ 1+ Stars</option>
                        </select>
                      </div>

                      {/* Items per page */}
                      <div className="col-lg-3 col-md-6">
                        <label className="form-label fw-medium text-dark">
                          <i className="fas fa-th me-2 text-info"></i>Items per page
                        </label>
                        <select 
                          className="form-select"
                          value={filters.limit || 8}
                          onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                          style={{ borderRadius: '10px' }}
                        >
                          <option value="8">8 items</option>
                          <option value="12">12 items</option>
                          <option value="16">16 items</option>
                          <option value="24">24 items</option>
                        </select>
                      </div>

                      {/* Clear Filters */}
                      <div className="col-lg-3 col-md-6 d-flex align-items-end">
                        <button 
                          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
                          onClick={clearFilters}
                          style={{ borderRadius: '10px' }}
                        >
                          <i className="fas fa-eraser"></i>
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Filters Pills */}
              {(filters.title || filters.category || filters.rating) && (
                <div className="mb-4">
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <span className="text-muted small fw-medium">
                      <i className="fas fa-filter me-1"></i>Active filters:
                    </span>
                    {filters.title && (
                      <span className="badge bg-primary px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                        <i className="fas fa-search"></i>
                        Search: "{filters.title}"
                        <button 
                          className="btn-close btn-close-white"
                          style={{ fontSize: '0.6em' }}
                          onClick={() => handleFilterChange('title', '')}
                          aria-label="Remove search filter"
                        ></button>
                      </span>
                    )}
                    {filters.category && (
                      <span className="badge bg-success px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                        <i className="fas fa-tag"></i>
                        {filters.category}
                        <button 
                          className="btn-close btn-close-white"
                          style={{ fontSize: '0.6em' }}
                          onClick={() => handleFilterChange('category', '')}
                          aria-label="Remove category filter"
                        ></button>
                      </span>
                    )}
                    {filters.rating && (
                      <span className="badge bg-warning text-dark px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                        <i className="fas fa-star"></i>
                        {filters.rating}+ stars
                        <button 
                          className="btn-close"
                          style={{ fontSize: '0.6em' }}
                          onClick={() => handleFilterChange('rating', undefined)}
                          aria-label="Remove rating filter"
                        ></button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section className="untree_co-section product-section before-footer-section">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="d-flex flex-column align-items-center">
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="text-muted">Loading amazing products...</h5>
                <p className="text-muted">Please wait a moment</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <div className="card border-0 shadow-sm d-inline-block p-4">
                <div className="text-danger mb-3">
                  <i className="fas fa-exclamation-triangle fa-3x"></i>
                </div>
                <h5 className="text-danger mb-3">Oops! Something went wrong</h5>
                <p className="text-muted mb-4">{error}</p>
                <button
                  onClick={() => fetchProducts()}
                  className="btn btn-primary px-4"
                >
                  <i className="fas fa-redo me-2"></i>Try Again
                </button>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5">
              <div className="card border-0 shadow-sm d-inline-block p-5">
                <div className="text-muted mb-3">
                  <i className="fas fa-search fa-4x"></i>
                </div>
                <h5 className="text-muted mb-3">No products found</h5>
                <p className="text-muted mb-4">
                  We couldn't find any products matching your criteria.<br/>
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn btn-outline-primary px-4"
                >
                  <i className="fas fa-eraser me-2"></i>Clear All Filters
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="row">
                {products.map((product) => (
                  <div key={product.id} className="col-12 col-md-4 col-lg-3 mb-5">
                    <div className="product-item position-relative">
                      <Link 
                        href={`/product/${generateSlug(product.title)}`}
                        className="text-decoration-none"
                      >
                        <img
                          src={
                            product.image?.medium ||
                            product.image?.original ||
                            "/assets/images/sofa.png"
                          }
                          alt={product.title}
                          className="img-fluid product-thumbnail"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/assets/images/sofa.png";
                          }}
                        />
                        <h3 className="product-title">{product.title}</h3>
                        <strong className="product-price">
                          {formatRupiah(product.price || 0)}
                        </strong>
                        
                        {/* Enhanced Rating display */}
                        {product.rating && (
                          <div className="product-rating mt-2">
                            <div className="d-flex align-items-center gap-1">
                              <div className="d-flex">
                                {renderStarRating(product.rating)}
                              </div>
                              <span className="ms-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                ({product.rating.toFixed(1)})
                              </span>
                            </div>
                          </div>
                        )}
                      </Link>
                      
                      {/* <span className="icon-cross">
                        <img
                          src="/assets/images/cross.svg"
                          alt="add"
                          className="img-fluid"
                        />
                      </span> */}
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="row mt-5">
                  <div className="col-12">
                    <div className="bg-white rounded-3 shadow-sm p-4">
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        {/* Enhanced page info with better styling */}
                        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
                          <div className="badge bg-light text-dark px-3 py-2 fs-6">
                            <i className="fas fa-file-alt me-2"></i>
                            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                          </div>
                          <div className="text-muted small">
                            <i className="fas fa-box me-1"></i>
                            Showing <strong>{((currentPage - 1) * filters.limit!) + 1}</strong> to{' '}
                            <strong>{Math.min(currentPage * filters.limit!, totalProducts)}</strong> of{' '}
                            <strong>{totalProducts.toLocaleString('id-ID')}</strong> products
                          </div>
                        </div>
                        
                        {/* Enhanced pagination controls with modern styling */}
                        <nav aria-label="Product pagination">
                          <ul className="pagination justify-content-center mb-0">
                            {/* First page */}
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                              <button
                                className="page-link border-0 rounded-3 me-1 shadow-sm"
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                                style={{ 
                                  backgroundColor: currentPage === 1 ? '#f8f9fa' : '#fff',
                                  color: currentPage === 1 ? '#6c757d' : '#0d6efd',
                                  width: '42px',
                                  height: '42px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="First page"
                              >
                                <i className="fas fa-angle-double-left"></i>
                              </button>
                            </li>
                            
                            {/* Previous page */}
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                              <button
                                className="page-link border-0 rounded-3 me-1 shadow-sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{
                                  backgroundColor: currentPage === 1 ? '#f8f9fa' : '#fff',
                                  color: currentPage === 1 ? '#6c757d' : '#0d6efd',
                                  width: '42px',
                                  height: '42px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Previous page"
                              >
                                <i className="fas fa-angle-left"></i>
                              </button>
                            </li>

                            {/* Page numbers with modern styling */}
                            {getPaginationNumbers().map((pageNum, index) => (
                              <li key={index} className="page-item">
                                {pageNum === '...' ? (
                                  <span 
                                    className="page-link border-0 me-1"
                                    style={{
                                      backgroundColor: 'transparent',
                                      color: '#6c757d',
                                      width: '42px',
                                      height: '42px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'default'
                                    }}
                                  >
                                    ...
                                  </span>
                                ) : (
                                  <button
                                    className="page-link border-0 rounded-3 me-1 shadow-sm"
                                    onClick={() => handlePageChange(Number(pageNum))}
                                    style={{
                                      backgroundColor: currentPage === pageNum ? '#0d6efd' : '#fff',
                                      color: currentPage === pageNum ? '#fff' : '#0d6efd',
                                      fontWeight: currentPage === pageNum ? 'bold' : 'normal',
                                      width: '42px',
                                      height: '42px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s ease-in-out'
                                    }}
                                    title={`Go to page ${pageNum}`}
                                  >
                                    {pageNum}
                                  </button>
                                )}
                              </li>
                            ))}

                            {/* Next page */}
                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                              <button
                                className="page-link border-0 rounded-3 me-1 shadow-sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                style={{
                                  backgroundColor: currentPage === totalPages ? '#f8f9fa' : '#fff',
                                  color: currentPage === totalPages ? '#6c757d' : '#0d6efd',
                                  width: '42px',
                                  height: '42px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Next page"
                              >
                                <i className="fas fa-angle-right"></i>
                              </button>
                            </li>
                            
                            {/* Last page */}
                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                              <button
                                className="page-link border-0 rounded-3 shadow-sm"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                style={{
                                  backgroundColor: currentPage === totalPages ? '#f8f9fa' : '#fff',
                                  color: currentPage === totalPages ? '#6c757d' : '#0d6efd',
                                  width: '42px',
                                  height: '42px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Last page"
                              >
                                <i className="fas fa-angle-double-right"></i>
                              </button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProductPage;
                               