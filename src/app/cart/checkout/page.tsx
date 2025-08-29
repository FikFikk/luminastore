"use client";

import AsyncSelect from "react-select/async";
import { searchDestinations, Destination } from "@/services/rajaongkirService";
import { 
  getShippingOptions,
  ShippingOption,
  ShippingService,
  clearCaches
} from "@/services/rajaongkirService";

import { 
  getDuitkuPaymentMethods, 
  DuitkuPaymentMethodsResponse,
  getPaymentMethodInfo,
  getCategoryDisplayName,
  DuitkuPaymentMethod
} from "@/services/duitkuService";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { getCart, formatPrice, Cart } from "@/services/cartService";
import { 
  getMemberAddresses, 
  createMemberAddress, 
  Address, 
  CreateAddressParams
} from "@/services/addressService";
import { 
  createOrder, 
  CreateOrderParams,
  PaymentResponse 
} from "@/services/orderService";

interface AddressFormData {
  title: string;
  alamat: string;
  kodepos: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  is_default: number;
  province_id: number;
  city_id: number;
  district_id: number;
  subdistrict_id: number;
}

function CheckoutPage() {
  // Cart state
  const [cart, setCart] = useState<Cart>({ items: [], summary: { total_items: 0, total_price: 0, total_weight: 0, items_count: 0 } });
  const [cartLoading, setCartLoading] = useState(true);

  const [paymentMethods, setPaymentMethods] = useState<DuitkuPaymentMethodsResponse | null>(null);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [paymentMethodsError, setPaymentMethodsError] = useState<string>('');
  const [selectedPaymentCategory, setSelectedPaymentCategory] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<DuitkuPaymentMethod | null>(null);

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  // Shipping state with better management
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingService | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  // Request management
  const currentRequestRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  // Add this function to load payment methods
const loadPaymentMethods = useCallback(async () => {
  if (!cart.summary.total_price || cart.summary.total_price <= 0) return;
  
  try {
    setPaymentMethodsLoading(true);
    setPaymentMethodsError('');
    
    const totalAmount = getTotalAmount();
    const methods = await getDuitkuPaymentMethods(totalAmount);
    setPaymentMethods(methods);
    
  } catch (error: any) {
    console.error('Failed to load payment methods:', error);
    setPaymentMethodsError(error.message || 'Gagal memuat metode pembayaran');
  } finally {
    setPaymentMethodsLoading(false);
  }
}, [cart.summary.total_price, selectedShipping]);

useEffect(() => {
  if (!cartLoading && cart.summary.total_price > 0) {
    const timer = setTimeout(() => {
      loadPaymentMethods();
    }, 1000); // Delay to avoid too many API calls
    
    return () => clearTimeout(timer);
  }
}, [cart.summary.total_price, selectedShipping?.cost, loadPaymentMethods]);

  // Optimized shipping options loader with proper cleanup
  const loadShippingOptions = useCallback(async (addressId?: number, weight?: number) => {
    // Use provided parameters or current state
    const targetAddress = addressId ? addresses.find(a => a.ID === addressId) : selectedAddress;
    const targetWeight = weight || cart.summary.total_weight;

    if (!targetAddress || targetWeight <= 0) {
      setShippingOptions([]);
      setShippingError(null);
      return;
    }

    // Create request identifier to prevent race conditions
    const requestId = `${targetAddress.ID}-${targetWeight}-${Date.now()}`;
    currentRequestRef.current = requestId;

    try {
      setShippingLoading(true);
      setShippingError(null);
      setSelectedShipping(null);
      setSelectedCourier(null);
      
      console.log(`Loading shipping options [${requestId}]:`, {
        addressId: targetAddress.ID,
        weight: targetWeight,
        subDistrictId: targetAddress.SubDistrictID
      });
      
      const destinationId = targetAddress.DistrictID;
      if (!destinationId) {
        throw new Error("ID tujuan pengiriman tidak ditemukan pada alamat yang dipilih");
      }

      const options = await getShippingOptions(
        destinationId.toString(),
        targetWeight
      );

      // Check if this request is still current
      if (currentRequestRef.current !== requestId) {
        console.log(`Request ${requestId} cancelled - newer request in progress`);
        return;
      }

      setShippingOptions(options);
      retryCountRef.current = 0; // Reset retry count on success

    } catch (err: any) {
      // Check if this request is still current
      if (currentRequestRef.current !== requestId) {
        console.log(`Request ${requestId} cancelled - newer request in progress`);
        return;
      }

      console.error(`Load shipping options error [${requestId}]:`, err);
      
      let errorMessage = "Gagal memuat ongkir. Silakan coba lagi.";
      
      if (err.message.includes('429') || err.message.toLowerCase().includes('rate limit')) {
        errorMessage = "Sistem sedang sibuk. Silakan tunggu sebentar sebelum mencoba lagi.";
      } else if (err.message.includes('401') || err.message.toLowerCase().includes('auth')) {
        errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
      } else if (err.message.includes('500')) {
        errorMessage = "Terjadi kesalahan server. Silakan coba lagi nanti.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setShippingError(errorMessage);
      setShippingOptions([]);
    } finally {
      // Only update loading state if this is still the current request
      if (currentRequestRef.current === requestId) {
        setShippingLoading(false);
      }
    }
  }, [selectedAddress, cart.summary.total_weight, addresses]);

  // Retry function with exponential backoff
  const retryShippingOptions = useCallback(async () => {
    if (retryCountRef.current >= maxRetries) {
      setShippingError("Telah mencoba beberapa kali namun gagal. Silakan refresh halaman atau coba lagi nanti.");
      return;
    }

    retryCountRef.current++;
    const delay = Math.pow(2, retryCountRef.current) * 1000; // Exponential backoff: 2s, 4s, 8s
    
    setShippingError(`Mencoba lagi dalam ${delay / 1000} detik... (percobaan ${retryCountRef.current}/${maxRetries})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    await loadShippingOptions();
  }, [loadShippingOptions]);

  // AsyncSelect untuk destination search dengan rate limiting
  const loadOptions = useCallback(async (inputValue: string): Promise<Destination[]> => {
    if (!inputValue || inputValue.length < 3) return [];
    
    try {
      const results = await searchDestinations(inputValue);
      return results;
    } catch (err: any) {
      console.error("Load options error:", err);
      // Return empty array instead of throwing to prevent AsyncSelect from breaking
      return [];
    }
  }, []);

  // State untuk destination selection
  const [selected, setSelected] = useState<Destination | null>(null);
  const [modalSelected, setModalSelected] = useState<Destination | null>(null);

  // Address form
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    title: "",
    alamat: "",
    kodepos: "",
    kecamatan: "",
    kota: "",
    provinsi: "",
    is_default: 0,
    province_id: 0,
    city_id: 0,
    district_id: 0,
    subdistrict_id: 0,
  });
  const [addressLoading, setAddressLoading] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{ show: boolean; data: PaymentResponse | null }>({ 
    show: false, 
    data: null 
  });

  // Form data state
  const [billingForm, setBillingForm] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    address: "",
    address2: "",
    stateCountry: "",
    postalZip: "",
    email: "",
    phone: "",
  });

  // Error state
  const [error, setError] = useState<string>("");

  // Function untuk handle pemilihan destination di modal
  const handleDestinationSelect = (destination: Destination | null) => {
    setModalSelected(destination);
    
    if (destination) {
      setAddressForm(prev => ({
        ...prev,
        kecamatan: destination.district_name || '',
        kota: destination.city_name || '',
        provinsi: destination.province_name || '',
        kodepos: destination.zip_code || '',
      }));
    }
  };

  // Reset modal form
  const resetModalForm = () => {
    setModalSelected(null);
    setAddressForm({
      title: "",
      alamat: "",
      kodepos: "",
      kecamatan: "",
      kota: "",
      provinsi: "",
      is_default: 0,
      province_id: 0,
      city_id: 0,
      district_id: 0,
      subdistrict_id: 0,
    });
  };

  // Load initial data
  useEffect(() => {
    loadCart();
    loadAddresses();
    
    // Cleanup function
    return () => {
      currentRequestRef.current = null;
    };
  }, []);

  // Optimized effect for loading shipping options
  useEffect(() => {
    // Only load if we have both address and weight, and cart is loaded
    if (!cartLoading && selectedAddress && cart.summary.total_weight > 0) {
      // Use a longer debounce to reduce API calls
      const timer = setTimeout(() => {
        loadShippingOptions();
      }, 2000); // 2 second delay

      return () => {
        clearTimeout(timer);
      };
    } else {
      // Clear shipping options if conditions aren't met
      setShippingOptions([]);
      setShippingError(null);
      setSelectedShipping(null);
      setSelectedCourier(null);
    }
  }, [selectedAddress?.ID, cart.summary.total_weight, cartLoading, loadShippingOptions]);

  const loadCart = async () => {
    try {
      setCartLoading(true);
      const cartData = await getCart();
      setCart(cartData);
    } catch (error) {
      console.error("Failed to load cart:", error);
      setError("Gagal memuat keranjang belanja");
    } finally {
      setCartLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      console.log("Loading addresses...");
      const addressData = await getMemberAddresses();
      console.log("Loaded addresses:", addressData);
      setAddresses(addressData);
      
      // Select default address if exists
      const defaultAddress = addressData.find(addr => addr.IsDefault === 1);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
        console.log("Selected default address:", defaultAddress);
      } else if (addressData.length > 0) {
        setSelectedAddress(addressData[0]);
        console.log("Selected first address:", addressData[0]);
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
    }
  };

  const handleCreateAddress = async () => {
    try {
      if (!addressForm.title.trim()) {
        alert("Nama alamat harus diisi");
        return;
      }
      if (!addressForm.alamat.trim()) {
        alert("Alamat lengkap harus diisi");
        return;
      }
      if (!addressForm.provinsi.trim() || !addressForm.kota.trim() || 
          !addressForm.kecamatan.trim() || !addressForm.kodepos.trim()) {
        alert("Provinsi, Kota, Kecamatan, dan Kode Pos harus diisi");
        return;
      }

      setAddressLoading(true);
      
      const memberId = 1; // TODO: ambil dari token/session
      
      const newAddress = await createMemberAddress({
        member_id: memberId,
        title: addressForm.title,
        alamat: addressForm.alamat,
        kodepos: addressForm.kodepos,
        kecamatan: addressForm.kecamatan,
        kota: addressForm.kota,
        provinsi: addressForm.provinsi,
        is_default: addressForm.is_default,
        province_id: 0,
        city_id: 0,
        district_id: 0,
        subdistrict_id: 0,
      });
      
      await loadAddresses();
      resetModalForm();
      setShowAddressModal(false);
      alert("Alamat berhasil ditambahkan");
    } catch (err) {
      console.error("Error creating address:", err);
      alert("Gagal menambah alamat. Silakan coba lagi.");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleBillingFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBillingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enhanced getTotalAmount to include payment method fee
  const getTotalAmount = () => {
    const baseAmount = cart.summary.total_price + (selectedShipping?.cost || 0);
    const paymentFee = getSelectedPaymentMethodFee();
    return baseAmount + paymentFee;
  };

  // Function to get selected payment method fee
  const getSelectedPaymentMethodFee = (): number => {
    if (!paymentMethod || !selectedPaymentMethod) return 0;
    return Number(selectedPaymentMethod.totalFee) || 0;
  };


  // Function to handle payment method selection with fee tracking
  const handlePaymentMethodSelect = (methodCode: string, methodData?: DuitkuPaymentMethod) => {
    setPaymentMethod(methodCode);
    
    if (methodCode === "cod") {
      setSelectedPaymentMethod(null);
      setSelectedPaymentCategory('');
    } else if (methodData) {
      setSelectedPaymentMethod(methodData);
    }
  };
  
  const handleSelectShipping = (service: ShippingService, courierCode: string) => {
    setSelectedShipping(service);
    setSelectedCourier(courierCode);
  };

  // Enhanced notes validation and handling
  const validateNotes = (notes: string): string | null => {
    if (notes.trim().length > 1000) {
      return "Catatan terlalu panjang (maksimal 1000 karakter)";
    }
    return null;
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setOrderNotes(value);
    
    // Clear any previous note-related errors
    if (error && error.includes('catatan')) {
      setError("");
    }
  };

  const handlePlaceOrder = async () => {
  // Validation
  if (!selectedAddress || !selectedShipping || !paymentMethod) {
    alert("Harap lengkapi semua data: alamat pengiriman, metode pengiriman, dan metode pembayaran.");
    return;
  }

  if (!selectedCourier) {
    alert("Data courier tidak ditemukan. Silakan pilih ulang metode pengiriman.");
    return;
  }

  if (cart.items.length === 0) {
    alert("Keranjang belanja kosong.");
    return;
  }

  // Validate notes
  const notesError = validateNotes(orderNotes);
  if (notesError) {
    setError(notesError);
    alert(notesError);
    return;
  }

  try {
    setIsProcessing(true);
    setError("");

    // Prepare cart_ids from cart items
    const cart_ids = cart.items.map(item => item.id);

    // Enhanced order data preparation with proper notes handling
    const orderData: CreateOrderParams = {
      cart_ids: cart_ids,
      address_id: selectedAddress.ID,
      payment_method: paymentMethod,
      courier: selectedCourier,
      service: selectedShipping.service_code,
      // Always include notes field, even if empty - this ensures it's saved to DB
      notes: orderNotes.trim()
    };

    console.log("Creating order with data:", orderData);
    console.log("Order notes being sent:", orderData.notes);

    // Create order
    const result = await createOrder(orderData);
    
    console.log("Order creation result:", result);

    // Check if order creation was successful
    if (result.success) {
      // Clear the notes field on successful order creation
      setOrderNotes("");
      
      alert("Pesanan berhasil dibuat!");
      
      // Handle different payment methods based on actual API response structure
      if (paymentMethod === "cod") {
        // For COD, redirect to order details page
        window.location.href = `/orders/${result.order_id}`;
      } else {
        // For online payment methods - use actual response structure
        if (result.paymentUrl) {
          // If paymentUrl exists, open in new tab
          window.open(result.paymentUrl, '_blank');
          // Also redirect to orders page in current tab after a short delay
          setTimeout(() => {
            window.location.href = `/orders/${result.order_id}`;
          }, 1000);
          
          // Alternative: Direct redirect (uncomment if you prefer this)
          // window.location.href = result.paymentUrl;
          
        } else if (result.qr_code || result.va_number) {
          // Show modal for QR code or VA number
          setPaymentModal({
            show: true,
            data: result
          });
        } else {
          // Fallback: redirect to order details
          window.location.href = `/orders/${result.order_id}`;
        }
      }
      
    } else {
      // Handle case where success is false
      const errorMessage = result.error || result.message || 'Pesanan gagal dibuat, silakan coba lagi';
      throw new Error(errorMessage);
    }

  } catch (error: any) {
    console.error("Error creating order:", error);
    
    let errorMessage = "Gagal membuat pesanan. Silakan coba lagi.";
    
    // Enhanced error handling
    if (error.message.includes('401')) {
      errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
    } else if (error.message.includes('400')) {
      errorMessage = "Data pesanan tidak valid. Periksa kembali form Anda.";
    } else if (error.message.includes('422')) {
      errorMessage = "Data yang dikirim tidak lengkap atau tidak sesuai format.";
    } else if (error.message.includes('500')) {
      errorMessage = "Terjadi kesalahan server. Silakan coba lagi nanti.";
    } else if (error.message.toLowerCase().includes('notes') || error.message.toLowerCase().includes('catatan')) {
      errorMessage = `Kesalahan pada catatan pesanan: ${error.message}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setError(errorMessage);
    alert(errorMessage);
    
  } finally {
    setIsProcessing(false);
  }
};

const handleClosePaymentModal = () => {
  setPaymentModal({ show: false, data: null });
  window.location.href = '/orders';
};

  // Manual cache clear function (for debugging)
  const handleClearCache = () => {
    clearCaches();
    setShippingOptions([]);
    setShippingError(null);
    retryCountRef.current = 0;
    alert("Cache dibersihkan. Silakan pilih alamat untuk memuat ulang ongkir.");
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="h3 mb-3">Keranjang Belanja Kosong</h2>
          <p className="mb-3">Silakan tambahkan produk ke keranjang terlebih dahulu</p>
          <button 
            onClick={() => window.location.href = '/products'}
            className="btn btn-primary"
          >
            Belanja Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <div className="hero">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-lg-5">
              <div className="intro-excerpt">
                <h1>Checkout</h1>
              </div>
            </div>
            <div className="col-lg-7"></div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="alert alert-danger" role="alert">
                {error}
                {/* Debug: Add cache clear button */}
                <button 
                  className="btn btn-sm btn-outline-danger ms-2" 
                  onClick={handleClearCache}
                  title="Clear cache untuk reset"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="untree_co-section">
        <div className="container">
          <div className="row">
            {/* Billing Details */}
            <div className="col-md-6 mb-5 mb-md-0">
              <h2 className="h3 mb-3 text-black">Billing Details</h2>
              <div className="p-3 p-lg-5 border bg-white">
                
                {/* Address Selection */}
                <div className="form-group mb-4">
                  <label className="text-black"><strong>Pilih Alamat Pengiriman</strong></label>
                  
                  {addresses.length > 0 ? (
                    <div className="mt-3">
                      {addresses.map((address) => (
                        <div key={address.ID} className="form-check mb-3">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="selectedAddress"
                            id={`address-${address.ID}`}
                            checked={selectedAddress?.ID === address.ID}
                            onChange={() => setSelectedAddress(address)}
                          />
                          <label className="form-check-label" htmlFor={`address-${address.ID}`}>
                            <strong>{address.Title}</strong><br/>
                            <small className="text-muted">
                              {address.Alamat}, {address.Kecamatan}<br/>
                              {address.Kota}, {address.Provinsi} {address.KodePos}
                              {address.IsDefault === 1 && <span className="badge badge-success ml-2">Default</span>}
                            </small>
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="alert alert-info mt-2">
                      <small>Belum ada alamat tersimpan</small>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm mt-2"
                    onClick={() => setShowAddressModal(true)}
                  >
                    + Tambah Alamat Baru
                  </button>
                </div>

                {/* Enhanced Shipping Options Section */}
                {selectedAddress && (
                  <div className="form-group mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="text-black"><strong>Pilih Metode Pengiriman</strong></label>
                      <small className="text-muted">
                        Berat: {cart.summary.total_weight}g
                      </small>
                    </div>
                    
                    {shippingLoading ? (
                      <div className="mt-3">
                        <div className="d-flex align-items-center">
                          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                          <small className="text-muted">Memuat opsi pengiriman...</small>
                        </div>
                      </div>
                    ) : shippingError ? (
                      <div className="alert alert-warning mt-3">
                        <small>{shippingError}</small>
                        <div className="mt-2">
                          <button 
                            className="btn btn-sm btn-outline-primary me-2" 
                            onClick={retryShippingOptions}
                            disabled={shippingLoading || retryCountRef.current >= maxRetries}
                          >
                            {shippingLoading ? 'Loading...' : 'Coba Lagi'}
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-secondary" 
                            onClick={handleClearCache}
                          >
                            Reset Cache
                          </button>
                        </div>
                      </div>
                    ) : shippingOptions.length > 0 ? (
                      <div className="mt-3">
                        {shippingOptions.map((option) => (
                          <div key={option.courier_code} className="mb-3">
                            <h6 className="text-primary">{option.courier_name}</h6>
                            {option.services.map((service) => (
                              <div key={service.service_code} className="form-check mb-2 ml-3">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="selectedShipping"
                                  id={`shipping-${option.courier_code}-${service.service_code}`}
                                  checked={selectedShipping?.service_code === service.service_code && selectedCourier === option.courier_code}
                                  onChange={() => handleSelectShipping(service, option.courier_code)}
                                />
                                <label className="form-check-label" htmlFor={`shipping-${option.courier_code}-${service.service_code}`}>
                                  <strong>{service.service_name}</strong> - {service.cost_formatted}<br/>
                                  <small className="text-muted">
                                    {service.description} • Estimasi: {service.etd}
                                  </small>
                                </label>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : selectedAddress ? (
                      <div className="alert alert-info mt-3">
                        <small>Tidak ada opsi pengiriman tersedia untuk alamat ini</small>
                        <button 
                          className="btn btn-sm btn-outline-primary ms-2" 
                          onClick={() => loadShippingOptions()}
                          disabled={shippingLoading}
                        >
                          Muat Ulang
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Enhanced Payment Method Section with Fee Display */}
                <div className="form-group mb-4">
                  <label className="text-black"><strong>Metode Pembayaran</strong></label>
                  
                  {paymentMethodsLoading ? (
                    <div className="mt-3">
                      <div className="d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        <small className="text-muted">Memuat metode pembayaran...</small>
                      </div>
                    </div>
                  ) : paymentMethodsError ? (
                    <div className="alert alert-warning mt-3">
                      <small>{paymentMethodsError}</small>
                      <div className="mt-2">
                        <button 
                          className="btn btn-sm btn-outline-primary" 
                          onClick={loadPaymentMethods}
                          disabled={paymentMethodsLoading}
                        >
                          Coba Lagi
                        </button>
                      </div>
                    </div>
                  ) : paymentMethods ? (
                    <div className="mt-3">
                      {/* COD Option - Always show first */}
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          id="payment-cod"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={(e) => handlePaymentMethodSelect(e.target.value)}
                        />
                        <label className="form-check-label" htmlFor="payment-cod">
                          <strong>Bayar di Tempat (COD)</strong>
                          <small className="text-muted d-block">Bayar saat barang diterima</small>
                        </label>
                      </div>

                      {/* Online Payment Methods */}
                      {Object.entries(paymentMethods.groupedMethods).map(([category, methods]) => {
                        if (methods.length === 0) return null;
                        
                        return (
                          <div key={category} className="mb-3">
                            <h6 className="text-primary mb-2">{getCategoryDisplayName(category as any)}</h6>
                            <div className="ms-3">
                              {methods.map((method: DuitkuPaymentMethod) => {
                                const methodInfo = getPaymentMethodInfo(method);
                                const inputId = `payment-${method.paymentMethod}`;
                                
                                return (
                                  <div key={method.paymentMethod} className="form-check mb-2">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="paymentMethod"
                                      id={inputId}
                                      value={method.paymentMethod}
                                      checked={paymentMethod === method.paymentMethod}
                                      onChange={(e) => handlePaymentMethodSelect(e.target.value, method)}
                                    />
                                    <label className="form-check-label d-flex align-items-center" htmlFor={inputId}>
                                      {method.paymentImage && (
                                        <img 
                                          src={method.paymentImage} 
                                          alt={method.paymentName}
                                          className="me-2"
                                          style={{ width: '32px', height: '20px', objectFit: 'contain' }}
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      )}
                                      <div>
                                        <strong>{methodInfo.name}</strong>
                                        {methodInfo.fee > 0 && (
                                          <small className="text-muted d-block">
                                            Biaya admin: {methodInfo.feeFormatted}
                                          </small>
                                        )}
                                      </div>
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="mt-3">
                        <small className="text-muted">
                          Total metode pembayaran: {paymentMethods.totalMethods}
                        </small>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          id="payment-cod-fallback"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={(e) => handlePaymentMethodSelect(e.target.value)}
                        />
                        <label className="form-check-label" htmlFor="payment-cod-fallback">
                          Bayar di Tempat (COD)
                        </label>
                      </div>
                      <small className="text-muted">Metode pembayaran online akan dimuat setelah total harga tersedia</small>
                    </div>
                  )}
                </div>

                {/* Enhanced Order Notes Section */}
                <div className="form-group">
                  <label htmlFor="c_order_notes" className="text-black">
                    <strong>Catatan Pesanan</strong>
                  </label>
                  <textarea
                    name="c_order_notes"
                    id="c_order_notes"
                    className="form-control"
                    placeholder="Tulis catatan khusus untuk pesanan Anda (opsional)..."
                    value={orderNotes}
                    onChange={handleNotesChange}
                    rows={4}
                    maxLength={1000}
                  ></textarea>
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <small className="text-muted">
                      Catatan akan disimpan dan dapat dilihat oleh penjual
                    </small>
                    <small className="text-muted">
                      {orderNotes.length}/1000 karakter
                    </small>
                  </div>
                  {orderNotes.length > 900 && (
                    <small className="text-warning">
                      Mendekati batas maksimal karakter
                    </small>
                  )}
                </div>
              </div>
            </div>

            {/* Order Section */}
            <div className="col-md-6">
              <div className="row mb-5">
                <div className="col-md-12">
                  <h2 className="h3 mb-3 text-black">Your Order</h2>
                  <div className="p-3 p-lg-5 border bg-white">
                    <table className="table site-block-order-table mb-5">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.items.map((item) => (
                          <tr key={item.id}>
                            <td>
                              {item.product_title}
                              {item.variant_title && (
                                <small className="text-muted d-block">
                                  Variant: {item.variant_title}
                                </small>
                              )}
                              <strong className="mx-2">x</strong> {item.quantity}
                            </td>
                            <td>{formatPrice(item.total_price)}</td>
                          </tr>
                        ))}
                        
                        <tr>
                          <td className="text-black font-weight-bold">
                            <strong>Cart Subtotal</strong>
                          </td>
                          <td className="text-black">{formatPrice(cart.summary.total_price)}</td>
                        </tr>
                        
                        {selectedShipping && (
                          <tr>
                            <td className="text-black font-weight-bold">
                              <strong>Shipping ({selectedCourier?.toUpperCase()} - {selectedShipping.service_code})</strong>
                            </td>
                            <td className="text-black">{selectedShipping.cost_formatted}</td>
                          </tr>
                        )}
                        {getSelectedPaymentMethodFee() > 0 && (
                          <tr>
                            <td className="text-black font-weight-bold">
                              <strong>Biaya Admin Pembayaran</strong>
                            </td>
                            <td className="text-black">{formatPrice(getSelectedPaymentMethodFee())}</td>
                          </tr>
                        )}
                        
                        <tr>
                          <td className="text-black font-weight-bold">
                            <strong>Order Total</strong>
                          </td>
                          <td className="text-black font-weight-bold">
                            <strong>{formatPrice(getTotalAmount())}</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="form-group">
                      <button
                        className="btn btn-black btn-lg py-3 btn-block"
                        onClick={handlePlaceOrder}
                        disabled={!selectedAddress || !paymentMethod || !selectedShipping || isProcessing}
                      >
                        {isProcessing ? 'Processing...' : 'Place Order'}
                      </button>
                      
                      {(!selectedAddress || !paymentMethod || !selectedShipping) && (
                        <small className="text-muted d-block mt-2">
                          {!selectedAddress && "• Pilih alamat pengiriman"}<br/>
                          {!selectedShipping && "• Pilih metode pengiriman"}<br/>
                          {!paymentMethod && "• Pilih metode pembayaran"}
                        </small>
                      )}
                    </div>

                    {/* Payment Modal */}
                    {paymentModal.show && paymentModal.data && (
                      <div className="modal fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-lg">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5 className="modal-title">Pembayaran</h5>
                              <button 
                                type="button" 
                                className="btn-close" 
                                onClick={handleClosePaymentModal}
                              ></button>
                            </div>
                            <div className="modal-body text-center">
                              <div className="alert alert-success">
                                <h6>Pesanan berhasil dibuat!</h6>
                                <p className="mb-0">Order ID: {paymentModal.data.order_id}</p>
                              </div>

                              {paymentModal.data.qr_code && (
                                <div className="mb-4">
                                  <h6>Scan QR Code untuk pembayaran:</h6>
                                  <img 
                                    src={paymentModal.data.qr_code} 
                                    alt="QR Code Pembayaran" 
                                    className="img-fluid"
                                    style={{ maxWidth: '300px' }}
                                  />
                                </div>
                              )}

                              {paymentModal.data.va_number && (
                                <div className="mb-4">
                                  <h6>Nomor Virtual Account:</h6>
                                  <div className="alert alert-info">
                                    <strong>{paymentModal.data.va_number}</strong>
                                  </div>
                                </div>
                              )}

                              <div className="mb-3">
                                <p><strong>Total Pembayaran: {formatPrice(paymentModal.data.total_amount || 0)}</strong></p>
                                {paymentModal.data.expired_date && (
                                  <p className="text-muted">
                                    Berlaku hingga: {new Date(paymentModal.data.expired_date).toLocaleString('id-ID')}
                                  </p>
                                )}
                              </div>

                              {paymentModal.data.reference && (
                                <div className="mb-3">
                                  <small className="text-muted">Reference: {paymentModal.data.reference}</small>
                                </div>
                              )}
                            </div>
                            <div className="modal-footer">
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleClosePaymentModal}
                              >
                                Lihat Status Pesanan
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Add Address Modal */}
      {showAddressModal && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tambah Alamat Baru</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowAddressModal(false);
                    resetModalForm();
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nama Alamat <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={addressForm.title}
                    onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                    placeholder="Rumah, Kantor, dll"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Cari Lokasi</label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions={false}
                    loadOptions={loadOptions}
                    value={modalSelected}
                    onChange={handleDestinationSelect}
                    placeholder="Ketik minimal 3 karakter untuk mencari..."
                    isClearable
                    noOptionsMessage={({ inputValue }) => 
                      inputValue.length < 3 
                        ? "Ketik minimal 3 karakter" 
                        : "Tidak ada hasil ditemukan"
                    }
                    loadingMessage={() => "Mencari..."}
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '38px'
                      })
                    }}
                  />
                  <small className="text-muted">
                    Pilih lokasi untuk otomatis mengisi provinsi, kota, kecamatan, dan kode pos
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Alamat Lengkap <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    value={addressForm.alamat}
                    onChange={(e) => setAddressForm({ ...addressForm, alamat: e.target.value })}
                    placeholder="Jalan, Nomor Rumah, RT/RW, dll"
                    rows={3}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Provinsi <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={addressForm.provinsi}
                      onChange={(e) => setAddressForm({ ...addressForm, provinsi: e.target.value })}
                      readOnly={!!modalSelected}
                      style={{ backgroundColor: modalSelected ? '#f8f9fa' : 'white' }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Kota <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={addressForm.kota}
                      onChange={(e) => setAddressForm({ ...addressForm, kota: e.target.value })}
                      readOnly={!!modalSelected}
                      style={{ backgroundColor: modalSelected ? '#f8f9fa' : 'white' }}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Kecamatan <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={addressForm.kecamatan}
                      onChange={(e) => setAddressForm({ ...addressForm, kecamatan: e.target.value })}
                      readOnly={!!modalSelected}
                      style={{ backgroundColor: modalSelected ? '#f8f9fa' : 'white' }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Kode Pos <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={addressForm.kodepos}
                      onChange={(e) => setAddressForm({ ...addressForm, kodepos: e.target.value })}
                      readOnly={!!modalSelected}
                      style={{ backgroundColor: modalSelected ? '#f8f9fa' : 'white' }}
                    />
                  </div>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={addressForm.is_default === 1}
                    onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked ? 1 : 0 })}
                  />
                  <label className="form-check-label">Jadikan alamat default</label>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowAddressModal(false);
                    resetModalForm();
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateAddress}
                  disabled={addressLoading}
                >
                  {addressLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Alamat"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CheckoutPage;