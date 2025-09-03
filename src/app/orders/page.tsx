'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Image, Shimmer } from "react-shimmer";

import { 
  getOrderList, 
  formatOrderStatus, 
  formatPaymentStatus, 
  formatShippingStatus,
  getStatusBadgeClass,
  formatCurrency,
  formatDate,
  type OrderListItem, 
  type OrderListParams, 
  type OrderListResponse 
} from '@/services/orderService';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<OrderListResponse['pagination'] | null>(null);
  const [statistics, setStatistics] = useState<OrderListResponse['statistics'] | null>(null);
  const [filters, setFilters] = useState<OrderListParams>({
    page: 1,
    limit: 10,
    status: '',
    payment_status: '',
    shipping_status: ''
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const cleanFilters: OrderListParams = {
        page: filters.page,
        limit: filters.limit,
      };
      
      if (filters.status) cleanFilters.status = filters.status;
      if (filters.payment_status) cleanFilters.payment_status = filters.payment_status;
      if (filters.shipping_status) cleanFilters.shipping_status = filters.shipping_status;

      const response = await getOrderList(cleanFilters);
      setOrders(response.orders);
      setPagination(response.pagination);
      setStatistics(response.statistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (key: keyof OrderListParams, value: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      [key]: value || ''
    }));
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { class: 'bg-warning text-dark', text: 'Menunggu' },
      'paid': { class: 'bg-success text-white', text: 'Lunas' },
      'failed': { class: 'bg-danger text-white', text: 'Gagal' },
      'expired': { class: 'bg-secondary text-white', text: 'Kadaluarsa' },
      'cancelled': { class: 'bg-dark text-white', text: 'Dibatalkan' }
    };
    const badge = statusMap[status as keyof typeof statusMap] || { class: 'bg-light text-dark', text: status };
    
    return (
      <span className={`badge ${badge.class} fw-normal`}>
        {badge.text}
      </span>
    );
  };

  const getShippingStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { class: 'bg-warning text-dark', text: 'Menunggu', icon: 'fas fa-clock' },
      'processing': { class: 'bg-info text-white', text: 'Diproses', icon: 'fas fa-cogs' },
      'shipped': { class: 'bg-primary text-white', text: 'Dikirim', icon: 'fas fa-shipping-fast' },
      'delivered': { class: 'bg-success text-white', text: 'Terkirim', icon: 'fas fa-check-circle' },
      'cancelled': { class: 'bg-dark text-white', text: 'Dibatalkan', icon: 'fas fa-times-circle' }
    };
    const badge = statusMap[status as keyof typeof statusMap] || { class: 'bg-light text-dark', text: status, icon: 'fas fa-question' };
    
    return (
      <span className={`badge ${badge.class} fw-normal`}>
        <i className={`${badge.icon} me-1`}></i>
        {badge.text}
      </span>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-5">
        {/* Header Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h1 className="h2 fw-bold text-dark mb-1">
                  <i className="fas fa-shopping-bag text-primary me-2"></i>
                  Pesanan Saya
                </h1>
                <p className="text-muted mb-0">Kelola dan pantau semua pesanan Anda</p>
              </div>
              <div className="text-end d-none d-md-block">
                <small className="text-muted">
                  <i className="fas fa-calendar me-1"></i>
                  {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                        <i className="fas fa-shopping-cart text-primary fs-5"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="h4 fw-bold mb-0 text-primary">{statistics.total_orders}</div>
                      <div className="small text-muted">Total Pesanan</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                        <i className="fas fa-clock text-warning fs-5"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="h4 fw-bold mb-0 text-warning">{statistics.pending_orders}</div>
                      <div className="small text-muted">Menunggu Bayar</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                        <i className="fas fa-check-circle text-success fs-5"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="h4 fw-bold mb-0 text-success">{statistics.paid_orders - statistics.delivered_orders}</div>
                      <div className="small text-muted">Sudah Bayar</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                        <i className="fas fa-truck text-info fs-5"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="h4 fw-bold mb-0 text-info">{statistics.delivered_orders}</div>
                      <div className="small text-muted">Terkirim</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="card-title mb-0">
              <i className="fas fa-filter text-primary me-2"></i>
              Filter Pesanan
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  <i className="fas fa-list-alt me-1"></i>
                  Status Pesanan
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="form-select"
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Menunggu Pembayaran</option>
                  <option value="paid">Sudah Dibayar</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
              
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  <i className="fas fa-credit-card me-1"></i>
                  Status Pembayaran
                </label>
                <select
                  value={filters.payment_status || ''}
                  onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                  className="form-select"
                >
                  <option value="">Semua</option>
                  <option value="pending">Menunggu</option>
                  <option value="paid">Lunas</option>
                  <option value="failed">Gagal</option>
                  <option value="expired">Kadaluarsa</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
              
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  <i className="fas fa-shipping-fast me-1"></i>
                  Status Pengiriman
                </label>
                <select
                  value={filters.shipping_status || ''}
                  onChange={(e) => handleFilterChange('shipping_status', e.target.value)}
                  className="form-select"
                >
                  <option value="">Semua</option>
                  <option value="pending">Menunggu</option>
                  <option value="processing">Diproses</option>
                  <option value="shipped">Dikirim</option>
                  <option value="delivered">Terkirim</option>
                </select>
              </div>
              
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  <i className="fas fa-list me-1"></i>
                  Item per Halaman
                </label>
                <select
                  value={filters.limit || 10}
                  onChange={(e) => handleFilterChange('limit', e.target.value)}
                  className="form-select"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <div>{error}</div>
          </div>
        )}

        {/* Orders List */}
        <div className="card border-0 shadow-sm">
          {orders.length === 0 ? (
            <div className="card-body text-center py-5">
              <div className="mb-4">
                <i className="fas fa-shopping-bag text-muted" style={{ fontSize: '4rem' }}></i>
              </div>
              <h4 className="text-muted mb-3">Belum Ada Pesanan</h4>
              <p className="text-muted mb-4">Anda belum memiliki pesanan apapun saat ini.</p>
              <Link href="/products" className="btn btn-primary">
                <i className="fas fa-shopping-cart me-2"></i>
                Mulai Berbelanja
              </Link>
            </div>
          ) : (
            <>
              {/* Orders List Header */}
              <div className="card-header bg-white py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">
                    <i className="fas fa-list-ul text-primary me-2"></i>
                    Daftar Pesanan
                  </h5>
                  {pagination && (
                    <small className="text-muted">
                      {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total_items)} dari {pagination.total_items} pesanan
                    </small>
                  )}
                </div>
              </div>

              <div className="card-body p-0">
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <div key={order.id} className={`p-4 ${index !== orders.length - 1 ? 'border-bottom' : ''} order-item`}>
                    
                    {/* Order Header */}
                    <div className="row align-items-center mb-3">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                            <i className="fas fa-receipt text-primary"></i>
                          </div>
                          <div>
                            <Link 
                              href={`/orders/${order.id}`}
                              className="h6 mb-0 text-decoration-none fw-bold order-link"
                            >
                              {order.reference === undefined ? (
                                <Shimmer width={100} height={20} />
                              ) : order.reference ? (
                                order.reference
                              ) : (
                                "-"
                              )}
                            </Link>

                            <div className="small text-muted">
                              <i className="fas fa-calendar-alt me-1"></i>
                              {order.created_at ? formatDate(order.created_at) : <Shimmer width={80} height={14} />}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 text-md-end mt-2 mt-md-0">
                        <div className="h5 fw-bold text-success mb-1">
                          {order.total_price_formatted || <Shimmer width={60} height={24} />}
                        </div>
                        <div className="small text-muted">
                          <i className="fas fa-box me-1"></i>
                          {order.total_items != null ? `${order.total_items} item` : <Shimmer width={40} height={14} />}
                        </div>
                      </div>
                    </div>

                    {/* Product Preview */}
                    <div className="row align-items-center mb-3">
                      <div className="col-12">
                        <div className="d-flex align-items-center bg-light rounded p-3">
                          
                          {order.first_product.image ? (
                            <div style={{ width: 60, height: 60, position: 'relative' }}>
                              <Shimmer width={60} height={60} />
                              <img
                                src={order.first_product.image.small}
                                alt={order.first_product.title}
                                className="rounded border"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                                onLoad={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  const shimmer = target.previousElementSibling as HTMLElement | null;
                                  if (shimmer) shimmer.style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <Shimmer width={60} height={60} />
                          )}

                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-1 fw-semibold">
                              {order.first_product.title || <Shimmer width={120} height={18} />}
                            </h6>
                            {order.total_items > 1 ? (
                              <p className="small text-muted mb-0">
                                <i className="fas fa-plus me-1"></i>
                                dan {order.total_items - 1} item lainnya
                              </p>
                            ) : (
                              !order.total_items && <Shimmer width={100} height={14} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="row align-items-center mb-3">
                      <div className="col-md-8">
                        <div className="d-flex gap-2 flex-wrap">
                          <div className="d-flex align-items-center">
                            <small className="text-muted me-2">Pembayaran:</small>
                            {order.payment_status ? getPaymentStatusBadge(order.payment_status) : <Shimmer width={80} height={20} />}
                          </div>
                          <div className="d-flex align-items-center">
                            <small className="text-muted me-2">Pengiriman:</small>
                            {order.shipping_status ? getShippingStatusBadge(order.shipping_status) : <Shimmer width={80} height={20} />}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 text-md-end mt-2 mt-md-0">
                        <div className="btn-group" role="group">
                          {order.can_pay && order.payment_url && (
                            <a
                              href={order.payment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-success btn-sm"
                            >
                              <i className="fas fa-credit-card me-1"></i>
                              Bayar
                            </a>
                          )}
                          <Link href={`/orders/${order.id}`} className="btn btn-outline-primary btn-sm">
                            <i className="fas fa-eye me-1"></i>
                            Detail
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="row">
                      <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center text-small bg-white border rounded p-3">
                          <div className="d-flex align-items-center text-muted">
                            <i className="fas fa-truck me-2"></i>
                            {order.courier ? (
                              <span>Kurir: <strong>{order.courier}</strong> - {order.service}</span>
                            ) : (
                              <Shimmer width={120} height={14} />
                            )}
                          </div>

                          <div className="d-flex gap-3">
                            {/* {order.tracking_number ? (
                              <span className="badge bg-info text-white">
                                <i className="fas fa-barcode me-1"></i>
                                Resi: {order.tracking_number}
                              </span>
                            ) : (
                              <Shimmer width={80} height={20} />
                            )}

                            {order.estimated_delivery ? (
                              <small className="text-muted">
                                <i className="fas fa-calendar-check me-1"></i>
                                Estimasi: {formatDate(order.estimated_delivery)}
                              </small>
                            ) : (
                              <Shimmer width={100} height={14} />
                            )} */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Tidak ada order tersedia</p>
              )}
              </div>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="card-footer bg-white py-3">
                  <nav aria-label="Orders pagination">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="text-muted small">
                        Halaman {pagination.current_page} dari {pagination.total_pages}
                      </div>
                      
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${!pagination.has_prev || loading ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.prev_page!)}
                            disabled={!pagination.has_prev || loading}
                          >
                            <i className="fas fa-chevron-left me-1"></i>
                            Sebelumnya
                          </button>
                        </li>
                        
                        <li className="page-item active">
                          <span className="page-link">
                            {pagination.current_page}
                          </span>
                        </li>
                        
                        <li className={`page-item ${!pagination.has_next || loading ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.next_page!)}
                            disabled={!pagination.has_next || loading}
                          >
                            Selanjutnya
                            <i className="fas fa-chevron-right ms-1"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .order-item {
          transition: all 0.2s ease;
        }
        
        .order-item:hover {
          background-color: #f8f9fa !important;
          transform: translateY(-1px);
        }
        
        .order-link {
          transition: color 0.2s ease;
        }
        
        .order-link:hover {
          color: #0d6efd !important;
        }
        
        .card {
          transition: box-shadow 0.2s ease;
        }
        
        .card:hover {
          box-shadow: 0 0.125rem 0.75rem rgba(0, 0, 0, 0.1) !important;
        }
        
        .btn {
          transition: all 0.2s ease;
        }
        
        .btn:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}