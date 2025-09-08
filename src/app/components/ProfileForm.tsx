"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { updateProfile, uploadPhoto, clearError } from "@/store/slices/userSlice";
import Link from "next/link";
import AddAddress from "@/app/components/modal/AddAddress";
import { getMemberAddresses, setDefaultAddress, deleteAddress } from "@/services/addressService";
import { IAddress } from "@/app/components/inteface/IAddress";
import PutAddress from "./modal/PutAddress";


export default function ProfileForm() {
    const dispatch = useAppDispatch();
    
    // Ambil data user dari authSlice
    const { user, isAuthenticated, isLoading: authLoading } = useAppSelector((state) => state.auth);
    
    // Ambil state operasi dari userSlice
    const { isUpdating, error, message } = useAppSelector((state) => state.user);
    
    const [isEditing, setIsEditing] = useState(false);
    const [localMessage, setLocalMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Address modal state
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addresses, setAddresses] = useState<IAddress[]>([]);
    const [addressesLoading, setAddressesLoading] = useState(false);
    const [settingDefault, setSettingDefault] = useState<number | null>(null);
    const [deletingAddress, setDeletingAddress] = useState<number | null>(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<IAddress | null>(null);

    const [showAlert, setShowAlert] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null);

    const [formData, setFormData] = useState({
        FirstName: "",
        Surname: "",
        Email: "",
        PhoneNumber: "",
        Address: ""
    });

    const showMessage = (type: 'success' | 'error' | 'warning', message: string) => {
        setShowAlert({ type, message });
        setTimeout(() => setShowAlert(null), 4000);
    };

    // Update form when user data changes
    useEffect(() => {
        console.log('User data changed:', user);
        if (user) {
            setFormData({
                FirstName: user.FirstName || "",
                Surname: user.Surname || "",
                Email: user.Email || "",
                PhoneNumber: user.PhoneNumber || "",
                Address: ""
            });
        }
    }, [user]);

    // Load addresses when component mounts
    useEffect(() => {
        if (isAuthenticated && user) {
            loadAddresses();
        }
    }, [isAuthenticated, user]);

    // Handle Redux errors and messages
    useEffect(() => {
        if (error) {
            setLocalMessage(error);
            setIsSuccess(false);
            dispatch(clearError());
        } else if (message) {
            setLocalMessage(message);
            setIsSuccess(true);
            dispatch(clearError());
            
            // Clear message setelah 3 detik
            const timer = setTimeout(() => {
                setLocalMessage("");
                setIsSuccess(false);
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [error, message, dispatch]);

    // Load addresses function
    const loadAddresses = async () => {
        try {
            setAddressesLoading(true);
            const addressData = await getMemberAddresses();
            setAddresses(addressData);
        } catch (error) {
            console.error("Failed to load addresses:", error);
            setLocalMessage("Gagal memuat alamat");
            setIsSuccess(false);
        } finally {
            setAddressesLoading(false);
        }
    };
    
    const handleSetDefaultAddress = async (addressId: number) => {
        try {
            setSettingDefault(addressId);

            const result = await setDefaultAddress(addressId);

            if (result.ok) {
            const updatedAddresses = addresses.map(addr => ({
                ...addr,
                IsDefault: addr.ID === addressId ? 1 : 0
            }));
            setAddresses(updatedAddresses);

            showMessage("success", "Alamat default berhasil diubah!");
            } else {
            throw new Error("Failed to set default address");
            }
        } catch (error) {
            console.error("Failed to set default address:", error);
            showMessage("error", "Gagal mengubah alamat default");
        } finally {
            setSettingDefault(null);
        }
    };

    // Handler untuk edit alamat
    const handleEditAddress = (address: IAddress) => {
        setAddressToEdit(address);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setAddressToEdit(null);
    };

    // Success edit
    const handleEditSuccess = (message?: string) => {
        showMessage("success", message || "Alamat berhasil diperbarui");
        loadAddresses(); // reload kalau ada
    };

    // Delete alamat
    const handleDeleteAddress = async (addressId: number) => {
        if (addresses.length === 1) {
            showMessage("warning", "Tidak dapat menghapus alamat terakhir");
            return;
        }

        if (!confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
            return;
        }

        try {
            setDeletingAddress(addressId);

            const result = await deleteAddress(addressId);

            if (result.ok) {
            const updatedAddresses = addresses.filter(addr => addr.ID !== addressId);

            if (
                updatedAddresses.length > 0 &&
                !updatedAddresses.some(addr => addr.IsDefault === 1)
            ) {
                updatedAddresses[0].IsDefault = 1;
                await setDefaultAddress(updatedAddresses[0].ID);
            }

            setAddresses(updatedAddresses);

            showMessage("success", "Alamat berhasil dihapus!");
            }
        } catch (error: unknown) {
            console.error("Failed to delete address:", error);
            showMessage(
            "error",
            error instanceof Error ? error.message : "Gagal menghapus alamat"
            );
        } finally {
            setDeletingAddress(null);
        }
    };


    // Handle address modal success
    const handleSuccess = (message: string, callback?: () => void) => {
        showMessage("success", message);
        if (callback) callback();
    };

    const handleAddressModalSuccess = () => {
        handleSuccess("Alamat berhasil disimpan", loadAddresses);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        console.log("Saving profile data:", formData);

        try {
            const result = await dispatch(updateProfile(formData)).unwrap();
            console.log("Update profile success:", result);

            showMessage("success", "Profil berhasil diperbarui");
            setIsEditing(false);
        } catch (err) {
            console.error("Update profile error:", err);
            showMessage("error", "Gagal memperbarui profil");
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
            FirstName: user.FirstName || "",
            Surname: user.Surname || "",
            Email: user.Email || "",
            PhoneNumber: user.PhoneNumber || "",
            Address: ""
            });
        }
        setIsEditing(false);
        showMessage("warning", "Perubahan dibatalkan");
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
            if (!file) return;

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            if (!file.type.startsWith("image/")) {
                showMessage("error", "File harus berupa gambar");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showMessage("error", "Ukuran file maksimal 5MB");
                return;
            }

            try {
                setIsUploadingPhoto(true);

                // Buat preview sementara
                const imageUrl = URL.createObjectURL(file);
                setPreviewImage(imageUrl);

                const result = await dispatch(uploadPhoto(file)).unwrap();
                console.log("Upload photo success:", result);

                if (result?.PhotoProfile) {
                // Hapus preview sementara
                URL.revokeObjectURL(imageUrl);

                const newProfilePic =
                    typeof result.PhotoProfile === "object"
                    ? result.PhotoProfile.medium
                    : result.PhotoProfile;

                setPreviewImage(newProfilePic);

                // ✅ Tambahkan toast success
                showMessage("success", "Foto profil berhasil diperbarui");

                // Clear preview setelah beberapa detik
                setTimeout(() => {
                    setPreviewImage(null);
                }, 1000);
                }
            } catch (err) {
                console.error("Upload photo error:", err);
                if (previewImage) {
                URL.revokeObjectURL(previewImage);
                setPreviewImage(null);
                }
                showMessage("error", "Gagal mengunggah foto profil");
            } finally {
                setIsUploadingPhoto(false);
        }
    };



    // Clean up preview image on unmount
    useEffect(() => {
        return () => {
            if (previewImage && previewImage.startsWith('blob:')) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    // Loading state saat auth sedang loading
    if (authLoading) {
        return (
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p>Memuat data profil...</p>
            </div>
        );
    }

    // Jika user tidak authenticated
    if (!isAuthenticated || !user) {
        return (
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 text-center">
                        <div className="card shadow-lg border-0" style={{ borderRadius: "20px" }}>
                            <div className="card-body p-5">
                                <i className="fas fa-exclamation-triangle text-warning fs-1 mb-3"></i>
                                <h3 className="fw-bold text-dark mb-3">Akses Ditolak</h3>
                                <p className="text-muted mb-4">
                                    Anda harus login terlebih dahulu untuk mengakses halaman profil.
                                </p>
                                <Link href="/auth/login" className="btn btn-primary">
                                    Login Sekarang
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Prioritas gambar: preview > user photo > default
    const getProfileImage = () => {
        if (previewImage) return previewImage;

        const userPhoto =
            typeof user?.PhotoProfile === "object"
            ? user?.PhotoProfile?.medium ?? null
            : user?.PhotoProfile ?? null;

        return (
            userPhoto ||
            "https://www.pngitem.com/pimgs/m/579-5798505_user-placeholder-svg-hd-png-download.png"
        );
    };


    const profilePic = getProfileImage();
    console.log({profilePic, previewImage, userPhoto: user?.PhotoProfile});

    return (
        <div className="container">
            {showAlert && (
            <div className="position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 9999 }}>
                <div className={`alert alert-${showAlert.type === 'success' ? 'success' : showAlert.type === 'error' ? 'danger' : 'warning'} alert-dismissible fade show shadow-lg`} role="alert">
                <i className={`fas ${showAlert.type === 'success' ? 'fa-check-circle' : showAlert.type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                {showAlert.message}
                <button type="button" className="btn-close" onClick={() => setShowAlert(null)}></button>
                </div>
            </div>
            )}
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-lg border-0" style={{ borderRadius: "20px" }}>
                        <div className="card-body p-5">
                            {/* Header Profile */}
                            <div className="text-center mb-4">
                                <div className="position-relative d-inline-block mb-3">
                                    <div
                                        className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center position-relative"
                                        style={{ width: "100px", height: "100px" }}
                                    >
                                        <img
                                            src={profilePic}
                                            alt="Profile"
                                            className="rounded-circle"
                                            style={{ 
                                                width: "100px", 
                                                height: "100px", 
                                                objectFit: "cover",
                                                opacity: isUploadingPhoto ? 0.7 : 1,
                                                transition: "opacity 0.3s ease"
                                            }}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = "/default-avatar.png";
                                            }}
                                        />
                                        
                                        {/* Loading overlay saat upload */}
                                        {isUploadingPhoto && (
                                            <div 
                                                className="position-absolute top-0 start-0 w-100 h-100 rounded-circle d-flex align-items-center justify-content-center"
                                                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                                            >
                                                <div className="spinner-border spinner-border-sm text-white"></div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button
                                        className="btn btn-sm btn-warning rounded-circle position-absolute bottom-0 end-0 p-2"
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Ubah foto profil"
                                        disabled={isUploadingPhoto}
                                    >
                                        {isUploadingPhoto ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                            <i className="fas fa-camera"></i>
                                        )}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        style={{ display: "none" }}
                                    />
                                </div>
                                <h2 className="fw-bold text-dark mb-1">
                                    {user.FirstName} {user.Surname}
                                </h2>
                                <p className="text-muted small">{user.Email}</p>
                            </div>

                            {/* Form Profile */}
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-semibold text-dark mb-0">Informasi Profil</h5>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="btn btn-outline-primary btn-sm"
                                            style={{ borderRadius: "12px" }}
                                        >
                                            <i className="fas fa-edit me-1"></i>
                                            Edit Profil
                                        </button>
                                    ) : (
                                        <div className="btn-group">
                                            <button
                                                onClick={handleSave}
                                                className="btn btn-success btn-sm"
                                                disabled={isUpdating}
                                                style={{ borderRadius: "12px 0 0 12px" }}
                                            >
                                                {isUpdating ? (
                                                    <>
                                                        <span
                                                            className="spinner-border spinner-border-sm me-1"
                                                            role="status"
                                                            aria-hidden="true"
                                                        ></span>
                                                        Menyimpan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-save me-1"></i>
                                                        Simpan
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="btn btn-outline-secondary btn-sm"
                                                style={{ borderRadius: "0 12px 12px 0" }}
                                            >
                                                <i className="fas fa-times me-1"></i>
                                                Batal
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Input Fields */}
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small fw-semibold">Nama Depan</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <i className="fas fa-user text-muted"></i>
                                            </span>
                                            <input
                                                type="text"
                                                name="FirstName"
                                                className="form-control border-start-0 ps-0"
                                                value={formData.FirstName}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label text-muted small fw-semibold">Nama Belakang</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <i className="fas fa-user text-muted"></i>
                                            </span>
                                            <input
                                                type="text"
                                                name="Surname"
                                                className="form-control border-start-0 ps-0"
                                                value={formData.Surname}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label text-muted small fw-semibold">Email</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <i className="fas fa-envelope text-muted"></i>
                                            </span>
                                            <input
                                                type="email"
                                                name="Email"
                                                className="form-control border-start-0 ps-0"
                                                value={formData.Email}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label text-muted small fw-semibold">Nomor Telepon</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <i className="fas fa-phone text-muted"></i>
                                            </span>
                                            <input
                                                type="tel"
                                                name="PhoneNumber"
                                                className="form-control border-start-0 ps-0"
                                                placeholder="Masukkan nomor telepon"
                                                value={formData.PhoneNumber}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bagian Alamat - Enhanced Version */}
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-lg border-0 mt-4" style={{ borderRadius: "20px" }}>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-semibold text-dark mb-0">Alamat Saya</h6>
                                <button
                                    onClick={() => setShowAddressModal(true)}
                                    className="btn btn-outline-primary btn-sm"
                                    style={{ borderRadius: "12px" }}
                                    disabled={addressesLoading}
                                >
                                    {addressesLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-plus me-1"></i> Tambah Alamat
                                        </>
                                    )}
                                </button>
                            </div>

                            {addressesLoading ? (
                                <div className="text-center py-3">
                                    <div className="spinner-border spinner-border-sm text-primary"></div>
                                    <p className="small text-muted mt-2">Memuat alamat...</p>
                                </div>
                            ) : addresses && addresses.length > 0 ? (
                                <div className="list-group">
                                    {addresses.map((addr: IAddress) => (
                                        <div
                                            key={addr.ID}
                                            className={`list-group-item border-0 shadow-sm mb-3 rounded-3 position-relative ${
                                                addr.IsDefault ? "border border-2 border-primary bg-primary bg-opacity-10" : "bg-light"
                                            }`}
                                            style={{ 
                                                transition: "all 0.3s ease",
                                                padding: "1rem"
                                            }}
                                        >
                                            {/* Default Badge */}
                                            {addr.IsDefault === 1 && (
                                                <div className="position-absolute top-0 start-0">
                                                    <div className="badge bg-primary rounded-end-0 rounded-bottom-3 px-2 py-1">
                                                        <i className="fas fa-star me-1"></i>
                                                        Default
                                                    </div>
                                                </div>
                                            )}

                                            <div className="d-flex justify-content-between mt-2 align-items-start">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <h6 className="mb-0 fw-semibold text-dark">
                                                            {addr.Title}
                                                        </h6>
                                                    </div>
                                                    
                                                    <p className="mb-1 text-muted small">
                                                        <i className="fas fa-map-marker-alt me-1 text-primary"></i>
                                                        {addr.Alamat}
                                                    </p>
                                                    <p className="mb-2 text-muted small">
                                                        {addr.Kecamatan}, {addr.Kota}, {addr.Provinsi} {addr.KodePos}
                                                    </p>

                                                    {/* Action Buttons */}
                                                    <div className="d-flex gap-2 mt-2 flex-wrap">
                                                        {/* Set as Default Button */}
                                                        {addr.IsDefault !== 1 && (
                                                            <button
                                                                onClick={() => handleSetDefaultAddress(addr.ID)}
                                                                className="btn btn-outline-primary btn-sm"
                                                                style={{ borderRadius: "8px", fontSize: "0.75rem" }}
                                                                disabled={settingDefault === addr.ID}
                                                            >
                                                                {settingDefault === addr.ID ? (
                                                                    <>
                                                                        <span className="spinner-border spinner-border-sm me-1" style={{ width: "0.7rem", height: "0.7rem" }}></span>
                                                                        Setting...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="fas fa-star me-1"></i>
                                                                        Jadikan Default
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}

                                                        {/* Edit Button */}
                                                        <button
                                                            onClick={() => handleEditAddress(addr)}
                                                            className="btn btn-outline-secondary btn-sm"
                                                            style={{ borderRadius: "8px", fontSize: "0.75rem" }}
                                                        >
                                                            <i className="fas fa-edit me-1"></i>
                                                            Edit
                                                        </button>

                                                        {/* Delete Button */}
                                                        <button
                                                            onClick={() => handleDeleteAddress(addr.ID)}
                                                            className="btn btn-outline-danger btn-sm"
                                                            style={{ borderRadius: "8px", fontSize: "0.75rem" }}
                                                            disabled={addresses.length === 1 || deletingAddress === addr.ID}
                                                            title={addresses.length === 1 ? "Tidak dapat menghapus alamat terakhir" : "Hapus alamat"}
                                                        >
                                                            {deletingAddress === addr.ID ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-1" style={{ width: "0.7rem", height: "0.7rem" }}></span>
                                                                    Hapus...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-trash me-1"></i>
                                                                    Hapus
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Default Address Indicator */}
                                            {addr.IsDefault === 1 && (
                                                <div className="position-absolute top-0 end-0 me-3 mt-3">
                                                    <div className="text-primary">
                                                        <i className="fas fa-check-circle fs-5"></i>
                                                    </div>
                                                </div>
                                            )}
                                            {/* PutAddress Modal */}
                                            <PutAddress
                                                show={showEditModal}
                                                onClose={handleCloseEditModal}
                                                onSuccess={handleEditSuccess}
                                                address={addressToEdit}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="mb-3">
                                        <i className="fas fa-map-marker-alt text-muted" style={{ fontSize: "3rem", opacity: 0.5 }}></i>
                                    </div>
                                    <h6 className="text-muted mb-2">Belum ada alamat tersimpan</h6>
                                    <p className="text-muted small mb-3">
                                        Tambahkan alamat untuk mempermudah pengiriman produk
                                    </p>
                                    <button
                                        onClick={() => setShowAddressModal(true)}
                                        className="btn btn-primary"
                                        style={{ borderRadius: "12px" }}
                                    >
                                        <i className="fas fa-plus me-2"></i>
                                        Tambah Alamat Pertama
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Navigation */}
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-lg border-0 mt-4" style={{ borderRadius: "20px" }}>
                        <div className="card-body p-4">
                            {/* Quick Actions */}
                            <div className="mb-4">
                                <h6 className="fw-semibold text-dark mb-3">Pengaturan Akun</h6>
                                <div className="row g-2">
                                    <div className="col-md-12">
                                        <Link
                                            href="/change-password"
                                            className="btn btn-outline-warning w-100 py-2"
                                            style={{ borderRadius: "12px" }}
                                        >
                                            <i className="fas fa-key me-2"></i>
                                            Ganti Password
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <div className="text-center pt-3 border-top">
                                <div className="row g-2">
                                    <div className="col-md-4">
                                        <Link
                                            href="/"
                                            className="text-decoration-none text-primary fw-semibold small"
                                        >
                                            <i className="fas fa-home me-1"></i>
                                            Beranda
                                        </Link>
                                    </div>
                                    <div className="col-md-4">
                                        <Link
                                            href="/product"
                                            className="text-decoration-none text-primary fw-semibold small"
                                        >
                                            <i className="fas fa-shopping-bag me-1"></i>
                                            Produk
                                        </Link>
                                    </div>
                                    <div className="col-md-4">
                                        <Link
                                            href="/cart"
                                            className="text-decoration-none text-primary fw-semibold small"
                                        >
                                            <i className="fas fa-shopping-cart me-1"></i>
                                            Keranjang
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AddAddressModal Integration */}
            <AddAddress
                show={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                onSuccess={handleAddressModalSuccess}
                showMessage={showMessage}
            />
            
        </div>
    );
}