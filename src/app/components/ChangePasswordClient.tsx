'use client';

import React, { useState } from 'react';
import { changePassword } from '@/services/userService';
import Link from 'next/link';

interface PasswordFormData {
  CurrentPassword: string;
  NewPassword: string;
  ConfirmPassword: string;
}

function ChangePassword() {
  const [formData, setFormData] = useState<PasswordFormData>({
    CurrentPassword: '',
    NewPassword: '',
    ConfirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear message when user starts typing
    if (message) {
      setMessage(null);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.CurrentPassword.trim()) {
      setMessage({ type: 'error', text: 'Password saat ini harus diisi' });
      return false;
    }
    
    if (!formData.NewPassword.trim()) {
      setMessage({ type: 'error', text: 'Password baru harus diisi' });
      return false;
    }
    
    if (formData.NewPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password baru minimal 6 karakter' });
      return false;
    }
    
    if (formData.NewPassword !== formData.ConfirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok' });
      return false;
    }
    
    if (formData.CurrentPassword === formData.NewPassword) {
      setMessage({ type: 'error', text: 'Password baru tidak boleh sama dengan password saat ini' });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await changePassword({
        CurrentPassword: formData.CurrentPassword,
        NewPassword: formData.NewPassword
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Password berhasil diubah' });
        // Reset form
        setFormData({
          CurrentPassword: '',
          NewPassword: '',
          ConfirmPassword: ''
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: response.data?.message || 'Gagal mengubah password' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Terjadi kesalahan. Silakan coba lagi.' 
      });
    } finally {
      setLoading(false);
    }
  };

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
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block mb-3">
                    <div
                      className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <i className="fas fa-key text-white" style={{ fontSize: "28px" }}></i>
                    </div>
                  </div>
                  <h2 className="fw-bold text-dark mb-1">Ubah Password</h2>
                  <p className="text-muted small">Pastikan password baru Anda aman dan mudah diingat</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <h5 className="fw-semibold text-dark mb-3">Informasi Password</h5>

                    {/* Current Password */}
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-semibold">
                        Password Saat Ini
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="fas fa-lock text-muted"></i>
                        </span>
                        <input
                          type={showPassword.current ? 'text' : 'password'}
                          id="CurrentPassword"
                          name="CurrentPassword"
                          className="form-control border-start-0 border-end-0 ps-0"
                          placeholder="Masukkan password saat ini"
                          value={formData.CurrentPassword}
                          onChange={handleInputChange}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="input-group-text bg-light border-start-0"
                          onClick={() => togglePasswordVisibility('current')}
                          disabled={loading}
                          style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                          <i className={`fas ${showPassword.current ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-semibold">
                        Password Baru
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="fas fa-key text-muted"></i>
                        </span>
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          id="NewPassword"
                          name="NewPassword"
                          className="form-control border-start-0 border-end-0 ps-0"
                          placeholder="Masukkan password baru (min. 6 karakter)"
                          value={formData.NewPassword}
                          onChange={handleInputChange}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="input-group-text bg-light border-start-0"
                          onClick={() => togglePasswordVisibility('new')}
                          disabled={loading}
                          style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                          <i className={`fas ${showPassword.new ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-4">
                      <label className="form-label text-muted small fw-semibold">
                        Konfirmasi Password Baru
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="fas fa-shield-alt text-muted"></i>
                        </span>
                        <input
                          type={showPassword.confirm ? 'text' : 'password'}
                          id="ConfirmPassword"
                          name="ConfirmPassword"
                          className="form-control border-start-0 border-end-0 ps-0"
                          placeholder="Ulangi password baru"
                          value={formData.ConfirmPassword}
                          onChange={handleInputChange}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="input-group-text bg-light border-start-0"
                          onClick={() => togglePasswordVisibility('confirm')}
                          disabled={loading}
                          style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                          <i className={`fas ${showPassword.confirm ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-warning w-100 py-3 fw-semibold"
                      style={{ borderRadius: "12px" }}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Mengubah Password...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Ubah Password
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Success/Error Message */}
                {message && (
                  <div
                    className={`alert mt-3 py-3 ${
                      message.type === 'success' ? "alert-success" : "alert-danger"
                    }`}
                    style={{ borderRadius: "12px" }}
                  >
                    <div className="d-flex align-items-center">
                      <i
                        className={`fas ${
                          message.type === 'success' ? "fa-check-circle" : "fa-exclamation-circle"
                        } me-2`}
                      ></i>
                      <span className="small">{message.text}</span>
                    </div>
                  </div>
                )}

                {/* Password Guidelines */}
                <div className="border-top pt-4 mb-4">
                    <h6 className="fw-semibold text-dark mb-3">Tips Password Aman</h6>
                    <div className="row g-2">
                        <div className="col-12">
                        <div
                            className="alert alert-info py-2"
                            style={{ borderRadius: "12px" }}
                        >
                            <small className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            Password harus minimal <b>6 karakter</b>, tidak boleh sama dengan
                            password saat ini, dan juga harus <b>berbeda dari password-password
                            yang pernah dipakai sebelumnya</b>.
                            </small>
                        </div>
                        </div>
                    </div>
                </div>


                {/* Navigation Links */}
                <div className="text-center pt-3 border-top">
                  <div className="row g-2">
                    <div className="col-md-4">
                      <Link
                        href="/profile"
                        className="text-decoration-none text-primary fw-semibold small"
                      >
                        <i className="fas fa-user me-1"></i>
                        Kembali ke Profil
                      </Link>
                    </div>
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

export default ChangePassword;