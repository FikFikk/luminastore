"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Header({showHeader = true} : {showHeader?: boolean}) {
  const [user, setUser] = useState<{
    FirstName: ReactNode;
    Surname: ReactNode;
    name?: string;
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const token = Cookies.get("token");
    if (!token) {
      alert("Token tidak ditemukan");
      return;
    }

    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        Cookies.remove("token");
        setUser(null);
        router.push("/login");
      } else {
        alert(data.message || "Logout gagal");
      }
    } catch (err) {
      alert("Terjadi error saat logout");
    }
  };

  return (
    <>
      <nav
        className={'custom-navbar navbar navbar-expand-md navbar-dark bg-dark'}
        style={{display: !showHeader ? "none" : ""}}
        aria-label="Furni navigation bar"
      >
        <div className="container">
          <Link className="navbar-brand" href="/">
            Furni<span>.</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarsFurni"
            aria-controls="navbarsFurni"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarsFurni">
            <ul className="custom-navbar-nav navbar-nav ms-auto mb-2 mb-md-0">
              <li className="nav-item">
                <Link className="nav-link" href="/">Home</Link>
              </li>
              <li>
                <Link className="nav-link" href="/product">Product</Link>
              </li>
              <li>
                <Link className="nav-link" href="/contact">Contact us</Link>
              </li>
            </ul>

            <ul className="custom-navbar-cta navbar-nav mb-2 mb-md-0 ms-5">
              <li className="nav-item dropdown">
                {user ? (
                  <>
                    <a
                      className="nav-link dropdown-toggle text-white"
                      href="#"
                      id="userDropdown"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Hi, {user.FirstName} {user.Surname}
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                      <li>
                        <Link className="dropdown-item" href="/profile">
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" href="/change-password">
                          Change Password
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="dropdown-item text-danger"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </>
                ) : (
                  <Link className="nav-link" href="/login">
                    <Image
                      src="/assets/images/user.svg"
                      alt="User"
                      width={20}
                      height={20}
                    />
                  </Link>
                )}
              </li>
              <li>
                <Link className="nav-link" href="/cart">
                  <Image
                    src="/assets/images/cart.svg"
                    alt="Cart"
                    width={20}
                    height={20}
                  />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
