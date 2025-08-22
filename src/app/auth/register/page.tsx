"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Validasi form
    if (!firstName || !surname || !email || !password || !confirmPassword) {
      setMessage("Semua field harus diisi");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Password dan konfirmasi password tidak cocok");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Password harus minimal 6 karakter");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          FirstName: firstName,
          Surname: surname,
          Email: email,
          Password: password,
          PhoneNumber: phoneNumber
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Registrasi berhasil! ✅ Redirecting ke halaman login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setMessage(data.message || `Registrasi gagal (${res.status})`);
      }
    } catch (err) {
      setMessage("Terjadi error saat registrasi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'var(--font-geist-sans)'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
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
                          type="text"
                          className="form-control border-start-0 ps-0"
                          placeholder="Nama depan"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
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
                          type="text"
                          className="form-control border-start-0 ps-0"
                          placeholder="Nama belakang"
                          value={surname}
                          onChange={(e) => setSurname(e.target.value)}
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
                        type="tel"
                        className="form-control border-start-0 ps-0"
                        placeholder="Masukkan nomor telepon"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
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
                        type={showPassword ? "text" : "password"}
                        className="form-control border-start-0 border-end-0 ps-0"
                        placeholder="Masukkan password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control border-start-0 border-end-0 ps-0"
                        placeholder="Konfirmasi password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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

                {message && (
                  <div className={`alert mt-4 py-3 ${message.includes("✅") ? "alert-success" : "alert-danger"}`} style={{ borderRadius: '12px' }}>
                    <div className="d-flex align-items-center">
                      <i className={`fas ${message.includes("✅") ? "fa-check-circle" : "fa-exclamation-circle"} me-2`}></i>
                      <span className="small">{message}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;