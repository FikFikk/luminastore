"use client";

import AsyncSelect from "react-select/async";
import { searchDestinations, Destination } from "@/services/rajaongkirService";

import React, { useState, useEffect } from "react";
import { getCart, formatPrice, Cart } from "@/services/cartService";
import { 
  getMemberAddresses, 
  createMemberAddress, 
  Address, 
  CreateAddressParams
} from "@/services/addressService";
// import {
//   getProvinces,
//   getCitiesByProvince,
//   getDistrictsByCity,
//   getSubDistrictsByDistrict,
//   searchSubDistricts,
//   getMultipleCourierCosts,
//   Province,
//   City,
//   District,
//   SubDistrict,
//   ShippingOption
// } from "@/services/rajaongkirService";
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

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  // RajaOngkir location data
  const [locationLoading, setLocationLoading] = useState(false);

  const loadOptions = async (inputValue: string): Promise<Destination[]> => {
    if (!inputValue) return [];
    try {
      return await searchDestinations(inputValue);
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const [selected, setSelected] = React.useState<Destination | null>(null);

  // Address form with RajaOngkir IDs
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

  // Shipping state
  const [shippingLoading, setShippingLoading] = useState(false);

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

  // Search state for subdistrict
  const [subdistrictSearch, setSubdistrictSearch] = useState("");

  // Error state
  const [error, setError] = useState<string>("");

  // Load initial data
  useEffect(() => {
    loadCart();
    loadAddresses();
  }, []);

  // Load shipping options when address is selected
  useEffect(() => {
    if (selectedAddress && cart.summary.total_weight > 0) {
    //   loadShippingOptions();
    }
  }, [selectedAddress, cart.summary.total_weight]);

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
        // If no default, select first address
        setSelectedAddress(addressData[0]);
        console.log("Selected first address:", addressData[0]);
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
      // Don't set error state for address loading failure - let user add address instead
      console.log("Will show 'add address' option instead");
    }
  };

  const handleBillingFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBillingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getTotalAmount = () => {
    // return cart.summary.total_price + (selectedShipping?.cost || 0);
    return cart.summary.total_price;
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
      {/* Start Hero Section */}
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
      {/* End Hero Section */}

      <div className="p-4">
        <label className="block mb-2 font-semibold">Pilih Alamat Tujuan</label>
        <AsyncSelect
          cacheOptions
          defaultOptions
          loadOptions={loadOptions}
          value={selected}
          onChange={(val) => setSelected(val as Destination)}
          placeholder="Cari kecamatan / kota..."
          isClearable
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="alert alert-danger" role="alert">
                {error}
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

                {/* Shipping Options */}
                {/* {selectedAddress && (
                  <div className="form-group mb-4">
                    <label className="text-black"><strong>Pilihan Pengiriman</strong></label>
                    
                    {shippingLoading ? (
                      <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm mr-2" role="status"></div>
                        <small>Mencari opsi pengiriman...</small>
                      </div>
                    ) : shippingOptions.length > 0 ? (
                      <div className="mt-3">
                        {shippingOptions.map((option, index) => (
                          <div key={index} className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="selectedShipping"
                              id={`shipping-${index}`}
                              checked={selectedShipping === option}
                              onChange={() => setSelectedShipping(option)}
                            />
                            <label className="form-check-label d-flex justify-content-between align-items-center" htmlFor={`shipping-${index}`}>
                              <div>
                                <strong>{option.courier} - {option.service}</strong><br/>
                                <small className="text-muted">{option.description} (Est: {option.etd} hari)</small>
                              </div>
                              <span className="font-weight-bold">{formatPrice(option.cost)}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : selectedAddress ? (
                      <div className="alert alert-warning mt-2">
                        <small>Tidak ada opsi pengiriman tersedia</small>
                      </div>
                    ) : null}
                  </div>
                )} */}

                {/* Payment Method */}
                {/* {selectedShipping && (
                  <div className="form-group mb-4">
                    <label className="text-black"><strong>Metode Pembayaran</strong></label>
                    <div className="mt-3">
                      {[
                        { id: 'bank_transfer', name: 'Transfer Bank' },
                        { id: 'credit_card', name: 'Kartu Kredit' },
                        { id: 'e_wallet', name: 'E-Wallet' },
                        { id: 'cod', name: 'Bayar di Tempat (COD)' }
                      ].map((method) => (
                        <div key={method.id} className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id={method.id}
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <label className="form-check-label" htmlFor={method.id}>
                            {method.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}

                <div className="form-group row">
                  <div className="col-md-6">
                    <label htmlFor="c_fname" className="text-black">
                      First Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="c_fname"
                      name="firstName"
                      value={billingForm.firstName}
                      onChange={handleBillingFormChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="c_lname" className="text-black">
                      Last Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="c_lname"
                      name="lastName"
                      value={billingForm.lastName}
                      onChange={handleBillingFormChange}
                    />
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-md-12">
                    <label htmlFor="c_companyname" className="text-black">
                      Company Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="c_companyname"
                      name="companyName"
                      value={billingForm.companyName}
                      onChange={handleBillingFormChange}
                    />
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-md-6">
                    <label htmlFor="c_email_address" className="text-black">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="c_email_address"
                      name="email"
                      value={billingForm.email}
                      onChange={handleBillingFormChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="c_phone" className="text-black">
                      Phone <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="c_phone"
                      name="phone"
                      placeholder="Phone Number"
                      value={billingForm.phone}
                      onChange={handleBillingFormChange}
                    />
                  </div>
                </div>

                {/* Order Notes */}
                <div className="form-group">
                  <label htmlFor="c_order_notes" className="text-black">
                    Order Notes
                  </label>
                  <textarea
                    name="c_order_notes"
                    id="c_order_notes"
                    className="form-control"
                    placeholder="Write your notes here..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Order Section */}
            <div className="col-md-6">
              {/* Order Table */}
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
                        
                        {/* {selectedShipping && (
                          <tr>
                            <td className="text-black font-weight-bold">
                              <strong>Shipping ({selectedShipping.courier} - {selectedShipping.service})</strong>
                            </td>
                            <td className="text-black">{formatPrice(selectedShipping.cost)}</td>
                          </tr>
                        )} */}
                        
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
                        // onClick={handlePlaceOrder}
                        disabled={!selectedAddress || !paymentMethod || isProcessing}
                      >
                        {isProcessing ? 'Processing...' : 'Place Order'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


	{showAddressModal && (
	<div className="modal fade show d-block" tabIndex={-1}>
		<div className="modal-dialog">
		<div className="modal-content">
			<div className="modal-header">
			<h5 className="modal-title">Tambah Alamat Baru</h5>
			<button type="button" className="btn-close" onClick={() => setShowAddressModal(false)}></button>
			</div>
			<div className="modal-body">
			<div className="mb-3">
				<label className="form-label">Nama Alamat</label>
				<input
				type="text"
				className="form-control"
				value={addressForm.title}
				onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
				/>
			</div>
			<div className="mb-3">
				<label className="form-label">Alamat Lengkap</label>
				<textarea
				className="form-control"
				value={addressForm.alamat}
				onChange={(e) => setAddressForm({ ...addressForm, alamat: e.target.value })}
				/>
			</div>
			<div className="mb-3">
				<label className="form-label">Provinsi</label>
				<input
				type="text"
				className="form-control"
				value={addressForm.provinsi}
				onChange={(e) => setAddressForm({ ...addressForm, provinsi: e.target.value })}
				/>
			</div>
			<div className="mb-3">
				<label className="form-label">Kota</label>
				<input
				type="text"
				className="form-control"
				value={addressForm.kota}
				onChange={(e) => setAddressForm({ ...addressForm, kota: e.target.value })}
				/>
			</div>
			<div className="mb-3">
				<label className="form-label">Kecamatan</label>
				<input
				type="text"
				className="form-control"
				value={addressForm.kecamatan}
				onChange={(e) => setAddressForm({ ...addressForm, kecamatan: e.target.value })}
				/>
			</div>
			<div className="mb-3">
				<label className="form-label">Kode Pos</label>
				<input
				type="text"
				className="form-control"
				value={addressForm.kodepos}
				onChange={(e) => setAddressForm({ ...addressForm, kodepos: e.target.value })}
				/>
			</div>
			<div className="form-check">
				<input
				className="form-check-input"
				type="checkbox"
				checked={addressForm.is_default === 1}
				onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked ? 1 : 0 })}
				/>
				<label className="form-check-label">Jadikan Default</label>
			</div>
			</div>
			<div className="modal-footer">
			<button type="button" className="btn btn-secondary" onClick={() => setShowAddressModal(false)}>Batal</button>
			<button
				type="button"
				className="btn btn-primary"
				onClick={async () => {
				try {
					setAddressLoading(true);
					const newAddress = await createMemberAddress({
					member_id: 1, // ambil dari token kalau ada
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
					setAddresses([...addresses, newAddress]);
					setSelectedAddress(newAddress);
					setShowAddressModal(false);
				} catch (err) {
					alert("Gagal menambah alamat");
				} finally {
					setAddressLoading(false);
				}
				}}
				disabled={addressLoading}
			>
				{addressLoading ? "Menyimpan..." : "Simpan"}
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