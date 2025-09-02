"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { forgotPasswordRequest, clearAuthState } from "@/store/slices/authSlice";

export default function ForgotPasswordForm() {
  const dispatch = useAppDispatch();
  const { isLoading, error, message, isSuccess } = useAppSelector((state) => state.auth);
  
  const [email, setEmail] = useState("");

  // Clear state saat component mount
  useEffect(() => {
    dispatch(clearAuthState());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return;
    }

    dispatch(forgotPasswordRequest(email));
  };

  const handleResend = () => {
    dispatch(clearAuthState());
    setEmail("");
  };

  // Custom validation
  let validationError = "";
  if (!email) {
    // validationError = "Email harus diisi";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      validationError = "Format email tidak valid";
    }
  }

  const displayMessage = validationError || error || message;

  return (
    <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
      <div className="card-body p-5">
        <div className="text-center mb-4">
          <div className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
               style={{ width: '60px', height: '60px' }}>
            <i className="fas fa-key text-white fs-4"></i>
          </div>
          <h2 className="fw-bold text-dark mb-2">Lupa Password?</h2>
          <p className="text-muted small">
            {isSuccess 
              ? "Kami telah mengirimkan link reset password ke email Anda"
              : "Masukkan email Anda dan kami akan mengirimkan link reset password"
            }
          </p>
        </div>
        
        {!isSuccess ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="form-label text-muted small fw-semibold">
                Email Address
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-envelope text-muted"></i>
                </span>
                <input
                  id="email"
                  type="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="Masukkan email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  style={{ boxShadow: 'none', borderColor: '#dee2e6' }}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-warning w-100 py-3 fw-semibold text-white"
              disabled={isLoading}
              style={{ 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fd7e14 0%, #e83e8c 100%)',
                border: 'none'
              }}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Mengirim Email...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane me-2"></i>
                  Kirim Link Reset
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="alert alert-success d-inline-block" style={{ borderRadius: '12px' }}>
              <i className="fas fa-check-circle me-2"></i>
              Email berhasil dikirim!
            </div>
            <p className="text-muted small mt-3 mb-4">
              Tidak menerima email? Cek folder spam/junk atau 
              <button
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 fw-semibold rounded-pill px-3 py-1 ms-2"
                onClick={handleResend}
              >
                <i className="fas fa-redo"></i> Kirim Ulang
              </button>
            </p>
          </div>
        )}

        {displayMessage && !isSuccess && (
          <div className={`alert mt-4 py-3 ${message?.includes("✅") ? "alert-success" : "alert-danger"}`} style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-center">
              <i className={`fas ${message?.includes("✅") ? "fa-check-circle" : "fa-exclamation-circle"} me-2`}></i>
              <span className="small">{displayMessage}</span>
            </div>
          </div>
        )}

        <div className="text-center mt-4 pt-3 border-top">
          <p className="text-muted small mb-2">
            Ingat password Anda? 
            <Link href="/auth/login" className="text-decoration-none text-primary fw-semibold ms-1">
              Kembali ke Login
            </Link>
          </p>
          <p className="text-muted small mb-0">
            Belum punya akun? 
            <Link href="/auth/register" className="text-decoration-none text-primary fw-semibold ms-1">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}