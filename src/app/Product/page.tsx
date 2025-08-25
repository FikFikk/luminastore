"use client";

import React, { useState, useEffect } from "react";
import { getProducts, Product, ProductListParams } from "@/services/productService";

function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filters, setFilters] = useState<ProductListParams>({
    limit: 8,
    page: 1,
    sort_field: "Title",
    sort_dir: "ASC",
  });

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

  // Pagination
  const handlePageChange = (page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchProducts(updatedFilters);
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
              </div>
            </div>
            <div className="col-lg-7"></div>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section className="untree_co-section product-section before-footer-section">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <h5 className="text-danger mb-3">Error loading products</h5>
              <p>{error}</p>
              <button
                onClick={() => fetchProducts()}
                className="btn btn-primary mt-3"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="row">
                {products.map((product) => (
                  <div key={product.id} className="col-12 col-md-4 col-lg-3 mb-5">
                    <a className="product-item" href="#">
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
                        ${product.price?.toFixed(2) || "0.00"}
                      </strong>
                      <span className="icon-cross">
                        <img
                          src="/assets/images/cross.svg"
                          alt="add"
                          className="img-fluid"
                        />
                      </span>
                    </a>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          Previous
                        </button>
                      </li>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <li
                            key={pageNum}
                            className={`page-item ${
                              currentPage === pageNum ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        )
                      )}

                      <li
                        className={`page-item ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
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
