"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getUser, updateUserProfile, uploadProfilePicture } from "@/services/userService";

interface UserResponse {
  Email: string;
  FirstName: string;
  Surname: string;
  PhoneNumber?: string;
  PhotoProfile?: {
    original: string;
    small: string;
    medium: string;
  } | null;
}

function Profile() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    FirstName: "",
    Surname: "",
    Email: "",
    PhoneNumber: "",
    Address: ""
  });

  // 🔹 Load user pertama kali
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      const result = await getUser();
      if (result.ok && result.data) {
        setUser(result.data);
        setFormData({
          FirstName: result.data.FirstName || "",
          Surname: result.data.Surname || "",
          Email: result.data.Email || "",
          PhoneNumber: result.data.PhoneNumber || "",
          Address: ""
        });
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🔹 Save profile
  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    setIsSuccess(false);

    const { ok, data } = await updateUserProfile(formData);
    if (ok) {
      setMessage("Profil berhasil diperbarui! ✅");
      setIsSuccess(true);
      setIsEditing(false);

      // Refresh user
      const result = await getUser();
      if (result.ok && result.data) {
        setUser(result.data);
      }
    } else {
      setMessage(data?.message || "Gagal memperbarui profil");
      setIsSuccess(false);
    }
    setIsSaving(false);
  };

  // 🔹 Cancel edit
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
    setMessage("");
  };

  // 🔹 Upload profile picture
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("File harus berupa gambar");
      setIsSuccess(false);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Ukuran file maksimal 5MB");
      setIsSuccess(false);
      return;
    }

    const { ok, data } = await uploadProfilePicture(file);
    if (ok) {
      setMessage("Foto profil berhasil diperbarui! ✅");
      setIsSuccess(true);
      const result = await getUser();
      if (result.ok && result.data) {
        setUser(result.data);
      }
    } else {
      setMessage(data?.message || "Gagal upload foto profil");
      setIsSuccess(false);
    }
  };

  // 🔹 Ambil foto profil (fallback ke default)
  const profilePic = user?.PhotoProfile?.medium ?? "/default-avatar.png";

  // 🔹 State Loading
  if (isLoading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{
          background: "linear-gradient(135deg, #3b5d50 0%, #2d4a42 100%)",
          fontFamily: "var(--font-geist-sans)"
        }}
      >
        <div className="text-center text-white">
          <div className="spinner-border text-warning mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Memuat data profil...</p>
        </div>
      </div>
    );
  }

  // 🔹 Kalau user belum login
  if (!user) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{
          background: "linear-gradient(135deg, #3b5d50 0%, #2d4a42 100%)",
          fontFamily: "var(--font-geist-sans)"
        }}
      >
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
                  <Link
                    href="/login"
                    className="btn btn-primary px-4 py-2"
                    style={{ borderRadius: "12px" }}
                  >
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Login Sekarang
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Render profile
  return (
    <div
      className="min-vh-100 py-5"
      style={{
        background: "linear-gradient(135deg, #3b5d50 0%, #2d4a42 100%)",
        fontFamily: "var(--font-geist-sans)"
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0" style={{ borderRadius: "20px" }}>
              <div className="card-body p-5">
                {/* Header Profile */}
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block mb-3">
                    <div
                      className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{ width: "100px", height: "100px" }}
                    >
                      <img
                        src={profilePic}
                        alt="Profile"
                        className="rounded-circle"
                        style={{ width: "100px", height: "100px", objectFit: "cover" }}
                      />
                    </div>
                    <button
                      className="btn btn-sm btn-warning rounded-circle position-absolute bottom-0 end-0 p-2"
                      onClick={() => fileInputRef.current?.click()}
                      title="Ubah foto profil"
                    >
                      <i className="fas fa-camera"></i>
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
                          disabled={isSaving}
                          style={{ borderRadius: "12px 0 0 12px" }}
                        >
                          {isSaving ? (
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

                {/* Success/Error Message */}
                {message && (
                  <div
                    className={`alert mt-3 py-3 ${
                      isSuccess ? "alert-success" : "alert-danger"
                    }`}
                    style={{ borderRadius: "12px" }}
                  >
                    <div className="d-flex align-items-center">
                      <i
                        className={`fas ${
                          isSuccess ? "fa-check-circle" : "fa-exclamation-circle"
                        } me-2`}
                      ></i>
                      <span className="small">{message}</span>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="border-top pt-4">
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
                    {/* <div className="col-md-6">
                      <button
                        className="btn btn-outline-danger w-100 py-2"
                        style={{ borderRadius: "12px" }}
                      >
                        <i className="fas fa-trash me-2"></i>
                        Hapus Akun
                      </button>
                    </div> */}
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="text-center mt-4 pt-3 border-top">
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
      </div>
    </div>
  );
}

export default Profile;
