'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getOrderById, 
  updateOrderStatus, 
  cancelOrder, 
  formatDate,
} from '@/services/orderService';

import { 
  DuitkuPaymentMethodsResponse,
  DuitkuPaymentMethod
} from "@/services/duitkuService";
import { Shimmer } from 'react-shimmer';
import { IOrderDetailResponse } from '@/app/components/inteface/IOrderDetailResponse';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string);
  
  const [orderDetail, setOrderDetail] = useState<IOrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await getOrderById(orderId);
      setOrderDetail(orderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  const getTotalAmount = () => {
    const baseAmount = order.total_price_formatted;
    // const paymentFee = getSelectedPaymentMethodFee();
    return baseAmount;
  };
  // Function to get selected payment method fee
  // const getSelectedPaymentMethodFee = (): number => {
  //   if (!paymentMethod || !selectedPaymentMethod) return 0;
  //   return Number(selectedPaymentMethod.totalFee) || 0;
  // };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!orderDetail?.order) return;
    
    try {
      setUpdating(true);
      const updatedOrder = await updateOrderStatus(orderDetail.order.id, newStatus);
      await fetchOrder();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderDetail?.order || !confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;
    
    try {
      setCancelling(true);
      await cancelOrder(orderDetail.order.id);
      await fetchOrder();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { class: 'bg-warning text-dark', text: 'Menunggu', icon: 'fas fa-clock' },
      'paid': { class: 'bg-success text-white', text: 'Lunas', icon: 'fas fa-check-circle' },
      'failed': { class: 'bg-danger text-white', text: 'Gagal', icon: 'fas fa-times-circle' },
      'expired': { class: 'bg-secondary text-white', text: 'Kadaluarsa', icon: 'fas fa-hourglass-end' },
      'cancelled': { class: 'bg-dark text-white', text: 'Dibatalkan', icon: 'fas fa-ban' }
    };
    const badge = statusMap[status as keyof typeof statusMap] || { class: 'bg-light text-dark', text: status, icon: 'fas fa-question' };
    
    return (
      <span className={`badge ${badge.class} fw-normal px-3 py-2`}>
        <i className={`${badge.icon} me-2`}></i>
        {badge.text}
      </span>
    );
  };

  const getShippingStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { class: 'bg-warning text-dark', text: 'Menunggu', icon: 'fas fa-clock' },
      'processing': { class: 'bg-info text-white', text: 'Diproses', icon: 'fas fa-cogs' },
      'shipped': { class: 'bg-primary text-white', text: 'Dikirim', icon: 'fas fa-shipping-fast' },
      'delivered': { class: 'bg-success text-white', text: 'Terkirim', icon: 'fas fa-check-double' }
    };
    const badge = statusMap[status as keyof typeof statusMap] || { class: 'bg-light text-dark', text: status, icon: 'fas fa-question' };
    
    return (
      <span className={`badge ${badge.class} fw-normal px-3 py-2`}>
        <i className={`${badge.icon} me-2`}></i>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Memuat detail pesanan...</h5>
        </div>
      </div>
    );
  }

  if (error && !orderDetail) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card border-0 shadow">
                <div className="card-body text-center p-5">
                  <div className="text-danger mb-4">
                    <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h4 className="text-danger mb-3">Terjadi Kesalahan</h4>
                  <p className="text-muted mb-4">{error}</p>
                  <div className="d-flex gap-2 justify-content-center">
                    <button
                      onClick={() => router.back()}
                      className="btn btn-secondary"
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Kembali
                    </button>
                    <button
                      onClick={fetchOrder}
                      className="btn btn-primary"
                    >
                      <i className="fas fa-redo me-2"></i>
                      Coba Lagi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetail) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="mb-4">
            <i className="fas fa-search text-muted" style={{ fontSize: '3rem' }}></i>
          </div>
          <h4 className="text-muted mb-3">Pesanan Tidak Ditemukan</h4>
          <Link href="/orders" className="btn btn-primary">
            <i className="fas fa-arrow-left me-2"></i>
            Kembali ke Daftar Pesanan
          </Link>
        </div>
      </div>
    );
  }

  const { order, items, customer, shipping_address } = orderDetail;

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-5">
        {/* Breadcrumb & Header */}
        <div className="row mb-4">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/orders" className="text-decoration-none">
                    <i className="fas fa-shopping-bag me-1"></i>
                    Pesanan
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">#{order.reference}</li>
              </ol>
            </nav>
            
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
              <div className="mb-3 mb-md-0">
                <h1 className="h2 fw-bold text-dark mb-2">
                  <i className="fas fa-receipt text-primary me-2"></i>
                  Detail Pesanan
                </h1>
                <div className="d-flex align-items-center gap-3">
                  <span className="h5 text-primary mb-0">#{order.reference}</span>
                  <span className="badge bg-light text-dark">
                    <i className="fas fa-calendar me-1"></i>
                    {formatDate(order.created_at)}
                  </span>
                </div>
              </div>
              
              <div className="d-flex gap-2">
                {order.can_cancel && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="btn btn-outline-danger"
                  >
                    <i className="fas fa-times me-2"></i>
                    {cancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
                  </button>
                )}
                
                {order.can_pay && order.payment_url && (
                  <a
                    href={order.payment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success"
                  >
                    <i className="fas fa-credit-card me-2"></i>
                    Bayar Sekarang
                  </a>
                )}
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

        {/* Order Status Timeline */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-gradient-primary text-white py-3">
            <h5 className="card-title mb-0">
              <i className="fas fa-chart-line me-2"></i>
              Status Pesanan
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-4">
              <div className="col-md-4">
                <div className="text-center p-3">
                  <div className="mb-3">
                    <i className="fas fa-credit-card text-primary" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h6 className="fw-bold mb-2">Status Pembayaran</h6>
                  {getPaymentStatusBadge(order.payment_status)}
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="text-center p-3">
                  <div className="mb-3">
                    <i className="fas fa-shipping-fast text-primary" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h6 className="fw-bold mb-2">Status Pengiriman</h6>
                  {getShippingStatusBadge(order.shipping_status)}
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="text-center p-3">
                  <div className="mb-3">
                    <i className="fas fa-calendar-check text-primary" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h6 className="fw-bold mb-2">Estimasi Pengiriman</h6>
                  {order.etd ? (
                    <span className="badge bg-info text-white px-3 py-2">
                      <i className="fas fa-clock me-1"></i>
                      {order.etd}
                    </span>
                  ) : (
                    <span className="badge bg-light text-dark px-3 py-2">Belum tersedia</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tracking Number */}
            {order.tracking_number && (
              <div className="row mt-4">
                <div className="col-12">
                  <div className="alert alert-info d-flex align-items-center">
                    <i className="fas fa-barcode me-3 fs-4"></i>
                    <div>
                      <h6 className="alert-heading mb-1">Nomor Resi Pengiriman</h6>
                      <p className="mb-0 fw-bold">{order.tracking_number}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="card-title mb-0">
              <i className="fas fa-box text-primary me-2"></i>
              Item Pesanan ({order.total_items ?? <Shimmer width={30} height={20} />})
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="border-0 ps-4">Produk</th>
                    <th scope="col" className="border-0 text-center">Qty</th>
                    <th scope="col" className="border-0 text-end">Harga</th>
                    <th scope="col" className="border-0 text-end pe-4">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center">
                            {item.product_image ? (
                              <div style={{ width: 60, height: 60, position: 'relative' }}>
                                <Shimmer width={60} height={60} />
                                <img
                                  src={item.product_image.small}
                                  alt={item.product_title}
                                  className="rounded border me-3"
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
                            <div>
                              <h6 className="mb-1 fw-semibold">
                                {item.product_title || <Shimmer width={120} height={18} />}
                              </h6>
                              {item.variant_title ? (
                                <small className="text-muted">
                                  <i className="fas fa-tag me-1"></i>
                                  Varian: {item.variant_title}
                                </small>
                              ) : (
                                <Shimmer width={80} height={14} />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3">
                          {item.quantity != null ? (
                            <span className="badge bg-primary">{item.quantity}</span>
                          ) : (
                            <Shimmer width={30} height={20} />
                          )}
                        </td>
                        <td className="text-end py-3">
                          {item.price_formatted || <Shimmer width={60} height={18} />}
                        </td>
                        <td className="text-end py-3 pe-4">
                          {item.subtotal_formatted || <Shimmer width={60} height={18} />}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>
                        <Shimmer width={100} height={40} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Order Summary */}
            <div className="border-top bg-light p-4">
              <div className="row justify-content-end">
                <div className="col-md-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal ({order.total_quantity ?? <Shimmer width={30} height={14} />} item):</span>
                    <span className="fw-semibold">{order.subtotal_formatted || <Shimmer width={60} height={18} />}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">
                      <i className="fas fa-truck me-1"></i>
                      Ongkos Kirim:
                    </span>
                    <span className="fw-semibold">{order.shipping_cost_formatted || <Shimmer width={60} height={18} />}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Biaya Admin Pembayaran</span>
                    <span className="fw-semibold">{order.fee_formatted || <Shimmer width={60} height={18} />}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between">
                    <span className="h6 fw-bold">Total:</span>
                    <span className="h5 fw-bold text-success">{getTotalAmount() || <Shimmer width={80} height={20} />}</span>
                  </div>

                  {/* Bayar Button */}
                  {orderDetail?.can_pay &&
                  orderDetail?.order.payment_url &&
                  !orderDetail?.is_expired && (
                    <a
                      href={orderDetail.order.payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success btn-sm mt-2"
                    >
                      <i className="fas fa-credit-card me-1"></i>
                      Bayar
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="row g-4">
          {/* Customer Information */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white py-3">
                <h5 className="card-title mb-0">
                  <i className="fas fa-user text-primary me-2"></i>
                  Informasi Pelanggan
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                        <i className="fas fa-user text-primary"></i>
                      </div>
                      <div>
                        <label className="small text-muted mb-0">Nama Lengkap</label>
                        <div className="fw-semibold">
                          {customer?.name || <Shimmer width={120} height={16} />}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <div className="bg-info bg-opacity-10 p-2 rounded-circle me-3">
                        <i className="fas fa-envelope text-info"></i>
                      </div>
                      <div>
                        <label className="small text-muted mb-0">Email</label>
                        <div className="fw-semibold">
                          {customer?.email || <Shimmer width={180} height={16} />}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {customer.phone && (
                    <div className="col-12">
                      <div className="d-flex align-items-center p-3 bg-light rounded">
                        <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                          <i className="fas fa-phone text-success"></i>
                        </div>
                        <div>
                          <label className="small text-muted mb-0">Nomor Telepon</label>
                          <div className="fw-semibold">
                            {customer?.phone || <Shimmer width={140} height={16} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Information */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white py-3">
                <h5 className="card-title mb-0">
                  <i className="fas fa-truck text-primary me-2"></i>
                  Informasi Pengiriman & Pembayaran
                </h5>
              </div>
              <div className="card-body">
                {/* Payment Method */}
                <div className="mb-4">
                  <div className="d-flex align-items-center p-3 bg-light rounded">
                    <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                      <i className="fas fa-credit-card text-warning"></i>
                    </div>
                    <div>
                      <label className="small text-muted mb-0">Metode Pembayaran</label>
                      <div className="fw-semibold">
                        {order?.payment_method_code || <Shimmer width={100} height={16} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Courier */}
                <div className="mb-4">
                  <div className="d-flex align-items-center p-3 bg-light rounded">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                      <i className="fas fa-shipping-fast text-primary"></i>
                    </div>
                    <div>
                      <label className="small text-muted mb-0">Kurir Pengiriman</label>
                      <div className="fw-semibold">
                        {order?.courier ? `${order.courier} - ${order.service}` : <Shimmer width={160} height={16} />}
                      </div>
                      <div className="fw-semibold">
                        {orderDetail?.tracking_number ? orderDetail.tracking_number : "-"}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {shipping_address && (
                  <div className="border rounded p-3 bg-white">
                    <h6 className="fw-bold mb-3">
                      <i className="fas fa-map-marker-alt text-danger me-2"></i>
                      Alamat Pengiriman
                    </h6>
                    <div className="ps-4">
                      {shipping_address ? (
                        <>
                          <div className="fw-semibold text-dark">{shipping_address.recipient_name}</div>
                          <div className="text-muted small mb-2">{shipping_address.phone_number}</div>
                          <div className="text-muted small">{shipping_address.full_address}</div>
                        </>
                      ) : (
                        <>
                          <Shimmer width={120} height={16} />
                          <Shimmer width={100} height={14} />
                          <Shimmer width={80} height={14} />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #007bff, #0056b3);
        }
        
        .card {
          transition: all 0.2s ease;
        }
        
        .card:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
        }
        
        .btn {
          transition: all 0.2s ease;
        }
        
        .btn:hover {
          transform: translateY(-1px);
        }
        
        .table-hover tbody tr:hover {
          background-color: #f8f9fa;
        }
        
        .order-item {
          transition: background-color 0.2s ease;
        }
        
        .breadcrumb-item + .breadcrumb-item::before {
          content: var(--bs-breadcrumb-divider, ">");
          color: #6c757d;
        }
        
        @media (max-width: 768px) {
          .table-responsive {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
}