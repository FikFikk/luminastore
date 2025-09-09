"use client";

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
  DuitkuPaymentMethod,
  GroupedPaymentMethods
} from "@/services/duitkuService";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { getCart, formatPrice, Cart } from "@/services/cartService";
import { getMemberAddresses } from "@/services/addressService";
import { 
  createOrder, 
} from "@/services/orderService";
import { IAddress } from "@/app/components/inteface/IAddress";
import { ICartItem } from "@/app/components/inteface/ICartItem";
import AddAddress from "@/app/components/modal/AddAddress";
import { NextResponse } from "next/server";
import { ICreateOrderParams } from "@/app/components/inteface/ICreateOrderParams";

function CheckoutPage() {
  // Cart state - untuk menyimpan semua cart dan filtered selected items
  const [cart, setCart] = useState<Cart>({ items: [], summary: { total_items: 0, total_price: 0, total_weight: 0, items_count: 0 } });
  const [selectedCartItems, setSelectedCartItems] = useState<ICartItem[]>([]);
  const [selectedCartIds, setSelectedCartIds] = useState<number[]>([]);
  const [cartLoading, setCartLoading] = useState(true);

  const [paymentMethods, setPaymentMethods] = useState<DuitkuPaymentMethodsResponse | null>(null);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [paymentMethodsError, setPaymentMethodsError] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<DuitkuPaymentMethod | null>(null);

  // Address state
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);
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

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{ show: boolean; data: PaymentResponse | null }>({ 
    show: false, 
    data: null 
  });

  // Error state
  const [error, setError] = useState<string>("");
  const [showAlert, setShowAlert] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null);

  // Custom Wizard State
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    { title: "Alamat Pengiriman", icon: "fas fa-map-marker-alt" },
    { title: "Metode Pengiriman", icon: "fas fa-truck" },
    { title: "Metode Pembayaran", icon: "fas fa-credit-card" },
    { title: "Ringkasan & Catatan", icon: "fas fa-clipboard-list" }
  ];

  // Load initial data
  useEffect(() => {
    loadCart();
    loadAddresses();
    
    // Cleanup function
    return () => {
      currentRequestRef.current = null;
    };
  }, []);

  const loadCart = async () => {
    try {
      setCartLoading(true);
      const cartData = await getCart();
      setCart(cartData);

      // Get selected cart IDs from sessionStorage
      const storedSelectedIds = sessionStorage.getItem('selectedCartIds');
      if (storedSelectedIds) {
        const selectedIds: number[] = JSON.parse(storedSelectedIds);
        setSelectedCartIds(selectedIds);

        // Filter cart items to only include selected ones
        const filteredItems = cartData.items.filter(item => 
          selectedIds.includes(item.id)
        );

        setSelectedCartItems(filteredItems);

        // If no items selected, redirect back to cart
        if (filteredItems.length === 0) {
          alert('No items selected for checkout');
          window.location.href = '/cart';
          return;
        }
      } else {
        // If no selected items, use all cart items (fallback)
        setSelectedCartItems(cartData.items);
        setSelectedCartIds(cartData.items.map(item => item.id));
      }

    } catch (error) {
      console.error("Failed to load cart:", error);
      setError("Gagal memuat keranjang belanja");
    } finally {
      setCartLoading(false);
    }
  };

  type CategoryKey = keyof GroupedPaymentMethods;

  function isCategoryKey(value: string): value is CategoryKey {
    return ["bank_transfer", "ewallet", "credit_card", "retail", "others"].includes(value);
  }

  // Calculate totals for selected items only
  const calculateSelectedTotals = () => {
    const totalItems = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = selectedCartItems.reduce((sum, item) => sum + item.total_price, 0);
    const totalWeight = selectedCartItems.reduce((sum, item) => sum + ((item.weight || 0) * item.quantity), 0);
    
    return {
      total_items: totalItems,
      total_price: totalPrice,
      total_weight: totalWeight,
      items_count: selectedCartItems.length
    };
  };

  const showMessage = (type: 'success' | 'error' | 'warning', message: string) => {
    setShowAlert({ type, message });
    setTimeout(() => setShowAlert(null), 4000);
  };

  const selectedTotals = calculateSelectedTotals();

  // Add this function to load payment methods
  const loadPaymentMethods = useCallback(async () => {
    if (!selectedTotals.total_price || selectedTotals.total_price <= 0) return;
    
    try {
      setPaymentMethodsLoading(true);
      setPaymentMethodsError('');
      
      const totalAmount = getTotalAmount();
      const methods = await getDuitkuPaymentMethods(totalAmount);
      setPaymentMethods(methods);
      
    } catch (error: unknown) {
      console.error('Failed to load payment methods:', error);
      setPaymentMethodsError('Gagal memuat metode pembayaran');
    } finally {
      setPaymentMethodsLoading(false);
    }
  }, [selectedTotals.total_price, selectedShipping]);

  useEffect(() => {
    if (!cartLoading && selectedTotals.total_price > 0) {
      const timer = setTimeout(() => {
        loadPaymentMethods();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedTotals.total_price, selectedShipping?.cost, loadPaymentMethods]);

  // Optimized shipping options loader with selected items weight
  const loadShippingOptions = useCallback(async (addressId?: number, weight?: number) => {
    const targetAddress = addressId ? addresses.find(a => a.ID === addressId) : selectedAddress;
    const targetWeight = weight || selectedTotals.total_weight;

    if (!targetAddress || targetWeight <= 0) {
      setShippingOptions([]);
      setShippingError(null);
      return;
    }

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

      if (currentRequestRef.current !== requestId) {
        console.log(`Request ${requestId} cancelled - newer request in progress`);
        return;
      }

      setShippingOptions(options);
      retryCountRef.current = 0;

    } catch (err: unknown) {
      if (currentRequestRef.current !== requestId) {
        console.log(`Request ${requestId} cancelled - newer request in progress`);
        return;
      }

      console.error(`Load shipping options error [${requestId}]:`, err);

      let errorMessage = "Gagal memuat ongkir. Silakan coba lagi.";

      if (err instanceof Error && err.message) {
        const msg = err.message.toLowerCase();

        if (msg.includes("429") || msg.includes("rate limit")) {
          errorMessage = "Sistem sedang sibuk. Silakan tunggu sebentar sebelum mencoba lagi.";
        } else if (msg.includes("401") || msg.includes("auth")) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
        } else if (msg.includes("500")) {
          errorMessage = "Terjadi kesalahan server. Silakan coba lagi nanti.";
        } else {
          errorMessage = err.message;
        }
      }

      setShippingError(errorMessage);
      setShippingOptions([]);
    } finally {
      if (currentRequestRef.current === requestId) {
        setShippingLoading(false);
      }
    }

  }, [selectedAddress, selectedTotals.total_weight, addresses]);

  // Optimized effect for loading shipping options - menggunakan selected weight
  useEffect(() => {
    if (!cartLoading && selectedAddress && selectedTotals.total_weight > 0) {
      const timer = setTimeout(() => {
        loadShippingOptions();
      }, 2000);

      return () => {
        clearTimeout(timer);
      };
    } else {
      setShippingOptions([]);
      setShippingError(null);
      setSelectedShipping(null);
      setSelectedCourier(null);
    }
  }, [selectedAddress?.ID, selectedTotals.total_weight, cartLoading, loadShippingOptions]);

  const loadAddresses = async () => {
    try {
      console.log("Loading addresses...");
      const addressData = await getMemberAddresses();
      console.log("Loaded addresses:", addressData);
      setAddresses(addressData);
      
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

  // Retry function with exponential backoff
  const retryShippingOptions = useCallback(async () => {
    if (retryCountRef.current >= maxRetries) {
      setShippingError("Telah mencoba beberapa kali namun gagal. Silakan refresh halaman atau coba lagi nanti.");
      return;
    }

    retryCountRef.current++;
    const delay = Math.pow(2, retryCountRef.current) * 1000;
    
    setShippingError(`Mencoba lagi dalam ${delay / 1000} detik... (percobaan ${retryCountRef.current}/${maxRetries})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    await loadShippingOptions();
  }, [loadShippingOptions]);

  // Enhanced getTotalAmount untuk selected items + shipping + payment fee
  const getTotalAmount = () => {
    const baseAmount = selectedTotals.total_price + (selectedShipping?.cost || 0);
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
    } else if (methodData) {
      setSelectedPaymentMethod(methodData);
    }
  };
  
  const handleSelectShipping = (service: ShippingService, courierCode: string) => {
    setSelectedShipping(service);
    setSelectedCourier(courierCode);
  };

  // Handle address selection
  const handleSelectAddress = (address: IAddress) => {
    setSelectedAddress(address);
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
    
    if (error && error.includes('catatan')) {
      setError("");
    }
  };

  // Step validation functions
  const validateStep = (stepIndex: number): { isValid: boolean; message?: string } => {
    switch (stepIndex) {
      case 0:
        if (!selectedAddress) {
          return { isValid: false, message: 'Pilih alamat pengiriman terlebih dahulu' };
        }
        return { isValid: true };
      case 1:
        if (!selectedShipping || !selectedCourier) {
          return { isValid: false, message: 'Pilih metode pengiriman terlebih dahulu' };
        }
        return { isValid: true };
      case 2:
        if (!paymentMethod) {
          return { isValid: false, message: 'Pilih metode pembayaran terlebih dahulu' };
        }
        return { isValid: true };
      case 3:
        return { isValid: true }; // Notes are optional
      default:
        return { isValid: false };
    }
  };

  // Navigation handlers
  const handleNext = () => {
    const validation = validateStep(activeStep);
    if (validation.isValid) {
      setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    } else if (validation.message) {
      showMessage('error', validation.message);
    }
  };

  const handlePrev = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow going back to previous steps or current step
    if (stepIndex <= activeStep) {
      setActiveStep(stepIndex);
    } else {
      // Validate all previous steps before jumping ahead
      for (let i = activeStep; i < stepIndex; i++) {
        const validation = validateStep(i);
        if (!validation.isValid && validation.message) {
          showMessage('error', validation.message);
          return;
        }
      }
      setActiveStep(stepIndex);
    }
  };

  const handleComplete = () => {
    const validation = validateStep(activeStep);
    if (validation.isValid) {
      handlePlaceOrder();
    } else if (validation.message) {
      showMessage('error', validation.message);
    }
  };

  const handleSuccess = (message: string, callback?: () => void) => {
    showMessage("success", message);
    if (callback) callback();
  };

  const handleAddressModalSuccess = () => {
    handleSuccess("Alamat berhasil disimpan", loadAddresses);
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

    if (selectedCartItems.length === 0) {
      alert("Tidak ada item yang dipilih untuk checkout.");
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

      // Use selected cart IDs
      const orderData: ICreateOrderParams = {
        cart_ids: selectedCartIds,
        address_id: selectedAddress.ID,
        payment_method: paymentMethod,
        courier: selectedCourier,
        service: selectedShipping.service_code,
        notes: orderNotes.trim()
      };

      console.log("Creating order with data:", orderData);

      const result = await createOrder(orderData);
      
      console.log("Order creation result:", result);

      if (result.success) {
        // Clear sessionStorage and notes
        sessionStorage.removeItem('selectedCartIds');
        setOrderNotes("");
        
        alert("Pesanan berhasil dibuat!");
        
        if (paymentMethod === "cod") {
          window.location.href = `/orders/${result.order_id}`;
        } else {
          if (result.paymentUrl) {
            window.open(result.paymentUrl, '_blank');
            setTimeout(() => {
              window.location.href = `/orders/${result.order_id}`;
            }, 1000); 
          } else {
            window.location.href = `/orders/${result.order_id}`;
          }
        }
        
      } else {
        const errorMessage = result.error || result.message || 'Pesanan gagal dibuat, silakan coba lagi';
        throw new Error(errorMessage);
      }

    } catch (error: unknown) {
      console.error("Error creating order:", error);

      let errorMessage = "Gagal membuat pesanan. Silakan coba lagi.";

      if (error instanceof Error && error.message) {
        const msg = error.message.toLowerCase();

        if (msg.includes("401")) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
        } else if (msg.includes("400")) {
          errorMessage = "Data pesanan tidak valid. Periksa kembali form Anda.";
        } else if (msg.includes("422")) {
          errorMessage = "Data yang dikirim tidak lengkap atau tidak sesuai format.";
        } else if (msg.includes("500")) {
          errorMessage = "Terjadi kesalahan server. Silakan coba lagi nanti.";
        } else if (msg.includes("notes") || msg.includes("catatan")) {
          errorMessage = `Kesalahan pada catatan pesanan: ${error.message}`;
        } else {
          errorMessage = error.message;
        }
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

  // Manual cache clear function
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

  if (selectedCartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="h3 mb-3">Tidak Ada Item Yang Dipilih</h2>
          <p className="mb-3">Silakan kembali ke keranjang dan pilih item untuk checkout</p>
          <button 
            onClick={() => window.location.href = '/cart'}
            className="btn btn-primary"
          >
            Kembali ke Keranjang
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
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

      {/* Hero Section */}
      <div className="hero">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-lg-5">
              <div className="intro-excerpt">
                <h1>Checkout</h1>
                <p>Menyelesaikan pesanan untuk {selectedCartItems.length} item terpilih</p>
              </div>
            </div>
            <div className="col-lg-7"></div>
          </div>
        </div>
      </div>

      <div className="untree_co-section">
        <div className="container">
          <div className="row">
            <div className="col-12">
              
              {/* Custom Wizard Implementation */}
              <div className="custom-wizard">
                {/* Step Indicator */}
                <div className="wizard-steps mb-5">
                  <div className="row">
                    {steps.map((step, index) => {
                      const isActive = index === activeStep;
                      const isCompleted = index < activeStep;
                      const isAccessible = index <= activeStep || validateStep(index).isValid;
                      
                      return (
                        <div key={index} className="col">
                          <div 
                            className={`wizard-step text-center ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isAccessible ? 'clickable' : ''}`}
                            onClick={() => isAccessible && handleStepClick(index)}
                            style={{ cursor: isAccessible ? 'pointer' : 'default' }}
                          >
                            <div className={`step-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${isActive ? 'bg-danger text-white' : isCompleted ? 'bg-success text-white' : 'bg-light text-muted'}`}>
                              {isCompleted ? (
                                <i className="fas fa-check"></i>
                              ) : (
                                <i className={step.icon}></i>
                              )}
                            </div>
                            <div className={`step-title small ${isActive ? 'text-danger fw-bold' : isCompleted ? 'text-success' : 'text-muted'}`}>
                              {step.title}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="progress mt-3">
                    <div 
                      className="progress-bar bg-danger" 
                      style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Step Content */}
                <div className="wizard-content">
                  {/* Step 1: Address Selection */}
                  {activeStep === 0 && (
                    <div className="p-3 p-lg-5 border bg-white rounded">
                      <h3 className="mb-4">Pilih Alamat Pengiriman</h3>
                      
                      {addresses.length > 0 ? (
                        <div className="mt-3">
                          {addresses.map((address) => (
                            <div key={address.ID} className="form-check mb-3 p-3 border rounded">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="selectedAddress"
                                id={`address-${address.ID}`}
                                checked={selectedAddress?.ID === address.ID}
                                onChange={() => handleSelectAddress(address)}
                              />
                              <label className="form-check-label ms-2" htmlFor={`address-${address.ID}`}>
                                <strong>{address.Title}</strong><br/>
                                <small className="text-muted">
                                  {address.Alamat}, {address.Kecamatan}<br/>
                                  {address.Kota}, {address.Provinsi} {address.KodePos}
                                  {address.IsDefault === 1 && <span className="badge bg-success ms-2">Default</span>}
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
                  )}

                  {/* Step 2: Shipping Method */}
                  {activeStep === 1 && (
                    <div className="p-3 p-lg-5 border bg-white rounded">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3>Pilih Metode Pengiriman</h3>
                        <small className="text-muted">
                          Berat: {selectedTotals.total_weight}g
                        </small>
                      </div>
                      
                      {!selectedAddress && (
                        <div className="alert alert-warning">
                          Pilih alamat pengiriman terlebih dahulu pada step sebelumnya
                        </div>
                      )}
                      
                      {selectedAddress && (
                        <>
                          <div className="mb-3 p-3 bg-light rounded">
                            <strong>Alamat Terpilih:</strong><br/>
                            {selectedAddress.Title} - {selectedAddress.Alamat}, {selectedAddress.Kecamatan}, {selectedAddress.Kota}
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
                                <div key={option.courier_code} className="mb-4">
                                  <h5 className="text-primary">{option.courier_name}</h5>
                                  {option.services.map((service) => (
                                    <div key={service.service_code} className="form-check mb-3 ms-3 p-3 border rounded">
                                      <input
                                        className="form-check-input"
                                        type="radio"
                                        name="selectedShipping"
                                        id={`shipping-${option.courier_code}-${service.service_code}`}
                                        checked={selectedShipping?.service_code === service.service_code && selectedCourier === option.courier_code}
                                        onChange={() => handleSelectShipping(service, option.courier_code)}
                                      />
                                      <label className="form-check-label ms-2" htmlFor={`shipping-${option.courier_code}-${service.service_code}`}>
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
                          ) : (
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
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Step 3: Payment Method */}
                  {activeStep === 2 && (
                    <div className="p-3 p-lg-5 border bg-white rounded">
                      <h3 className="mb-4">Pilih Metode Pembayaran</h3>
                      
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
                          <div className="form-check mb-3 p-3 border rounded">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="paymentMethod"
                              id="payment-cod"
                              value="cod"
                              checked={paymentMethod === "cod"}
                              onChange={(e) => handlePaymentMethodSelect(e.target.value)}
                            />
                            <label className="form-check-label ms-2" htmlFor="payment-cod">
                              <strong>Bayar di Tempat (COD)</strong>
                              <small className="text-muted d-block">Bayar saat barang diterima</small>
                            </label>
                          </div>

                          {/* Online Payment Methods */}
                          {Object.entries(paymentMethods.groupedMethods).map(([category, methods]) => {
                            if (methods.length === 0) return null;
                            
                            return (
                              <div key={category} className="mb-4">
                                <h5 className="text-primary mb-3">
                                  {isCategoryKey(category)
                                    ? getCategoryDisplayName(category)
                                    : "Metode Tidak Dikenal"}
                                </h5>

                                <div className="ms-3">
                                  {methods.map((method: DuitkuPaymentMethod) => {
                                    const methodInfo = getPaymentMethodInfo(method);
                                    const inputId = `payment-${method.paymentMethod}`;
                                    
                                    return (
                                      <div key={method.paymentMethod} className="form-check mb-3 p-3 border rounded">
                                        <input
                                          className="form-check-input"
                                          type="radio"
                                          name="paymentMethod"
                                          id={inputId}
                                          value={method.paymentMethod}
                                          checked={paymentMethod === method.paymentMethod}
                                          onChange={(e) => handlePaymentMethodSelect(e.target.value, method)}
                                        />
                                        <label className="form-check-label d-flex align-items-center ms-2" htmlFor={inputId}>
                                          {method.paymentImage && (
                                            <img 
                                              src={method.paymentImage} 
                                              alt={method.paymentName}
                                              className="me-3"
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
                          <div className="form-check mb-2 p-3 border rounded">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="paymentMethod"
                              id="payment-cod-fallback"
                              value="cod"
                              checked={paymentMethod === "cod"}
                              onChange={(e) => handlePaymentMethodSelect(e.target.value)}
                            />
                            <label className="form-check-label ms-2" htmlFor="payment-cod-fallback">
                              <strong>Bayar di Tempat (COD)</strong>
                            </label>
                          </div>
                          <small className="text-muted">Metode pembayaran online akan dimuat setelah total harga tersedia</small>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 4: Order Summary and Notes */}
                  {activeStep === 3 && (
                    <div className="row">
                      {/* Order Notes Section */}
                      <div className="col-md-6 mb-4">
                        <div className="p-3 p-lg-5 border bg-white h-100 rounded">
                          <h4 className="mb-4">Catatan Pesanan</h4>
                          
                          <div className="form-group">
                            <label htmlFor="c_order_notes" className="text-black mb-2">
                              <strong>Catatan untuk Penjual (Opsional)</strong>
                            </label>
                            <textarea
                              name="c_order_notes"
                              id="c_order_notes"
                              className="form-control"
                              placeholder="Tulis catatan khusus untuk pesanan Anda (opsional)..."
                              value={orderNotes}
                              onChange={handleNotesChange}
                              rows={6}
                              maxLength={1000}
                            ></textarea>
                            <div className="d-flex justify-content-between align-items-center mt-2">
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

                          {/* Selected Information Summary */}
                          <div className="mt-4">
                            <h5>Informasi Terpilih:</h5>
                            <div className="small">
                              <p><strong>Alamat:</strong>{selectedAddress?.Title}, {selectedAddress?.Alamat}, {selectedAddress?.Kecamatan}, {selectedAddress?.Kota}, {selectedAddress?.Provinsi}</p>
                              <p><strong>Pengiriman:</strong> {selectedCourier?.toUpperCase()} - {selectedShipping?.service_name}</p>
                              <p><strong>Pembayaran:</strong> {paymentMethod === 'cod' ? 'Bayar di Tempat (COD)' : selectedPaymentMethod?.paymentName}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Summary Section */}
                      <div className="col-md-6">
                        <div className="p-3 p-lg-5 border bg-white rounded">
                          <h4 className="mb-4">Ringkasan Pesanan</h4>
                          
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedCartItems.map((item) => (
                                <tr key={item.id}>
                                  <td>
                                    <div className="small">
                                      <strong>{item.product_title}</strong>
                                      {item.variant_title && (
                                        <div className="text-muted">
                                          Variant: {item.variant_title}
                                        </div>
                                      )}
                                      <div>Qty: {item.quantity}</div>
                                    </div>
                                  </td>
                                  <td>{formatPrice(item.total_price)}</td>
                                </tr>
                              ))}
                              
                              <tr>
                                <td className="text-black font-weight-bold">
                                  <strong>Subtotal</strong>
                                </td>
                                <td className="text-black">{formatPrice(selectedTotals.total_price)}</td>
                              </tr>
                              
                              {selectedShipping && (
                                <tr>
                                  <td className="text-black font-weight-bold">
                                    <strong>Ongkir ({selectedCourier?.toUpperCase()})</strong>
                                  </td>
                                  <td className="text-black">{selectedShipping.cost_formatted}</td>
                                </tr>
                              )}
                              
                              {getSelectedPaymentMethodFee() > 0 && (
                                <tr>
                                  <td className="text-black font-weight-bold">
                                    <strong>Biaya Admin</strong>
                                  </td>
                                  <td className="text-black">{formatPrice(getSelectedPaymentMethodFee())}</td>
                                </tr>
                              )}
                              
                              <tr>
                                <td className="text-black font-weight-bold">
                                  <strong>Total Pembayaran</strong>
                                </td>
                                <td className="text-black font-weight-bold">
                                  <strong>{formatPrice(getTotalAmount())}</strong>
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          <div className="mt-3">
                            <small className="text-muted">
                              Total Item: {selectedTotals.total_items} • Berat: {selectedTotals.total_weight}g
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="wizard-navigation mt-4 d-flex justify-content-between">
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={handlePrev}
                    disabled={activeStep === 0}
                  >
                    <i className="fas fa-chevron-left me-2"></i>
                    Kembali
                  </button>
                  
                  {activeStep < steps.length - 1 ? (
                    <button 
                      type="button"
                      className="btn btn-danger"
                      onClick={handleNext}
                    >
                      Selanjutnya
                      <i className="fas fa-chevron-right ms-2"></i>
                    </button>
                  ) : (
                    <button 
                      type="button"
                      className="btn btn-success"
                      onClick={handleComplete}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-shopping-cart me-2"></i>
                          Buat Pesanan
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Custom styling for the wizard */}
              <style>{`
                .wizard-step {
                  transition: all 0.3s ease;
                }
                
                .wizard-step.clickable:hover {
                  transform: translateY(-2px);
                }
                
                .step-circle {
                  width: 50px;
                  height: 50px;
                  border-radius: 50%;
                  font-size: 18px;
                  transition: all 0.3s ease;
                }
                
                .wizard-step.active .step-circle {
                  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.25);
                }
                
                .wizard-step.completed .step-circle {
                  box-shadow: 0 0 0 3px rgba(25, 135, 84, 0.25);
                }
                
                .form-check-input:checked {
                  background-color: #dc3545;
                  border-color: #dc3545;
                }
                
                .form-check-input:focus {
                  border-color: #dc3545;
                  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
                }
                
                .btn-danger {
                  background-color: #dc3545;
                  border-color: #dc3545;
                }
                
                .btn-danger:hover {
                  background-color: #c82333;
                  border-color: #bd2130;
                }
                
                .progress-bar {
                  transition: width 0.6s ease;
                }

                .wizard-content {
                  min-height: 400px;
                }

                @media (max-width: 768px) {
                  .step-circle {
                    width: 40px;
                    height: 40px;
                    font-size: 14px;
                  }
                  
                  .step-title {
                    font-size: 12px;
                  }
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>

      {/* Use the AddAddressModal component */}
      <AddAddress
        show={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSuccess={handleAddressModalSuccess}
        showMessage={showMessage}
      />
    </>
  );
}

export default CheckoutPage;