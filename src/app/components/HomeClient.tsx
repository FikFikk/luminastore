"use client";

import { useState, useEffect } from "react";
import { utilsService, CarouselSlide, Product, SiteConfig } from "@/services/utilsService";
import { Shimmer } from "react-shimmer";
import Link from "next/link";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const {user} = useAppSelector((state) => state.auth);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [carouselData, latestData, popularData, configData] = await Promise.all([
          utilsService.getCarouselSlides(),
          utilsService.getLatestProducts(1, 3),
          utilsService.getPopularProducts(1, 3),
          utilsService.getSiteConfig(),
        ]);

        setCarouselSlides(carouselData.slides);
        setLatestProducts(latestData.products);
        setPopularProducts(popularData.products);
        setSiteConfig(configData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto slide carousel
  useEffect(() => {
    if (carouselSlides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [carouselSlides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="min-vh-100 d-flex justify-content-center align-items-center">Loading your furniture collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentSlideData = carouselSlides[currentSlide];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                {currentSlideData?.title || siteConfig?.site_name || "Modern Interior Design Studio"}
              </h1>
              <p className="hero-description">
                {currentSlideData?.description || siteConfig?.tagline || "Discover premium furniture designed for modern living"}
              </p>
              <div className="hero-buttons flex gap-3 mt-4">
                <Link 
                  href={currentSlideData?.button_link || "#"} 
                  className="btn btn-primary px-4 py-2 rounded-lg"
                >
                  {currentSlideData?.button_text || "Shop Now"}
                </Link>
                <Link 
                  href="/product" 
                  className="btn btn-outline-light px-4 py-2 rounded-lg"
                >
                  Explore Collection
                </Link>
              </div>
            </div>

            <div className="hero-carousel">
              {carouselSlides.length > 0 ? (
                <>
                  <div className="carousel-main">
                    <div className="carousel-viewport">
                      {carouselSlides.map((slide, index) => (
                        <div 
                          key={slide.id} 
                          className={`slide ${index === currentSlide ? 'active' : ''}`}
                        >
                          <div style={{ width: 600, height: 400, position: 'relative' }}>
                            <Shimmer width={600} height={400} />
                            <img
                              src={slide.image.medium}
                              alt={slide.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                              onLoad={(e) => {
                                const target = e.target as HTMLImageElement; // cast here
                                const shimmer = target.previousElementSibling as HTMLElement | null;
                                if (shimmer) shimmer.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {carouselSlides.length > 1 && (
                      <>
                        <button className="nav-btn prev" onClick={prevSlide}>
                          <span>←</span>
                        </button>
                        <button className="nav-btn next" onClick={nextSlide}>
                          <span>→</span>
                        </button>
                      </>
                    )}
                  </div>

                  {carouselSlides.length > 1 && (
                    <div className="carousel-dots">
                      {carouselSlides.map((slide, index) => (
                        <button
                          key={slide.id}
                          className={`dot ${index === currentSlide ? 'active' : ''}`}
                          onClick={() => goToSlide(index)}
                        >
                          <div style={{ width: 50, height: 50, position: 'relative' }}>
                            <Shimmer width={50} height={50} />
                            <img
                              src={slide.image.small}
                              alt={slide.title}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                position: 'absolute',
                                top: 0,
                                left: 0
                              }}
                              onLoad={(e) => {
                                const target = e.target as HTMLImageElement; // cast here
                                const shimmer = target.previousElementSibling as HTMLElement | null;
                                if (shimmer) shimmer.style.display = 'none';
                              }}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="carousel-placeholder">
                  <p>No carousel slides available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="products-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Latest Products</h2>
            <p>Discover our newest collection of premium furniture</p>
          </div>
          
          <div className="products-grid">
            {latestProducts.length > 0 ? (
              latestProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <Link href={`/product/${product.slug}`} className="product-link">
                    <div className="product-image">
                      {product.image ? (
                        <div style={{ width: 280, height: 280, position: 'relative' }}>
                          <Shimmer width={280} height={280} />
                          <img
                            src={product.image.medium}
                            alt={product.title}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              position: 'absolute',
                              top: 0,
                              left: 0
                            }}
                            onLoad={(e) => {
                                const target = e.target as HTMLImageElement; // cast here
                                const shimmer = target.previousElementSibling as HTMLElement | null;
                                if (shimmer) shimmer.style.display = 'none';
                              }}
                          />
                        </div>
                      ) : (
                        <div className="image-placeholder">No Image</div>
                      )}
                      {!product.has_stock && (
                        <div className="stock-badge out-of-stock">Out of Stock</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.title}</h3>
                      <p className="product-price">
                        {product.price_range.display || 'Price not available'}
                      </p>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="no-products">
                <p>No latest products available</p>
              </div>
            )}
          </div>
          
          <div className="section-footer">
            <Link href="/product" className="view-all-btn">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      {/* Popular Products Section */}
      <section className="popular-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Best Selling Products</h2>
            <p>Our most popular items based on customer orders</p>
          </div>
          
          <div className="popular-grid">
            {popularProducts.length > 0 ? (
              popularProducts.map((product, index) => (
                <div key={product.id} className="popular-card">
                  <div className="popular-image">
                    {product.image ? (
                      <div style={{ width: 120, height: 120, position: 'relative' }}>
                        <Shimmer width={120} height={120} />
                        <img
                          src={product.image.medium}
                          alt={product.title}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                          onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
                            const shimmer = target.previousElementSibling as HTMLElement | null;
                            if (shimmer) shimmer.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="image-placeholder-small">No Image</div>
                    )}
                  </div>
                  <div className="popular-info">
                    <div className="popular-content">
                      <div className="popular-header">
                        <h3>
                          <Link href={`/product/${product.slug}`}>{product.title}</Link>
                        </h3>
                        <span className="rank">#{index + 1}</span>
                      </div>
                      <p className="sales-info">
                        {product.total_sold ? `${product.total_sold} sold` : 'Popular choice'}
                      </p>
                      <p className="popular-price">
                        {product.price_range.display || 'Price not available'}
                      </p>
                    </div>
                    <Link href={`/product/${product.slug}`} className="view-btn">
                      View Product
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-products">
                <p>No popular products available</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-lg-6">
              <h2 className="section-title">
                {siteConfig?.about.title || "Why Choose Us"}
              </h2>
              <div 
                className="about-content"
                dangerouslySetInnerHTML={{
                  __html: siteConfig?.about.content || 
                    "Donec vitae odio quis nisl dapibus malesuada. Nullam ac aliquet velit. Aliquam vulputate velit imperdiet dolor tempor tristique."
                }}
              />
            </div>

            <div className="col-lg-5">
              <div className="img-wrap">
                {siteConfig?.about.image ? (
                  <div style={{ width: 500, height: 400, position: 'relative' }}>
                    <Shimmer width={500} height={400} />
                    <img
                      src={siteConfig.about.image.medium}
                      alt={siteConfig.about.title}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement; // cast here
                        const shimmer = target.previousElementSibling as HTMLElement | null;
                        if (shimmer) shimmer.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ width: 500, height: 400, position: 'relative' }}>
                    <Shimmer width={500} height={400} />
                    <img
                      src="/assets/images/why-choose-us-img.jpg"
                      alt="Why Choose Us"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement; // cast here
                        const shimmer = target.previousElementSibling as HTMLElement | null;
                        if (shimmer) shimmer.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Popular Products Grid */
        .popular-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 32px;
        }

        /* Popular Card - Flexbox untuk alignment */
        .popular-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%; /* Membuat semua card sama tinggi */
        }

        .popular-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        /* Popular Image */
        .popular-image {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }

        .image-placeholder-small {
          width: 120px;
          height: 120px;
          background: #f0f0f0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: 14px;
        }

        /* Popular Info - Key untuk alignment */
        .popular-info {
          display: flex;
          flex-direction: column;
          flex: 1; /* Mengambil sisa ruang yang tersedia */
        }

        /* Popular Header */
        .popular-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .popular-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          line-height: 1.3;
          flex: 1;
          margin-right: 12px;
        }

        .popular-header h3 a {
          color: #333;
          text-decoration: none;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .popular-header h3 a:hover {
          color: #007bff;
        }

        .rank {
          background: #007bff;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        /* Sales Info & Price */
        .sales-info {
          color: #666;
          font-size: 14px;
          margin: 4px 0;
        }

        .popular-price {
          color: #007bff;
          font-weight: 600;
          font-size: 16px;
          margin: 8px 0 16px 0;
        }

        /* View Button - Selalu di bottom dengan margin-top: auto */
        .view-btn {
          display: inline-block;
          background: #007bff;
          color: white;
          text-decoration: none;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          transition: background-color 0.3s ease;
          margin-top: auto; /* Key: Mendorong button ke bawah */
        }

        .view-btn:hover {
          background: #0056b3;
          color: white;
        }

        /* No Products */
        .no-products {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .popular-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
          }
          
          .popular-card {
            padding: 16px;
          }
        }

        @media (max-width: 480px) {
          .popular-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
        .homepage {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Loading & Error States */
        .loading-container, .error-container {
          min-height: 50vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 1rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3b5d50;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-card {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 400px;
        }

        .retry-btn {
          background: #3b5d50;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 1rem;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: 80vh;
          display: flex;
          align-items: center;
          padding: 4rem 0;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 3rem;
          align-items: center;
        }

        .hero-text {
          z-index: 2;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .hero-description {
          font-size: 1.2rem;
          color: #6c757d;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn-primary, .btn-secondary {
          padding: 12px 30px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          display: inline-block;
        }

        .btn-primary {
          background: #3b5d50;
          color: white;
          border: 2px solid #3b5d50;
        }

        .btn-primary:hover {
          background: #2a4238;
          border-color: #2a4238;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: transparent;
          color: #3b5d50;
          border: 2px solid #3b5d50;
        }

        .btn-secondary:hover {
          background: #3b5d50;
          color: white;
          transform: translateY(-2px);
        }

        /* Carousel Styles */
        .hero-carousel {
          position: relative;
        }

        .carousel-main {
          position: relative;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        .carousel-viewport {
          position: relative;
          height: 400px;
          overflow: hidden;
        }

        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 0.6s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
        }

        .slide.active {
          opacity: 1;
        }

        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.9);
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          color: #3b5d50;
          z-index: 10;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .nav-btn:hover {
          background: white;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .nav-btn.prev {
          left: 15px;
        }

        .nav-btn.next {
          right: 15px;
        }

        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 1.5rem;
        }

        .dot {
          width: 60px;
          height: 60px;
          border: 3px solid #ddd;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s ease;
          padding: 0;
        }

        .dot.active {
          border-color: #3b5d50;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 93, 80, 0.3);
        }

        .dot:hover {
          border-color: #3b5d50;
          transform: scale(1.05);
        }

        .carousel-placeholder {
          height: 400px;
          background: #f8f9fa;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
        }

        /* Products Section */
        .products-section {
          padding: 5rem 0;
          background: white;
        }

        .section-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          color: #2c3e50;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .section-header p {
          font-size: 1.1rem;
          color: #6c757d;
          max-width: 600px;
          margin: 0 auto;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .product-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }

        .product-link {
          text-decoration: none;
          color: inherit;
        }

        .product-image {
          position: relative;
          height: 280px;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-placeholder {
          color: #6c757d;
          font-weight: 500;
        }

        .stock-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .out-of-stock {
          background: #dc3545;
          color: white;
        }

        .product-info {
          padding: 1.5rem;
        }

        .product-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .product-price {
          font-size: 1.1rem;
          color: #3b5d50;
          font-weight: 600;
          margin: 0;
        }

        .section-footer {
          text-align: center;
        }

        .view-all-btn {
          background: #3b5d50;
          color: white;
          padding: 12px 30px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .view-all-btn:hover {
          background: #2a4238;
          transform: translateY(-2px);
          color: white;
        }

        /* Popular Products Section */
        .popular-section {
          padding: 5rem 0;
          background: #f8f9fa;
        }

        .popular-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .popular-card {
          background: white;
          border-radius: 15px;
          padding: 1.5rem;
          display: flex;
          gap: 1.5rem;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }

        .popular-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }

        .popular-image {
          flex-shrink: 0;
        }

        .image-placeholder-small {
          width: 120px;
          height: 120px;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .popular-info {
          flex: 1;
        }

        .popular-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .popular-header h3 {
          font-size: 1.1rem;
          margin: 0;
        }

        .popular-header a {
          color: #2c3e50;
          text-decoration: none;
          font-weight: 600;
        }

        .popular-header a:hover {
          color: #3b5d50;
        }

        .rank {
          background: #28a745;
          color: white;
          padding: 4px 8px;
          border-radius: 5px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .sales-info {
          color: #6c757d;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .popular-price {
          color: #3b5d50;
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .view-btn {
          background: #3b5d50;
          color: white;
          padding: 8px 20px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }
          

        .view-btn:hover {
          background: #2a4238;
          color: white;
          transform: translateY(-1px);
        }

        /* Features Section */
        .features-section {
          padding: 5rem 0;
          background: white;
        }

        .features-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .features-text h2 {
          font-size: 2.5rem;
          color: #2c3e50;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .features-text > p {
          font-size: 1.1rem;
          color: #6c757d;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .feature {
          text-align: center;
        }

        .feature-icon {
          background: #f8f9fa;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          transition: all 0.3s ease;
        }

        .feature:hover .feature-icon {
          background: #3b5d50;
        }

        .feature:hover .feature-icon img {
          filter: brightness(0) invert(1);
        }

        .feature h3 {
          font-size: 1.1rem;
          color: #2c3e50;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .feature p {
          color: #6c757d;
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
        }

        .features-image {
          position: relative;
        }

        .features-image img {
          border-radius: 20px;
          width: 100%;
          height: auto;
        }

        .no-products {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          color: #6c757d;
        }

        /* Responsive Design */
        @media (max-width: 968px) {
          .hero-content {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }

          .features-content {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .products-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
          }

          .popular-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .popular-card {
            flex-direction: column;
            text-align: center;
          }

          .carousel-viewport {
            height: 300px;
          }

          .nav-btn {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }

          .dot {
            width: 50px;
            height: 50px;
          }
        }

        @media (max-width: 480px) {
          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }

          .btn-primary, .btn-secondary {
            width: 100%;
            max-width: 200px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}