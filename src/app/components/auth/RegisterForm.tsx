"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { registerUser, clearAuthState } from "@/store/slices/authSlice";

export default function RegisterForm() {
  const dispatch = useAppDispatch();
  const { isLoading, error, message, isSuccess } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Clear state saat component mount
  useEffect(() => {
    dispatch(clearAuthState());
  }, [dispatch]);

  // Handle redirect setelah register sukses
  useEffect(() => {
    if (isSuccess && message?.includes("Registrasi berhasil")) {
      const timer = setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, message, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { firstName, surname, email, password, confirmPassword, phoneNumber } = formData;

    // Validasi form
    if (!firstName || !surname || !email || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    dispatch(registerUser({
      FirstName: firstName,
      Surname: surname,
      Email: email,
      Password: password,
      PhoneNumber: phoneNumber,
    }));
  };

  const displayMessage = error || message;

  // Custom validation messages
  let validationError = "";
  const { firstName, surname, email, password, confirmPassword } = formData;

  if (!firstName || !surname || !email || !password || !confirmPassword) {
    validationError = "Semua field harus diisi";
  } else if (password !== confirmPassword) {
    validationError = "Password dan konfirmasi password tidak cocok";
  } else if (password.length < 6) {
    validationError = "Password harus minimal 6 karakter";
  }

  const finalMessage = validationError || displayMessage;

  return (
    <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
      <div className="card-body p-5">
        <div className="text-center mb-4">
          <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
               style={{ width: '60px', height: '60px' }}>
            <i className="fas fa-user-plus text-white fs-4"></i>
          </div>
          <h2 className="fw-bold text-dark mb-2">Buat Akun Baru</h2>
          <p className="text-muted small">Silakan isi data diri Anda</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* First Name & Surname */}
          <div className="row mb-4">
            <div className="col-md-6">
              <label htmlFor="firstName" className="form-label text-muted small fw-semibold">
                Nama Depan *
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-user text-muted"></i>
                </span>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Nama depan"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                  style={{ boxShadow: 'none', borderColor: '#dee2e6' }}
                />
              </div>
            </div>
            <div className="col-md-6">
              <label htmlFor="surname" className="form-label text-muted small fw-semibold">
                Nama Belakang *
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-user text-muted"></i>
                </span>
                <input
                  id="surname"
                  name="surname"
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Nama belakang"
                  value={formData.surname}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                  style={{ boxShadow: 'none', borderColor: '#dee2e6' }}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="form-label text-muted small fw-semibold">
              Email Address *
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="fas fa-envelope text-muted"></i>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="Masukkan email Anda"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                style={{ boxShadow: 'none', borderColor: '#dee2e6' }}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="form-label text-muted small fw-semibold">
              Nomor Telepon
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="fas fa-phone text-muted"></i>
              </span>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                className="form-control border-start-0 ps-0"
                placeholder="Masukkan nomor telepon"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={isLoading}
                style={{ boxShadow: 'none', borderColor: '#dee2e6' }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="form-label text-muted small fw-semibold">
              Password *
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="fas fa-lock text-muted"></i>
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="form-control border-start-0 border-end-0 ps-0"
                placeholder="Masukkan password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                style={{ boxShadow: 'none', borderColor: '#dee2e6' }}
              />
              <button
                type="button"
                className="input-group-text bg-light border-start-0"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer' }}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label text-muted small fw-semibold">
              Konfirmasi Password *
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="fas fa-lock text-muted"></i>
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="form-control border-start-0 border-end-0 ps-0"
                placeholder="Konfirmasi password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                style={{ boxShadow: 'none', borderColor: '#dee2e6' }}
              />
              <button
                type="button"
                className="input-group-text bg-light border-start-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ cursor: 'pointer' }}
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-success w-100 py-3 fw-semibold"
            disabled={isLoading}
            style={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              border: 'none'
            }}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Memproses...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus me-2"></i>
                Daftar Sekarang
              </>
            )}
          </button>
        </form>

        {finalMessage && (
          <div className={`alert mt-4 py-3 ${message?.includes("✅") ? "alert-success" : "alert-danger"}`} style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-center">
              <i className={`fas ${message?.includes("✅") ? "fa-check-circle" : "fa-exclamation-circle"} me-2`}></i>
              <span className="small">{finalMessage}</span>
            </div>
          </div>
        )}

        <div className="text-center mt-4 pt-3 border-top">
          <p className="text-muted small mb-0">
            Sudah punya akun? 
            <Link href="/auth/login" className="text-decoration-none text-primary fw-semibold ms-1">
              Masuk sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}