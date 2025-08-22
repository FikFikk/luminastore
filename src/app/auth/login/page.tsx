"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (!email || !password) {
      setMessage("Email dan password harus diisi");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email, Password: password }),
      });

      const data = await res.json();

      if (res.ok) {
        Cookies.set("token", data.access_token, { 
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        setMessage("Login berhasil ✅");
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        setMessage(data.message || `Login gagal (${res.status})`);
      }
    } catch (err) {
      setMessage("Terjadi error saat login. Silakan coba lagi.");
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
          <div className="col-md-6 col-lg-5 col-xl-4">
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '60px', height: '60px' }}>
                    <i className="fas fa-user text-white fs-4"></i>
                  </div>
                  <h2 className="fw-bold text-dark mb-2">Selamat Datang</h2>
                  <p className="text-muted small">Silakan masuk ke akun Anda</p>
                </div>
                
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

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label text-muted small fw-semibold">
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-lock text-muted"></i>
                      </span>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="form-control border-start-0 border-end-0 ps-0"
                        placeholder="Masukkan password Anda"
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

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="rememberMe" />
                      <label className="form-check-label text-muted small" htmlFor="rememberMe">
                        Ingat saya
                      </label>
                    </div>
                    <a href="/auth/forgot-password" className="text-decoration-none small text-primary">Lupa password?</a>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-3 fw-semibold"
                    disabled={isLoading}
                    style={{ 
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Masuk
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
                    Belum punya akun? 
                    <a href="/auth/register" className="text-decoration-none text-primary fw-semibold ms-1">
                      Daftar sekarang
                    </a>
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

export default LoginPage;
